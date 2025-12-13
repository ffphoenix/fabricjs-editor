import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import ToolMenu from "./components/ToolMenu";
import "./style.css";

type Tool = "select" | "pen" | "rect" | "circle" | "text" | "measure" | "hand";

const GameScenePage: React.FC = () => {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const wheelHandlerRef = useRef<((e: fabric.IEvent<WheelEvent>) => void) | null>(null);
  const isPanningRef = useRef<boolean>(false);
  const measuringRef = useRef<{
    start: fabric.Point;
    line: fabric.Line;
    arrow: fabric.Triangle;
    label: fabric.Text;
  } | null>(null);

  const [tool, setTool] = useState<Tool>("select");
  const [strokeColor, setStrokeColor] = useState<string>("#222222");
  const [fillColor, setFillColor] = useState<string>("rgba(0,0,0,0)");
  const [strokeWidth, setStrokeWidth] = useState<number>(3);

  // Temp drawing state
  const drawingState = useRef<{
    origin?: fabric.Point;
    activeObject?: fabric.Object | null;
  }>({});

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasElRef.current) return;
    const canvas = new fabric.Canvas(canvasElRef.current, {
      backgroundColor: "#f8fafc", // slate-50
      selection: true,
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    const resize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      // Provide a reasonable min height
      const height = Math.max(clientHeight || 600, 500);
      // Account for left menu padding (pl-52 ~ 208px)
      const effectiveWidth = Math.max(clientWidth || 800, 300);
      canvas.setWidth(effectiveWidth);
      canvas.setHeight(height);
      canvas.renderAll();
    };
    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      // detach wheel handler if attached
      if (wheelHandlerRef.current) {
        // @ts-expect-error fabric event typing
        canvas.off("mouse:wheel", wheelHandlerRef.current);
      }
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Zoom handlers (mouse wheel and programmatic)
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const MIN_ZOOM = 0.2;
    const MAX_ZOOM = 5;

    const onWheel = (opt: any) => {
      const evt: WheelEvent = opt.e as WheelEvent;
      let zoom = canvas.getZoom();
      const delta = evt.deltaY;
      const factor = 0.999 ** delta; // smooth zoom
      zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor));
      const point = new fabric.Point(evt.offsetX, evt.offsetY);
      canvas.zoomToPoint(point, zoom);
      evt.preventDefault();
      evt.stopPropagation();
    };

    wheelHandlerRef.current = onWheel;
    canvas.on("mouse:wheel", onWheel as unknown as fabric.IEventHandler<WheelEvent>);

    return () => {
      if (wheelHandlerRef.current) {
        // @ts-expect-error fabric event typing
        canvas.off("mouse:wheel", wheelHandlerRef.current);
      }
    };
  }, []);

  const zoomByFactor = (factor: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const MIN_ZOOM = 0.2;
    const MAX_ZOOM = 5;
    const current = canvas.getZoom();
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current * factor));
    const center = canvas.getCenter();
    const point = new fabric.Point(center.left, center.top);
    canvas.zoomToPoint(point, next);
  };

  const handleZoomIn = () => zoomByFactor(1.2);
  const handleZoomOut = () => zoomByFactor(1 / 1.2);

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

      // Escape: cancel measuring
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

    // reset modes
    canvas.isDrawingMode = false;
    const selectionEnabled = tool === "select";
    canvas.selection = selectionEnabled;
    canvas.forEachObject((obj) => obj.set({ selectable: selectionEnabled }));

    // cursors for hand tool
    if (tool === "hand") {
      canvas.defaultCursor = "grab";
      canvas.hoverCursor = "grab";
    } else if (tool === "measure") {
      canvas.defaultCursor = "crosshair";
      canvas.hoverCursor = "crosshair";
    } else {
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move"; // fabric default-ish for objects
    }

    if (tool === "pen") {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.isDrawingMode = true;
      const brush = canvas.freeDrawingBrush;
      brush.color = strokeColor;
      brush.width = strokeWidth;
    }

    canvas.renderAll();
  }, [tool, strokeColor, strokeWidth]);

  // Pointer handlers for shapes and text
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const onMouseDown = (opt: fabric.TPointerEventInfo<MouseEvent>) => {
      if (!canvas) return;
      // Hand tool: start panning
      if (tool === "hand") {
        isPanningRef.current = true;
        canvas.setCursor("grabbing");
        canvas.requestRenderAll();
        return;
      }
      // Measure tool: start or finish measuring
      if (tool === "measure") {
        const pointer = canvas.getPointer(opt.e);
        if (!measuringRef.current) {
          // start
          const startPt = new fabric.Point(pointer.x, pointer.y);
          const red = "#ef4444"; // tailwind red-500
          const line = new fabric.Line([startPt.x, startPt.y, startPt.x, startPt.y], {
            stroke: red,
            strokeWidth: 2,
            selectable: false,
            evented: false,
            excludeFromExport: true as any,
          });
          const arrow = new fabric.Triangle({
            left: startPt.x,
            top: startPt.y,
            width: 10,
            height: 12,
            fill: red,
            originX: "center",
            originY: "center",
            selectable: false,
            evented: false,
            excludeFromExport: true as any,
          });
          const label = new fabric.Text("0 px", {
            left: startPt.x,
            top: startPt.y,
            fontSize: 14,
            fill: red,
            backgroundColor: "rgba(255,255,255,0.6)",
            selectable: false,
            evented: false,
            excludeFromExport: true as any,
          });
          canvas.add(line);
          canvas.add(arrow);
          canvas.add(label);
          measuringRef.current = { start: startPt, line, arrow, label };
          canvas.requestRenderAll();
        } else {
          // finish and clear temp objects
          const { line, arrow, label } = measuringRef.current;
          canvas.remove(line);
          canvas.remove(arrow);
          canvas.remove(label);
          measuringRef.current = null;
          canvas.requestRenderAll();
        }
        return;
      }
      const pointer = canvas.getPointer(opt.e);
      drawingState.current.origin = new fabric.Point(pointer.x, pointer.y);

      if (tool === "rect") {
        const rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 1,
          height: 1,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          selectable: false,
          objectCaching: false,
        });
        drawingState.current.activeObject = rect;
        canvas.add(rect);
      } else if (tool === "circle") {
        const circle = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 1,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          originX: "center",
          originY: "center",
          selectable: false,
          objectCaching: false,
        });
        drawingState.current.activeObject = circle;
        canvas.add(circle);
      } else if (tool === "text") {
        const text = new fabric.IText("Text", {
          left: pointer.x,
          top: pointer.y,
          fill: strokeColor,
          fontSize: 24,
          editable: true,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        // Immediately enter editing mode
        // @ts-expect-error type guard for IText
        if (typeof (text as any).enterEditing === "function") {
          (text as any).enterEditing();
          (text as any).selectAll();
        }
        // switch back to select after placing text
        setTool("select");
      }
    };

    const onMouseMove = (opt: fabric.TPointerEventInfo<MouseEvent>) => {
      if (!canvas) return;
      // Hand tool panning behavior
      if (tool === "hand" && isPanningRef.current) {
        const evt = opt.e as unknown as MouseEvent;
        const vpt = canvas.viewportTransform || fabric.iMatrix.concat();
        // movementX/Y are in CSS pixels relative to the element
        vpt[4] += evt.movementX;
        vpt[5] += evt.movementY;
        canvas.setViewportTransform(vpt);
        canvas.requestRenderAll();
        return;
      }
      // Measure tool live update
      if (tool === "measure" && measuringRef.current) {
        const pointer = canvas.getPointer(opt.e);
        const { start, line, arrow, label } = measuringRef.current;
        // update line end
        line.set({ x2: pointer.x, y2: pointer.y });
        // compute distance
        const dx = pointer.x - start.x;
        const dy = pointer.y - start.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        label.set({ text: `${Math.round(dist)} px` });
        // position label at midpoint with slight offset perpendicular to line
        const midX = (start.x + pointer.x) / 2;
        const midY = (start.y + pointer.y) / 2;
        const angle = Math.atan2(dy, dx);
        const offset = 10;
        const offX = -Math.sin(angle) * offset;
        const offY = Math.cos(angle) * offset;
        label.set({ left: midX + offX, top: midY + offY });
        // position and rotate arrow at end, pointing along the line
        arrow.set({ left: pointer.x, top: pointer.y, angle: (angle * 180) / Math.PI + 90 });
        canvas.requestRenderAll();
        return;
      }
      const active = drawingState.current.activeObject;
      const origin = drawingState.current.origin;
      if (!active || !origin) return;
      const pointer = canvas.getPointer(opt.e);

      if (active instanceof fabric.Rect) {
        const left = Math.min(pointer.x, origin.x);
        const top = Math.min(pointer.y, origin.y);
        const width = Math.abs(pointer.x - origin.x);
        const height = Math.abs(pointer.y - origin.y);
        active.set({ left, top, width, height });
      } else if (active instanceof fabric.Circle) {
        const dx = pointer.x - origin.x;
        const dy = pointer.y - origin.y;
        const r = Math.sqrt(dx * dx + dy * dy);
        active.set({ left: origin.x, top: origin.y, radius: r });
      }

      canvas.requestRenderAll();
    };

    const onMouseUp = () => {
      if (tool === "hand") {
        isPanningRef.current = false;
        canvas.setCursor("grab");
        canvas.requestRenderAll();
        // capture pan change (exclude zoom)
        captureState();
        return;
      }
      if (tool === "measure") {
        // nothing on mouse up; finishing is on second click in onMouseDown
        return;
      }
      const active = drawingState.current.activeObject;
      if (active) {
        active.set({ selectable: true, objectCaching: true });
      }
      drawingState.current.activeObject = null;
      drawingState.current.origin = undefined;
      // After finishing a shape, switch to select to allow moving it
      if (tool === "rect" || tool === "circle") {
        setTool("select");
        // capture newly created shape
        captureState();
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
      <div className="absolute left-0 top-0 h-full w-48 p-3 border-r bg-white/90 backdrop-blur-sm z-9999">
        <ToolMenu
          tool={tool}
          setTool={setTool}
          strokeColor={strokeColor}
          setStrokeColor={setStrokeColor}
          fillColor={fillColor}
          setFillColor={setFillColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          onNoFill={() => setFillColor("rgba(0,0,0,0)")}
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
        {/* Zoom controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 z-50">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-md border bg-white/90 hover:bg-white text-gray-800 shadow"
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-md border bg-white/90 hover:bg-white text-gray-800 shadow"
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameScenePage;
