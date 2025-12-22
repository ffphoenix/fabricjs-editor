import { type Canvas } from "fabric";
import SceneHistoryStore from "../../SceneHistoryStore";
import type { MutableRefObject } from "react";
import doHistoryAction from "./doHistoryAction";

const undoSceneAction = (canvasRef: MutableRefObject<Canvas | null>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const historyItem = SceneHistoryStore.latestUndoHistoryItem;
  if (!historyItem) return;

  const prevItem = doHistoryAction("undo", canvas, historyItem);
  const popHistoryItem = SceneHistoryStore.undoHistory.pop();
  if (popHistoryItem) {
    const { action, UUID } = popHistoryItem;
    SceneHistoryStore.addRedoHistoryItem(action, UUID, prevItem ?? {});
  }
  canvas.requestRenderAll();
};
export default undoSceneAction;
