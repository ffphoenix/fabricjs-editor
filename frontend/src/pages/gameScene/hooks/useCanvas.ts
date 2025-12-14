import { useEffect, useRef } from "react";
import * as fabric from "fabric";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import type { TCanvasOptions } from "fabric/dist/src/canvas/CanvasOptions";
import handleCanvasResize from "../core/handleCanvasResize";

const defaultCanvasOptions: TCanvasOptions = {
  backgroundColor: "#f8fafc",
  selection: true,
  preserveObjectStacking: true,
};

export default (canvasOptions: TCanvasOptions) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;
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
    canvas: canvasRef.current,
    canvasElRef,
  };
};
