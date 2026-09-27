package com.dreamsol.master.repository;

import com.dreamsol.master.entity.WorkingShift;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkingShiftRepository extends JpaRepository<WorkingShift, Long> {

    List<WorkingShift> findByStatusFalse();
}