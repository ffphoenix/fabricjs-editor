import React from "react";
import { InputSwitch, type InputSwitchChangeEvent, type InputSwitchProps } from "primereact/inputswitch";

type CustomInputSwitchProps<T> = {
  label: string;
  dataKey: string;
  value: boolean;
  onChange: (data: Partial<T>) => void;
  className?: string;
  helpText?: string;
};

export default <T,>({ ...props }: CustomInputSwitchProps<T>) => {
  const customOnchange = (e: InputSwitchChangeEvent) => {
    props.onChange({ [props.dataKey]: e.value } as Partial<T>);
  };

  const InputProps: InputSwitchProps = {
    id: props.dataKey,
    checked: props.value,
    onChange: customOnchange,
    className: props.className ?? "",
  };
  return (
    <div className="flex-auto mb-2">
      <label htmlFor={props.dataKey} className="font-bold block">
        {props.label}
      </label>
      <InputSwitch {...InputProps} />
      {props.helpText && <small id={props.dataKey + "-help"}>{props.helpText}</small>}
    </div>
  );
};
