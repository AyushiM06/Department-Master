package com.dreamsol.department.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;
import java.util.UUID;

@Entity
@Table(uniqueConstraints = {@UniqueConstraint(name = "uk_department_attachment_uuid", columnNames = "uuid")})
@Getter
@Setter
public class DepartmentAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, updatable = false, length = 36)
    private String uuid;
    @Column(nullable = false)
    private Long departmentId;
    @Column(nullable = false, length = 500)
    private String filePath;
    @Column(nullable = false)
    private String fileName;
    @Column(nullable = false, length = 30)
    private String attachmentType;
    @PrePersist
    public void generateUuid() {
        if (Objects.isNull(uuid) || uuid.isBlank())
            uuid = UUID.randomUUID().toString();
    }
}