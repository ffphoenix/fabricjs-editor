import type { FabricObject } from "fabric";

export default (object: FabricObject, transformProps: Partial<FabricObject>) => {
  return Object.keys(transformProps).reduce((diff, key) => {
    const searchKey = key as keyof FabricObject;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    diff[searchKey] = transformProps[searchKey] !== object[searchKey] ? object[searchKey] : transformProps[searchKey];
    return diff;
  }, {} as Partial<FabricObject>);
};
