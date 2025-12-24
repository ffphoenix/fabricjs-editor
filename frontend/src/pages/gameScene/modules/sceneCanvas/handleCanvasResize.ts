import { Canvas } from "fabric";
import type { MutableRefObject } from "react";

export default (canvas: Canvas, containerRef: MutableRefObject<HTMLElement | null>) => {
  if (!containerRef.current) return;
  const { clientWidth, clientHeight } = containerRef.current;
  const height = Math.max(clientHeight, 600);
  const width = Math.max(clientWidth, 800);

  canvas.setDimensions({ width, height });
};
