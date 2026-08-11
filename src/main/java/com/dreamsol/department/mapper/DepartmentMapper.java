package com.dreamsol.department.mapper;

import com.dreamsol.department.dto.DepartmentRequest;
import com.dreamsol.department.dto.DepartmentResponse;
import com.dreamsol.department.entity.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper
{
    public Department toEntity(DepartmentRequest request)
    {
        Department department = new Department();
        department.setDepartmentCode(request.getDepartmentCode());

        department.setDepartmentName(request.getDepartmentName());

        department.setShortName(request.getShortName());

        department.setDepartmentType(request.getDepartmentType());

        department.setParentDepartmentId(request.getParentDepartmentId());

        department.setDepartmentHead(request.getDepartmentHead());

        department.setBranchIds(request.getBranchIds());

        department.setBusinessUnitId(request.getBusinessUnitId());

        department.setCostCenter(request.getCostCenter());

        department.setDepartmentEmail(request.getDepartmentEmail());

        department.setDepartmentPhone(request.getDepartmentPhone());

        department.setWorkingDays(request.getWorkingDays());

        department.setWorkingShiftId(request.getWorkingShiftId());

        department.setDescription(request.getDescription());

        department.setDepartmentLogo(request.getDepartmentLogo());

        department.setDocumentPath(request.getDocumentPath());

        department.setTags(request.getTags());

        department.setKeywords(request.getKeywords());

        department.setRemarks(request.getRemarks());

        department.setStatus(request.getStatus());

        return department;
    }

    public DepartmentResponse toResponse(Department department)
    {
        DepartmentResponse response = new DepartmentResponse();

        response.setId(department.getId());

        response.setDepartmentCode(department.getDepartmentCode());

        response.setDepartmentName(department.getDepartmentName());

        response.setShortName(department.getShortName());

        response.setDepartmentType(department.getDepartmentType());

        response.setParentDepartmentId(department.getParentDepartmentId());

        response.setDepartmentHead(department.getDepartmentHead());

        response.setBranchIds(department.getBranchIds());

        response.setBusinessUnitId(department.getBusinessUnitId());

        response.setCostCenter(department.getCostCenter());

        response.setDepartmentEmail(department.getDepartmentEmail());

        response.setDepartmentPhone(department.getDepartmentPhone());

        response.setWorkingDays(department.getWorkingDays());

        response.setWorkingShiftId(department.getWorkingShiftId());

        response.setDescription(department.getDescription());

        response.setDepartmentLogo(department.getDepartmentLogo());

        response.setDocumentPath(department.getDocumentPath());

        response.setTags(department.getTags());

        response.setKeywords(department.getKeywords());

        response.setRemarks(department.getRemarks());

        response.setStatus(department.getStatus());

        response.setCreatedBy(department.getCreatedBy());

        response.setCreatedAt(department.getCreatedAt());

        response.setUpdatedBy(department.getUpdatedBy());

        response.setUpdatedAt(department.getUpdatedAt());

        return response;
    }
}
