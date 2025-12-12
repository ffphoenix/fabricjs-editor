import type { DataStorage, InputError } from "../createDataStorage";
import { Button } from "primereact/button";
import { observer } from "mobx-react-lite";
import React from "react";
import getFormDataHandler from "./utils/getFormDataHandler";
import FormFieldByConfig from "./fields/FieldByConfig";
import type { FormConfig } from "./crudForm";
import validateField from "./utils/validateField";
import validateForm from "./utils/validateForm";

type Props<T> = {
  config: FormConfig;
  storageData: DataStorage<T>;
};

function filterFieldErrors<T>(dataKey: string, storageData: DataStorage<T>): InputError[] {
  if (!storageData.formUI?.errors) return [];
  return storageData.formUI.errors?.filter((error) => error.field === dataKey) ?? [];
}

export default observer(<T,>({ config, storageData }: Props<T>) => {
  const onChange = getFormDataHandler<T>(storageData);
  const customSubmit = () => {
    validateForm(config, storageData);

    if (storageData.isFormValid) config.onSubmit();
  };

  return (
    <div>
      {config.fields.map((field) => (
        <div key={field.dataKey}>
          {field.render ? (
            field.render()
          ) : (
            <FormFieldByConfig<T>
              fieldConfig={field}
              onChange={(data) => {
                onChange(data);
                if (config?.validateOn === "change") {
                  validateField(field.dataKey, storageData, field.validators ?? []);
                }
              }}
              value={storageData.current?.[field.dataKey as keyof T] as string}
              onBlur={() =>
                config?.validateOn !== "change" && validateField(field.dataKey, storageData, field.validators ?? [])
              }
              errors={filterFieldErrors<T>(field.dataKey, storageData)}
            />
          )}
        </div>
      ))}
      <div className="flex justify-end">
        <Button
          icon={storageData.formUI.isLoading ? "pi pi-spin pi-spinner" : ""}
          label={storageData.isCurrentNew ? "Add" : "Save"}
          onClick={customSubmit}
          disabled={storageData.formUI.isLoading || !storageData.isFormValid}
        />
      </div>
    </div>
  );
});
