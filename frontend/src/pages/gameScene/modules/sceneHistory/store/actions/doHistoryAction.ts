import { type Canvas, FabricObject } from "fabric";
import removeObject from "../../../sceneActions/producer/removeObject";
import modifyObject from "../../../sceneActions/producer/modifyObject";
import addObject from "../../../sceneActions/producer/addObject";

export const doHistoryAction = (
  queue: "undo" | "redo",
  canvas: Canvas,
  action: "add" | "modify" | "remove",
  object: FabricObject,
  pan: { x: number; y: number },
  originalProps: Partial<FabricObject> = {},
) => {
  const undoMapByAction = {
    add: () => removeObject(canvas, object),
    modify: () => modifyObject(canvas, object, originalProps, pan),
    remove: () => addObject(canvas, object, pan),
  };

  const redoMapByAction = {
    add: () => addObject(canvas, object, pan),
    modify: () => modifyObject(canvas, object, originalProps, pan),
    remove: () => removeObject(canvas, object),
  };

  const actionMap = queue === "undo" ? undoMapByAction : redoMapByAction;
  const actionFunction = actionMap[action];
  if (!action) throw new Error(`Cannot perform action ${action}`);
  actionFunction();
};
export default doHistoryAction;
