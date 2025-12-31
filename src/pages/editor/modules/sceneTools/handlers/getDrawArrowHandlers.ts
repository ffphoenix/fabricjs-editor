import { type MutableRefObject } from "react";
import { type Canvas, type TPointerEventInfo } from "fabric";
import type { ArrowDrawingRef, MouseHandlers } from "../useSceneTools";
import * as fabric from "fabric";
import SceneStore from "../../../store/SceneStore";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";

const getDrawArrowHandlers = (
  canvasRef: MutableRefObject<Canvas | null>,
  arrowDrawingRef: ArrowDrawingRef,
): MouseHandlers => {
  const canvas = canvasRef.current;
  if (canvas === null) throw new Error("Canvas is not initialized");

  canvas.defaultCursor = "crosshair";
  canvas.hoverCursor = "crosshair";

  const onMouseDown = (options: TPointerEventInfo) => {
    // @TODO: pick correct point
    const point = canvas.getScenePoint(options.e);
    const startPt = new fabric.Point(point.x, point.y);
    const line = new fabric.Line([startPt.x, startPt.y, startPt.x, startPt.y], {
      stroke: SceneStore.tools.drawTools.strokeColor,
      strokeWidth: SceneStore.tools.drawTools.strokeWidth,
      selectable: false,
      evented: false,
      objectCaching: false,
    });
    const headSize = Math.max(8, SceneStore.tools.drawTools.strokeWidth * 4);
    const head = new fabric.Triangle({
      left: startPt.x,
      top: startPt.y,
      width: headSize,
      height: headSize + 2,
      fill: SceneStore.tools.drawTools.strokeColor,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });
    canvas.add(line);
    canvas.add(head);
    arrowDrawingRef.current = { start: startPt, line, head };
    canvas.requestRenderAll();
  };

  const onMouseMove = (options: TPointerEventInfo) => {
    if (!arrowDrawingRef.current) return;

    const point = canvas.getScenePoint(options.e);
    const { start, line, head } = arrowDrawingRef.current;
    line.set({ x2: point.x, y2: point.y });
    const dx = point.x - start.x;
    const dy = point.y - start.y;
    const angle = Math.atan2(dy, dx);
    head.set({ left: point.x, top: point.y, angle: (angle * 180) / Math.PI + 90 });
    canvas.requestRenderAll();
  };

  const onMouseUp = () => {
    if (!arrowDrawingRef.current) return;

    const arrowRef = arrowDrawingRef.current;
    const { line, head } = arrowRef;
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const distance = Math.hypot(dx, dy);
    // remove temp objects
    canvas.remove(line);
    canvas.remove(head);
    arrowDrawingRef.current = null;

    if (distance < 2) {
      canvas.requestRenderAll();
      return; // too small, ignore
    }

    const lineFinal = new fabric.Line([line.x1, line.y1, line.x2, line.y2], {
      stroke: SceneStore.tools.drawTools.strokeColor,
      strokeWidth: SceneStore.tools.drawTools.strokeWidth,
      selectable: true,
      objectCaching: true,
    });
    const headSize = Math.max(8, SceneStore.tools.drawTools.strokeWidth * 4);
    const angle = Math.atan2(dy, dx);
    const headFinal = new fabric.Triangle({
      left: line.x2,
      top: line.y2,
      width: headSize,
      height: headSize + 2,
      fill: SceneStore.tools.drawTools.strokeColor,
      originX: "center",
      originY: "center",
      angle: (angle * 180) / Math.PI + 90,
    });
    const group = new fabric.Group([lineFinal, headFinal], {
      selectable: true,
      objectCaching: true,
    });
    canvas.add(group);
    canvas.requestRenderAll();
    fireObjectAddedEvent(canvas, "self", group);
  };

  const handlerDisposer = () => {
    if (!arrowDrawingRef.current) return;
    const { line, head } = arrowDrawingRef.current;
    canvas.remove(line);
    canvas.remove(head);
    arrowDrawingRef.current = null;
    canvas.requestRenderAll();
  };

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    handlerDisposer,
  };
};
export default getDrawArrowHandlers;
