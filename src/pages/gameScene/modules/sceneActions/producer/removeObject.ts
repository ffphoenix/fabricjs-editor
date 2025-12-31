import type { Canvas, FabricObject } from "fabric";
import type { HistoryItem } from "../../sceneHistory/store/SceneHistoryStore";
import { getFabricObjectByUuid } from "../../../utils/getFabricObjectByUuid";

const removeObject = (canvas: Canvas, object: FabricObject) => {
  const objectToDelete = getFabricObjectByUuid(canvas, object?.UUID ?? "");
  if (!objectToDelete) throw new Error(`Cannot delete object - object not found by UUID: ${object.UUID}`);
  object.set({ isChangedByHistory: true });
  canvas.remove(objectToDelete);
};
export default removeObject;
