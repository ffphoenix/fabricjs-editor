import CustomInputText, { type CustomInputTextProps } from "./CustomInputText";
import React from "react";
import { observer } from "mobx-react-lite";
import CustomInputSwitch from "./CustomInputSwitch";
import type { FieldConfig } from "../crudForm";
import type { InputError } from "../../createDataStorage";
import CustomTextarea, { type CustomTextareaProps } from "./CustomTextarea";

type Props<T> = {
  fieldConfig: FieldConfig;
  onChange: (data: Partial<T>) => void;
  value: string;
  errors?: InputError[];
  onBlur?: () => void;
  onFocus?: () => void;
};

function filterTextInputProps<T>(fieldProps: Props<T>): CustomInputTextProps<T> {
  return {
    dataKey: fieldProps.fieldConfig.dataKey,
    onChange: fieldProps.onChange,
    onBlur: fieldProps.onBlur,
    onFocus: fieldProps.onFocus,
    label: fieldProps.fieldConfig.label,
    type: fieldProps.fieldConfig.type,
    value: fieldProps.value,
    errors: fieldProps.errors,
  };
}

function filterTextareaProps<T>(fieldProps: Props<T>): CustomTextareaProps<T> {
  const props = filterTextInputProps<T>(fieldProps);
  return { ...props, autoResize: fieldProps.fieldConfig.autoResize };
}

export default observer(<T,>({ ...fieldProps }: Props<T>) => {
  const fieldsMap = {
    switch: () => (
      <CustomInputSwitch<T>
        dataKey={fieldProps.fieldConfig.dataKey}
        label={fieldProps.fieldConfig.label}
        onChange={fieldProps.onChange}
        value={!!fieldProps.value}
      />
    ),
    text: () => <CustomInputText<T> {...filterTextInputProps<T>(fieldProps)} />,
    number: () => <CustomInputText<T> {...filterTextInputProps<T>(fieldProps)} />,
    textarea: () => <CustomTextarea<T> {...filterTextareaProps<T>(fieldProps)} />,
  };

  return fieldsMap[fieldProps.fieldConfig.type]?.() ?? fieldsMap.text();
});
