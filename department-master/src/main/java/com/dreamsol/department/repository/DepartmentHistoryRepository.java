package com.dreamsol.department.repository;

import com.dreamsol.department.entity.DepartmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentHistoryRepository
        extends JpaRepository<DepartmentHistory, Long> {

    List<DepartmentHistory> findByDepartmentIdOrderByPerformedAtDesc(Long departmentId);
}