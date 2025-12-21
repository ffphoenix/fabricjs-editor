import { type MutableRefObject, useEffect } from "react";
import type { Canvas } from "fabric";
import undoSceneAction from "../store/actions/undoSceneAction";

const handleDeleteSelected = (canvas: Canvas) => {
  if (!canvas) return;
  const active = canvas.getActiveObjects();
  if (active.length) {
    active.forEach((o) => canvas.remove(o));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }
};

const useKeyboardHotkeys = (canvasRef: MutableRefObject<Canvas | null>) => {
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const onKeyDown = (e: KeyboardEvent) => {
      // ignore when typing in inputs/textareas or contenteditable
      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || "").toLowerCase();
      const isEditable = tag === "input" || tag === "textarea" || (target && (target as HTMLElement).isContentEditable);

      // If an IText is actively editing, do not intercept
      const activeObj = canvas?.getActiveObject() as any;
      const isFabricTextEditing = !!(activeObj && typeof activeObj.isEditing === "boolean" && activeObj.isEditing);

      if (isEditable || isFabricTextEditing) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        console.log("Delete/Backspace pressed");
        handleDeleteSelected(canvas);
        // prevent navigating back on Backspace when nothing is focused
        e.preventDefault();
        return;
      }

      // Escape: cancel measuring / arrow drawing
      if (e.key === "Escape") {
        // @TODO: refactor arrow and measuring drawing to store state
        // and remove this code
        //
        // if (canvas && measuringRef.current) {
        //   const { line, arrow, label } = measuringRef.current;
        //   canvas.remove(line);
        //   canvas.remove(arrow);
        //   canvas.remove(label);
        //   measuringRef.current = null;
        //   canvas.requestRenderAll();
        //   e.preventDefault();
        //   return;
        // }
        // if (canvas && arrowDrawingRef.current) {
        //   const { line, head } = arrowDrawingRef.current;
        //   canvas.remove(line);
        //   canvas.remove(head);
        //   arrowDrawingRef.current = null;
        //   canvas.requestRenderAll();
        //   e.preventDefault();
        //   return;
        // }
      }

      // Undo / Redo shortcuts
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (isCtrlOrMeta && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          // redo();
        } else {
          // undo();
        }
        undoSceneAction(canvasRef);
        console.log("Undo/Redo pressed");
        e.preventDefault();
        return;
      }
      if (isCtrlOrMeta && e.key.toLowerCase() === "y") {
        // redo();
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);

    return () => {};
  }, []);
};

export default useKeyboardHotkeys;
