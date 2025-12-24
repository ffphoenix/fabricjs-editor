import { type Canvas, FabricObject, util } from "fabric";
import type { HistoryItem } from "../../sceneHistory/store/SceneHistoryStore";
import { toJS } from "mobx";
import { setPanKeepingZoom } from "../../sceneHistory/utils/setPanKeepingZoom";

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

export default addObject;
