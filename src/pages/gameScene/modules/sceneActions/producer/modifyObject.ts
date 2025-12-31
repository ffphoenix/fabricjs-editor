import { type Canvas, type FabricObject, Group } from "fabric";
import { setPanKeepingZoom } from "../../sceneHistory/utils/setPanKeepingZoom";

const modifyObject = (
  canvas: Canvas,
  object: FabricObject,
  originalProps: Partial<FabricObject>,
  pan: { x: number; y: number },
) => {
  object.set({ ...originalProps, isChangedByHistory: true });

  if (object instanceof Group) {
    object.getObjects().forEach((o) => o.setCoords());
  } else {
    object.setCoords();
  }
  setPanKeepingZoom(canvas, pan);
};

export default modifyObject;
