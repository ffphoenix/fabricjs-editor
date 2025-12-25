import { type Canvas, FabricObject, util } from "fabric";
import type { HistoryItem } from "../../sceneHistory/store/SceneHistoryStore";
import { toJS } from "mobx";
import { setPanKeepingZoom } from "../../sceneHistory/utils/setPanKeepingZoom";

const addObject = (canvas: Canvas, object: FabricObject, pan: { x: number; y: number }) => {
  const objectsToEnlive = Array.isArray(object) ? object.map((o) => o.toJSON()) : [object.toJSON()];
  util.enlivenObjects<FabricObject>([objectsToEnlive]).then((enlivenedObjects) => {
    enlivenedObjects.forEach((object) => {
      object.set({ isEnlivened: true, isChangedByHistory: true });
      //console.log("addObject", toJS(objectsToEnlive));
      canvas.add(object);

      setPanKeepingZoom(canvas, pan);
    });
  });
};

export default addObject;
