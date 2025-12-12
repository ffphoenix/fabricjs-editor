import React from "react";
import type { InputError } from "../createDataStorage";

export type ValidationFunction = (value: string) => string | undefined;
export type FieldConfig = {
  dataKey: string;
  label: string;
  type: "text" | "number" | "switch" | "textarea";
  render?: () => React.ReactNode;
  validators?: ValidationFunction[];
  errors?: InputError[];
  autoResize?: boolean;
};

export type FormConfig = {
  validateOn?: "change" | "blur";
  onSubmit: () => void;
  fields: FieldConfig[];
};
