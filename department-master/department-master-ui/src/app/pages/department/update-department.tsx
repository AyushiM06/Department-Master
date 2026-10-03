import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import { fetchDepartmentDropdownData } from "../../../store/slices/departmentSlice";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";
import { Box, Button, Card, CardContent, Grid, Paper } from "@mui/material";

import TextField from "../../component/TextField";
import TextArea from "../../component/TextArea";
import Dropdown from "../../component/Dropdown";
import MultiSelect from "../../component/MultiSelect";
import AutoComplete from "../../component/AutoComplete";
import MultiAutoComplete from "../../component/MultiAutoComplete";
import Attachment from "../../component/Attachment";

import {
  departmentValidationSchema,
  departmentInitialValues,
  type DepartmentFormValues,
} from "../../validation/department-validations";

import type { AutoCompleteOption } from "../../component/AutoComplete";
import type { MultiAutoCompleteOption } from "../../component/MultiAutoComplete";

import {
  updateDepartment,
  uploadDepartmentAttachment,
  type DepartmentAttachmentUpload,
  createDepartmentEmailNotification,
  searchDepartments,
  searchEmployees,
  createEmployee,
} from "./departmentApi";

export interface Option {
  label: string;
  value: string | number;
}

export interface TagOption {
  label: string;
  value: string;
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

const statusOptions: Option[] = [
  { label: "Active", value: "false" },
  { label: "Inactive", value: "true" },
];

export interface DepartmentRow {
  id: number;
  departmentName: string;
  shortName?: string | null;
  departmentType: string;
  parentDepartment?: number | null;
  departmentHead?: string | number | null;
  branches?: number[] | null;
  businessUnit?: number | null;
  costCenter?: string | null;
  departmentEmail?: string | null;
  departmentPhone?: string | null;
  workingDays?: string[] | null;
  workingShift?: number | null;
  description?: string | null;
  departmentLogo?: string | null;
  documentPath?: string | null;
  tags?: string[] | null;
  keywords?: string | null;
  remarks?: string | null;
  status: boolean;
}

interface UpdateDepartmentProps {
  department: DepartmentRow;
  onClose?: () => void | Promise<void>;
}

const isFile = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

const normalizeWorkingDays = (value: unknown): string[] => {
  const dayMap: Record<string, string> = {
    MONDAY: "MON",
    TUESDAY: "TUE",
    WEDNESDAY: "WED",
    THURSDAY: "THU",
    FRIDAY: "FRI",
    SATURDAY: "SAT",
    SUNDAY: "SUN",
  };

  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  return values
    .map(
      (day) =>
        dayMap[String(day).trim().toUpperCase()] ??
        String(day).trim().toUpperCase(),
    )
    .filter((day) =>
      workingDaysOptions.some((option) => String(option.value) === day),
    );
};

function UpdateDepartment({ department, onClose }: UpdateDepartmentProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { dropdownData, dropdownLoading, dropdownLoaded } = useSelector(
    (state: RootState) => state.department,
  );

  const [parentDepartmentOptions, setParentDepartmentOptions] = useState<
    AutoCompleteOption[]
  >([]);

  const [parentDepartmentLoading, setParentDepartmentLoading] = useState(false);

  const [departmentHeadOptions, setDepartmentHeadOptions] = useState<
    AutoCompleteOption[]
  >([]);

  const [departmentHeadLoading, setDepartmentHeadLoading] = useState(false);

  const departmentTypeOptions = useMemo<Option[]>(
    () =>
      Array.isArray(dropdownData?.departmentTypes)
        ? dropdownData.departmentTypes.map((item) => ({
            label: String(item.name),
            value: String(item.name),
          }))
        : [],
    [dropdownData],
  );

  const branchOptions = useMemo<Option[]>(
    () =>
      Array.isArray(dropdownData?.branches)
        ? dropdownData.branches.map((item) => ({
            label: String(item.name),
            value: Number(item.id),
          }))
        : [],
    [dropdownData],
  );

  const businessUnitOptions = useMemo<Option[]>(
    () =>
      Array.isArray(dropdownData?.businessUnits)
        ? dropdownData.businessUnits.map((item) => ({
            label: String(item.name),
            value: Number(item.id),
          }))
        : [],
    [dropdownData],
  );

  const shiftOptions = useMemo<Option[]>(
    () =>
      Array.isArray(dropdownData?.workingShifts)
        ? dropdownData.workingShifts.map((item) => ({
            label: String(item.name),
            value: Number(item.id),
          }))
        : [],
    [dropdownData],
  );

  const [existingDepartmentLogo, setExistingDepartmentLogo] = useState<
    string | null
  >(department.departmentLogo ?? null);

  const [existingSupportingDocument, setExistingSupportingDocument] = useState<
    string | null
  >(department.documentPath ?? null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<DepartmentFormValues>({
    defaultValues: departmentInitialValues,
    resolver: yupResolver(departmentValidationSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!dropdownLoaded && !dropdownLoading) {
      dispatch(fetchDepartmentDropdownData());
    }
  }, [dispatch, dropdownLoaded, dropdownLoading]);

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
      const content = Array.isArray(response?.data?.content)
        ? response.data.content
        : [];

      const options: AutoCompleteOption[] = content
        .filter(
          (item: any) =>
            item?.id != null &&
            item?.departmentName &&
            Number(item.id) !== Number(department.id),
        )
        .map((item: any) => ({
          label: String(item.departmentName).trim(),
          value: Number(item.id),
        }));

      setParentDepartmentOptions(options);
    } catch (error) {
      setParentDepartmentOptions([]);
    } finally {
      setParentDepartmentLoading(false);
    }
  };

