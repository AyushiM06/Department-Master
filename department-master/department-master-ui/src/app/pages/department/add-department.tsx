import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import TextField from "../../component/TextField";
import TextArea from "../../component/TextArea";
import Dropdown from "../../component/Dropdown";
import MultiSelect from "../../component/MultiSelect";
import AutoComplete from "../../component/AutoComplete";
import MultiAutoComplete from "../../component/MultiAutoComplete";
import Attachment from "../../component/Attachment";
import {
  departmentInitialValues,
  addDepartmentValidationSchema,
  type DepartmentFormValues,
} from "../../validation/department-validations";
import type { AutoCompleteOption } from "../../component/AutoComplete";
import type { MultiAutoCompleteOption } from "../../component/MultiAutoComplete";
import {
  createDepartment,
  searchEmployees,
  createEmployee,
  uploadDepartmentAttachment,
  getDepartmentDropdownData,
  searchDepartments,
  type DepartmentDropdownResponse,
  type DepartmentAttachmentUpload,
} from "./departmentApi";

export interface Option {
  label: string;
  value: string | number;
}

export interface TagOption {
  label: string;
  value: string;
}

interface AddDepartmentFormValues {
  departments: DepartmentFormValues[];
}

interface AddDepartmentProps {
  onClose: () => void | Promise<void>;
}

const workingDaysOptions: Option[] = [
  { label: "Mon", value: "MON" },
  { label: "Tue", value: "TUE" },
  { label: "Wed", value: "WED" },
  { label: "Thu", value: "THU" },
  { label: "Fri", value: "FRI" },
  { label: "Sat", value: "SAT" },
  { label: "Sun", value: "SUN" },
];

const tagOptions: TagOption[] = [
  { label: "Important", value: "important" },
  { label: "Management", value: "management" },
  { label: "Internal", value: "internal" },
  { label: "Technical", value: "technical" },
];

const isFile = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

