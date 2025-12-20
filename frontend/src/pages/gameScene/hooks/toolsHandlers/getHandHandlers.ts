import { type MutableRefObject } from "react";
import { type Canvas, type TPointerEventInfo } from "fabric";
import type { MouseHandlers } from "../useCanvasMouseEvents";
import * as fabric from "fabric";

const useHandHandler = (
  canvasRef: MutableRefObject<Canvas | null>,
  isPanningRef: MutableRefObject<boolean>,
): MouseHandlers => {
  const canvas = canvasRef.current;
  if (canvas === null) throw new Error("Canvas is not initialized");

  canvas.defaultCursor = "grab";
  canvas.hoverCursor = "grab";

  const onMouseDown = () => {
    isPanningRef.current = true;
    canvas.setCursor("grabbing");
    canvas.requestRenderAll();
  };

  const onMouseMove = (options: TPointerEventInfo) => {
    const event = options.e as MouseEvent;
    const vpt = canvas.viewportTransform || fabric.iMatrix.concat();
    // movementX/Y are in CSS pixels relative to the element
    vpt[4] += event.movementX;
    vpt[5] += event.movementY;
    canvas.setViewportTransform(vpt);
    canvas.requestRenderAll();
  };

  const onMouseUp = () => {
    isPanningRef.current = false;
    canvas.setCursor("grab");
    canvas.requestRenderAll();
  };

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
  };
};
export default useHandHandler;
