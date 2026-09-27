package com.dreamsol.department.service;
import com.dreamsol.department.dto.DepartmentHistoryResponseDto;
import com.dreamsol.department.entity.Department;
import com.dreamsol.department.entity.DepartmentHistory;
import com.dreamsol.department.repository.DepartmentHistoryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.beans.PropertyDescriptor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentHistoryService {
    private final DepartmentHistoryRepository departmentHistoryRepository;
    private final ObjectMapper objectMapper;

    public void saveHistories(List<Department> savedDepartments, Map<Long, Department> oldDepartments, Long performedBy) {
        if (savedDepartments == null || savedDepartments.isEmpty()) return;
        List<DepartmentHistory> histories = new ArrayList<>();
        for (Department department : savedDepartments) {
            Department oldDepartment = oldDepartments.get(department.getId());
            boolean isNew = oldDepartment == null;
            Map<String, Map<String, Object>> changes = buildChanges(oldDepartment, department);
            if (!isNew && changes.isEmpty()) continue;
            DepartmentHistory history = DepartmentHistory.builder().departmentId(department.getId()).departmentCode(department.getDepartmentCode()).action(isNew ? "CREATED" : "UPDATED").performedBy(String.valueOf(performedBy)).performedAt(LocalDateTime.now()).details(convertToJson(changes)).build();
            histories.add(history);
        }
        if (!histories.isEmpty()) departmentHistoryRepository.saveAll(histories);
    }

    private Map<String, Map<String, Object>> buildChanges(Department oldDepartment, Department newDepartment) {
        Map<String, Map<String, Object>> changes = new LinkedHashMap<>();
        BeanWrapper newWrapper = new BeanWrapperImpl(newDepartment);
        if (oldDepartment == null) {
            Arrays.stream(newWrapper.getPropertyDescriptors()).map(PropertyDescriptor::getName).filter(field -> !Set.of("class", "id", "departmentCode").contains(field)).forEach(field -> addCreatedChange(changes, field, newWrapper.getPropertyValue(field)));
            return changes;
        }
        BeanWrapper oldWrapper = new BeanWrapperImpl(oldDepartment);
        Arrays.stream(newWrapper.getPropertyDescriptors()).map(PropertyDescriptor::getName).filter(field -> !Set.of("class", "id", "departmentCode").contains(field)).forEach(field -> addChange(changes, field, oldWrapper.getPropertyValue(field), newWrapper.getPropertyValue(field)));
        return changes;
    }

    private void addCreatedChange(Map<String, Map<String, Object>> changes, String field, Object value) {
        if (value == null) return;
        if (value instanceof String stringValue && stringValue.isBlank()) return;
        if (value instanceof Collection<?> collection && collection.isEmpty()) return;
        Map<String, Object> change = new LinkedHashMap<>();
        change.put("old", null);
        change.put("new", value);
        changes.put(field, change);
    }

    private void addChange(Map<String, Map<String, Object>> changes, String field, Object oldValue, Object newValue) {
        Map<String, Object> change = new LinkedHashMap<>();
        change.put("old", oldValue);
        change.put("new", newValue);
        changes.put(field, change);
    }

    public List<DepartmentHistoryResponseDto> getDepartmentHistory(Long departmentId) {
        return departmentHistoryRepository.findByDepartmentIdOrderByPerformedAtDesc(departmentId).stream().map(this::toResponseDto).toList();
    }

    private DepartmentHistoryResponseDto toResponseDto(DepartmentHistory history) {
        Map<String, Map<String, Object>> changes = new LinkedHashMap<>();
        try {
            if (history.getDetails() != null && !history.getDetails().isBlank()) changes = objectMapper.readValue(history.getDetails(), new TypeReference<Map<String, Map<String, Object>>>() {});
        } catch (JsonProcessingException ex) {
            log.error("Unable to parse department history details. historyId={}", history.getId(), ex);
        }
        return new DepartmentHistoryResponseDto(history.getId(), history.getDepartmentId(), history.getDepartmentCode(), history.getAction(), history.getPerformedBy(), history.getPerformedAt(), changes);
    }

    private String convertToJson(Map<String, Map<String, Object>> changes) {
        try {
            return objectMapper.writeValueAsString(changes);
        } catch (JsonProcessingException ex) {
            throw new RuntimeException("Unable to create department history details", ex);
        }
    }

    public void saveHistory(Department oldDepartment, Department newDepartment, String action, Long performedBy) {
        Map<String, Map<String, Object>> changes = buildChanges(oldDepartment, newDepartment);
        DepartmentHistory history = DepartmentHistory.builder().departmentId(newDepartment.getId()).departmentCode(newDepartment.getDepartmentCode()).action(action).performedBy(String.valueOf(performedBy)).performedAt(LocalDateTime.now()).details(convertToJson(changes)).build();
        departmentHistoryRepository.save(history);
    }
}