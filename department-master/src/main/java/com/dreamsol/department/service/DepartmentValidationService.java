package com.dreamsol.department.service;

import com.dreamsol.common.validation.ValidationResponse;
import com.dreamsol.common.validation.ValidationUtil;
import com.dreamsol.department.dto.DepartmentDropdownResponseDto;
import com.dreamsol.department.dto.DepartmentRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DepartmentValidationService {

    private final ValidationUtil validationUtil;

    public ValidationResponse validate(
            DepartmentRequestDto request,
            Map<String, List<DepartmentDropdownResponseDto>> masterData) {

        String validationError =
                validationUtil.getValidationError(request);

        if (Objects.nonNull(validationError)) {
            return ValidationResponse.failure(validationError);
        }

        String masterDataError =
                validateMasterData(request, masterData);

        if (Objects.nonNull(masterDataError)) {
            return ValidationResponse.failure(masterDataError);
        }

        return ValidationResponse.success();
    }

    private String validateMasterData(
            DepartmentRequestDto request,
            Map<String, List<DepartmentDropdownResponseDto>> masterData) {

        List<DepartmentDropdownResponseDto> departmentTypes =
                masterData.getOrDefault(
                        "departmentTypes",
                        List.of()
                );

        List<DepartmentDropdownResponseDto> branches =
                masterData.getOrDefault(
                        "branches",
                        List.of()
                );

        List<DepartmentDropdownResponseDto> businessUnits =
                masterData.getOrDefault(
                        "businessUnits",
                        List.of()
                );

        List<DepartmentDropdownResponseDto> workingShifts =
                masterData.getOrDefault(
                        "workingShifts",
                        List.of()
                );

        boolean validDepartmentType =
                departmentTypes.stream()
                        .anyMatch(type ->
                                type.getName() != null
                                        && type.getName()
                                        .equalsIgnoreCase(
                                                request.getDepartmentType()
                                        )
                        );

        if (!validDepartmentType) {
            return "Invalid or inactive Department Type";
        }

        if (Objects.isNull(request.getBranches())
                || request.getBranches().isEmpty()) {

            return "Branch IDs are required";
        }

        boolean validBranches =
                request.getBranches()
                        .stream()
                        .allMatch(branchId ->
                                branches.stream()
                                        .anyMatch(branch ->
                                                Objects.equals(
                                                        branch.getId(),
                                                        branchId
                                                )
                                        )
                        );

        if (!validBranches) {
            return "Invalid or inactive Branch";
        }

        if (Objects.nonNull(request.getBusinessUnit())) {

            boolean validBusinessUnit =
                    businessUnits.stream()
                            .anyMatch(unit ->
                                    Objects.equals(
                                            unit.getId(),
                                            request.getBusinessUnit()
                                    )
                            );

            if (!validBusinessUnit) {
                return "Invalid or inactive Business Unit";
            }
        }

        if (Objects.nonNull(request.getWorkingShift())) {

            boolean validWorkingShift =
                    workingShifts.stream()
                            .anyMatch(shift ->
                                    Objects.equals(
                                            shift.getId(),
                                            request.getWorkingShift()
                                    )
                            );

            if (!validWorkingShift) {
                return "Invalid or inactive Working Shift";
            }
        }

        return null;
    }
}

