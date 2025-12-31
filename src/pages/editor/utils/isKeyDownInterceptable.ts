import type { Canvas } from "fabric";

export default (e: KeyboardEvent, canvas: Canvas) => {
  const target = e.target as HTMLElement | null;
  const tag = (target?.tagName || "").toLowerCase();
  const isEditable = tag === "input" || tag === "textarea" || (target && (target as HTMLElement).isContentEditable);

  // If an IText is actively editing, do not intercept
  const activeObj = canvas?.getActiveObject();
  const isFabricTextEditing = !!(activeObj && typeof activeObj.isEditing === "boolean" && activeObj.isEditing);

  return !isEditable && !isFabricTextEditing;
};
