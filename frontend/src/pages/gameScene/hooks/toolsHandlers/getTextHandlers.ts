import { type MutableRefObject } from "react";
import { type Canvas, type TPointerEventInfo } from "fabric";
import type { MouseHandlers } from "../useCanvasMouseEvents";
import * as fabric from "fabric";
import SceneStore from "../../store/SceneStore";

const useDrawRectHandlers = (canvasRef: MutableRefObject<Canvas | null>): MouseHandlers => {
  const canvas = canvasRef.current;
  if (canvas === null) throw new Error("Canvas is not initialized");

  const onMouseDown = (options: TPointerEventInfo) => {
    // @TODO: pick correct point
    const point = canvas.getScenePoint(options.e);
    const text = new fabric.IText("Text", {
      left: point.x,
      top: point.y,
      fill: SceneStore.tools.textTool.color,
      fontSize: SceneStore.tools.textTool.fontSize,
      editable: true,
    });
    text.set("layerId", SceneStore.activeLayerId);
    canvas.add(text);
    canvas.setActiveObject(text);
    if (typeof text.enterEditing === "function") {
      text.enterEditing();
      text.selectAll();
    }
    SceneStore.setActiveTool("select");
  };

  const onMouseMove = () => {};
  const onMouseUp = () => {};

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
  };
};
export default useDrawRectHandlers;
