import { type Canvas, type FabricObject } from "fabric";
import SceneHistoryStore from "../SceneHistoryStore";
import type { MutableRefObject } from "react";
import doHistoryAction from "./doHistoryAction";
import doActionWithGroup from "./doActionWithGroup";
import { getObjectTransformProps } from "../../utils/getObjectTransformProps";
import { toJS } from "mobx";

const redoSceneAction = (canvasRef: MutableRefObject<Canvas | null>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const historyItem = SceneHistoryStore.latestRedoHistoryItem;
  if (!historyItem) return;

  try {
    canvas.discardActiveObject();
    const { originalProps, object, action, pan } = toJS(historyItem);
    let transformProps;
    if (Array.isArray(object) && action === "modify") {
      transformProps = doActionWithGroup(canvas, object as FabricObject[], (groupObject) =>
        doHistoryAction("redo", canvas, action, groupObject, pan, originalProps),
      );
    } else {
      transformProps = getObjectTransformProps(object as FabricObject);
      doHistoryAction("redo", canvas, action, object as FabricObject, pan, originalProps);
    }

    SceneHistoryStore.popRedoHistoryItem();
    SceneHistoryStore.addUndoHistoryItem(action, { pan, object, originalProps: transformProps }, true);
  } catch (e) {
    console.error(e);
    SceneHistoryStore.popRedoHistoryItem();
  }
  canvas.requestRenderAll();
};

export default redoSceneAction;