  const loadDepartmentHeads = async () => {
    try {
      setDepartmentHeadLoading(true);

      const response = await searchEmployees("");
      const employees = Array.isArray(response) ? response : [];
      const options: AutoCompleteOption[] = employees
        .filter(
          (employee: any) =>
            employee?.id != null &&
            employee?.name != null &&
            String(employee.name).trim() !== "",
        )
        .map((employee: any) => ({
          label: String(employee.name).trim(),
          value: Number(employee.id),
        }));
      setDepartmentHeadOptions(options);
    } catch (error) {
      setDepartmentHeadOptions([]);
    } finally {
      setDepartmentHeadLoading(false);
    }
  };

  useEffect(() => {
    loadParentDepartments();
    loadDepartmentHeads();
  }, [department.id]);

  const getFormValues = (): DepartmentFormValues => {
    const parentDepartment: AutoCompleteOption | null =
      department.parentDepartment != null
        ? (parentDepartmentOptions.find(
            (option) =>
              Number(option.value) === Number(department.parentDepartment),
          ) ?? null)
        : null;

    const departmentHeadId =
      department.departmentHead != null &&
      String(department.departmentHead).trim() !== ""
        ? Number(department.departmentHead)
        : null;

    const departmentHead: AutoCompleteOption | null =
      departmentHeadId != null
        ? (departmentHeadOptions.find(
            (option) => Number(option.value) === departmentHeadId,
          ) ?? null)
        : null;

    const tags: MultiAutoCompleteOption[] = Array.isArray(department.tags)
      ? department.tags.map((tag: string) => {
          const value = String(tag);

          return (
            tagOptions.find((option) => option.value === value) ?? {
              label: value,
              value,
            }
          );
        })
      : [];

    return {
      departmentName: department.departmentName ?? "",

      shortName: department.shortName ?? "",

      departmentType: department.departmentType ?? "",

      parentDepartment,

      departmentHead,

      branches: Array.isArray(department.branches)
        ? department.branches.map(Number).filter(Number.isFinite)
        : [],

      businessUnit:
        department.businessUnit != null ? String(department.businessUnit) : "",

      costCenter: department.costCenter ?? "",

      departmentEmail: department.departmentEmail ?? "",

      departmentPhone: department.departmentPhone ?? "",

      workingDays: normalizeWorkingDays(department.workingDays),

      workingShift:
        department.workingShift != null ? String(department.workingShift) : "",

      description: department.description ?? "",

      departmentLogo: null,

      supportingDocument: null,

      tags,

      keywords: department.keywords ?? "",

      remarks: department.remarks ?? "",

      status: department.status ? "true" : "false",
    };
  };

