package com.dreamsol.department.service;
import com.dreamsol.common.excel.ExcelHeader;
import com.dreamsol.common.excel.ExcelUtil;
import com.dreamsol.department.client.MasterClient;
import com.dreamsol.department.client.UserClient;
import com.dreamsol.department.dto.DepartmentDropdownResponseDto;
import com.dreamsol.department.dto.DepartmentExportResponseDto;
import com.dreamsol.department.dto.DepartmentImportRequestDto;
import com.dreamsol.department.dto.UserLookupResponseDto;
import com.dreamsol.department.excel.DepartmentExcelHeader;
import com.dreamsol.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentExcelService {
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final int HEADER_ROW_INDEX = 1;
    private static final int DATA_START_ROW_INDEX = 2;
    private static final String IMPORT_DIRECTORY = "uploads/department/import";
    private static final String CORRECT = "CORRECT";
    private static final String INCORRECT = "INCORRECT";
    private static final String DUPLICATE = "DUPLICATE";
    private static final String ACTIVE = "Active";
    private static final String INACTIVE = "Inactive";
    private static final int MAX_DIRECT_DOWNLOAD_DAYS = 7;
    private static final List<ExcelHeader> IMPORT_HEADERS = DepartmentExcelHeader.IMPORT_HEADERS;
    private static final List<ExcelHeader> EXPORT_HEADERS = DepartmentExcelHeader.EXPORT_HEADERS;
    private final DepartmentRepository departmentRepository;
    private final MasterClient masterClient;
    private final UserClient userClient;
    private final EmailNotificationService emailNotificationService;
    private final ExcelUtil excelUtil = new ExcelUtil();

    public ResponseEntity<?> importDepartments(MultipartFile file) {
        try {
            if (Objects.isNull(file) || file.isEmpty()) return badRequest("Please select an Excel file");
            String fileName = file.getOriginalFilename();
            excelUtil.validateFile(fileName, file.getSize(), MAX_FILE_SIZE);
            try (Workbook workbook = excelUtil.readWorkbook(file.getInputStream())) {
                if (workbook.getNumberOfSheets() == 0) return badRequest("Excel file does not contain any sheet");
                Sheet sheet = workbook.getSheetAt(0);
                if (sheet.getPhysicalNumberOfRows() <= 2) return badRequest("Excel file does not contain data");
                Map<String, Integer> headers = excelUtil.readHeaders(sheet, HEADER_ROW_INDEX);
                List<String> expectedHeaders = IMPORT_HEADERS.stream().map(ExcelHeader::getField).toList();
                List<String> missingHeaders = expectedHeaders.stream().filter(field -> !headers.containsKey(excelUtil.normalize(field))).toList();
                if (!missingHeaders.isEmpty()) return badRequest("Missing columns: " + String.join(", ", missingHeaders));
                List<Map<String, String>> excelRows = excelUtil.readRows(sheet, headers, expectedHeaders, DATA_START_ROW_INDEX);
                if (excelRows.isEmpty()) return badRequest("Excel file does not contain data");
                Map<String, List<DepartmentDropdownResponseDto>> masterData = masterClient.getDropdownData();
                ExistingDepartments existingDepartments = getExistingDepartments();
                Set<String> names = new HashSet<>(existingDepartments.names());
                List<ImportResult> results = excelRows.stream().map(row -> processRow(row, excelRows.indexOf(row) + 3, names, masterData)).toList();
                List<Map<String, Object>> rows = results.stream().map(ImportResult::result).toList();
                List<DepartmentImportRequestDto> saveData = results.stream().filter(result -> CORRECT.equals(result.result().get("type"))).map(ImportResult::request).filter(Objects::nonNull).toList();
                String originalFileName = Objects.toString(fileName, "departments.xlsx");
                Path storedFilePath = storeImportResultFile(rows, originalFileName);
                return ResponseEntity.ok(buildImportResponse(rows, saveData, storedFilePath, originalFileName));
            }
        } catch (IllegalArgumentException ex) {
            return badRequest(ex.getMessage());
        } catch (Exception ex) {
            log.error("Error while importing departments", ex);
            return ResponseEntity.internalServerError().body(Map.of("message", "Unable to process Excel file"));
        }
    }

    private ImportResult processRow(Map<String, String> data, int rowNumber, Set<String> names, Map<String, List<DepartmentDropdownResponseDto>> masterData) {
        Map<String, Object> result = createResult(rowNumber, data);
        String validationError = validateRow(data);
        if (Objects.nonNull(validationError)) return incorrect(result, validationError);
        String name = data.getOrDefault("departmentName", "").trim();
        String normalizedName = name.toLowerCase();
        if (names.contains(normalizedName)) return duplicate(result);
        try {
            DepartmentImportRequestDto request = createRequest(data, masterData);
            names.add(normalizedName);
            return new ImportResult(resultWithReason(result, CORRECT, "Valid record"), request);
        } catch (IllegalArgumentException ex) {
            return incorrect(result, ex.getMessage());
        } catch (Exception ex) {
            log.error("Failed to process row {}", rowNumber, ex);
            return incorrect(result, "Unable to process row");
        }
    }

    private ExistingDepartments getExistingDepartments() {
        List<DepartmentExportResponseDto> departments = departmentRepository.findDepartmentsForExport();
        Set<String> names = departments.stream().map(DepartmentExportResponseDto::getDepartmentName).filter(Objects::nonNull).map(String::trim).map(String::toLowerCase).collect(Collectors.toSet());
        Set<String> codes = departments.stream().map(DepartmentExportResponseDto::getDepartmentCode).filter(Objects::nonNull).map(String::trim).filter(code -> !code.isBlank()).map(String::toLowerCase).collect(Collectors.toSet());
        return new ExistingDepartments(names, codes);
    }

    private String validateRow(Map<String, String> data) {
        String name = data.getOrDefault("departmentName", "");
        String type = data.getOrDefault("departmentType", "");
        String branch = data.getOrDefault("branch", "");
        String workingDays = data.getOrDefault("workingDays", "");
        String email = data.getOrDefault("departmentEmail", "");
        List<String> errors = new ArrayList<>();
        if (name.isBlank()) errors.add("Department Name is required");
        if (type.isBlank()) errors.add("Department Type is required");
        if (branch.isBlank()) errors.add("Branch is required");
        if (workingDays.isBlank()) errors.add("Working Days are required");
        if (!email.isBlank() && !email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) errors.add("Invalid Department Email");
        if (name.length() > 150) errors.add("Department Name cannot exceed 150 characters");
        return errors.isEmpty() ? null : String.join(", ", errors);
    }

    private DepartmentImportRequestDto createRequest(Map<String, String> data, Map<String, List<DepartmentDropdownResponseDto>> masterData) {
        DepartmentImportRequestDto request = new DepartmentImportRequestDto();
        request.setDepartmentName(data.get("departmentName"));
        request.setDepartmentType(data.get("departmentType"));
        String email = data.get("departmentEmail");
        request.setDepartmentEmail(Objects.isNull(email) || email.isBlank() ? null : email);
        request.setBranches(getBranchIds(data.get("branch"), masterData));
        request.setDepartmentHead(getDepartmentHeadId(data.get("departmentHead")));
        request.setBusinessUnit(getBusinessUnitId(data.get("businessUnit"), masterData));
        request.setWorkingDays(getWorkingDays(data.get("workingDays")));
        request.setStatus(parseStatus(data.get("status")));
        return request;
    }

    private Long getDepartmentHeadId(String value) {
        if (Objects.isNull(value) || value.isBlank())
            return null;
        String departmentHeadName = value.trim();
        return userClient.getUsersForLookup().stream().filter(Objects::nonNull).filter(user -> Objects.nonNull(user.getUsername())).filter(user -> user.getUsername().equalsIgnoreCase(departmentHeadName)).map(UserLookupResponseDto::getId).findFirst().orElse(null);
    }

    private List<String> getWorkingDays(String value) {
        if (Objects.isNull(value) || value.isBlank()) throw new IllegalArgumentException("Working Days are required");
        List<String> workingDays = Arrays.stream(value.replace("[", "").replace("]", "").split(",")).map(String::trim).filter(day -> !day.isBlank()).toList();
        if (workingDays.isEmpty()) throw new IllegalArgumentException("Working Days are required");
        return workingDays;
    }

    private List<Long> getBranchIds(String branch, Map<String, List<DepartmentDropdownResponseDto>> masterData) {
        if (Objects.isNull(branch) || branch.isBlank()) throw new IllegalArgumentException("Branch is required");
        return Arrays.stream(branch.replace("[", "").replace("]", "").split(",")).map(String::trim).filter(value -> !value.isBlank()).map(value -> getBranchId(value, masterData)).toList();
    }

    private Long getBranchId(String value, Map<String, List<DepartmentDropdownResponseDto>> masterData) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            return masterData.getOrDefault("branches", List.of()).stream().filter(branch -> Objects.nonNull(branch.getName()) && branch.getName().equalsIgnoreCase(value)).map(DepartmentDropdownResponseDto::getId).findFirst().orElseThrow(() -> new IllegalArgumentException("Invalid Branch: " + value));
        }
    }

    public ResponseEntity<byte[]> exportDepartments(String search, String departmentType, List<Long> branches, Long businessUnit, Boolean status, LocalDate fromDate, LocalDate toDate) {
        try {
            if (Objects.isNull(fromDate) || Objects.isNull(toDate)) return ResponseEntity.badRequest().build();
            if (fromDate.isAfter(toDate)) return ResponseEntity.badRequest().build();
            long days = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
            if (days > MAX_DIRECT_DOWNLOAD_DAYS) return ResponseEntity.badRequest().body(null);
            List<DepartmentExportResponseDto> departments = getFilteredDepartments(search, departmentType, branches, businessUnit, status, fromDate, toDate);
            Map<String, List<DepartmentDropdownResponseDto>> masterData = masterClient.getDropdownData();
            Map<Long, String> userNames = getUserNames();
            return createExcelResponse(departments, masterData, userNames, fromDate, toDate);
        } catch (Exception ex) {
            log.error("Error while exporting departments", ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<?> exportDepartmentsByEmail(String search, String departmentType, List<Long> branches, Long businessUnit, Boolean status, LocalDate fromDate, LocalDate toDate) {
        long totalStart = System.currentTimeMillis();
        try {
            log.info("EXPORT EMAIL START");
            if (Objects.isNull(fromDate) || Objects.isNull(toDate)) return badRequest("From Date and To Date are required");
            if (fromDate.isAfter(toDate)) return badRequest("From Date cannot be after To Date");
            long days = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
            if (days <= MAX_DIRECT_DOWNLOAD_DAYS) return badRequest("Email export is only required for date ranges greater than 7 days");
            long start = System.currentTimeMillis();
            List<DepartmentExportResponseDto> departments = getFilteredDepartments(search, departmentType, branches, businessUnit, status, fromDate, toDate);
            log.info("EXPORT FILTERED DEPARTMENTS COMPLETED | records={} | time={} ms", departments.size(), System.currentTimeMillis() - start);
            start = System.currentTimeMillis();
            Path exportDirectory = Paths.get("uploads/department/export");
            Files.createDirectories(exportDirectory);
            String fileName = "departments_" + fromDate + "_to_" + toDate + ".xlsx";
            Path filePath = exportDirectory.resolve(UUID.randomUUID() + "_" + fileName);
            log.info("EXPORT FILE PATH CREATED | time={} ms", System.currentTimeMillis() - start);
            try (Workbook workbook = excelUtil.createWorkbook("Departments")) {
                Sheet sheet = workbook.getSheet("Departments");
                createHeaders(workbook, sheet);
                start = System.currentTimeMillis();
                Map<String, List<DepartmentDropdownResponseDto>> masterData = masterClient.getDropdownData();
                log.info("EXPORT MASTER DATA COMPLETED | time={} ms", System.currentTimeMillis() - start);
                start = System.currentTimeMillis();
                Map<Long, String> userNames = getUserNames();
                log.info("EXPORT USER NAMES COMPLETED | users={} | time={} ms", userNames.size(), System.currentTimeMillis() - start);
                start = System.currentTimeMillis();
                List<List<String>> rows = departments.stream().map(department -> departmentToRow(department, masterData, userNames)).toList();
                log.info("EXPORT ROW PREPARATION COMPLETED | rows={} | time={} ms", rows.size(), System.currentTimeMillis() - start);
                start = System.currentTimeMillis();
                excelUtil.writeRows(sheet, rows, DATA_START_ROW_INDEX);
                log.info("EXPORT WRITE ROWS COMPLETED | time={} ms", System.currentTimeMillis() - start);
                start = System.currentTimeMillis();
                excelUtil.autoSizeColumns(sheet, EXPORT_HEADERS.size());
                log.info("EXPORT AUTO SIZE COMPLETED | time={} ms", System.currentTimeMillis() - start);
                start = System.currentTimeMillis();
                byte[] bytes = excelUtil.toBytes(workbook);
                log.info("EXPORT EXCEL TO BYTES COMPLETED | size={} bytes | time={} ms", bytes.length, System.currentTimeMillis() - start);
                start = System.currentTimeMillis();
                Files.write(filePath, bytes);
                log.info("EXPORT FILE WRITE COMPLETED | time={} ms", System.currentTimeMillis() - start);
            }
            start = System.currentTimeMillis();
            ResponseEntity<?> response = emailNotificationService.createExportEmailNotification(filePath.toString(), fileName, fromDate, toDate, departments.size());
            log.info("EXPORT EMAIL NOTIFICATION CREATED | time={} ms", System.currentTimeMillis() - start);
            log.info("EXPORT EMAIL TOTAL TIME | time={} ms", System.currentTimeMillis() - totalStart);
            return response;
        } catch (Exception ex) {
            log.error("Error while exporting departments by email", ex);
            log.info("EXPORT EMAIL FAILED | totalTime={} ms", System.currentTimeMillis() - totalStart);
            return ResponseEntity.internalServerError().body(Map.of("message", "Unable to create department export email"));
        }
    }

    private Long getBusinessUnitId(String value, Map<String, List<DepartmentDropdownResponseDto>> masterData) {
        if (Objects.isNull(value) || value.isBlank()) return null;
        if (value.matches("\\d+")) return Long.parseLong(value);
        return masterData.getOrDefault("businessUnits", List.of()).stream().filter(unit -> Objects.nonNull(unit.getName()) && unit.getName().equalsIgnoreCase(value.trim())).map(DepartmentDropdownResponseDto::getId).findFirst().orElseThrow(() -> new IllegalArgumentException("Invalid Business Unit: " + value));
    }

    private Boolean parseStatus(String value) {
        if (Objects.isNull(value) || value.isBlank()) return false;
        if (ACTIVE.equalsIgnoreCase(value) || "false".equalsIgnoreCase(value)) return false;
        if (INACTIVE.equalsIgnoreCase(value) || "true".equalsIgnoreCase(value)) return true;
        throw new IllegalArgumentException("Invalid Status");
    }

    private ResponseEntity<byte[]> createExcelResponse(List<DepartmentExportResponseDto> departments, Map<String, List<DepartmentDropdownResponseDto>> masterData, Map<Long, String> userNames, LocalDate fromDate, LocalDate toDate) {
        try (Workbook workbook = excelUtil.createWorkbook("Departments")) {
            Sheet sheet = workbook.getSheet("Departments");
            createHeaders(workbook, sheet);
            List<List<String>> rows = departments.stream().map(department -> departmentToRow(department, masterData, userNames)).toList();
            excelUtil.writeRows(sheet, rows, DATA_START_ROW_INDEX);
            excelUtil.autoSizeColumns(sheet, EXPORT_HEADERS.size());
            byte[] bytes = excelUtil.toBytes(workbook);
            String fileName = "departments_" + fromDate + "_to_" + toDate + ".xlsx";
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName).contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).body(bytes);
        } catch (Exception ex) {
            log.error("Error while creating department Excel", ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    private void createHeaders(Workbook workbook, Sheet sheet) {
        List<String> headers = EXPORT_HEADERS.stream().map(ExcelHeader::getHeader).toList();
        List<String> types = EXPORT_HEADERS.stream().map(header -> header.isMandatory() ? "Mandatory" : "Optional").toList();
        excelUtil.createHeaderRows(workbook, sheet, headers, types);
    }

    private List<Map<String, Object>> filter(List<Map<String, Object>> rows, String type) {
        return rows.stream().filter(row -> type.equals(row.get("type"))).toList();
    }

    private List<String> departmentToRow(DepartmentExportResponseDto department, Map<String, List<DepartmentDropdownResponseDto>> masterData, Map<Long, String> userNames) {
        String branchNames = department.getBranches() == null ? "" : department.getBranches().stream().map(branchId -> getMasterName(masterData.get("branches"), branchId)).filter(name -> name != null && !name.isBlank()).collect(Collectors.joining(", "));
        String businessUnitName = getMasterName(masterData.get("businessUnits"), department.getBusinessUnit());
        String createdByName = userNames.getOrDefault(department.getCreatedBy(), "");
        String updatedByName = userNames.getOrDefault(department.getUpdatedBy(), "");
        return List.of(value(department.getDepartmentCode()), value(department.getDepartmentName()), value(department.getDepartmentHead()), value(department.getDepartmentType()), branchNames, businessUnitName, value(department.getWorkingDays()), value(department.getDepartmentEmail()), department.isStatus() ? INACTIVE : ACTIVE, createdByName, value(department.getCreatedAt()), updatedByName, value(department.getUpdatedAt()));
    }

    private String getMasterName(List<DepartmentDropdownResponseDto> data, Long id) {
        if (id == null || data == null) return "";
        return data.stream().filter(Objects::nonNull).filter(item -> Objects.equals(item.getId(), id)).map(DepartmentDropdownResponseDto::getName).findFirst().orElse("");
    }

    private Map<String, Object> createResult(int rowNumber, Map<String, String> data) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("rowNumber", rowNumber);
        result.put("departmentName", data.get("departmentName"));
        result.put("departmentHead", data.get("departmentHead"));
        result.put("departmentType", data.get("departmentType"));
        result.put("branch", data.get("branch"));
        result.put("businessUnit", data.get("businessUnit"));
        result.put("workingDays", data.get("workingDays"));
        result.put("departmentEmail", data.get("departmentEmail"));
        result.put("status", data.get("status"));
        result.put("createdBy", data.get("createdBy"));
        result.put("createdOn", data.get("createdOn"));
        result.put("updatedBy", data.get("updatedBy"));
        result.put("updatedOn", data.get("updatedOn"));
        return result;
    }

    private long count(List<Map<String, Object>> rows, String type) {
        return rows.stream().filter(row -> type.equals(row.get("type"))).count();
    }

    private ImportResult incorrect(Map<String, Object> result, String reason) {
        return new ImportResult(resultWithReason(result, INCORRECT, reason), null);
    }

    private ImportResult duplicate(Map<String, Object> result) {
        return new ImportResult(resultWithReason(result, DUPLICATE, "Department already exists"), null);
    }

    private Map<String, Object> resultWithReason(Map<String, Object> result, String type, String reason) {
        result.put("type", type);
        result.put("reason", reason);
        return result;
    }

    private Long parseLong(String value, String field) {
        if (Objects.isNull(value) || value.isBlank()) return null;
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid " + field);
        }
    }

    private Path storeImportResultFile(List<Map<String, Object>> rows, String originalFileName) throws Exception {
        Path uploadDirectory = Paths.get(IMPORT_DIRECTORY);
        Files.createDirectories(uploadDirectory);
        String storedFileName = UUID.randomUUID() + "_" + originalFileName;
        Path storedFilePath = uploadDirectory.resolve(storedFileName);
        try (Workbook workbook = excelUtil.createWorkbook("Import Result")) {
            Sheet sheet = workbook.getSheet("Import Result");
            List<String> headers = new ArrayList<>();
            headers.add("Import Result");
            headers.addAll(IMPORT_HEADERS.stream().map(ExcelHeader::getHeader).toList());
            headers.add("Reason");
            List<String> types = new ArrayList<>();
            types.add("Optional");
            types.addAll(IMPORT_HEADERS.stream().map(header -> header.isMandatory() ? "Mandatory" : "Optional").toList());
            types.add("Optional");
            excelUtil.createHeaderRows(workbook, sheet, headers, types);
            List<List<String>> excelRows = rows.stream().map(this::importResultToRow).toList();
            excelUtil.writeRows(sheet, excelRows, DATA_START_ROW_INDEX);
            excelUtil.autoSizeColumns(sheet, headers.size());
            byte[] fileBytes = excelUtil.toBytes(workbook);
            Files.write(storedFilePath, fileBytes);
        }
        return storedFilePath;
    }

    private List<String> importResultToRow(Map<String, Object> row) {
        return List.of(value(row.get("type")), value(row.get("departmentName")), value(row.get("departmentHead")), value(row.get("departmentType")), value(row.get("branch")), value(row.get("businessUnit")), value(row.get("workingDays")), value(row.get("departmentEmail")), value(row.get("status")), value(row.get("createdBy")), value(row.get("createdOn")), value(row.get("updatedBy")), value(row.get("updatedOn")), value(row.get("reason")));
    }

    private Map<String, Object> buildImportResponse(List<Map<String, Object>> rows, List<DepartmentImportRequestDto> saveData, Path storedFilePath, String originalFileName) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalRows", rows.size());
        response.put("correctCount", count(rows, CORRECT));
        response.put("incorrectCount", count(rows, INCORRECT));
        response.put("duplicateCount", count(rows, DUPLICATE));
        response.put("correct", filter(rows, CORRECT));
        response.put("incorrect", filter(rows, INCORRECT));
        response.put("duplicate", filter(rows, DUPLICATE));
        response.put("saveData", saveData);
        response.put("importFilePath", storedFilePath.toString());
        response.put("importFileName", originalFileName);
        return response;
    }

    private String value(Object value) {
        return Objects.toString(value, "");
    }

    private ResponseEntity<?> badRequest(String message) {
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    private record ExistingDepartments(Set<String> names, Set<String> codes) {}
    private record ImportResult(Map<String, Object> result, DepartmentImportRequestDto request) {}

    public ResponseEntity<byte[]> downloadTemplate() {
        Workbook workbook = null;
        try {
            workbook = excelUtil.createWorkbook("Departments");
            Sheet sheet = workbook.getSheet("Departments");
            List<String> headers = IMPORT_HEADERS.stream().map(ExcelHeader::getHeader).toList();
            List<String> types = IMPORT_HEADERS.stream().map(header -> header.isMandatory() ? "Mandatory" : "Optional").toList();
            excelUtil.createHeaderRows(workbook, sheet, headers, types);
            List<List<String>> dummyData = List.of(List.of("Information Technology", "IT Head", "Technology", "Delhi", "Corporate", "MON,TUE,WED,THU,FRI", "it@example.com", "Active", "", ""));
            excelUtil.writeRows(sheet, dummyData, 2);
            excelUtil.autoSizeColumns(sheet, headers.size());
            byte[] fileBytes = excelUtil.toBytes(workbook);
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=department-template.xlsx").contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).body(fileBytes);
        } catch (Exception ex) {
            log.error("Error while generating department template", ex);
            return ResponseEntity.internalServerError().build();
        } finally {
            try {
                excelUtil.closeWorkbook(workbook);
            } catch (Exception ex) {
                log.error("Error while closing department template workbook", ex);
            }
        }
    }

    private List<DepartmentExportResponseDto> getFilteredDepartments(String search, String departmentType, List<Long> branches, Long businessUnit, Boolean status, LocalDate fromDate, LocalDate toDate) {
        LocalDateTime fromDateTime = fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate.plusDays(1).atStartOfDay().minusNanos(1);
        return departmentRepository.findDepartmentsForExportByDate(fromDateTime, toDateTime).stream().filter(department -> {
            if (search != null && !search.isBlank()) {
                String searchValue = search.trim().toLowerCase();
                boolean matchesSearch = contains(department.getDepartmentCode(), searchValue) || contains(department.getDepartmentName(), searchValue) || contains(department.getDepartmentType(), searchValue) || contains(String.valueOf(department.getDepartmentHead()), searchValue) || contains(String.valueOf(department.getBusinessUnit()), searchValue) || contains(department.getDepartmentEmail(), searchValue);
                if (!matchesSearch) return false;
            }
            if (departmentType != null && !departmentType.isBlank() && !departmentType.equalsIgnoreCase(department.getDepartmentType())) return false;
            if (branches != null && !branches.isEmpty() && (department.getBranches() == null || department.getBranches().stream().noneMatch(branches::contains))) return false;
            if (businessUnit != null && !Objects.equals(department.getBusinessUnit(), businessUnit)) return false;
            return status == null || department.isStatus() == status;
        }).toList();
    }

    private boolean contains(String value, String search) {
        return value != null && value.toLowerCase().contains(search);
    }

    private Map<Long, String> getUserNames() {
        try {
            return userClient.getUsersForLookup().stream().filter(Objects::nonNull).filter(user -> user.getId() != null).collect(Collectors.toMap(UserLookupResponseDto::getId, UserLookupResponseDto::getUsername, (first, second) -> first));
        } catch (Exception ex) {
            log.error("Unable to fetch user lookup data", ex);
            return Map.of();
        }
    }
}