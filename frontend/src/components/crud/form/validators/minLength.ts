export default (number: number) => {
  return (value: string) => {
    if (value.length < number) {
      return `Field must contain at least ${number} letters`;
    }
    return undefined;
  };
};
