import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import handleCanvasResize from "../core/handleCanvasResize";
import type { CanvasOptions } from "fabric";

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
    console.log("init canvas");
    const canvas = new fabric.Canvas(canvasElRef.current, { defaultCanvasOptions, ...canvasOptions });
    canvasRef.current = canvas;

    handleCanvasResize(canvas, containerRef);
    const eventResizeHandler = () => handleCanvasResize(canvas, containerRef);
    window.addEventListener("resize", eventResizeHandler);

    return () => {
      window.removeEventListener("resize", eventResizeHandler);
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
