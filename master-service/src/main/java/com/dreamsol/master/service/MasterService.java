package com.dreamsol.master.service;

import com.dreamsol.master.dto.MasterDropdownResponseDto;
import com.dreamsol.master.repository.BranchRepository;
import com.dreamsol.master.repository.BusinessUnitRepository;
import com.dreamsol.master.repository.DepartmentTypeRepository;
import com.dreamsol.master.repository.WorkingShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MasterService {

    private final DepartmentTypeRepository departmentTypeRepository;
    private final BranchRepository branchRepository;
    private final BusinessUnitRepository businessUnitRepository;
    private final WorkingShiftRepository workingShiftRepository;

    @Cacheable(
            value = "masterDropdown",
            key = "'all'",
            unless = "#result == null"
    )
    public Map<String, List<MasterDropdownResponseDto>> getDropdownData() {

        return Map.of("departmentTypes", departmentTypeRepository.findByStatusFalse().stream().map(x -> new MasterDropdownResponseDto(x.getId(), x.getName())).toList(),
                "branches", branchRepository.findByStatusFalse().stream().map(x -> new MasterDropdownResponseDto(x.getId(), x.getName())).toList(),
                "businessUnits", businessUnitRepository.findByStatusFalse().stream().map(x -> new MasterDropdownResponseDto(x.getId(), x.getName())).toList(),
                "workingShifts", workingShiftRepository.findByStatusFalse().stream().map(x -> new MasterDropdownResponseDto(x.getId(), x.getName())).toList()
        );
    }
}