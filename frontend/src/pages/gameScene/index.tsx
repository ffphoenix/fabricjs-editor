import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import ToolMenu from "./components/ToolMenu";
import "./style.css";

type Tool = "select" | "pen" | "rect" | "circle" | "text";

const GameScenePage: React.FC = () => {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

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
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Update tool specifics (drawing mode, selection, brush)
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // reset modes
    canvas.isDrawingMode = false;
    canvas.selection = tool === "select";
    canvas.forEachObject((obj) => obj.set({ selectable: tool === "select" }));

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
      const active = drawingState.current.activeObject;
      if (active) {
        active.set({ selectable: true, objectCaching: true });
      }
      drawingState.current.activeObject = null;
      drawingState.current.origin = undefined;
      // After finishing a shape, switch to select to allow moving it
      if (tool === "rect" || tool === "circle") {
        setTool("select");
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
          onDeleteSelected={() => {
            const canvas = fabricRef.current;
            if (!canvas) return;
            const active = canvas.getActiveObjects();
            if (active.length) {
              active.forEach((o) => canvas.remove(o));
              canvas.discardActiveObject();
              canvas.requestRenderAll();
            }
          }}
          onClear={() => {
            const canvas = fabricRef.current;
            if (!canvas) return;
            canvas.clear();
            canvas.setBackgroundColor("#f8fafc", () => canvas.requestRenderAll());
          }}
        />
      </div>

      {/* Canvas area with left padding to avoid overlap */}
      <div className="w-full border rounded bg-white overflow-hidden">
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
};

export default GameScenePage;
