import { ActiveSelection, type Canvas, type FabricObject, Group } from "fabric";
import SceneHistoryStore from "../SceneHistoryStore";
import type { MutableRefObject } from "react";
import doHistoryAction from "./doHistoryAction";
import { getFabricObjectByUuid } from "../../../../utils/getFabricObjectByUuid";

const undoSceneAction = (canvasRef: MutableRefObject<Canvas | null>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const historyItem = SceneHistoryStore.latestUndoHistoryItem;
  if (!historyItem) return;

  if (historyItem.action === "modify" && !historyItem.originalProps) return;

  try {
    let object = historyItem.object;
    canvas.discardActiveObject();
    if (Array.isArray(historyItem.object)) {
      const canvasObjects = historyItem.object.map((obj) => getFabricObjectByUuid(canvas, obj.UUID));
      object = new Group(canvasObjects);
    }
    console.log("undoing", object);
    if (historyItem.originalProps) {
      doHistoryAction(
        "undo",
        canvas,
        historyItem.action,
        object as FabricObject,
        historyItem.pan,
        historyItem.originalProps,
      );
      if (object.type === "group") {
        console.log("undoing group", object);
        object.removeAll();
        // canvas.remove(object);
        // canvas.add(...object.removeAll());
      }
    }
    return;
    // const popHistoryItem = SceneHistoryStore.undoHistory.pop();
    // if (popHistoryItem) {
    //   const { action, UUID, pan } = popHistoryItem;
    //   SceneHistoryStore.addRedoHistoryItem(action, UUID, pan, prevItem ?? {});
    // }
  } catch (e) {
    console.error(e);
    SceneHistoryStore.undoHistory.pop();
  }
  canvas.requestRenderAll();
};
export default undoSceneAction;
