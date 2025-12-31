import { type MutableRefObject } from "react";
import { type Canvas } from "fabric";
import type { MouseHandlers } from "../useSceneTools";
import * as fabric from "fabric";
import SceneStore from "../../../store/SceneStore";
import getEmptyHandlers from "./getEmptyHandlers";
import { autorun } from "mobx";
import fireObjectAddedEvent from "../../sceneActions/catcher/fireObjectAddedEvent";

const getDrawPencilHandlers = (canvasRef: MutableRefObject<Canvas | null>): MouseHandlers => {
  const canvas = canvasRef.current;
  if (canvas === null) throw new Error("Canvas is not initialized");

  const autorunDispose = autorun(
    () => {
      console.log("autorun getDrawPencilHandlers");
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.isDrawingMode = true;
      const brush = canvas.freeDrawingBrush;
      brush.color = SceneStore.tools.drawTools.strokeColor;
      brush.width = SceneStore.tools.drawTools.strokeWidth;
    },
    { delay: 500 },
  );

  const onPathCreatedDisposer = canvas.on("path:created", (e) => {
    const path = e.path;
    fireObjectAddedEvent(canvas, "self", path);
  });
  return {
    ...getEmptyHandlers(),
    handlerDisposer: () => {
      autorunDispose();
      onPathCreatedDisposer();
    },
  };
};
export default getDrawPencilHandlers;
