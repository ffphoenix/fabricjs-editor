import { type Canvas, FabricObject } from "fabric";
import SceneHistoryStore from "../SceneHistoryStore";
import type { MutableRefObject } from "react";

export default function undoSceneAction(canvasRef: MutableRefObject<Canvas | null>) {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const historyItem = SceneHistoryStore.latestUndoHistoryItem;
  if (!historyItem) return;

  const object = canvas.getObjects().find((object) => object.UUID === historyItem.UUID);
  if (!object) return;
  if (historyItem.action === "add") {
    canvas.remove(object);
  }
  if (historyItem.action === "modify") {
    canvas.discardActiveObject();
    object.set({ ...historyItem.item });
    canvas.setActiveObject(object);
  }
  if (historyItem.action === "remove") {
    FabricObject.fromObject(historyItem.item).then((obj) => {
      canvas.add(obj);
    });
  }
  SceneHistoryStore.historyUndo.pop();
  canvas.requestRenderAll();
}
