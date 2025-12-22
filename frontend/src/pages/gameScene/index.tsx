import React, { useEffect } from "react";
import * as fabric from "fabric";
import ToolMenu from "./components/ToolMenu";
import "./style.css";
import useCanvas from "./hooks/useCanvas";
import ZoomControls from "./components/ZoomControls";
import useWheelZoomHandler from "./hooks/useWheelZoomHandler";
import SceneStore from "./store/SceneStore";
import useCanvasMouseEvents from "./hooks/useCanvasMouseEvents";
import useKeyboardHotkeys from "./hooks/useKeyboardHotkeys";
import useSceneHistory from "./hooks/useSceneHistory";
import "./declarations/FabricObject";

const GameScenePage: React.FC = () => {
  const { canvasRef, canvasElRef, containerRef } = useCanvas({
    backgroundColor: "#f8fafc",
    selection: true,
    preserveObjectStacking: true,
  });
  useWheelZoomHandler(canvasRef);
  useCanvasMouseEvents(canvasRef);
  useKeyboardHotkeys(canvasRef);
  useSceneHistory(canvasRef);
  console.log("GameScenePage rendered");

  const getPan = () => {
    const canvas = canvasRef.current;
    if (!canvas) return { panX: 0, panY: 0 };
    const vpt = canvas.viewportTransform || fabric.iMatrix.concat();
    return { panX: vpt[4] || 0, panY: vpt[5] || 0 };
  };

  const setPanKeepingZoom = (panX: number, panY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const vpt = (canvas.viewportTransform || fabric.iMatrix.concat()).slice() as number[];
    const zoom = canvas.getZoom();
    vpt[0] = zoom; // scaleX
    vpt[3] = zoom; // scaleY
    vpt[4] = panX; // translateX
    vpt[5] = panY; // translateY
    canvas.setViewportTransform(vpt as any);
  };

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

    const onMouseDown = (opt: fabric.TPointerEventInfo<MouseEvent>) => {
      if (!canvas) return;
      // Hand tool: start panning
      // MoveLayer tool: start tracking
      // if (tool === "moveLayer") {
      //   const evt = opt.e as unknown as MouseEvent;
      //   layerMoveRef.current = { lastX: evt.clientX, lastY: evt.clientY };
      //   canvas.setCursor("grabbing");
      //   return;
      // }
      // Measure tool: start or finish measuring
      // Arrow tool: start drawing
    };

    const onMouseMove = (opt: fabric.TPointerEventInfo<MouseEvent>) => {
      if (!canvas) return;
      // Hand tool panning behavior

      // MoveLayer live behavior
      // if (tool === "moveLayer" && layerMoveRef.current) {
      //   const evt = opt.e as unknown as MouseEvent;
      //   const zoom = canvas.getZoom() || 1;
      //   const dx = (evt.clientX - layerMoveRef.current.lastX) / zoom;
      //   const dy = (evt.clientY - layerMoveRef.current.lastY) / zoom;
      //   layerMoveRef.current.lastX = evt.clientX;
      //   layerMoveRef.current.lastY = evt.clientY;
      //   // move all objects of active layer
      //   canvas.getObjects().forEach((o) => {
      //     if ((o as any).layerId === SceneStore.activeLayerId) {
      //       o.set({ left: (o.left || 0) + dx, top: (o.top || 0) + dy });
      //       o.setCoords();
      //     }
      //   });
      //   canvas.requestRenderAll();
      //   return;
      // }
      // Measure tool live update
      // Arrow live update
    };

    const onMouseUp = () => {
      // if (tool === "moveLayer") {
      //   layerMoveRef.current = null;
      //   canvas.setCursor("move");
      //   captureState();
      //   return;
      // }
    };
  });

  // Capture changes for various canvas events

  const handleAddImage = (file: File) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // use fabric.Image.fromURL to create image
      fabric.Image.fromURL(
        dataUrl,
        (img) => {
          console.log("Image loaded:", img);
          const cw = canvas.getWidth() || 800;
          const ch = canvas.getHeight() || 600;
          const padding = 20;
          const maxW = Math.max(10, cw - padding * 2);
          const maxH = Math.max(10, ch - padding * 2);

          const iw = img.width ?? 0;
          const ih = img.height ?? 0;
          if (iw > 0 && ih > 0) {
            const scale = Math.min(maxW / iw, maxH / ih, 1);
            img.set({ scaleX: scale, scaleY: scale });
          }

          img.set({ selectable: true, objectCaching: true });
          (img as any).layerId = SceneStore.activeLayerId;
          canvas.add(img);
          canvas.centerObject(img);
          canvas.setActiveObject(img);
          canvas.requestRenderAll();
          // setTool("select");
        },
        { crossOrigin: "anonymous" },
      );
    };
    reader.onerror = () => {
      console.warn("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-full min-h-screen" ref={containerRef}>
      {/* Absolute vertical menu on the left */}
      <div className="absolute left-0 top-0 h-full p-3 border-r bg-white/90 backdrop-blur-sm z-1000">
        <ToolMenu
          onAddImage={handleAddImage}
          onClear={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.clear();
            canvas.setBackgroundColor("#f8fafc", () => canvas.requestRenderAll());
          }}
        />
      </div>

      {/* Canvas area with left padding to avoid overlap */}
      <div className="w-full border rounded bg-white overflow-hidden relative">
        <canvas ref={canvasElRef} />
        <ZoomControls canvasRef={canvasRef} />
      </div>
    </div>
  );
};

export default GameScenePage;
