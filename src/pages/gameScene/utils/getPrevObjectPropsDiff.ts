import type { FabricObject } from "fabric";

export default (object: FabricObject, originalProps: Partial<FabricObject>) => {
  return Object.keys(originalProps).reduce((diff, key) => {
    const searchKey = key as keyof FabricObject;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    diff[searchKey] = originalProps[searchKey] !== object[searchKey] ? object[searchKey] : originalProps[searchKey];
    return diff;
  }, {} as Partial<FabricObject>);
};
