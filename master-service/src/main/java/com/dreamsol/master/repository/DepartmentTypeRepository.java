package com.dreamsol.master.repository;

import com.dreamsol.master.entity.DepartmentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentTypeRepository extends JpaRepository<DepartmentType, Long> {

    List<DepartmentType> findByStatusFalse();
}