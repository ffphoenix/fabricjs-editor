import { runInAction } from "mobx";
import type { DataStorage } from "../../createDataStorage";

export default <dataType>(dataStorage: DataStorage<dataType>) => {
  return (data: Partial<dataType>) => {
    runInAction(() => {
      dataStorage.current = {
        ...dataStorage.current,
        ...data,
      };
    });
  };
};
