import type { DataStorage } from "../../createDataStorage";
import type { FormConfig } from "../crudForm";
import validateField from "./validateField";

export default <T>(formConfig: FormConfig, dataStorage: DataStorage<T>) => {
  dataStorage.clearFormErrors();
  formConfig.fields.forEach((field) => {
    if (!field.validators) return;
    validateField(field.dataKey, dataStorage, field.validators);
  });
};
