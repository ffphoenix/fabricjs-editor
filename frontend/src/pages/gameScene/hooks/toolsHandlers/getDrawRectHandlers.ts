import { type MutableRefObject } from "react";
import { type Canvas, type TPointerEventInfo } from "fabric";
import type { MouseHandlers } from "../useCanvasMouseEvents";
import * as fabric from "fabric";
import SceneStore from "../../store/SceneStore";

const getDrawRectHandlers = (
  canvasRef: MutableRefObject<Canvas | null>,
  drawingState: MutableRefObject<{ origin?: fabric.Point; activeObject?: fabric.Object | null }>,
): MouseHandlers => {
  const canvas = canvasRef.current;
  if (canvas === null) throw new Error("Canvas is not initialized");

  const onMouseDown = (options: TPointerEventInfo) => {
    // @TODO: pick correct point
    const point = canvas.getScenePoint(options.e);
    drawingState.current.origin = new fabric.Point(point.x, point.y);

    const rect = new fabric.Rect({
      left: point.x,
      top: point.y,
      width: 1,
      height: 1,
      fill: SceneStore.tools.drawTools.fillColor,
      stroke: SceneStore.tools.drawTools.strokeColor,
      strokeWidth: SceneStore.tools.drawTools.strokeWidth,
      selectable: false,
      objectCaching: false,
    });
    drawingState.current.activeObject = rect;
    rect.set("layerId", SceneStore.activeLayerId);
    canvas.add(rect);
  };

  const onMouseMove = (options: TPointerEventInfo) => {
    const active = drawingState.current.activeObject;
    const origin = drawingState.current.origin;
    if (!active || !origin) return;
    const point = canvas.getScenePoint(options.e);
    const left = Math.min(point.x, origin.x);
    const top = Math.min(point.y, origin.y);
    const width = Math.abs(point.x - origin.x);
    const height = Math.abs(point.y - origin.y);
    active.set({ left, top, width, height });
    canvas.requestRenderAll();
  };

  const onMouseUp = () => {
    const active = drawingState.current.activeObject;
    if (active) {
      active.set({ selectable: true, objectCaching: true });
    }
    canvas.requestRenderAll();
    drawingState.current.activeObject = null;
    drawingState.current.origin = undefined;
  };

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
  };
};
export default getDrawRectHandlers;
