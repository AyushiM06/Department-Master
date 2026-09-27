package com.dreamsol.common.excel;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class ExcelUtil {
    public boolean validateFile(String fileName, long fileSize, long maxSizeBytes) {
        if (Objects.isNull(fileName) || fileName.isBlank() || fileSize <= 0)
            return false;
        String file = fileName.toLowerCase(Locale.ROOT);
        return (file.endsWith(".xlsx") || file.endsWith(".xls")) && fileSize <= maxSizeBytes;
    }

    public Workbook readWorkbook(InputStream inputStream) throws IOException {
        if (Objects.isNull(inputStream))
            return null;
        return WorkbookFactory.create(inputStream);
    }

    public Map<String, Integer> readHeaders(Sheet sheet, int headerRowIndex) {
        if (Objects.isNull(sheet))
            return Map.of();
        Row headerRow = sheet.getRow(headerRowIndex);
        if (Objects.isNull(headerRow))
            return Map.of();
        return IntStream.range(0, headerRow.getLastCellNum()).mapToObj(index -> Map.entry(normalize(getCellValue(headerRow.getCell(index))), index))
                .filter(entry -> !entry.getKey().isBlank()).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (first, second) -> first, LinkedHashMap::new));
    }

    public List<Map<String, String>> readRows(Sheet sheet, Map<String, Integer> headers, List<String> expectedHeaders, int firstDataRowIndex) {
        if (Objects.isNull(sheet) || Objects.isNull(headers) || Objects.isNull(expectedHeaders))
            return List.of();
        return IntStream.rangeClosed(firstDataRowIndex, sheet.getLastRowNum()).mapToObj(sheet::getRow)
                .filter(Objects::nonNull).filter(row -> !isEmptyRow(row, expectedHeaders.size())).map(row -> readRow(row, headers, expectedHeaders)).toList();
    }

    public Map<String, String> readRow(Row row, Map<String, Integer> headers, List<String> expectedHeaders) {
        if (Objects.isNull(row) || Objects.isNull(headers) || Objects.isNull(expectedHeaders))
            return Map.of();
        return expectedHeaders.stream().collect(Collectors.toMap(header -> header, header -> getValue(row, headers, header), (first, second) -> second, LinkedHashMap::new));
    }

    public String getCellValue(Cell cell) {
        return Objects.isNull(cell) ? "" : new DataFormatter().formatCellValue(cell).trim();
    }

    public String normalize(String value) {
        return Objects.isNull(value) ? "" : value.trim().replaceAll("[^a-zA-Z0-9]", "").toLowerCase(Locale.ROOT);
    }

    public boolean isEmptyRow(Row row, int columnCount) {
        if (Objects.isNull(row) || columnCount <= 0)
            return true;
        return IntStream.range(0, columnCount).allMatch(index -> getCellValue(row.getCell(index)).isBlank());
    }

    public Workbook createWorkbook(String sheetName) {
        Workbook workbook = new XSSFWorkbook();
        if (Objects.nonNull(sheetName) && !sheetName.isBlank())
            workbook.createSheet(sheetName);
        return workbook;
    }

    public void createHeaderRows(Workbook workbook, Sheet sheet, List<String> headers, List<String> types) {
        if (Objects.isNull(workbook) || Objects.isNull(sheet) || Objects.isNull(headers) || Objects.isNull(types) || headers.size() != types.size())
            return;
        CellStyle mandatory = createStyle(workbook, IndexedColors.RED, IndexedColors.WHITE);
        CellStyle optional = createStyle(workbook, IndexedColors.YELLOW, null);
        CellStyle header = createStyle(workbook, IndexedColors.TEAL, IndexedColors.WHITE);
        Row typeRow = sheet.createRow(0);
        Row headerRow = sheet.createRow(1);
        IntStream.range(0, headers.size()).forEach(index -> {Cell typeCell = typeRow.createCell(index);
                    typeCell.setCellValue(Objects.toString(types.get(index), ""));
                    typeCell.setCellStyle("Mandatory".equalsIgnoreCase(types.get(index)) ? mandatory : optional);
                    Cell headerCell = headerRow.createCell(index);
                    headerCell.setCellValue(Objects.toString(headers.get(index), ""));
                    headerCell.setCellStyle(header);
        });
    }

    public void writeRows(Sheet sheet, List<List<String>> rows, int firstRowIndex) {
        if (Objects.isNull(sheet) || Objects.isNull(rows) || rows.isEmpty())
            return;
        IntStream.range(0, rows.size()).forEach(rowIndex -> {List<String> values = rows.get(rowIndex);
            if (Objects.isNull(values))
                        return;
            Row row = sheet.createRow(firstRowIndex + rowIndex);
            IntStream.range(0, values.size()).forEach(columnIndex -> row.createCell(columnIndex).setCellValue(Objects.toString(values.get(columnIndex), "")));
        });
    }

    public void autoSizeColumns(Sheet sheet, int columnCount) {
        if (Objects.isNull(sheet) || columnCount <= 0)
            return;
        IntStream.range(0, columnCount).forEach(sheet::autoSizeColumn);
    }

    public byte[] toBytes(Workbook workbook) throws IOException {
        if (Objects.isNull(workbook))
            return new byte[0];
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            workbook.write(output);
            return output.toByteArray();
        }
    }

    public void closeWorkbook(Workbook workbook) throws IOException {
        if (Objects.nonNull(workbook))
            workbook.close();
    }

    private String getValue(Row row, Map<String, Integer> headers, String header) {
        String normalizedHeader = normalize(header);
        Integer columnIndex = headers.get(normalizedHeader);
        return Objects.isNull(columnIndex) || columnIndex < 0 ? "" : getCellValue(row.getCell(columnIndex));
    }

    private CellStyle createStyle(Workbook workbook, IndexedColors background, IndexedColors fontColor) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        if (Objects.nonNull(fontColor))
            font.setColor(fontColor.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(background.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }
}