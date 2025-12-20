import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import ToolMenu from "./components/ToolMenu";
import "./style.css";
import useCanvas from "./hooks/useCanvas";
import ZoomControls from "./components/ZoomControls";
import useWheelZoomHandler from "./hooks/useWheelZoomHandler";
import SceneStore from "./store/SceneStore";
import applyLayerPropsToObjects from "./core/applyLayerPropsToObjects";
import useCanvasMouseEvents from "./hooks/useCanvasMouseEvents";

export type Tool = "select" | "pen" | "rect" | "circle" | "arrow" | "text" | "measure" | "hand" | "moveLayer";

const GameScenePage: React.FC = () => {
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const measuringRef = useRef<{
    start: fabric.Point;
    line: fabric.Line;
    arrow: fabric.Triangle;
    label: fabric.Text;
  } | null>(null);
  const arrowDrawingRef = useRef<{
    start: fabric.Point;
    line: fabric.Line;
    head: fabric.Triangle;
  } | null>(null);

  const { canvas, canvasRef, canvasElRef, containerRef } = useCanvas({
    backgroundColor: "#f8fafc",
    selection: true,
    preserveObjectStacking: true,
  });
  fabricRef.current = canvas;
  useWheelZoomHandler(canvasRef);
  useCanvasMouseEvents(canvasRef);
  console.log("GameScenePage rendered");

  const [tool, setTool] = useState<Tool>("select");
  const [strokeColor, setStrokeColor] = useState<string>("#222222");
  const [fillColor, setFillColor] = useState<string>("rgba(0,0,0,0)");
  const [strokeWidth, setStrokeWidth] = useState<number>(3);

  // Helper: delete selected objects
  const handleDeleteSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length) {
      active.forEach((o) => canvas.remove(o));
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      captureState();
    }
  };

  // Keyboard: Delete/Backspace to remove selected objects
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // ignore when typing in inputs/textareas or contenteditable
      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || "").toLowerCase();
      const isEditable = tag === "input" || tag === "textarea" || (target && (target as HTMLElement).isContentEditable);

      // If an IText is actively editing, do not intercept
      const activeObj = fabricRef.current?.getActiveObject() as any;
      const isFabricTextEditing = !!(activeObj && typeof activeObj.isEditing === "boolean" && activeObj.isEditing);

      if (isEditable || isFabricTextEditing) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteSelected();
        // prevent navigating back on Backspace when nothing is focused
        e.preventDefault();
        return;
      }

      // Escape: cancel measuring / arrow drawing
      if (e.key === "Escape") {
        const canvas = fabricRef.current;
        if (canvas && measuringRef.current) {
          const { line, arrow, label } = measuringRef.current;
          canvas.remove(line);
          canvas.remove(arrow);
          canvas.remove(label);
          measuringRef.current = null;
          canvas.requestRenderAll();
          e.preventDefault();
          return;
        }
        if (canvas && arrowDrawingRef.current) {
          const { line, head } = arrowDrawingRef.current;
          canvas.remove(line);
          canvas.remove(head);
          arrowDrawingRef.current = null;
          canvas.requestRenderAll();
          e.preventDefault();
          return;
        }
      }

      // Undo / Redo shortcuts
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (isCtrlOrMeta && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
        return;
      }
      if (isCtrlOrMeta && e.key.toLowerCase() === "y") {
        redo();
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ---- Undo/Redo History ----
  type HistoryEntry = { json: string; panX: number; panY: number };
  const undoStackRef = useRef<HistoryEntry[]>([]);
  const redoStackRef = useRef<HistoryEntry[]>([]);
  const isRestoringRef = useRef<boolean>(false);
  const MAX_HISTORY = 50;

  const getPan = () => {
    const canvas = fabricRef.current;
    if (!canvas) return { panX: 0, panY: 0 };
    const vpt = canvas.viewportTransform || fabric.iMatrix.concat();
    return { panX: vpt[4] || 0, panY: vpt[5] || 0 };
  };

  const setPanKeepingZoom = (panX: number, panY: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const vpt = (canvas.viewportTransform || fabric.iMatrix.concat()).slice() as number[];
    const zoom = canvas.getZoom();
    vpt[0] = zoom; // scaleX
    vpt[3] = zoom; // scaleY
    vpt[4] = panX; // translateX
    vpt[5] = panY; // translateY
    canvas.setViewportTransform(vpt as any);
  };

  const makeSnapshot = (): HistoryEntry | null => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    const json = JSON.stringify(canvas.toJSON());
    const { panX, panY } = getPan();
    return { json, panX, panY };
  };

  const captureState = () => {
    if (isRestoringRef.current) return; // avoid capturing while restoring
    const snap = makeSnapshot();
    if (!snap) return;
    undoStackRef.current.push(snap);
    if (undoStackRef.current.length > MAX_HISTORY) undoStackRef.current.shift();
    // new action invalidates redo stack
    redoStackRef.current = [];
  };

  const applyState = (entry: HistoryEntry | undefined, onDone?: () => void) => {
    const canvas = fabricRef.current;
    if (!canvas || !entry) return;
    isRestoringRef.current = true;
    canvas.loadFromJSON(entry.json, () => {
      // keep current zoom, restore pan
      setPanKeepingZoom(entry.panX, entry.panY);
      canvas.renderAll();
      isRestoringRef.current = false;
      if (onDone) onDone();
    });
  };

  const undo = () => {
    // Need at least one prior state to go back to
    if (undoStackRef.current.length < 2) return;
    const current = undoStackRef.current.pop(); // current state
    const prev = undoStackRef.current[undoStackRef.current.length - 1]; // previous remains on stack
    if (!current || !prev) return;
    // push current to redo
    redoStackRef.current.push(current);
    applyState(prev);
  };

  const redo = () => {
    const next = redoStackRef.current.pop();
    if (!next) return;
    // push current to undo
    const current = makeSnapshot();
    if (current) undoStackRef.current.push(current);
    applyState(next);
  };

  // Capture initial state once canvas is ready
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    // small timeout to ensure initial sizing applied
    setTimeout(() => {
      undoStackRef.current = [];
      redoStackRef.current = [];
      captureState();
    }, 0);
  }, []);

  // Update tool specifics (drawing mode, selection, brush)
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // // reset modes !!layers logic
    // canvas.forEachObject((obj) => {
    //   const layer = SceneStore.getLayerById((obj as any).layerId as string);
    //   const selectable = selectionEnabled && !layer?.locked;
    //   obj.set({ selectable });
    // });

    // cursors for hand tool
    if (tool === "moveLayer") {
      canvas.defaultCursor = "move";
      canvas.hoverCursor = "move";
    }
    applyLayerPropsToObjects(canvas, tool);
    canvas.renderAll();
  }, [tool, strokeColor, strokeWidth]);

  // Pointer handlers for shapes and text
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const onMouseDown = (opt: fabric.TPointerEventInfo<MouseEvent>) => {
      if (!canvas) return;
      // Hand tool: start panning
      // MoveLayer tool: start tracking
      // if (tool === "moveLayer") {
      //   const evt = opt.e as unknown as MouseEvent;
      //   layerMoveRef.current = { lastX: evt.clientX, lastY: evt.clientY };
      //   canvas.setCursor("grabbing");
      //   return;
      // }
      // Measure tool: start or finish measuring
      // Arrow tool: start drawing
    };

    const onMouseMove = (opt: fabric.TPointerEventInfo<MouseEvent>) => {
      if (!canvas) return;
      // Hand tool panning behavior

      // MoveLayer live behavior
      // if (tool === "moveLayer" && layerMoveRef.current) {
      //   const evt = opt.e as unknown as MouseEvent;
      //   const zoom = canvas.getZoom() || 1;
      //   const dx = (evt.clientX - layerMoveRef.current.lastX) / zoom;
      //   const dy = (evt.clientY - layerMoveRef.current.lastY) / zoom;
      //   layerMoveRef.current.lastX = evt.clientX;
      //   layerMoveRef.current.lastY = evt.clientY;
      //   // move all objects of active layer
      //   canvas.getObjects().forEach((o) => {
      //     if ((o as any).layerId === SceneStore.activeLayerId) {
      //       o.set({ left: (o.left || 0) + dx, top: (o.top || 0) + dy });
      //       o.setCoords();
      //     }
      //   });
      //   canvas.requestRenderAll();
      //   return;
      // }
      // Measure tool live update
      // Arrow live update

      canvas.requestRenderAll();
    };

    const onMouseUp = () => {
      // if (tool === "moveLayer") {
      //   layerMoveRef.current = null;
      //   canvas.setCursor("move");
      //   captureState();
      //   return;
      // }
      if (tool === "measure") {
        // nothing on mouse up; finishing is on second click in onMouseDown
        return;
      }
    };

    // Bind handlers only when not in pen or select mode for drawing shapes, but we can keep them active safely
    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);

    return () => {
      canvas.off("mouse:down", onMouseDown);
      canvas.off("mouse:move", onMouseMove);
      canvas.off("mouse:up", onMouseUp);
    };
  }, [tool, strokeColor, strokeWidth, fillColor]);

  // If leaving measure tool while measuring, cancel and clean up
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    return () => {
      // noop on unmount handled elsewhere
    };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (tool !== "measure" && measuringRef.current) {
      const { line, arrow, label } = measuringRef.current;
      canvas.remove(line);
      canvas.remove(arrow);
      canvas.remove(label);
      measuringRef.current = null;
      canvas.requestRenderAll();
    }
    if (tool !== "arrow" && arrowDrawingRef.current) {
      const { line, head } = arrowDrawingRef.current;
      canvas.remove(line);
      canvas.remove(head);
      arrowDrawingRef.current = null;
      canvas.requestRenderAll();
    }
  }, [tool]);

  // Capture changes for various canvas events
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const onObjectModified = () => captureState();
    const onPathCreated = () => captureState();
    const onEditingExited = () => captureState();

    canvas.on("object:modified", onObjectModified);
    // free drawing path created
    canvas.on("path:created", onPathCreated as any);
    // text editing finished
    canvas.on("editing:exited", onEditingExited as any);

    return () => {
      canvas.off("object:modified", onObjectModified);
      canvas.off("path:created", onPathCreated as any);
      canvas.off("editing:exited", onEditingExited as any);
    };
  }, []);

  const handleAddImage = (file: File) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // use fabric.Image.fromURL to create image
      fabric.Image.fromURL(
        dataUrl,
        (img) => {
          const cw = canvas.getWidth() || 800;
          const ch = canvas.getHeight() || 600;
          const padding = 20;
          const maxW = Math.max(10, cw - padding * 2);
          const maxH = Math.max(10, ch - padding * 2);

          const iw = img.width ?? 0;
          const ih = img.height ?? 0;
          if (iw > 0 && ih > 0) {
            const scale = Math.min(maxW / iw, maxH / ih, 1);
            img.set({ scaleX: scale, scaleY: scale });
          }

          img.set({ selectable: true, objectCaching: true });
          (img as any).layerId = SceneStore.activeLayerId;
          canvas.add(img);
          canvas.centerObject(img);
          canvas.setActiveObject(img);
          canvas.requestRenderAll();
          setTool("select");
          captureState();
        },
        { crossOrigin: "anonymous" },
      );
    };
    reader.onerror = () => {
      console.warn("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-full min-h-screen" ref={containerRef}>
      {/* Absolute vertical menu on the left */}
      <div className="absolute left-0 top-0 h-full p-3 border-r bg-white/90 backdrop-blur-sm z-1000">
        <ToolMenu
          onAddImage={handleAddImage}
          onDeleteSelected={handleDeleteSelected}
          onClear={() => {
            const canvas = fabricRef.current;
            if (!canvas) return;
            canvas.clear();
            canvas.setBackgroundColor("#f8fafc", () => canvas.requestRenderAll());
            captureState();
          }}
        />
      </div>

      {/* Canvas area with left padding to avoid overlap */}
      <div className="w-full border rounded bg-white overflow-hidden relative">
        <canvas ref={canvasElRef} />
        <ZoomControls canvasRef={canvasRef} />
      </div>
    </div>
  );
};

export default GameScenePage;
