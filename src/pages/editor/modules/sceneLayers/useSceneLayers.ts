import { type MutableRefObject, useEffect } from "react";
import type { Canvas } from "fabric";

const useSceneLayers = (canvasRef: MutableRefObject<Canvas | null>) => {
  // Update tool specifics (drawing mode, selection, brush)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // // reset modes !!layers logic
    // canvas.forEachObject((obj) => {
    //   const layer = SceneStore.getLayerById((obj as any).layerId as string);
    //   const selectable = selectionEnabled && !layer?.locked;
    //   obj.set({ selectable });
    // });

    // cursors for hand tool
    // if (tool === "moveLayer") {
    //   canvas.defaultCursor = "move";
    //   canvas.hoverCursor = "move";
    // }
    // applyLayerPropsToObjects(canvas, tool);
    canvas.renderAll();
  });

  // Pointer handlers for shapes and text
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // const onMouseDown = (opt: fabric.TPointerEventInfo<MouseEvent>) => {
    //   if (!canvas) return;
    //   // MoveLayer tool: start tracking
    //   // if (tool === "moveLayer") {
    //   //   const evt = opt.e as unknown as MouseEvent;
    //   //   layerMoveRef.current = { lastX: evt.clientX, lastY: evt.clientY };
    //   //   canvas.setCursor("grabbing");
    //   //   return;
    //   // }
    // };

    // const onMouseMove = (opt: fabric.TPointerEventInfo<MouseEvent>) => {
    //   if (!canvas) return;
    //
    //   // MoveLayer live behavior
    //   // if (tool === "moveLayer" && layerMoveRef.current) {
    //   //   const evt = opt.e as unknown as MouseEvent;
    //   //   const zoom = canvas.getZoom() || 1;
    //   //   const dx = (evt.clientX - layerMoveRef.current.lastX) / zoom;
    //   //   const dy = (evt.clientY - layerMoveRef.current.lastY) / zoom;
    //   //   layerMoveRef.current.lastX = evt.clientX;
    //   //   layerMoveRef.current.lastY = evt.clientY;
    //   //   // move all objects of active layer
    //   //   canvas.getObjects().forEach((o) => {
    //   //     if ((o as any).layerId === SceneStore.activeLayerId) {
    //   //       o.set({ left: (o.left || 0) + dx, top: (o.top || 0) + dy });
    //   //       o.setCoords();
    //   //     }
    //   //   });
    //   //   canvas.requestRenderAll();
    //   //   return;
    //   // }
    // };

    // const onMouseUp = () => {
    //   // if (tool === "moveLayer") {
    //   //   layerMoveRef.current = null;
    //   //   canvas.setCursor("move");
    //   //   captureState();
    //   //   return;
    //   // }
    // };
  });
};

export default useSceneLayers;
