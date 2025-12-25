import { type Canvas, iMatrix, type TMat2D } from "fabric";

export const setPanKeepingZoom = (canvas: Canvas, pan: { x: number; y: number }) => {
  const vpt = (canvas.viewportTransform || iMatrix.concat()).slice();
  const zoom = canvas.getZoom();
  vpt[0] = zoom; // scaleX
  vpt[3] = zoom; // scaleY
  vpt[4] = pan.x; // translateX
  vpt[5] = pan.y; // translateY
  canvas.setViewportTransform(vpt as TMat2D);
  canvas.renderAll();
};
