package com.dreamsol.master.repository;

import com.dreamsol.master.entity.BusinessUnit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BusinessUnitRepository extends JpaRepository<BusinessUnit, Long> {

    List<BusinessUnit> findByStatusFalse();
}