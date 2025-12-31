import { type MutableRefObject } from "react";
import { type Canvas, type TPointerEventInfo } from "fabric";
import type { DrawingRef, MouseHandlers } from "../useSceneTools";
import * as fabric from "fabric";
import SceneStore from "../../../store/SceneStore";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";

const getDrawCircleHandlers = (canvasRef: MutableRefObject<Canvas | null>, drawingRef: DrawingRef): MouseHandlers => {
  const canvas = canvasRef.current;
  if (canvas === null) throw new Error("Canvas is not initialized");

  const onMouseDown = (options: TPointerEventInfo) => {
    // @TODO: pick correct point
    const point = canvas.getScenePoint(options.e);
    drawingRef.current.origin = new fabric.Point(point.x, point.y);

    const circle = new fabric.Circle({
      left: point.x,
      top: point.y,
      radius: 1,
      fill: SceneStore.tools.drawTools.fillColor,
      stroke: SceneStore.tools.drawTools.strokeColor,
      strokeWidth: SceneStore.tools.drawTools.strokeWidth,
      originX: "center",
      originY: "center",
      selectable: false,
      objectCaching: false,
    });
    drawingRef.current.activeObject = circle;
    canvas.add(circle);
  };

  const onMouseMove = (options: TPointerEventInfo) => {
    const active = drawingRef.current.activeObject;
    const origin = drawingRef.current.origin;
    if (!active || !origin) return;
    const point = canvas.getScenePoint(options.e);
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    active.set({ left: origin.x, top: origin.y, radius: r });
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
export default getDrawCircleHandlers;
