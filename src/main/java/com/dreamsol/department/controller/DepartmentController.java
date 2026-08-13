package com.dreamsol.department.controller;
import com.dreamsol.department.dto.DepartmentRequest;
import com.dreamsol.department.dto.DepartmentResponse;
import com.dreamsol.department.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/department")
@RequiredArgsConstructor
public class DepartmentController
{
    private final DepartmentService departmentService;
    @PostMapping("/save")
    public DepartmentResponse saveDepartment(@Valid @RequestBody DepartmentRequest request)
    {
        return departmentService.saveDepartment(request);
    }

    @GetMapping("/list")
    public Page<DepartmentResponse> getAllDepartments(@RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "10") int size,
                                                      @RequestParam(defaultValue = "id") String sortBy,
                                                      @RequestParam String direction)
    {
        return departmentService.getAllDepartments(page,size,sortBy,direction);
    }

    @GetMapping("/{id}")
    public DepartmentResponse getDepartmentById(@PathVariable Long id)
    {
        return departmentService.getDepartmentById(id);
    }

    @PutMapping("/update")
    public DepartmentResponse updateDepartment(@RequestParam Long id, @Valid @RequestBody DepartmentRequest request)
    {
        return departmentService.updateDepartment(id, request);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteDepartment(@PathVariable Long id)
    {
        departmentService.deleteDepartment(id);
        return "Department deleted successfully";
    }
}
