import type { Canvas } from "fabric";

export const getFabricObject = (canvas: Canvas, uuid: string) => {
  return canvas.getObjects().find((object) => object.UUID === uuid);
};
