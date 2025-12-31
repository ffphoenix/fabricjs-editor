import { type MutableRefObject } from "react";
import { type Canvas, type TPointerEventInfo } from "fabric";
import type { MouseHandlers } from "../useSceneTools";
import * as fabric from "fabric";
import SceneStore from "../../../store/SceneStore";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";

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
    canvas.add(text);
    canvas.setActiveObject(text);
    if (typeof text.enterEditing === "function") {
      text.enterEditing();
      text.selectAll();
    }
    fireObjectAddedEvent(canvas, "self", text);
    SceneStore.setActiveTool("select");
  };

  const onMouseMove = () => {};
  const onMouseUp = () => {};

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    handlerDisposer: () => null,
  };
};
export default useDrawRectHandlers;
