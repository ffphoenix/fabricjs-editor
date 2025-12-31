import type { FabricObject } from "fabric";

export const checkObjectUUIDs = (object: FabricObject | FabricObject[]) => {
  if (Array.isArray(object)) {
    for (const obj of object as FabricObject[]) {
      if (!obj.UUID) throw new Error("Object must have UUID");
    }
  } else if (!object.UUID) throw new Error("Object must have UUID");
};
