import { ActiveSelection, type Canvas } from "fabric";
import type { HistoryItem } from "../../sceneHistory/store/SceneHistoryStore";
import { getFabricObjectByUuid } from "../../../utils/getFabricObjectByUuid";
import getPrevObjectPropsDiff from "../../../utils/getPrevObjectPropsDiff";
import { toJS } from "mobx";
import { setPanKeepingZoom } from "../../sceneHistory/utils/setPanKeepingZoom";

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

export default modifyObject;
