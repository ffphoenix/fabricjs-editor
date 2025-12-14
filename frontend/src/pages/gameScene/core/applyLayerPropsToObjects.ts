import type { Canvas } from "fabric";
import type { Tool } from "../index";
import SceneStore from "../store/SceneStore";

export default (canvas: Canvas | null, tool: Tool) => {
  if (!canvas) return;
  canvas.getObjects().forEach((obj) => {
    const layerId = (obj as any).layerId as string | undefined;
    const layer = layerId ? SceneStore.getLayerById(layerId) : undefined;
    if (!layer) return;
    obj.set({
      visible: layer.visible,
      selectable: !layer.locked && tool === "select",
      evented: !layer.locked,
    });
  });
  canvas.requestRenderAll();
};
