package com.dreamsol.department.repository;

import com.dreamsol.department.dto.DepartmentDetailResponseDto;
import com.dreamsol.department.dto.DepartmentExportResponseDto;
import com.dreamsol.department.dto.DepartmentListResponseDto;
import com.dreamsol.department.dto.DepartmentStatusCountResponseDto;
import com.dreamsol.department.dto.DepartmentTypeCountResponseDto;
import com.dreamsol.department.dto.DepartmentTypeStatusResponseDto;
import com.dreamsol.department.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    boolean existsByDepartmentCode(String code);

    boolean existsByDepartmentName(String name);

    boolean existsByDepartmentNameAndIdNot(String name, Long id);

    @Query("SELECT new com.dreamsol.department.dto.DepartmentListResponseDto(d.id, d.departmentCode, d.departmentName, d.shortName, d.departmentType, d.departmentHead, d.branches, d.businessUnit, d.departmentEmail, d.departmentPhone, d.workingDays, d.status, d.createdBy, d.createdAt, d.updatedBy, d.updatedAt) FROM Department d WHERE d.status = :status ORDER BY CASE WHEN d.updatedAt IS NULL THEN d.createdAt ELSE d.updatedAt END DESC")
    Page<DepartmentListResponseDto> findDepartmentsByStatus(@Param("status") boolean status, Pageable pageable);

    @Query("SELECT new com.dreamsol.department.dto.DepartmentDetailResponseDto(d.id, d.departmentCode, d.departmentName, d.shortName, d.departmentType, d.parentDepartment, (SELECT p.departmentName FROM Department p WHERE p.id = d.parentDepartment), d.departmentHead, d.branches, null, d.businessUnit, null, d.costCenter, d.departmentEmail, d.departmentPhone, d.workingDays, d.workingShift, null, d.description, d.departmentLogo, d.documentPath, d.tags, d.keywords, d.remarks, d.status, d.createdBy, d.createdAt, d.updatedBy, d.updatedAt) FROM Department d WHERE d.id = :id")
    Optional<DepartmentDetailResponseDto> findDepartmentDetailById(@Param("id") Long id);

    @Query("SELECT new com.dreamsol.department.dto.DepartmentListResponseDto(d.id, d.departmentCode, d.departmentName, d.shortName, d.departmentType, d.departmentHead, d.branches, d.businessUnit, d.departmentEmail, d.departmentPhone, d.workingDays, d.status, d.createdBy, d.createdAt, d.updatedBy, d.updatedAt) FROM Department d")
    List<DepartmentListResponseDto> findAllDepartments();

    @Query("SELECT new com.dreamsol.department.dto.DepartmentListResponseDto(d.id, d.departmentCode, d.departmentName, d.shortName, d.departmentType, d.departmentHead, d.branches, d.businessUnit, d.departmentEmail, d.departmentPhone, d.workingDays, d.status, d.createdBy, d.createdAt, d.updatedBy, d.updatedAt) FROM Department d WHERE d.createdAt BETWEEN :fromDate AND :toDate")
    List<DepartmentListResponseDto> findDepartmentsByCreatedAtBetween(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    @Query("SELECT new com.dreamsol.department.dto.DepartmentStatusCountResponseDto(COALESCE(SUM(CASE WHEN d.status = false THEN 1 ELSE 0 END), 0), COALESCE(SUM(CASE WHEN d.status = true THEN 1 ELSE 0 END), 0)) FROM Department d")
    DepartmentStatusCountResponseDto getDepartmentStatusCount();

    @Query("SELECT new com.dreamsol.department.dto.DepartmentStatusCountResponseDto(COALESCE(SUM(CASE WHEN d.status = false THEN 1 ELSE 0 END), 0), COALESCE(SUM(CASE WHEN d.status = true THEN 1 ELSE 0 END), 0)) FROM Department d WHERE d.createdAt BETWEEN :fromDate AND :toDate")
    DepartmentStatusCountResponseDto getDepartmentStatusCountByDate(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    @Query("SELECT new com.dreamsol.department.dto.DepartmentTypeCountResponseDto(d.departmentType, COUNT(d)) FROM Department d GROUP BY d.departmentType ORDER BY d.departmentType")
    List<DepartmentTypeCountResponseDto> getDepartmentTypeCounts();

    @Query("SELECT new com.dreamsol.department.dto.DepartmentTypeStatusResponseDto(d.departmentType, SUM(CASE WHEN d.status = false THEN 1 ELSE 0 END), SUM(CASE WHEN d.status = true THEN 1 ELSE 0 END)) FROM Department d GROUP BY d.departmentType ORDER BY d.departmentType")
    List<DepartmentTypeStatusResponseDto> getDepartmentTypeStatusCounts();

    @Query("SELECT new com.dreamsol.department.dto.DepartmentTypeCountResponseDto(d.departmentType, COUNT(d)) FROM Department d WHERE d.createdAt BETWEEN :fromDate AND :toDate GROUP BY d.departmentType ORDER BY d.departmentType")
    List<DepartmentTypeCountResponseDto> getDepartmentTypeCountsByDate(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    @Query("SELECT new com.dreamsol.department.dto.DepartmentTypeStatusResponseDto(d.departmentType, SUM(CASE WHEN d.status = false THEN 1 ELSE 0 END), SUM(CASE WHEN d.status = true THEN 1 ELSE 0 END)) FROM Department d WHERE d.createdAt BETWEEN :fromDate AND :toDate GROUP BY d.departmentType ORDER BY d.departmentType")
    List<DepartmentTypeStatusResponseDto> getDepartmentTypeStatusCountsByDate(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    @Query("SELECT new com.dreamsol.department.dto.DepartmentExportResponseDto(d.departmentCode, d.departmentName, d.departmentHead, d.departmentType, d.branches, d.businessUnit, d.workingDays, d.departmentEmail, d.status, d.createdBy, d.createdAt, d.updatedBy, d.updatedAt) FROM Department d ORDER BY d.id")
    List<DepartmentExportResponseDto> findDepartmentsForExport();

    @Query("SELECT new com.dreamsol.department.dto.DepartmentExportResponseDto(d.departmentCode, d.departmentName, d.departmentHead, d.departmentType, d.branches, d.businessUnit, d.workingDays, d.departmentEmail, d.status, d.createdBy, d.createdAt, d.updatedBy, d.updatedAt) FROM Department d WHERE d.createdAt BETWEEN :fromDate AND :toDate ORDER BY d.id")
    List<DepartmentExportResponseDto> findDepartmentsForExportByDate(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);
}