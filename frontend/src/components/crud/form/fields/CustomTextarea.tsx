import React from "react";
import { InputTextarea, type InputTextareaProps } from "primereact/inputtextarea";
import type { CustomInputTextProps } from "./CustomInputText";

export type CustomTextareaProps<T> = CustomInputTextProps<T> & {
  autoResize?: boolean;
};

export default <T,>({ ...props }: CustomTextareaProps<T>) => {
  const customOnchange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.onChange({ [props.dataKey]: e.target.value } as Partial<T>);
  };
  const isValid = props?.errors && props.errors?.length > 0;
  const textInputProps: InputTextareaProps = {
    id: props.dataKey,
    value: props.value,
    onChange: customOnchange,
    onBlur: props.onBlur,
    className: props.className ?? "w-full",
    invalid: isValid,
    autoResize: props.autoResize ?? false, // @todo: currently not working, lead to dialog glitch
  };
  return (
    <div className="flex-auto mb-2">
      <label htmlFor={props.dataKey} className="font-bold block">
        {props.label}
      </label>
      <InputTextarea {...textInputProps} />
      {props.helpText && <small id={props.dataKey + "-help"}>{props.helpText}</small>}
      {props.errors && props.errors.map((error) => <small className="p-error p-message-error">{error.message}</small>)}
    </div>
  );
};
