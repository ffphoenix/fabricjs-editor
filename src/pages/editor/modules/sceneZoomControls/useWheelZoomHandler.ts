import { type MutableRefObject, useEffect } from "react";
import { type Canvas, type TEvent } from "fabric";
import * as fabric from "fabric";
import SceneStore from "../../store/SceneStore";
import { MAX_ZOOM, MIN_ZOOM } from "../../constants/uiConstants";

const onWheel = (canvasRef: MutableRefObject<Canvas | null>, options: TEvent<WheelEvent>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const event: WheelEvent = options.e;
  let zoom = canvas.getZoom();
  const delta = event.deltaY;
  const factor = 0.999 ** delta;

  zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor));
  SceneStore.setCurrentZoom(zoom);
  const point = new fabric.Point(event.offsetX, event.offsetY);
  canvas.zoomToPoint(point, zoom);
  event.preventDefault();
  event.stopPropagation();
};

export default (canvasRef: MutableRefObject<Canvas | null>) => {
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const onWheelHandler = (options: TEvent<WheelEvent>) => onWheel(canvasRef, options);
    canvas.on("mouse:wheel", onWheelHandler);

    return () => {
      canvas.off("mouse:wheel", onWheelHandler);
    };
  }, []);
};
