import * as fabric from "fabric";
import type { MutableRefObject } from "react";
import type { Canvas } from "fabric";

const getPan = (canvasRef: MutableRefObject<Canvas | null>) => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: 0, y: 0 };
  const vpt = canvas.viewportTransform || fabric.iMatrix.concat();
  return { x: vpt[4] || 0, y: vpt[5] || 0 };
};
export default getPan;
