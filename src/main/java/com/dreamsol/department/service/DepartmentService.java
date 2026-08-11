package com.dreamsol.department.service;

import com.dreamsol.department.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

@Service
public class DepartmentService
{
    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository)
    {
        this.departmentRepository = departmentRepository;
    }
}
