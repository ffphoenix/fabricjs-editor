import { type MutableRefObject, useEffect } from "react";
import type { Canvas } from "fabric";
import isKeyDownInterceptable from "../utils/isKeyDownInterceptable";
import fireObjectRemovedEvent from "../modules/sceneActions/catcher/fireObjectRemovedEvent";

const handleDeleteSelected = (canvas: Canvas) => {
  if (!canvas) return;
  const active = canvas.getActiveObjects();
  if (active.length) {
    active.forEach((o) => canvas.remove(o));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    fireObjectRemovedEvent(canvas, "self", active);
  }
};

const useKeyboardHotkeys = (canvasRef: MutableRefObject<Canvas | null>) => {
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isKeyDownInterceptable(e, canvas)) return;
      if (e.code === "Delete" || e.code === "Backslash") {
        console.log("Delete/Backspace pressed");
        handleDeleteSelected(canvas);

        // prevent navigating back on Backspace when nothing is focused
        e.preventDefault();
        return;
      }

      // Escape: cancel measuring / arrow drawing
      if (e.code === "Escape") {
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
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
};

export default useKeyboardHotkeys;
