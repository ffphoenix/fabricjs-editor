import { type Canvas, type FabricObject } from "fabric";
import SceneHistoryStore from "../SceneHistoryStore";
import type { MutableRefObject } from "react";
import doHistoryAction from "./doHistoryAction";
import doActionWithGroup from "./doActionWithGroup";
import { getObjectTransformProps } from "../../utils/getObjectTransformProps";
import { toJS } from "mobx";

const undoSceneAction = (canvasRef: MutableRefObject<Canvas | null>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const historyItem = SceneHistoryStore.latestUndoHistoryItem;
  if (!historyItem) return;

  if (historyItem.action === "modify" && !historyItem.originalProps) return;

  try {
    canvas.discardActiveObject();
    const { originalProps, object, action, pan } = toJS(historyItem);
    let transformProps;
    if (Array.isArray(object) && action === "modify") {
      transformProps = doActionWithGroup(canvas, object as FabricObject[], (groupObject) =>
        doHistoryAction("undo", canvas, action, groupObject, pan, originalProps),
      );
    } else {
      transformProps = getObjectTransformProps(object as FabricObject);
      doHistoryAction("undo", canvas, action, object as FabricObject, pan, originalProps);
    }

    SceneHistoryStore.popUndoHistoryItem();
    SceneHistoryStore.addRedoHistoryItem(action, { pan, object, originalProps: transformProps });
  } catch (e) {
    console.error(e);
    SceneHistoryStore.popUndoHistoryItem();
  }
  canvas.requestRenderAll();
};
export default undoSceneAction;
