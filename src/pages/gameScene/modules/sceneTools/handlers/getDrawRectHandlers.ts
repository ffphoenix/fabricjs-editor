import { type MutableRefObject } from "react";
import { type Canvas, type TPointerEventInfo } from "fabric";
import type { DrawingRef, MouseHandlers } from "../useSceneTools";
import * as fabric from "fabric";
import SceneStore from "../../../store/SceneStore";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";

const getDrawRectHandlers = (canvasRef: MutableRefObject<Canvas | null>, drawingRef: DrawingRef): MouseHandlers => {
  const canvas = canvasRef.current;
  if (canvas === null) throw new Error("Canvas is not initialized");

  const onMouseDown = (options: TPointerEventInfo) => {
    // @TODO: pick correct point
    const point = canvas.getScenePoint(options.e);
    drawingRef.current.origin = new fabric.Point(point.x, point.y);

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
    drawingRef.current.activeObject = rect;
    canvas.add(rect);
  };

  const onMouseMove = (options: TPointerEventInfo) => {
    const active = drawingRef.current.activeObject;
    const origin = drawingRef.current.origin;
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
    const active = drawingRef.current.activeObject;
    if (active) {
      active.set({ selectable: true, objectCaching: true });
    }
    if (active) fireObjectAddedEvent(canvas, "self", active);
    canvas.requestRenderAll();
    drawingRef.current.activeObject = null;
    drawingRef.current.origin = undefined;
  };

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    handlerDisposer: () => null,
  };
};
export default getDrawRectHandlers;
