import { type Canvas } from "fabric";
import SceneHistoryStore from "../../SceneHistoryStore";
import type { MutableRefObject } from "react";
import doHistoryAction from "./doHistoryAction";

const redoSceneAction = (canvasRef: MutableRefObject<Canvas | null>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const historyItem = SceneHistoryStore.latestRedoHistoryItem;
  if (!historyItem) return;

  const prevItem = doHistoryAction("redo", canvas, historyItem);
  const popHistoryItem = SceneHistoryStore.redoHistory.pop();
  if (popHistoryItem) {
    const { action, UUID } = popHistoryItem;
    SceneHistoryStore.addUndoHistoryItem(action, UUID, prevItem ?? {});
  }
  canvas.requestRenderAll();
};

export default redoSceneAction;
