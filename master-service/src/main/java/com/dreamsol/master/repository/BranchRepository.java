package com.dreamsol.master.repository;

import com.dreamsol.master.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BranchRepository extends JpaRepository<Branch, Long> {

    List<Branch> findByStatusFalse();
}