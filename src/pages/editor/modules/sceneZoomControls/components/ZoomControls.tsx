import React, { type MutableRefObject } from "react";
import { type Canvas } from "fabric";
import SceneStore from "../../../store/SceneStore";
import { observer } from "mobx-react-lite";
import { MAX_ZOOM, MIN_ZOOM } from "../../../constants/uiConstants";

const zoomByFactor = (canvasRef: MutableRefObject<Canvas | null>, factor: number) => {
  if (!canvasRef.current) return;
  const canvas = canvasRef.current;
  const current = canvas.getZoom();
  const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current * factor));
  const point = canvas.getCenterPoint();
  canvas.zoomToPoint(point, next);
  SceneStore.setCurrentZoom(next);
};

type ZoomControlsProps = {
  canvasRef: MutableRefObject<Canvas | null>;
};
export default observer(({ canvasRef }: ZoomControlsProps) => {
  const handleZoomIn = () => zoomByFactor(canvasRef, 1.2);
  const handleZoomOut = () => zoomByFactor(canvasRef, 1 / 1.2);

  return (
    <div className="absolute right-3 top-3 flex flex-col gap-2 z-50">
      <span className="text-sm text-gray-500">{SceneStore.currentZoom}%</span>
      <button
        type="button"
        onClick={handleZoomIn}
        className="w-9 h-9 rounded-md border bg-white/90 hover:bg-white text-gray-800 shadow"
        aria-label="Zoom in"
        title="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        onClick={handleZoomOut}
        className="w-9 h-9 rounded-md border bg-white/90 hover:bg-white text-gray-800 shadow"
        aria-label="Zoom out"
        title="Zoom out"
      >
        −
      </button>
    </div>
  );
});
