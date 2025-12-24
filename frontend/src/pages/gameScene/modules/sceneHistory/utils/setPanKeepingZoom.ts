import { type Canvas, iMatrix, type TMat2D } from "fabric";
import type { HistoryItem } from "../store/SceneHistoryStore";

export const setPanKeepingZoom = (canvas: Canvas, historyItem: HistoryItem) => {
  const vpt = (canvas.viewportTransform || iMatrix.concat()).slice();
  const zoom = canvas.getZoom();
  vpt[0] = zoom; // scaleX
  vpt[3] = zoom; // scaleY
  vpt[4] = historyItem.pan.x; // translateX
  vpt[5] = historyItem.pan.y; // translateY
  canvas.setViewportTransform(vpt as TMat2D);
  canvas.renderAll();
};
