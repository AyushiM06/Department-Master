package com.dreamsol.master.controller;

import com.dreamsol.master.entity.Employee;
import com.dreamsol.master.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/search")
    public ResponseEntity<List<Employee>> searchEmployees(
            @RequestParam(required = false) String search) {

        return ResponseEntity.ok(
                employeeService.searchEmployees(search)
        );
    }

    @PostMapping("/save")
    public ResponseEntity<Employee> saveEmployee(
            @RequestParam String name) {

        return ResponseEntity.ok(
                employeeService.saveEmployee(name)
        );
    }
}