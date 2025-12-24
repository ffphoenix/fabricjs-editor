import { type HistoryItem } from "../SceneHistoryStore";
import { type Canvas, FabricObject } from "fabric";
import { toJS } from "mobx";
import removeObject from "../../../sceneActions/producer/removeObject";
import modifyObject from "../../../sceneActions/producer/modifyObject";
import addObject from "../../../sceneActions/producer/addObject";

export const doHistoryAction = (
  queue: "undo" | "redo",
  canvas: Canvas,
  historyItem: HistoryItem,
): Partial<FabricObject> => {
  const undoMapByAction = {
    add: () => removeObject(canvas, historyItem),
    modify: () => modifyObject(canvas, historyItem),
    remove: () => addObject(canvas, historyItem),
  };

  const redoMapByAction = {
    add: () => addObject(canvas, historyItem),
    modify: () => modifyObject(canvas, historyItem),
    remove: () => removeObject(canvas, historyItem),
  };

  const actionMap = queue === "undo" ? undoMapByAction : redoMapByAction;
  const action = actionMap[historyItem.action];
  if (!action) throw new Error(`Cannot perform action ${historyItem.action}`);
  const prevObjectState = action();

  return historyItem.action === "modify" && prevObjectState ? prevObjectState : toJS(historyItem.item);
};
export default doHistoryAction;
