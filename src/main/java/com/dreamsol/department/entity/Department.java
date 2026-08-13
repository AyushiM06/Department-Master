package com.dreamsol.department.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
public class Department
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(length = 20, nullable = false, unique = true)
    private String departmentCode;
    @Column(length = 150, nullable = false)
    private String departmentName;
    @Column(length = 50)
    private String shortName;
    @Column(length = 50, nullable = false)
    private String departmentType;
    private Long parentDepartmentId;
    private Long departmentHead;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<Long> branchIds;
    private Long businessUnitId;
    @Column(length = 50)
    private String costCenter;
    @Column(length = 150)
    private String departmentEmail;
    @Column(length = 15)
    private String departmentPhone;
    @Column(length = 100)
    private List<String> workingDays;
    private Long workingShiftId;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String departmentLogo;
    private String documentPath;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> tags;
    @Column(columnDefinition = "TEXT")
    private String keywords;
    @Column(columnDefinition = "TEXT")
    private String remarks;
    @Column(nullable = false)
    private Boolean status;
    private Long createdBy;
    private LocalDateTime createdAt;
    private Long updatedBy;
    private LocalDateTime updatedAt;
    @Column(nullable = false)
    private Boolean isDeleted;
}
