import { type HistoryItem } from "../../SceneHistoryStore";
import { ActiveSelection, type Canvas, FabricObject, iMatrix, type TMat2D, util } from "fabric";
import { getFabricObjectByUuid } from "../../../utils/getFabricObjectByUuid";
import getPrevObjectPropsDiff from "../../../utils/getPrevObjectPropsDiff";
import { toJS } from "mobx";

const setPanKeepingZoom = (canvas: Canvas, historyItem: HistoryItem) => {
  const vpt = (canvas.viewportTransform || iMatrix.concat()).slice();
  const zoom = canvas.getZoom();
  vpt[0] = zoom; // scaleX
  vpt[3] = zoom; // scaleY
  vpt[4] = historyItem.pan.x; // translateX
  vpt[5] = historyItem.pan.y; // translateY
  canvas.setViewportTransform(vpt as TMat2D);
  canvas.renderAll();
};

const removeObject = (canvas: Canvas, historyItem: HistoryItem) => {
  const object = getFabricObjectByUuid(canvas, historyItem.UUID);
  if (!object) throw new Error(`Cannot delete object - object not found by UUID: ${historyItem.UUID}`);
  object.set({ isChangedByHistory: true });
  canvas.remove(object);
};

const modifyObject = (canvas: Canvas, historyItem: HistoryItem) => {
  const object = getFabricObjectByUuid(canvas, historyItem.UUID);
  if (!object) throw new Error(`Cannot modify object - object not found by UUID: ${historyItem.UUID}`);
  const selectedObjects = canvas.getActiveObjects();
  canvas.discardActiveObject();
  const prevObjectState = getPrevObjectPropsDiff(toJS(object), historyItem.item);
  object.set({ ...historyItem.item, isChangedByHistory: true });
  object.setCoords();
  const selection = new ActiveSelection(selectedObjects, { canvas });
  canvas.setActiveObject(selection);

  setPanKeepingZoom(canvas, historyItem);
  return prevObjectState;
};

const addObject = (canvas: Canvas, historyItem: HistoryItem) => {
  util.enlivenObjects<FabricObject>([historyItem.item]).then((enlivenedObjects) => {
    enlivenedObjects.forEach((object) => {
      object.set({ isEnlivened: true, isChangedByHistory: true });
      console.log("addObject", object.toObject(), toJS(historyItem.item));
      canvas.add(object);

      setPanKeepingZoom(canvas, historyItem);
    });
  });
};

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