  useEffect(() => {
    if (!dropdownLoaded) return;

    reset(getFormValues());

    setExistingDepartmentLogo(department.departmentLogo ?? null);

    setExistingSupportingDocument(department.documentPath ?? null);
  }, [department, dropdownLoaded, reset]);

  useEffect(() => {
    if (!parentDepartmentOptions.length) return;

    const parentDepartmentId =
      department.parentDepartment != null
        ? Number(department.parentDepartment)
        : null;

    if (parentDepartmentId == null) {
      setValue("parentDepartment", null, {
        shouldValidate: false,
        shouldDirty: false,
      });
      return;
    }

    const selectedOption =
      parentDepartmentOptions.find(
        (option) => Number(option.value) === parentDepartmentId,
      ) ?? null;

    if (selectedOption) {
      setValue("parentDepartment", selectedOption, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [parentDepartmentOptions, department.parentDepartment, setValue]);

  useEffect(() => {
    if (!departmentHeadOptions.length) return;

    const departmentHeadId =
      department.departmentHead != null &&
      String(department.departmentHead).trim() !== ""
        ? Number(department.departmentHead)
        : null;

    if (departmentHeadId == null) return;

    const currentValue = getValues("departmentHead");

    if (currentValue) return;

    const selectedOption =
      departmentHeadOptions.find(
        (option) => Number(option.value) === departmentHeadId,
      ) ?? null;

    if (selectedOption) {
      setValue("departmentHead", selectedOption, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [departmentHeadOptions, department, getValues, setValue]);

  const onSubmit: SubmitHandler<DepartmentFormValues> = async (formValues) => {
    try {
      const payload = {
        id: Number(department.id),

        departmentName: formValues.departmentName,

        shortName: formValues.shortName,

        departmentType: formValues.departmentType,

        parentDepartment: formValues.parentDepartment
          ? Number(formValues.parentDepartment.value)
          : null,

        departmentHead: formValues.departmentHead
          ? Number(formValues.departmentHead.value)
          : null,

        branches: Array.isArray(formValues.branches)
          ? formValues.branches.map(Number).filter(Number.isFinite)
          : [],

        businessUnit: formValues.businessUnit
          ? Number(formValues.businessUnit)
          : null,

        costCenter: formValues.costCenter,

        departmentEmail: formValues.departmentEmail,

        departmentPhone:
          formValues.departmentPhone?.trim() === ""
            ? null
            : formValues.departmentPhone.trim(),

        workingDays: Array.isArray(formValues.workingDays)
          ? formValues.workingDays.map(String)
          : [],

        workingShift: formValues.workingShift
          ? Number(formValues.workingShift)
          : null,

        description: formValues.description,

        departmentLogo: isFile(formValues.departmentLogo)
          ? formValues.departmentLogo.name
          : existingDepartmentLogo,

        documentPath: isFile(formValues.supportingDocument)
          ? formValues.supportingDocument.name
          : existingSupportingDocument,

        tags: Array.isArray(formValues.tags)
          ? formValues.tags.map((tag) => String(tag.value))
          : [],

        keywords: formValues.keywords,

        remarks: formValues.remarks,

        status: formValues.status === "true",
      };
      await updateDepartment(department.id, payload);
      const attachments: DepartmentAttachmentUpload[] = [];

      if (isFile(formValues.departmentLogo)) {
        attachments.push({
          departmentId: department.id,
          file: formValues.departmentLogo,
          attachmentType: "LOGO",
        });
      }

      if (isFile(formValues.supportingDocument)) {
        attachments.push({
          departmentId: department.id,
          file: formValues.supportingDocument,
          attachmentType: "DOCUMENT",
        });
      }

      if (attachments.length > 0) {
        await uploadDepartmentAttachment(attachments);
      }

      await Swal.fire({
        text: "Department updated successfully!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,

        didOpen: () => {
          const container = document.querySelector(
            ".swal2-container",
          ) as HTMLElement | null;

          if (container) {
            container.style.zIndex = "2000";
          }
        },
      });

      await createDepartmentEmailNotification(department.id, "UPDATE");

      if (onClose) {
        await onClose();
      } else {
        navigate(-1);
      }
    } catch (error: any) {
      const data = error?.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.message || data?.error || "Failed to update department";

      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: message,
        confirmButtonText: "OK",

        didOpen: () => {
          const container = document.querySelector(
            ".swal2-container",
          ) as HTMLElement | null;

          if (container) {
            container.style.zIndex = "99999";
          }
        },
      });
    }
  };

  const handleReset = () => {
    reset(getFormValues());

    setExistingDepartmentLogo(department.departmentLogo ?? null);

    setExistingSupportingDocument(department.documentPath ?? null);
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <Paper
      sx={{
        backgroundColor: "transparent",
        boxShadow: "none",
      }}
    >
      <Box>
        <Card
          sx={{
            borderRadius: 3,
            backgroundColor: "#FFFFFF",
            border: "1px solid #D9E5E2",
            boxShadow: "0 4px 18px rgba(15, 118, 110, 0.07)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Grid container spacing={2.5}>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="departmentName"
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="shortName"
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="departmentType"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Dropdown
                        label="Department Type"
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        options={departmentTypeOptions}
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message}
                        required
                        disabled={dropdownLoading}
                      />
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="parentDepartment"
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="departmentHead"
                    control={control}
                    render={({ field, fieldState }) => (
                      <AutoComplete
                        label="Department Head"
                        value={field.value as AutoCompleteOption | null}
                        options={departmentHeadOptions}
                        allowCreate
                        error={Boolean(fieldState.error)}
                        helperText={
                          departmentHeadLoading
                            ? "Loading employees..."
                            : fieldState.error?.message
                        }
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
                                    Number(item.value) === Number(employee.id),
                                );

                                if (exists) {
                                  return prev;
                                }

                                return [...prev, newEmployeeOption];
                              });
                            } catch {
                              await Swal.fire({
                                text: "Failed to create employee.",
                                icon: "error",
                                timer: 3000,
                                showConfirmButton: false,
                              });
                            } finally {
                              setDepartmentHeadLoading(false);
                            }

                            return;
                          }
                          field.onChange(option);
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="branches"
                    control={control}
                    render={({ field, fieldState }) => (
                      <MultiSelect
                        label="Branch"
                        name={field.name}
                        value={field.value ?? []}
                        onChange={(e) => {
                          const selected = e.target.value;

                          field.onChange(
                            Array.isArray(selected)
                              ? selected.map(Number).filter(Number.isFinite)
                              : [],
                          );
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="businessUnit"
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="costCenter"
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="departmentEmail"
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="departmentPhone"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        label="Department Phone"
                        name={field.name}
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="workingShift"
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="workingDays"
                    control={control}
                    render={({ field, fieldState }) => (
                      <MultiSelect
                        label="Working Days"
                        name={field.name}
                        value={Array.isArray(field.value) ? field.value : []}
                        onChange={(e) => {
                          const selected = e.target.value;

                          field.onChange(
                            Array.isArray(selected)
                              ? selected.map((day) =>
                                  String(day).trim().toUpperCase(),
                                )
                              : [],
                          );
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="status"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Dropdown
                        label="Status"
                        name={field.name}
                        value={field.value ?? "false"}
                        onChange={(e) => field.onChange(e.target.value)}
                        options={statusOptions}
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message}
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <Controller
                    name="description"
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

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <Controller
                    name="keywords"
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
                    name="remarks"
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="departmentLogo"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Attachment
                        label="Department Logo"
                        file={isFile(field.value) ? field.value : null}
                        onChange={field.onChange}
                        allowedTypes={["image/jpeg", "image/jpg", "image/png"]}
                        maxSizeMB={5}
                        helperText={
                          fieldState.error?.message ??
                          "jpg, jpeg, png (max 5MB)"
                        }
                      />
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="supportingDocument"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Attachment
                        label="Supporting Document"
                        file={isFile(field.value) ? field.value : null}
                        onChange={field.onChange}
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field, fieldState }) => (
                      <MultiAutoComplete
                        label="Tags"
                        value={field.value ?? []}
                        onChange={field.onChange}
                        options={tagOptions}
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1.5,
                  mt: 4,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    minWidth: 110,
                    backgroundColor: "#0F766E",
                    "&:hover": {
                      backgroundColor: "#115E59",
                    },
                  }}
                >
                  {isSubmitting ? "Updating..." : "Update"}
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
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
}

export default UpdateDepartment;
