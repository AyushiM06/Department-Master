package com.dreamsol.department.service;

import com.dreamsol.common.validation.ValidationResponse;
import com.dreamsol.department.client.MasterClient;
import com.dreamsol.department.dto.DepartmentDetailResponseDto;
import com.dreamsol.department.dto.DepartmentDropdownResponseDto;
import com.dreamsol.department.dto.DepartmentListResponseDto;
import com.dreamsol.department.dto.DepartmentRequestDto;
import com.dreamsol.department.dto.DepartmentSearchRequestDto;
import com.dreamsol.department.dto.DepartmentStatusCountResponseDto;
import com.dreamsol.department.dto.DepartmentTypeCountResponseDto;
import com.dreamsol.department.dto.DepartmentTypeStatusResponseDto;
import com.dreamsol.department.entity.Department;
import com.dreamsol.department.entity.DepartmentAttachment;
import com.dreamsol.department.repository.DepartmentAttachmentRepository;
import com.dreamsol.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final DepartmentAttachmentRepository departmentAttachmentRepository;
    private final MasterClient masterClient;
    private final DepartmentValidationService departmentValidationService;
    private final DepartmentHistoryService departmentHistoryService;

    @CacheEvict(value = {"departmentDropdown", "departmentDetails"}, allEntries = true)
    @Transactional
    public ResponseEntity<?> saveOrUpdate(List<DepartmentRequestDto> requests) {
        try {
            if (Objects.isNull(requests) || requests.isEmpty()) return ResponseEntity.badRequest().build();
            Map<String, List<DepartmentDropdownResponseDto>> masterData = masterClient.getDropdownData();
            Optional<ValidationResponse> validationError = requests.stream().map(request -> departmentValidationService.validate(request, masterData)).filter(validation -> !validation.isValid()).findFirst();
            if (validationError.isPresent()) return ResponseEntity.badRequest().body(validationError.get());
            Long loggedInUserId = getLoggedInUserId();
            List<Long> ids = requests.stream().map(DepartmentRequestDto::getId).filter(Objects::nonNull).distinct().toList();
            Map<Long, Department> existingDepartments = ids.isEmpty() ? new HashMap<>() : departmentRepository.findAllById(ids).stream().collect(Collectors.toMap(Department::getId, Function.identity()));
            Map<Long, Department> oldDepartments = existingDepartments.values().stream().collect(Collectors.toMap(Department::getId, this::createHistorySnapshot));
            List<Department> departments = requests.stream().map(request -> {
                Long id = request.getId();
                Department department = Objects.isNull(id) ? new Department() : existingDepartments.get(id);
                if (Objects.isNull(department)) return null;
                boolean duplicate = Objects.isNull(id) ? departmentRepository.existsByDepartmentName(request.getDepartmentName()) : departmentRepository.existsByDepartmentNameAndIdNot(request.getDepartmentName(), id);
                if (duplicate || (Objects.nonNull(id) && Objects.equals(id, request.getParentDepartment())))
                    return null;
                String existingDepartmentCode = department.getDepartmentCode();
                BeanUtils.copyProperties(request, department);
                if (department.getDepartmentPhone() != null && department.getDepartmentPhone().isBlank())
                    department.setDepartmentPhone(null);
                if (Objects.isNull(id)) {
                    department.setCreatedBy(loggedInUserId);
                    department.setUpdatedBy(null);
                    String prefix = Arrays.stream(request.getDepartmentName().trim().split("\\s+")).map(word -> word.substring(0, 1).toUpperCase()).collect(Collectors.joining());
                    department.setDepartmentCode(prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 3).toUpperCase());
                } else {
                    department.setDepartmentCode(existingDepartmentCode);
                    department.setUpdatedBy(loggedInUserId);
                }
                return department;
            }).filter(Objects::nonNull).toList();
            if (departments.size() != requests.size()) return ResponseEntity.badRequest().build();
            List<Department> savedDepartments = departmentRepository.saveAll(departments);
            departmentHistoryService.saveHistories(savedDepartments, oldDepartments, loggedInUserId);
            return ResponseEntity.ok(savedDepartments);
        } catch (Exception ex) {
            log.error("Error while saving/updating departments", ex);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<?> getAllDepartments(boolean status, int page, int size, String sortBy, String direction) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sortBy));
            return ResponseEntity.ok(departmentRepository.findDepartmentsByStatus(status, pageable));
        } catch (Exception ex) {
            log.error("Error while fetching departments", ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    @Cacheable(value = "departmentDetails", key = "#id", unless = "#result == null")
    public ResponseEntity<?> getDepartmentById(Long id) {
        Optional<DepartmentDetailResponseDto> optional = departmentRepository.findDepartmentDetailById(id);
        if (optional.isEmpty()) return ResponseEntity.notFound().build();
        DepartmentDetailResponseDto department = optional.get();
        Map<String, List<DepartmentDropdownResponseDto>> masterData = masterClient.getDropdownData();
        Map<Long, String> branchMap = masterData.getOrDefault("branches", List.of()).stream().collect(Collectors.toMap(DepartmentDropdownResponseDto::getId, DepartmentDropdownResponseDto::getName));
        Map<Long, String> businessUnitMap = masterData.getOrDefault("businessUnits", List.of()).stream().collect(Collectors.toMap(DepartmentDropdownResponseDto::getId, DepartmentDropdownResponseDto::getName));
        Map<Long, String> workingShiftMap = masterData.getOrDefault("workingShifts", List.of()).stream().collect(Collectors.toMap(DepartmentDropdownResponseDto::getId, DepartmentDropdownResponseDto::getName));
        DepartmentDetailResponseDto response = new DepartmentDetailResponseDto();
        BeanUtils.copyProperties(department, response);
        response.setBranchNames(department.getBranches() == null ? List.of() : department.getBranches().stream().map(branchMap::get).filter(Objects::nonNull).toList());
        response.setBusinessUnitName(businessUnitMap.get(department.getBusinessUnit()));
        response.setWorkingShiftName(workingShiftMap.get(department.getWorkingShift()));
        return ResponseEntity.ok(response);
    }

    @CacheEvict(value = {"departmentDropdown", "departmentDetails"}, allEntries = true)
    @Transactional
    public ResponseEntity<?> deleteDepartment(Long id) {
        try {
            Department department = departmentRepository.findById(id).orElse(null);
            if (Objects.isNull(department)) return ResponseEntity.notFound().build();
            Long loggedInUserId = getLoggedInUserId();
            Department oldDepartment = createHistorySnapshot(department);
            department.setStatus(true);
            department.setUpdatedBy(loggedInUserId);
            Department savedDepartment = departmentRepository.save(department);
            departmentHistoryService.saveHistory(oldDepartment, savedDepartment, "INACTIVATED", loggedInUserId);
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            log.error("Error while deleting department, id={}", id, ex);
            throw ex;
        }
    }

    public ResponseEntity<?> getDepartmentCount(LocalDateTime fromDate, LocalDateTime toDate) {
        try {
            DepartmentStatusCountResponseDto count;
            if (fromDate != null && toDate != null)
                count = departmentRepository.getDepartmentStatusCountByDate(fromDate, toDate);
            else count = departmentRepository.getDepartmentStatusCount();
            return ResponseEntity.ok(count);
        } catch (Exception ex) {
            log.error("Error while fetching department count", ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<?> searchDepartments(DepartmentSearchRequestDto request) {
        try {
            List<DepartmentListResponseDto> departments = departmentRepository.findAllDepartments();
            departments = departments.stream().filter(department -> matches(department, request)).sorted(getComparator(request)).toList();
            int page = Math.max(request.getPage(), 0);
            int size = Math.max(request.getSize(), 1);
            int start = Math.min(page * size, departments.size());
            int end = Math.min(start + size, departments.size());
            List<DepartmentListResponseDto> content = new ArrayList<>(departments.subList(start, end));
            populateUpdateDetails(content);
            addAttachmentDetails(content);
            Page<DepartmentListResponseDto> result = new PageImpl<>(content, PageRequest.of(page, size), departments.size());
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            log.error("Error while searching departments", ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<?> uploadAttachment(List<Long> departmentIds, List<MultipartFile> files, List<String> attachmentTypes) {
        try {
            if (Objects.isNull(departmentIds) || Objects.isNull(files) || Objects.isNull(attachmentTypes) || departmentIds.size() != files.size() || files.size() != attachmentTypes.size())
                return ResponseEntity.badRequest().build();
            Path directory = Paths.get("uploads/department");
            Files.createDirectories(directory);
            List<DepartmentAttachment> attachments = IntStream.range(0, files.size()).mapToObj(index -> {
                MultipartFile file = files.get(index);
                Long departmentId = departmentIds.get(index);
                String attachmentType = attachmentTypes.get(index);
                if (Objects.isNull(file) || file.isEmpty() || !departmentRepository.existsById(departmentId)) return null;
                try {
                    String uuid = UUID.randomUUID().toString();
                    String fileName = file.getOriginalFilename();
                    String extension = fileName != null && fileName.contains(".") ? fileName.substring(fileName.lastIndexOf(".")) : "";
                    Path filePath = directory.resolve(uuid + extension);
                    Files.copy(file.getInputStream(), filePath);
                    DepartmentAttachment attachment = new DepartmentAttachment();
                    attachment.setUuid(uuid);
                    attachment.setDepartmentId(departmentId);
                    attachment.setFileName(fileName);
                    attachment.setFilePath(filePath.toString());
                    attachment.setAttachmentType(attachmentType.trim().toUpperCase());
                    return attachment;
                } catch (IOException ex) {
                    return null;
                }
            }).filter(Objects::nonNull).toList();
            if (attachments.size() != files.size()) return ResponseEntity.badRequest().build();
            departmentAttachmentRepository.saveAll(attachments);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Attachments uploaded successfully", "uploadedCount", attachments.size()));
        } catch (Exception ex) {
            log.error("Error while uploading department attachments", ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<Resource> downloadAttachment(String uuid) {
        try {
            DepartmentAttachment attachment = departmentAttachmentRepository.findByUuid(uuid).orElse(null);
            if (Objects.isNull(attachment)) return ResponseEntity.notFound().build();
            Path path = Paths.get(attachment.getFilePath());
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) return ResponseEntity.notFound().build();
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"").body(resource);
        } catch (Exception ex) {
            log.error("Error while downloading attachment", ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<?> deleteAttachment(String uuid) {
        try {
            DepartmentAttachment attachment = departmentAttachmentRepository.findByUuid(uuid).orElse(null);
            if (Objects.isNull(attachment)) return ResponseEntity.notFound().build();
            Path filePath = Paths.get(attachment.getFilePath());
            if (Files.exists(filePath)) Files.delete(filePath);
            departmentAttachmentRepository.delete(attachment);
            return ResponseEntity.noContent().build();
        } catch (Exception ex) {
            log.error("Error while deleting attachment, uuid={}", uuid, ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<?> getDashboardStatistics(LocalDateTime fromDate, LocalDateTime toDate, String search) {
        try {
            List<DepartmentListResponseDto> departments = departmentRepository.findDepartmentsByCreatedAtBetween(fromDate, toDate);
            String searchText = Optional.ofNullable(search).map(String::trim).map(String::toLowerCase).orElse("");
            if (!searchText.isBlank()) {
                departments = departments.stream().filter(department -> contains(department.getDepartmentCode(), searchText) || contains(department.getDepartmentName(), searchText) || contains(department.getShortName(), searchText) || contains(department.getDepartmentType(), searchText) || contains(department.getDepartmentEmail(), searchText) || contains(String.valueOf(department.getDepartmentHead()), searchText) || contains(String.valueOf(department.getBusinessUnit()), searchText) || contains(String.valueOf(department.getBranches()), searchText)).toList();
            }
            long total = departments.size();
            long active = departments.stream().filter(department -> !department.isStatus()).count();
            long inactive = total - active;
            Map<String, Long> typeCounts = departments.stream().collect(Collectors.groupingBy(DepartmentListResponseDto::getDepartmentType, java.util.LinkedHashMap::new, Collectors.counting()));
            List<DepartmentTypeCountResponseDto> typeStats = typeCounts.entrySet().stream().map(entry -> new DepartmentTypeCountResponseDto(entry.getKey(), entry.getValue())).toList();
            Map<String, long[]> typeStatusMap = new java.util.LinkedHashMap<>();
            departments.forEach(department -> {
                long[] counts = typeStatusMap.computeIfAbsent(department.getDepartmentType(), key -> new long[2]);
                if (department.isStatus()) counts[1]++;
                else counts[0]++;
            });
            List<DepartmentTypeStatusResponseDto> typeStatusStats = typeStatusMap.entrySet().stream().map(entry -> new DepartmentTypeStatusResponseDto(entry.getKey(), entry.getValue()[0], entry.getValue()[1])).toList();
            Map<String, Object> response = new java.util.LinkedHashMap<>();
            response.put("totalDepartments", total);
            response.put("activeDepartments", active);
            response.put("inactiveDepartments", inactive);
            response.put("departmentTypeStats", typeStats);
            response.put("departmentStatusStats", List.of(Map.of("name", "Active", "count", active), Map.of("name", "Inactive", "count", inactive)));
            response.put("departmentTypeStatusStats", typeStatusStats);
            response.put("fromDate", fromDate);
            response.put("toDate", toDate);
            response.put("search", searchText);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error while fetching dashboard statistics", ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    private boolean matches(DepartmentListResponseDto department, DepartmentSearchRequestDto request) {
        return matchesGlobalSearch(department, request.getGlobalSearch()) && (Objects.isNull(request.getDepartmentType()) || request.getDepartmentType().isBlank() || request.getDepartmentType().equalsIgnoreCase(department.getDepartmentType())) && matchesBranches(department.getBranches(), request.getBranches()) && (Objects.isNull(request.getBusinessUnit()) || Objects.equals(department.getBusinessUnit(), request.getBusinessUnit())) && (Objects.isNull(request.getStatus()) || department.isStatus() == request.getStatus()) && (Objects.isNull(request.getFromDate()) || (Objects.nonNull(department.getCreatedAt()) && !department.getCreatedAt().isBefore(request.getFromDate()))) && (Objects.isNull(request.getToDate()) || (Objects.nonNull(department.getCreatedAt()) && !department.getCreatedAt().isAfter(request.getToDate())));
    }

    private boolean matchesBranches(List<Long> departmentBranches, List<Long> selectedBranches) {
        if (Objects.isNull(selectedBranches) || selectedBranches.isEmpty()) return true;
        if (Objects.isNull(departmentBranches) || departmentBranches.isEmpty()) return false;
        return selectedBranches.stream().anyMatch(departmentBranches::contains);
    }

    private boolean matchesGlobalSearch(DepartmentListResponseDto department, String search) {
        if (Objects.isNull(search) || search.isBlank()) return true;
        String value = search.trim().toLowerCase();
        return contains(department.getDepartmentCode(), value) || contains(department.getDepartmentName(), value) || contains(department.getShortName(), value) || contains(department.getDepartmentType(), value) || contains(department.getDepartmentEmail(), value) || contains(department.getDepartmentPhone(), value) || contains(String.valueOf(department.getDepartmentHead()), value) || contains(String.valueOf(department.getBusinessUnit()), value) || contains(String.valueOf(department.getBranches()), value) || contains(String.valueOf(department.getCreatedAt()), value) || contains(String.valueOf(department.getUpdatedAt()), value);
    }

    private boolean contains(String value, String search) {
        return Objects.nonNull(value) && value.toLowerCase().contains(search);
    }

    private Comparator<DepartmentListResponseDto> getComparator(DepartmentSearchRequestDto request) {
        Comparator<DepartmentListResponseDto> comparator = switch (request.getSortBy()) {
            case "departmentCode" ->
                    Comparator.comparing(DepartmentListResponseDto::getDepartmentCode, Comparator.nullsFirst(String.CASE_INSENSITIVE_ORDER));
            case "shortName" ->
                    Comparator.comparing(DepartmentListResponseDto::getShortName, Comparator.nullsFirst(String.CASE_INSENSITIVE_ORDER));
            case "departmentType" ->
                    Comparator.comparing(DepartmentListResponseDto::getDepartmentType, Comparator.nullsFirst(String.CASE_INSENSITIVE_ORDER));
            case "departmentEmail" ->
                    Comparator.comparing(DepartmentListResponseDto::getDepartmentEmail, Comparator.nullsFirst(String.CASE_INSENSITIVE_ORDER));
            case "createdAt" ->
                    Comparator.comparing(DepartmentListResponseDto::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder()));
            case "updatedAt" ->
                    Comparator.comparing(department -> department.getUpdatedAt() != null ? department.getUpdatedAt() : department.getCreatedAt(), Comparator.nullsFirst(Comparator.naturalOrder()));
            default ->
                    Comparator.comparing(DepartmentListResponseDto::getDepartmentName, Comparator.nullsFirst(String.CASE_INSENSITIVE_ORDER));
        };
        if ("updatedAt".equalsIgnoreCase(request.getSortBy())) {
            Comparator<DepartmentListResponseDto> idComparator = Comparator.comparing(DepartmentListResponseDto::getId, Comparator.nullsFirst(Comparator.naturalOrder()));
            if ("desc".equalsIgnoreCase(request.getDirection()))
                return comparator.reversed().thenComparing(idComparator.reversed());
            else return comparator.thenComparing(idComparator);
        }
        return "desc".equalsIgnoreCase(request.getDirection()) ? comparator.reversed() : comparator;
    }

    private Long getLoggedInUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (Objects.isNull(authentication)) return null;
        Object details = authentication.getDetails();
        if (Objects.isNull(details)) return null;
        if (details instanceof Long) return (Long) details;
        try {
            return Long.valueOf(details.toString());
        } catch (NumberFormatException ex) {
            log.warn("Unable to convert userId from authentication details: {}", details);
            return null;
        }
    }

    private void populateUpdateDetails(List<DepartmentListResponseDto> departments) {
        if (Objects.isNull(departments) || departments.isEmpty()) return;
        List<Long> departmentIds = departments.stream().map(DepartmentListResponseDto::getId).filter(Objects::nonNull).toList();
        if (departmentIds.isEmpty()) return;
        Map<Long, Department> departmentMap = departmentRepository.findAllById(departmentIds).stream().collect(Collectors.toMap(Department::getId, Function.identity()));
        departments.forEach(response -> {
            Department department = departmentMap.get(response.getId());
            if (Objects.isNull(department)) return;
            response.setParentDepartment(department.getParentDepartment());
            response.setCostCenter(department.getCostCenter());
            response.setWorkingShift(department.getWorkingShift());
            response.setDescription(department.getDescription());
            response.setDepartmentLogo(department.getDepartmentLogo());
            response.setDocumentPath(department.getDocumentPath());
            response.setTags(Objects.isNull(department.getTags()) ? List.of() : new ArrayList<>(department.getTags()));
            response.setKeywords(department.getKeywords());
            response.setRemarks(department.getRemarks());
        });
    }

    private void addAttachmentDetails(List<DepartmentListResponseDto> departments) {
        if (Objects.isNull(departments) || departments.isEmpty()) return;
        List<Long> departmentIds = departments.stream().map(DepartmentListResponseDto::getId).filter(Objects::nonNull).toList();
        Map<Long, List<DepartmentAttachment>> attachmentMap = departmentAttachmentRepository.findByDepartmentIdIn(departmentIds).stream().collect(Collectors.groupingBy(DepartmentAttachment::getDepartmentId));
        departments.forEach(department -> {
            List<DepartmentAttachment> attachments = attachmentMap.getOrDefault(department.getId(), List.of());
            attachments.stream().filter(attachment -> "LOGO".equalsIgnoreCase(attachment.getAttachmentType())).max(Comparator.comparing(DepartmentAttachment::getId)).ifPresent(attachment -> {
                department.setDepartmentLogoUuid(attachment.getUuid());
                department.setDepartmentLogoFileName(attachment.getFileName());
            });
            attachments.stream().filter(attachment -> "DOCUMENT".equalsIgnoreCase(attachment.getAttachmentType())).max(Comparator.comparing(DepartmentAttachment::getId)).ifPresent(attachment -> {
                department.setDocumentUuid(attachment.getUuid());
                department.setDocumentFileName(attachment.getFileName());
            });
        });
    }

    private Department createHistorySnapshot(Department source) {
        if (Objects.isNull(source)) return null;
        Department snapshot = new Department();
        BeanUtils.copyProperties(source, snapshot);
        if (Objects.nonNull(source.getBranches())) snapshot.setBranches(new ArrayList<>(source.getBranches()));
        if (Objects.nonNull(source.getWorkingDays())) snapshot.setWorkingDays(new ArrayList<>(source.getWorkingDays()));
        if (Objects.nonNull(source.getTags())) snapshot.setTags(new ArrayList<>(source.getTags()));
        return snapshot;
    }
}