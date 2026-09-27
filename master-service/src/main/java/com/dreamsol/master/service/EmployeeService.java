package com.dreamsol.master.service;

import com.dreamsol.master.entity.Employee;
import com.dreamsol.master.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public List<Employee> searchEmployees(String searchText) {

        if (searchText == null || searchText.trim().isEmpty()) {
            return employeeRepository.findByStatusFalse();
        }

        return employeeRepository
                .findByNameContainingIgnoreCaseAndStatusFalse(searchText.trim());
    }

    public Employee saveEmployee(String name) {

        String employeeName = name == null ? "" : name.trim();

        if (employeeName.isEmpty()) {
            throw new IllegalArgumentException("Employee name is required");
        }

        return employeeRepository
                .findByNameIgnoreCaseAndStatusFalse(employeeName)
                .orElseGet(() -> {
                    Employee employee = new Employee();
                    employee.setName(employeeName);
                    employee.setStatus(false);
                    return employeeRepository.save(employee);
                });
    }
}