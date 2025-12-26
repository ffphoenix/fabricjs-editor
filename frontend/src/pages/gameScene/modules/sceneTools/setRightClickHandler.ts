import type { MutableRefObject } from "react";
import { type Canvas } from "fabric";
import * as fabric from "fabric";
import SceneStore from "../../store/SceneStore";

const setRightClickHandler = (canvasRef: MutableRefObject<Canvas | null>) => {
  if (!canvasRef.current) return () => {};
  const canvas = canvasRef.current;

  return canvas.on({
    "mouse:down": (options) => {
      const event = options.e as MouseEvent;
      if (event.button === 2) {
        SceneStore.setRightClickIsRightButtonDown(true);
        SceneStore.setRightClickStartPos({ x: event.clientX, y: event.clientY });
      }
    },
    "mouse:move": (options) => {
      const event = options.e as MouseEvent;

      if (!SceneStore.UI.rightClick.isRightButtonDown) return;
      const startPos = SceneStore.UI.rightClick.startPos;
      if (!startPos) return;

      const dx = Math.abs(event.clientX - startPos.x);
      const dy = Math.abs(event.clientY - startPos.y);
      if (dx >= 2 || dy >= 2) {
        SceneStore.setRightClickPanning(true);
        canvas.setCursor("grabbing");
        const vpt = canvas.viewportTransform || fabric.iMatrix.concat();
        vpt[4] += event.movementX;
        vpt[5] += event.movementY;
        canvas.setViewportTransform(vpt);
        canvas.requestRenderAll();
      }
    },
    "mouse:up": (options) => {
      const event = options.e as MouseEvent;
      if (!SceneStore.UI.rightClick.isRightButtonDown || event.button !== 2) return;
      SceneStore.setRightClickIsRightButtonDown(false);

      if (SceneStore.UI.rightClick.isPanning) {
        SceneStore.setRightClickPanning(false);
        SceneStore.setRightClickStartPos({ x: 0, y: 0 });
        // @TODO: change to propper handling
        const activeTool = SceneStore.activeTool;
        const cursor = activeTool === "hand" ? "grab" : "default";
        canvas.setCursor(cursor);
        canvas.requestRenderAll();
        return;
      }
      SceneStore.setContextMenu(true, event.clientX, event.clientY);
    },
  });
};
export default setRightClickHandler;