function AddDepartment({ onClose }: AddDepartmentProps) {
  const [departmentTypeOptions, setDepartmentTypeOptions] = useState<Option[]>(
    [],
  );
  const [branchOptions, setBranchOptions] = useState<Option[]>([]);
  const [businessUnitOptions, setBusinessUnitOptions] = useState<Option[]>([]);
  const [shiftOptions, setShiftOptions] = useState<Option[]>([]);

  const [parentDepartmentOptions, setParentDepartmentOptions] = useState<
    AutoCompleteOption[]
  >([]);

  const [departmentHeadOptions, setDepartmentHeadOptions] = useState<
    AutoCompleteOption[]
  >([]);

  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [parentDepartmentLoading, setParentDepartmentLoading] = useState(false);
  const [, setDepartmentHeadLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { isSubmitting },
  } = useForm<AddDepartmentFormValues>({
    defaultValues: { departments: [{ ...departmentInitialValues }] },
    resolver: yupResolver(addDepartmentValidationSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "departments",
  });

  useEffect(() => {
    let mounted = true;

    const loadDropdownData = async () => {
      try {
        setDropdownLoading(true);

        const data: DepartmentDropdownResponse =
          await getDepartmentDropdownData();

        if (!mounted) return;

        const departmentTypes = Array.isArray(data?.departmentTypes)
          ? data.departmentTypes
          : [];

        const mappedDepartmentTypes: Option[] = departmentTypes.map((item) => ({
          label: typeof item === "string" ? item : String(item.name),
          value: typeof item === "string" ? item : String(item.name),
        }));

        const branches = Array.isArray(data?.branches) ? data.branches : [];

        const mappedBranches: Option[] = branches.map((item) => ({
          label: String(item.name),
          value: Number(item.id),
        }));

        const businessUnits = Array.isArray(data?.businessUnits)
          ? data.businessUnits
          : [];

        const mappedBusinessUnits: Option[] = businessUnits.map((item) => ({
          label: String(item.name),
          value: Number(item.id),
        }));

        const workingShifts = Array.isArray(data?.workingShifts)
          ? data.workingShifts
          : [];

        const mappedShifts: Option[] = workingShifts.map((item) => ({
          label: String(item.name),
          value: Number(item.id),
        }));

        setDepartmentTypeOptions(mappedDepartmentTypes);
        setBranchOptions(mappedBranches);
        setBusinessUnitOptions(mappedBusinessUnits);
        setShiftOptions(mappedShifts);
      } catch (error) {
        console.error("FAILED TO LOAD ADD DEPARTMENT DROPDOWNS:", error);

        if (!mounted) return;

        setDepartmentTypeOptions([]);
        setBranchOptions([]);
        setBusinessUnitOptions([]);
        setShiftOptions([]);
      } finally {
        if (mounted) {
          setDropdownLoading(false);
        }
      }
    };

    loadDropdownData();

    return () => {
      mounted = false;
    };
  }, []);

  const loadParentDepartments = async () => {
    try {
      setParentDepartmentLoading(true);

      const response = await searchDepartments({
        globalSearch: null,
        branches: null,
        page: 0,
        size: 1000,
        sortBy: "departmentName",
        direction: "asc",
      });

      console.log("PARENT DEPARTMENT INITIAL LOAD:", response);

      const content = Array.isArray(response?.data?.content)
        ? response.data.content
        : [];

      const options: AutoCompleteOption[] = content
        .filter((item: any) => item?.id != null && item?.departmentName)
        .map((item: any) => ({
          label: String(item.departmentName).trim(),
          value: Number(item.id),
        }));

      setParentDepartmentOptions(options);
    } catch (error) {
      console.error("FAILED TO LOAD PARENT DEPARTMENTS:", error);

      setParentDepartmentOptions([]);
    } finally {
      setParentDepartmentLoading(false);
    }
  };

  const loadDepartmentHeads = async () => {
    try {
      setDepartmentHeadLoading(true);

      const response = await searchEmployees("");

      console.log("DEPARTMENT HEAD INITIAL LOAD:", response);

      const employees = Array.isArray(response) ? response : [];

      const options: AutoCompleteOption[] = employees
        .filter(
          (employee: any) =>
            employee?.id != null &&
            employee?.name &&
            String(employee.name).trim() !== "",
        )
        .map((employee: any) => ({
          label: String(employee.name).trim(),
          value: Number(employee.id),
        }));

      setDepartmentHeadOptions(options);
    } catch (error) {
      console.error("FAILED TO LOAD DEPARTMENT HEADS:", error);

      setDepartmentHeadOptions([]);
    } finally {
      setDepartmentHeadLoading(false);
    }
  };

  useEffect(() => {
    loadParentDepartments();
    loadDepartmentHeads();
  }, []);

  const onSubmit = async (formValues: AddDepartmentFormValues) => {
  try {
    // ============================================================
    // 1. CREATE ALL DEPARTMENT PAYLOADS
    // ============================================================

    const payloads = formValues.departments.map((formValuesItem) => ({
      departmentName: formValuesItem.departmentName,

      shortName: formValuesItem.shortName,

      departmentType: formValuesItem.departmentType,

      parentDepartment: formValuesItem.parentDepartment
        ? Number(formValuesItem.parentDepartment.value)
        : null,

      departmentHead: formValuesItem.departmentHead
        ? Number(formValuesItem.departmentHead.value)
        : null,

      branches: Array.isArray(formValuesItem.branches)
        ? formValuesItem.branches
            .map(Number)
            .filter((id: number) => Number.isFinite(id))
        : [],

      businessUnit: formValuesItem.businessUnit
        ? Number(formValuesItem.businessUnit)
        : null,

      costCenter: formValuesItem.costCenter,

      departmentEmail:
        formValuesItem.departmentEmail?.trim() || undefined,

      departmentPhone:
        formValuesItem.departmentPhone?.trim() || undefined,

      workingDays: Array.isArray(formValuesItem.workingDays)
        ? formValuesItem.workingDays.map(String)
        : [],

      workingShift: formValuesItem.workingShift
        ? Number(formValuesItem.workingShift)
        : null,

      description: formValuesItem.description,

      departmentLogo: isFile(formValuesItem.departmentLogo)
        ? formValuesItem.departmentLogo.name
        : undefined,

      documentPath: isFile(formValuesItem.supportingDocument)
        ? formValuesItem.supportingDocument.name
        : undefined,

      tags: Array.isArray(formValuesItem.tags)
        ? formValuesItem.tags.map(
            (tag: MultiAutoCompleteOption) =>
              String(tag.value),
          )
        : [],

      keywords: formValuesItem.keywords,

      remarks: formValuesItem.remarks,

      // New department = Active
      status: false,
    }));

    console.log(
      "ALL DEPARTMENT PAYLOADS:",
      payloads,
    );

    // ============================================================
    // 2. SAVE ALL DEPARTMENTS
    // ONLY ONE API CALL
    // ============================================================

    const response = await createDepartment(payloads);

    console.log(
      "BULK DEPARTMENT SAVE RESPONSE:",
      response,
    );

    /*
     * createDepartment() ka response actual axios response
     * hai ya direct data, uske according list nikal rahe hain.
     */

    const savedDepartments = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : [];

    console.log(
      "SAVED DEPARTMENTS:",
      savedDepartments,
    );

    if (
      savedDepartments.length !==
      formValues.departments.length
    ) {
      throw new Error(
        `Expected ${formValues.departments.length} departments to be saved, but ${savedDepartments.length} were returned.`,
      );
    }

    // ============================================================
    // 3. COLLECT ALL ATTACHMENTS
    // ============================================================

    const attachments: DepartmentAttachmentUpload[] =
      formValues.departments.flatMap(
        (formValuesItem, index) => {

          const savedDepartment =
            savedDepartments[index];

          const savedDepartmentId =
            savedDepartment?.id;

          if (!savedDepartmentId) {
            return [];
          }

          const departmentAttachments: DepartmentAttachmentUpload[] =
            [];

          // --------------------------------------------------------
          // LOGO
          // --------------------------------------------------------

          if (
            isFile(
              formValuesItem.departmentLogo,
            )
          ) {
            departmentAttachments.push({
              departmentId:
                Number(savedDepartmentId),

              file:
                formValuesItem.departmentLogo,

              attachmentType:
                "LOGO",
            });
          }

          // --------------------------------------------------------
          // DOCUMENT
          // --------------------------------------------------------

          if (
            isFile(
              formValuesItem.supportingDocument,
            )
          ) {
            departmentAttachments.push({
              departmentId:
                Number(savedDepartmentId),

              file:
                formValuesItem.supportingDocument,

              attachmentType:
                "DOCUMENT",
            });
          }

          return departmentAttachments;
        },
      );

    console.log(
      "ALL ATTACHMENTS:",
      attachments,
    );

    // ============================================================
    // 4. UPLOAD ALL ATTACHMENTS
    // ONLY ONE API CALL
    // ============================================================

    if (attachments.length > 0) {
      await uploadDepartmentAttachment(
        attachments,
      );
    }

    // ============================================================
    // 5. SUCCESS
    // ============================================================

    await Swal.fire({
      text:
        formValues.departments.length > 1
          ? `${formValues.departments.length} Departments Added Successfully`
          : "Department Added Successfully",

      icon: "success",

      timer: 2000,

      showConfirmButton: false,
    });

    // ============================================================
    // 6. CLOSE
    // ============================================================

    await onClose();

  } catch (error) {
    console.error(
      "FAILED TO SAVE DEPARTMENTS:",
      error,
    );

    if (axios.isAxiosError(error)) {
      const backendData =
        error.response?.data;

      const errorMessage =
        typeof backendData === "string"
          ? backendData
          : (
              backendData?.error ??
              backendData?.message ??
              "Failed to save department"
            );

      await Swal.fire({
        text: errorMessage,
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
      });

      return;
    }

    await Swal.fire({
      text:
        error instanceof Error
          ? error.message
          : "Something went wrong while saving departments",

      icon: "error",

      timer: 3000,

      showConfirmButton: false,
    });
  }
};

  const handleAddDepartment = async () => {
    const isValid = await trigger();

    if (!isValid) {
      await Swal.fire({
        text: "Please fill the required fields correctly before adding another department.",
        icon: "warning",
        timer: 2500,
        showConfirmButton: false,
      });

      return;
    }

    append({ ...departmentInitialValues });
  };

  const handleReset = () => {
    reset({
      departments: [{ ...departmentInitialValues }],
    });
  };

  const handleBack = async () => {
    await onClose();
  };

  return (
    <Paper
      sx={{
        backgroundColor: "transparent",
        boxShadow: "none",
      }}
    >
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#115E59",
            mb: 3,
          }}
        >
          Add Department
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {fields.map((item, index) => (
            <Card
              key={item.id}
              sx={{
                mb: 3,
                borderRadius: 3,
                backgroundColor: "#FFFFFF",
                border: "1px solid #D9E5E2",
                boxShadow: "0 4px 18px rgba(15, 118, 110, 0.07)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#115E59",
                    }}
                  >
                    Department {index + 1}
                  </Typography>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outlined"
                      color="error"
                      onClick={() => remove(index)}
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  )}
                </Box>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.departmentName`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          label="Department Name"
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                          maxLength={150}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.shortName`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          label="Short Name"
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                          maxLength={50}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.departmentType`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <Dropdown
                          label="Department Type"
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            trigger(`departments.${index}.departmentType`);
                          }}
                          onBlur={() => {
                            field.onBlur();
                            trigger(`departments.${index}.departmentType`);
                          }}
                          options={departmentTypeOptions}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                          required
                          disabled={dropdownLoading}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.parentDepartment`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <AutoComplete
                          label="Parent Department"
                          value={field.value as AutoCompleteOption | null}
                          onChange={(option) => field.onChange(option)}
                          options={parentDepartmentOptions}
                          error={Boolean(fieldState.error)}
                          helperText={
                            parentDepartmentLoading
                              ? "Loading departments..."
                              : fieldState.error?.message
                          }
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.departmentHead`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <AutoComplete
                          label="Department Head"
                          value={field.value as AutoCompleteOption | null}
                          options={departmentHeadOptions}
                          allowCreate
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                          onChange={async (option) => {
                            if (!option) {
                              field.onChange(null);
                              return;
                            }

                            if (option.isNew) {
                              try {
                                setDepartmentHeadLoading(true);

                                const employee = await createEmployee(
                                  String(option.value),
                                );

                                const newEmployeeOption: AutoCompleteOption = {
                                  label: employee.name,
                                  value: Number(employee.id),
                                };

                                field.onChange(newEmployeeOption);

                                setDepartmentHeadOptions((prev) => {
                                  const exists = prev.some(
                                    (item) =>
                                      Number(item.value) ===
                                      Number(employee.id),
                                  );

                                  return exists
                                    ? prev
                                    : [...prev, newEmployeeOption];
                                });
                              } catch (error) {
                                console.error(
                                  "FAILED TO CREATE EMPLOYEE:",
                                  error,
                                );
                              } finally {
                                setDepartmentHeadLoading(false);
                              }

                              return;
                            }

                            // Existing employee
                            field.onChange(option);
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.branches`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <MultiSelect
                          label="Branch"
                          name={field.name}
                          value={field.value ?? []}
                          onChange={(e) => {
                            const selected = e.target.value;

                            const values = Array.isArray(selected)
                              ? selected.map(Number)
                              : String(selected)
                                  .split(",")
                                  .filter(Boolean)
                                  .map(Number);

                            field.onChange(values);
                          }}
                          onBlur={field.onBlur}
                          options={branchOptions}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                          required
                          disabled={dropdownLoading}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.businessUnit`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <Dropdown
                          label="Business Unit"
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          options={businessUnitOptions}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                          disabled={dropdownLoading}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.costCenter`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          label="Cost Center"
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                          maxLength={50}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.departmentEmail`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          label="Department Email"
                          name={field.name}
                          type="email"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                          maxLength={150}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.departmentPhone`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          label="Department Phone"
                          name={field.name}
                          type="text"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                          maxLength={15}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.workingShift`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <Dropdown
                          label="Working Shift"
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          options={shiftOptions}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                          disabled={dropdownLoading}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.workingDays`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <MultiSelect
                          label="Working Days"
                          name={field.name}
                          value={field.value ?? []}
                          onChange={(e) => {
                            const selected = e.target.value;

                            const values = Array.isArray(selected)
                              ? selected.map(String)
                              : String(selected).split(",").filter(Boolean);

                            field.onChange(values);
                          }}
                          onBlur={field.onBlur}
                          options={workingDaysOptions}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={`departments.${index}.description`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextArea
                          label="Department Description"
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          rows={3}
                          maxLength={1000}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={`departments.${index}.keywords`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextArea
                          label="Keywords"
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          rows={3}
                          maxLength={500}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Controller
                      name={`departments.${index}.remarks`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextArea
                          label="Remarks"
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          rows={2}
                          maxLength={1000}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.departmentLogo`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <Attachment
                          label="Department Logo"
                          file={isFile(field.value) ? field.value : null}
                          onChange={(file) => field.onChange(file)}
                          allowedTypes={[
                            "image/jpeg",
                            "image/jpg",
                            "image/png",
                          ]}
                          maxSizeMB={5}
                          helperText={
                            fieldState.error?.message ??
                            "jpg, jpeg, png (max 5MB)"
                          }
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.supportingDocument`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <Attachment
                          label="Supporting Document"
                          file={isFile(field.value) ? field.value : null}
                          onChange={(file) => field.onChange(file)}
                          allowedTypes={[
                            "application/pdf",
                            "application/msword",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            "application/vnd.ms-excel",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                          ]}
                          maxSizeMB={20}
                          helperText={
                            fieldState.error?.message ??
                            "pdf, docx, xlsx (max 20MB)"
                          }
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Controller
                      name={`departments.${index}.tags`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <MultiAutoComplete
                          label="Tags"
                          value={field.value ?? []}
                          onChange={(value) => field.onChange(value)}
                          options={tagOptions}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={handleAddDepartment}
              disabled={isSubmitting || dropdownLoading}
              sx={{
                minWidth: 220,
                height: 44,
                color: "#0F766E",
                borderColor: "#0F766E",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#115E59",
                  backgroundColor: "rgba(15, 118, 110, 0.05)",
                },
              }}
            >
              + Add Another Department
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1.5,
              mt: 2,
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                minWidth: 120,
                backgroundColor: "#0F766E",
                "&:hover": {
                  backgroundColor: "#115E59",
                },
              }}
            >
              {isSubmitting
                ? "Saving..."
                : fields.length > 1
                  ? "Save All"
                  : "Save"}
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={handleReset}
              disabled={isSubmitting}
              sx={{
                minWidth: 110,
                color: "#0F766E",
                borderColor: "#0F766E",
              }}
            >
              Reset
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={handleBack}
              disabled={isSubmitting}
              sx={{
                minWidth: 110,
                color: "#475569",
                borderColor: "#CBD5E1",
              }}
            >
              Back
            </Button>
          </Box>
        </form>
      </Box>
    </Paper>
  );
}

export default AddDepartment;
