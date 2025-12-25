import { type Canvas, type FabricObject } from "fabric";
import { setPanKeepingZoom } from "../../sceneHistory/utils/setPanKeepingZoom";

const modifyObject = (
  canvas: Canvas,
  object: FabricObject,
  originalProps: Partial<FabricObject>,
  pan: { x: number; y: number },
) => {
  object.set({ ...originalProps, isChangedByHistory: true });
  object.setCoords();

  setPanKeepingZoom(canvas, pan);
};

export default modifyObject;
