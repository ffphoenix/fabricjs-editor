import { InputText, type InputTextProps } from "primereact/inputtext";
import React from "react";
import type { InputError } from "../../createDataStorage";

export type CustomInputTextProps<T> = {
  label: string;
  dataKey: string;
  onChange: (data: Partial<T>) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  errors?: InputError[];
  value?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  helpText?: string;
};

export default <T,>({ ...props }: CustomInputTextProps<T>) => {
  const customOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange({ [props.dataKey]: e.target.value } as Partial<T>);
  };
  const isValid = props?.errors && props.errors?.length > 0;
  const textInputProps: InputTextProps = {
    id: props.dataKey,
    type: props.type,
    value: props.value,
    onChange: customOnchange,
    onBlur: props.onBlur,
    className: props.className ?? "w-full",
    invalid: isValid,
  };
  return (
    <div className="flex-auto mb-2" key={props.dataKey}>
      <label htmlFor={props.dataKey} className="font-bold block">
        {props.label}
      </label>
      <InputText {...textInputProps} />
      {props.helpText && <small id={props.dataKey + "-help"}>{props.helpText}</small>}
      {props.errors && props.errors.map((error) => <small className="p-error p-message-error">{error.message}</small>)}
    </div>
  );
};
