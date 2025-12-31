import type { FabricObject } from "fabric";

export const getObjectTransformProps = (object: FabricObject) => {
  return {
    angle: object.angle,
    left: object.left,
    top: object.top,
    scaleX: object.scaleX,
    scaleY: object.scaleY,
    originX: object.originX,
    originY: object.originY,
    flipX: object.flipX,
    flipY: object.flipY,
    skewX: object.skewX,
    skewY: object.skewY,
  };
};
