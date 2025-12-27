import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import handleCanvasResize from "./handleCanvasResize";
import { type CanvasOptions } from "fabric";
import { generateUUID } from "../../utils/uuid";
import SceneStore from "../../store/SceneStore";
import fireObjectModifiedEvent from "../sceneActions/catcher/fireObjectModifiedEvent";

const defaultCanvasOptions: Partial<CanvasOptions> = {
  backgroundColor: "#f8fafc",
  selection: true,
  preserveObjectStacking: true,
};

export default (canvasOptions: Partial<CanvasOptions>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;
    const canvas = new fabric.Canvas(canvasElRef.current, {
      defaultCanvasOptions,
      ...canvasOptions,
    });
    canvasRef.current = canvas;
    handleCanvasResize(canvas, containerRef);
    const eventResizeHandler = () => handleCanvasResize(canvas, containerRef);
    window.addEventListener("resize", eventResizeHandler);

    const onObjectAddedDisposer = canvas.on("object:added", (e) => {
      const object = e.target;
      if (!object || object.changeMadeBy !== undefined || object.isEnlivened) return;
      object.set({
        UUID: generateUUID(),
        layerUUID: SceneStore.activeLayerId,
        changeMadeBy: "self",
      });
    });

    const onObjectModifiedDisposer = canvas.on("object:modified", (e) => {
      fireObjectModifiedEvent(canvas, e);
    });

    return () => {
      window.removeEventListener("resize", eventResizeHandler);
      onObjectAddedDisposer();
      onObjectModifiedDisposer();
      canvas.dispose();
      canvasRef.current = null;
    };
  }, []);

  return {
    containerRef,
    canvasRef,
    canvas: canvasRef.current,
    canvasElRef,
  };
};
