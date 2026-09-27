package com.dreamsol.department.repository;

import com.dreamsol.department.entity.DepartmentAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepartmentAttachmentRepository extends JpaRepository<DepartmentAttachment, Long> {
    Optional<DepartmentAttachment> findByUuid(String uuid);
    List<DepartmentAttachment> findByDepartmentId(Long departmentId);
    List<DepartmentAttachment> findByDepartmentIdIn(List<Long> departmentIds);
}