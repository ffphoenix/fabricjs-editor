import React from "react";
import ToolMenu from "./modules/sceneTools/components/ToolMenu";
import "./style.css";
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

  return (
    <div className="relative w-full h-full min-h-screen" ref={containerRef}>
      {/* Absolute vertical menu on the left */}
      <img src="/images/grid.png" id="bgimage" className="hidden" />

      <div className="absolute left-0 top-0 h-full p-3 border-r bg-white/90 backdrop-blur-sm z-1000">
        <ToolMenu canvasRef={canvasRef} />
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
