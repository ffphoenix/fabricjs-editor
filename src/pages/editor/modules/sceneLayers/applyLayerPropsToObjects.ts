import type { Canvas } from "fabric";
import SceneStore, { type Tool } from "../../store/SceneStore";

export default (canvas: Canvas | null, tool: Tool) => {
  if (!canvas) return;
  canvas.getObjects().forEach((obj) => {
    const layerId = obj.layerUUID as string | undefined;
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
