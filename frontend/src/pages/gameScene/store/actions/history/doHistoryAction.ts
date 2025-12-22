import { type HistoryItem } from "../../SceneHistoryStore";
import { type Canvas, FabricObject, util } from "fabric";
import { getFabricObject } from "../../../utils/getFabricObject";
import getPrevObjectPropsDiff from "../../../utils/getPrevObjectPropsDiff";
import { toJS } from "mobx";

const removeObject = (canvas: Canvas, uuid: string) => {
  const object = getFabricObject(canvas, uuid);
  if (!object) throw new Error(`Cannot delete object - object not found by UUID: ${uuid}`);
  object.set({ isChangedByHistory: true });
  canvas.remove(object);
};

const modifyObject = (canvas: Canvas, uuid: string, item: Partial<FabricObject>) => {
  const object = getFabricObject(canvas, uuid);
  if (!object) throw new Error(`Cannot modify object - object not found by UUID: ${uuid}`);
  canvas.discardActiveObject();
  const prevObjectState = getPrevObjectPropsDiff(toJS(object), item);
  object.set({ ...item, isChangedByHistory: true });
  object.setCoords();
  canvas.setActiveObject(object);
  console.log("-------modify action ", prevObjectState, toJS(item));
  return prevObjectState;
};

const addObject = (canvas: Canvas, item: Partial<FabricObject>) => {
  util.enlivenObjects<FabricObject>([item]).then((enlivenedObjects) => {
    enlivenedObjects.forEach((object) => {
      object.set({ isEnlivened: true, isChangedByHistory: true });
      canvas.add(object);
    });
  });
};

export const doHistoryAction = (
  queue: "undo" | "redo",
  canvas: Canvas,
  historyItem: HistoryItem,
): Partial<FabricObject> => {
  const undoMapByAction = {
    add: () => removeObject(canvas, historyItem.UUID),
    modify: () => modifyObject(canvas, historyItem.UUID, historyItem.item),
    remove: () => addObject(canvas, historyItem.item),
  };

  const redoMapByAction = {
    add: () => addObject(canvas, historyItem.item),
    modify: () => modifyObject(canvas, historyItem.UUID, historyItem.item),
    remove: () => removeObject(canvas, historyItem.UUID),
  };

  const actionMap = queue === "undo" ? undoMapByAction : redoMapByAction;
  const action = actionMap[historyItem.action];
  if (!action) throw new Error(`Cannot perform action ${historyItem.action}`);
  const prevObjectState = action();

  return historyItem.action === "modify" && prevObjectState ? prevObjectState : toJS(historyItem.item);
};
export default doHistoryAction;
