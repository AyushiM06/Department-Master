import * as Yup from "yup";
import type { AutoCompleteOption } from "../component/AutoComplete";
import type { MultiAutoCompleteOption } from "../component/MultiAutoComplete";
export type { AutoCompleteOption };
export type { MultiAutoCompleteOption };
export interface DepartmentFormValues {
  departmentName: string;
  shortName: string;
  departmentType: string;
  parentDepartment: AutoCompleteOption | null;
  departmentHead: AutoCompleteOption | null;
  branches: number[];
  businessUnit: string;
  costCenter: string;
  departmentEmail: string;
  departmentPhone: string;
  workingDays: string[];
  workingShift: string | number;
  description: string;
  departmentLogo: File | null;
  supportingDocument: File | null;
  tags: MultiAutoCompleteOption[];
  keywords: string;
  remarks: string;
  status: string;
}
export const departmentInitialValues: DepartmentFormValues = {
  departmentName: "",
  shortName: "",
  departmentType: "",
  parentDepartment: null,
  departmentHead: null,
  branches: [],
  businessUnit: "",
  costCenter: "",
  departmentEmail: "",
  departmentPhone: "",
  workingDays: [],
  workingShift: "",
  description: "",
  departmentLogo: null,
  supportingDocument: null,
  tags: [],
  keywords: "",
  remarks: "",
  status: "false",
};
export const departmentValidationSchema = Yup.object({
  departmentName: Yup.string().required("Department Name is required").max(150, "Max 150 characters").matches(/^[a-zA-Z\s]+$/, "Alphabets only"),
  shortName: Yup.string().max(50, "Max 50 characters").matches(/^[a-zA-Z\s]*$/, "Alphabets only").default(""),
  departmentType: Yup.string().required("Department Type is required"),
  parentDepartment: Yup.mixed<AutoCompleteOption>().nullable().defined(),
  departmentHead: Yup
  .object()
  .nullable()
  .test(
    "valid-department-head",
    "Department Head must be a valid employee",
    (value) => {
      if (!value) {
        return true;
      }
      const departmentHead = value as AutoCompleteOption;
      return (
        departmentHead.value !== undefined &&
        departmentHead.value !== null &&
        Number.isFinite(Number(departmentHead.value))
      );
    },
  ),
  branches: Yup.array().of(Yup.number().required()).min(1, "Select at least one branch").required("Branch is required").default([]),
  businessUnit: Yup.string().default(""),
  costCenter: Yup.string().max(50, "Max 50 characters").default(""),
  departmentEmail: Yup.string().nullable().transform((value) => value?.trim() || "").test("valid-email", "Enter a valid email", (value) => !value || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)).default(""),
  departmentPhone: Yup.string().test("phone", "Numbers only, max 15 digits", (value) => !value || /^[0-9]{1,15}$/.test(value)).default(""),
  workingDays: Yup.array().of(Yup.string().required()).min(1, "Select at least one working day").required("Working Days are required").default([]),
  workingShift: Yup.mixed<string | number>().defined().default(""),
  description: Yup.string().max(1000, "Max 1000 characters").default(""),
  departmentLogo: Yup.mixed().nullable().defined().default(null),
  supportingDocument: Yup.mixed().nullable().defined().default(null),
  tags: Yup.array().default([]),
  keywords: Yup.string().max(500, "Max 500 characters").default(""),
  remarks: Yup.string().max(1000, "Max 1000 characters").default(""),
  status: Yup.string().required("Status is required").default("false"),
}) as unknown as Yup.ObjectSchema<DepartmentFormValues>;
export interface AddDepartmentFormValues {
  departments: DepartmentFormValues[];
}
export const addDepartmentInitialValues: AddDepartmentFormValues = {
  departments: [{ ...departmentInitialValues }],
};
export const addDepartmentValidationSchema = Yup.object({
  departments: Yup.array().of(departmentValidationSchema).min(1, "At least one department is required").required("At least one department is required"),
});