import { type MutableRefObject } from "react";
import { type Canvas, type TPointerEventInfo } from "fabric";
import type { MeasuringRef, MouseHandlers } from "../useSceneTools";
import * as fabric from "fabric";

const getMeasureHandlers = (canvasRef: MutableRefObject<Canvas | null>, measuringRef: MeasuringRef): MouseHandlers => {
  const canvas = canvasRef.current;
  if (canvas === null) throw new Error("Canvas is not initialized");

  canvas.defaultCursor = "crosshair";
  canvas.hoverCursor = "crosshair";

  const onMouseDown = (options: TPointerEventInfo) => {
    // @TODO: pick correct point
    const point = canvas.getScenePoint(options.e);
    if (!measuringRef.current) {
      // start
      const startPt = new fabric.Point(point.x, point.y);
      const red = "#ef4444"; // tailwind red-500
      const line = new fabric.Line([startPt.x, startPt.y, startPt.x, startPt.y], {
        stroke: red,
        strokeWidth: 2,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      const arrow = new fabric.Triangle({
        left: startPt.x,
        top: startPt.y,
        width: 10,
        height: 12,
        fill: red,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      const label = new fabric.Text("0 px", {
        left: startPt.x,
        top: startPt.y,
        fontSize: 14,
        fill: red,
        backgroundColor: "rgba(255,255,255,0.6)",
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      canvas.add(line);
      canvas.add(arrow);
      canvas.add(label);
      measuringRef.current = { start: startPt, line, arrow, label };
      canvas.requestRenderAll();
    } else {
      // finish and clear temp objects
      const { line, arrow, label } = measuringRef.current;
      canvas.remove(line);
      canvas.remove(arrow);
      canvas.remove(label);
      measuringRef.current = null;
      canvas.requestRenderAll();
    }
  };

  const onMouseMove = (options: TPointerEventInfo) => {
    if (!measuringRef.current) return;

    const point = canvas.getScenePoint(options.e);
    const { start, line, arrow, label } = measuringRef.current;
    // update line end
    line.set({ x2: point.x, y2: point.y });
    // compute distance
    const dx = point.x - start.x;
    const dy = point.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    label.set({ text: `${Math.round(dist)} px` });
    // position label at midpoint with slight offset perpendicular to line
    const midX = (start.x + point.x) / 2;
    const midY = (start.y + point.y) / 2;
    const angle = Math.atan2(dy, dx);
    const offset = 10;
    const offX = -Math.sin(angle) * offset;
    const offY = Math.cos(angle) * offset;
    label.set({ left: midX + offX, top: midY + offY });
    // position and rotate arrow at end, pointing along the line
    arrow.set({ left: point.x, top: point.y, angle: (angle * 180) / Math.PI + 90 });
    canvas.requestRenderAll();
  };

  const onMouseUp = () => {};

  const handlerDisposer = () => {
    if (!measuringRef.current) return;
    const { line, arrow, label } = measuringRef.current;
    canvas.remove(line);
    canvas.remove(arrow);
    canvas.remove(label);
    measuringRef.current = null;
    canvas.requestRenderAll();
  };

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    handlerDisposer,
  };
};
export default getMeasureHandlers;
