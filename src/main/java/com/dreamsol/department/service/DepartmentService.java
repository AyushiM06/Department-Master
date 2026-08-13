package com.dreamsol.department.service;
import com.dreamsol.department.dto.DepartmentRequest;
import com.dreamsol.department.dto.DepartmentResponse;
import com.dreamsol.department.entity.Department;
import com.dreamsol.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DepartmentService
{
    private final DepartmentRepository departmentRepository;
    public DepartmentResponse saveDepartment(DepartmentRequest request)
    {
        validateDuplicateForCreate(request);
        Department department = new Department();
        BeanUtils.copyProperties(request, department);
        department.setIsDeleted(false);
        department.setCreatedAt(LocalDateTime.now());
        if(department.getStatus() == null)
            department.setStatus(true);
        return toResponseDto(departmentRepository.save(department));
    }

    public Page<DepartmentResponse> getAllDepartments(int page, int size, String sortBy, String direction)
    {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sortBy));
        return departmentRepository.findAllByIsDeletedFalse(pageable).map(this::toResponseDto);
    }

    public DepartmentResponse getDepartmentById(Long id)
    {
        Department department = getActiveDepartment(id);
        return toResponseDto(department);
    }

    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request)
    {
        Department department = getActiveDepartment(id);
        validateDuplicateForUpdate(request, id);
        BeanUtils.copyProperties(request,department);
        department.setUpdatedAt(LocalDateTime.now());
        return toResponseDto(departmentRepository.save(department));
    }

    public void deleteDepartment(Long id)
    {
        Department department = getActiveDepartment(id);
        department.setIsDeleted(true);
        department.setUpdatedAt(LocalDateTime.now());
        departmentRepository.save(department);
    }

    private DepartmentResponse toResponseDto(Department department)
    {
        DepartmentResponse response = new DepartmentResponse();
        BeanUtils.copyProperties(department, response);
        return response;
    }

    private Department getActiveDepartment(Long id)
    {
        Department department = departmentRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Department not found"));
        if (Boolean.TRUE.equals(department.getIsDeleted()))
            throw new RuntimeException("Department not found");
        return department;
    }

    private void validateDuplicateForCreate(DepartmentRequest request)
    {
        if (departmentRepository.existsByDepartmentCodeAndIsDeletedFalse(request.getDepartmentCode()))
            throw new RuntimeException("Department code already exists");
        if (departmentRepository.existsByDepartmentNameAndIsDeletedFalse(request.getDepartmentName()))
            throw new RuntimeException("Department name already exists");
    }

    private void validateDuplicateForUpdate(DepartmentRequest request, Long id)
    {
        if (departmentRepository.existsByDepartmentCodeAndIdNotAndIsDeletedFalse(request.getDepartmentCode(), id))
            throw new RuntimeException("Department code already exists");
        if (departmentRepository.existsByDepartmentNameAndIdNotAndIsDeletedFalse(request.getDepartmentName(), id))
            throw new RuntimeException("Department name already exists");
    }
}

