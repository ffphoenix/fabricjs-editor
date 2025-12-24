import type { Canvas } from "fabric";
import type { HistoryItem } from "../../sceneHistory/store/SceneHistoryStore";
import { getFabricObjectByUuid } from "../../../utils/getFabricObjectByUuid";

const removeObject = (canvas: Canvas, historyItem: HistoryItem) => {
  const object = getFabricObjectByUuid(canvas, historyItem.UUID);
  if (!object) throw new Error(`Cannot delete object - object not found by UUID: ${historyItem.UUID}`);
  object.set({ isChangedByHistory: true });
  canvas.remove(object);
};
export default removeObject;
