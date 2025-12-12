export default () => {
  return (value: string) => {
    if (!value) {
      return "Field cannot be empty";
    }
    return undefined;
  };
};
