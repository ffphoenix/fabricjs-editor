import type { DataStorage } from "../../createDataStorage";
import type { ValidationFunction } from "../crudForm";

export default <T>(dataKey: string, dataStorage: DataStorage<T>, validators: ValidationFunction[]) => {
  const value = dataStorage.current[dataKey as keyof T] as string;
  dataStorage.clearFormErrorsByKey(dataKey);
  for (const validator of validators) {
    const error = validator(value.toString());
    if (error) {
      dataStorage.setFormErrors({ field: dataKey, message: error });
    }
  }
};
