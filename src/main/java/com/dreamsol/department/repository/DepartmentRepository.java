package com.dreamsol.department.repository;
import com.dreamsol.department.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department,Long>
{
    boolean existsByDepartmentCodeAndIsDeletedFalse(String departmentCode);
    boolean existsByDepartmentNameAndIsDeletedFalse(String departmentName);
    boolean existsByDepartmentCodeAndIdNotAndIsDeletedFalse(String departmentCode, Long id);
    boolean existsByDepartmentNameAndIdNotAndIsDeletedFalse(String departmentName, Long id);
    Page<Department> findAllByIsDeletedFalse(Pageable pageable);
}
