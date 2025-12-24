import { type Canvas } from "fabric";
import SceneHistoryStore from "../SceneHistoryStore";
import type { MutableRefObject } from "react";
import doHistoryAction from "./doHistoryAction";

const undoSceneAction = (canvasRef: MutableRefObject<Canvas | null>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const historyItem = SceneHistoryStore.latestUndoHistoryItem;
  if (!historyItem) return;

  try {
    const prevItem = doHistoryAction("undo", canvas, historyItem);
    const popHistoryItem = SceneHistoryStore.undoHistory.pop();
    if (popHistoryItem) {
      const { action, UUID, pan } = popHistoryItem;
      SceneHistoryStore.addRedoHistoryItem(action, UUID, pan, prevItem ?? {});
    }
  } catch (e) {
    console.error(e);
    SceneHistoryStore.undoHistory.pop();
  }
  canvas.requestRenderAll();
};
export default undoSceneAction;
