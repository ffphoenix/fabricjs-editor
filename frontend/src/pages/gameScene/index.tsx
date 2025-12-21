import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";
import ToolMenu from "./components/ToolMenu";
import "./style.css";
import useCanvas from "./hooks/useCanvas";
import ZoomControls from "./components/ZoomControls";
import useWheelZoomHandler from "./hooks/useWheelZoomHandler";
import SceneStore from "./store/SceneStore";
import applyLayerPropsToObjects from "./core/applyLayerPropsToObjects";
import useCanvasMouseEvents from "./hooks/useCanvasMouseEvents";
import useKeyboardHotkeys from "./hooks/useKeyboardHotkeys";
import { generateUUID } from "./utils/uuid";
import "./declarations/FabricObject";
import SceneHistoryStore from "./store/SceneHistoryStore";

const GameScenePage: React.FC = () => {
  const { canvasRef, canvasElRef, containerRef } = useCanvas({
    backgroundColor: "#f8fafc",
    selection: true,
    preserveObjectStacking: true,
  });
  useWheelZoomHandler(canvasRef);
  useCanvasMouseEvents(canvasRef);
  useKeyboardHotkeys(canvasRef);
  console.log("GameScenePage rendered");

  // ---- Undo/Redo History ----
  type HistoryEntry = { json: string; panX: number; panY: number };
  const undoStackRef = useRef<HistoryEntry[]>([]);
  const redoStackRef = useRef<HistoryEntry[]>([]);
  const isRestoringRef = useRef<boolean>(false);
  const MAX_HISTORY = 50;

  const getPan = () => {
    const canvas = canvasRef.current;
    if (!canvas) return { panX: 0, panY: 0 };
    const vpt = canvas.viewportTransform || fabric.iMatrix.concat();
    return { panX: vpt[4] || 0, panY: vpt[5] || 0 };
  };

  const setPanKeepingZoom = (panX: number, panY: number) => {
    const canvas = canvasRef.current;
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
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const json = JSON.stringify(canvas.toJSON());
    console.log("snapshot", canvas.toJSON());
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
    const canvas = canvasRef.current;
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
    const canvas = canvasRef.current;
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    // // reset modes !!layers logic
    // canvas.forEachObject((obj) => {
    //   const layer = SceneStore.getLayerById((obj as any).layerId as string);
    //   const selectable = selectionEnabled && !layer?.locked;
    //   obj.set({ selectable });
    // });

    // cursors for hand tool
    // if (tool === "moveLayer") {
    //   canvas.defaultCursor = "move";
    //   canvas.hoverCursor = "move";
    // }
    // applyLayerPropsToObjects(canvas, tool);
    canvas.renderAll();
  });

  // Pointer handlers for shapes and text
  useEffect(() => {
    const canvas = canvasRef.current;
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
    };

    const onMouseUp = () => {
      // if (tool === "moveLayer") {
      //   layerMoveRef.current = null;
      //   canvas.setCursor("move");
      //   captureState();
      //   return;
      // }
    };
  });

  // Capture changes for various canvas events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onObjectModified = (e) => {
      captureState();
      const obj = e.target;
      const transform = e.transform;
      SceneHistoryStore.addUndoHistoryItem("modify", obj.UUID, transform.original);
      console.log("object modified", transform);
    };
    const onPathCreated = () => {
      console.log("path created");
      captureState();
    };
    const onEditingExited = () => captureState();

    canvas.on("object:modified", onObjectModified);
    // free drawing path created
    canvas.on("path:created", onPathCreated as any);
    // text editing finished
    canvas.on("editing:exited", onEditingExited as any);
    canvas.on("object:added", (e) => {
      captureState();

      const obj = e.target;
      obj.UUID = generateUUID();
      obj.layerUUID = SceneStore.activeLayerId;
      SceneHistoryStore.addUndoHistoryItem("add", obj.UUID, obj.toJSON());
      console.log("object added", obj.toJSON());
    });
    canvas.on("object:removed", (e) => {
      const obj = e.target;
      SceneHistoryStore.addUndoHistoryItem("remove", obj.UUID, obj.toJSON());
      console.log("object added", obj.toJSON());
    });

    return () => {
      canvas.off("object:modified", onObjectModified);
      canvas.off("path:created", onPathCreated as any);
      canvas.off("editing:exited", onEditingExited as any);
    };
  }, []);

  const handleAddImage = (file: File) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // use fabric.Image.fromURL to create image
      fabric.Image.fromURL(
        dataUrl,
        (img) => {
          console.log("Image loaded:", img);
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
          // setTool("select");
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
          onClear={() => {
            const canvas = canvasRef.current;
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
