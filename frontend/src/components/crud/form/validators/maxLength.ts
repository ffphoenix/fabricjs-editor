export default (number: number) => {
  return (value: string) => {
    if (value.length > number) {
      return `Field must contain at most ${number} letters`;
    }
    return undefined;
  };
};
