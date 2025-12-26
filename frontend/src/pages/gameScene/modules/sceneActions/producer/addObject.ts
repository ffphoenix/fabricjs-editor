import { type Canvas, FabricObject, util } from "fabric";
import { setPanKeepingZoom } from "../../sceneHistory/utils/setPanKeepingZoom";

const addObject = (canvas: Canvas, object: FabricObject, pan: { x: number; y: number }) => {
  const objectsToEnlive = Array.isArray(object) ? object.map((o) => o.toJSON()) : [object.toJSON()];
  // setPanKeepingZoom(canvas, pan);
  util.enlivenObjects<FabricObject>(objectsToEnlive).then((enlivenedObjects) => {
    enlivenedObjects.forEach((object) => {
      object.set({ isEnlivened: true, isChangedByHistory: true });
      canvas.add(object);
    });
  });
};

export default addObject;
