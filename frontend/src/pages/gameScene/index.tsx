import React from "react";
import * as fabric from "fabric";
import ToolMenu from "./modules/sceneTools/components/ToolMenu";
import "./style.css";
import SceneStore from "./store/SceneStore";
import useCanvas from "./modules/sceneCanvas/useCanvas";
import ZoomControls from "./modules/sceneZoomControls/components/ZoomControls";
import useWheelZoomHandler from "./modules/sceneZoomControls/useWheelZoomHandler";
import useSceneTools from "./modules/sceneTools/useSceneTools";
import useKeyboardHotkeys from "./hooks/useKeyboardHotkeys";
import "./declarations/FabricObject";
import useSceneHistory from "./modules/sceneHistory/useSceneHistory";
import SceneContextMenu from "./modules/sceneTools/components/SceneContextMenu";

const GameScenePage: React.FC = () => {
  const { canvasRef, canvasElRef, containerRef } = useCanvas({
    backgroundColor: "#f8fafc",
    selection: true,
    preserveObjectStacking: true,
    fireRightClick: true,
    stopContextMenu: true,
  });
  useWheelZoomHandler(canvasRef);
  useSceneTools(canvasRef);
  useKeyboardHotkeys(canvasRef);
  useSceneHistory(canvasRef);

  console.log("GameScenePage rendered");

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
          printCanvas={() => console.log("Print canvas", canvasRef.current?.toJSON())}
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
      <SceneContextMenu />
    </div>
  );
};

export default GameScenePage;
