import { makeAutoObservable } from "mobx";

export type InputError = { message: string; field: string };

export type DataStorage<dataType> = {
  list: dataType[];
  current: dataType;
  error: string | null;
  formUI: {
    errors: InputError[];
    networkError: string | null;
    isLoading: boolean;
    showPopup: boolean;
  };
  listUI: { isLoading: boolean };
  togglePopup: () => void;
  isPopupVisible: boolean;
  isCurrentNew: boolean;
  setFormErrors: (errors: InputError) => void;
  clearFormErrors: () => void;
  clearFormErrorsByKey: (key: string) => void;
  isFormValid: boolean;
  resetCurrent: () => void;
};

export default <dataType>(defaultCurrent: () => dataType) => {
  return makeAutoObservable({
    list: [] as dataType[],
    current: defaultCurrent(),
    error: null as string | null,
    listUI: {
      isLoading: false,
    },
    formUI: {
      errors: [] as InputError[],
      networkError: null,
      isLoading: false,
      showPopup: false,
    },

    get isPopupVisible(): boolean {
      return this.formUI.showPopup;
    },
    resetCurrent() {
      this.clearFormErrors();
      this.current = defaultCurrent();
    },
    togglePopup() {
      this.formUI.showPopup = !this.formUI.showPopup;
    },
    get isCurrentNew(): boolean {
      // @ts-ignore untill we have proper solution for id type
      return this.current.id === 0;
    },
    setFormErrors(error: InputError) {
      this.formUI.errors = [...this.formUI.errors, error];
    },
    clearFormErrors() {
      this.formUI.errors = [];
    },
    clearFormErrorsByKey(key: string) {
      if (this.formUI?.errors?.length === 0) return;
      this.formUI.errors = this.formUI.errors.filter((error) => error.field !== key);
    },
    get isFormValid(): boolean {
      return this.formUI.errors.length === 0;
    },
  });
};
