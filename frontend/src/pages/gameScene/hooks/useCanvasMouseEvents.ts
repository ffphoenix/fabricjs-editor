import { type Canvas, type TPointerEventInfo } from "fabric";
import { type MutableRefObject, useEffect, useRef } from "react";
import SceneStore, { type Tool } from "../store/SceneStore";
import { autorun } from "mobx";
import * as fabric from "fabric";
import getHandHandlers from "../core/toolsHandlers/getHandHandlers";
import getEmptyHandlers from "../core/toolsHandlers/getEmptyHandlers";
import getDrawRectHandlers from "../core/toolsHandlers/getDrawRectHandlers";
import getDrawCircleHandlers from "../core/toolsHandlers/getDrawCircleHandlers";
import getDrawArrowHandlers from "../core/toolsHandlers/getDrawArrowHandlers";
import getDrawPencilHandlers from "../core/toolsHandlers/getDrawPencilHandlers";
import getTextHandlers from "../core/toolsHandlers/getTextHandlers";
import getMeasureHandlers from "../core/toolsHandlers/getMeasureHandlers";

export type MouseHandlers = {
  onMouseDown: (options: TPointerEventInfo) => void;
  onMouseUp: (options: TPointerEventInfo) => void;
  onMouseMove: (options: TPointerEventInfo) => void;
  handlerDisposer: () => void;
};

export type ArrowDrawingRef = MutableRefObject<{
  start: fabric.Point;
  line: fabric.Line;
  head: fabric.Triangle;
} | null>;

export type MeasuringRef = MutableRefObject<{
  start: fabric.Point;
  line: fabric.Line;
  arrow: fabric.Triangle;
  label: fabric.Text;
} | null>;

const getMouseHandlers = (
  activeTool: Tool,
  canvasRef: MutableRefObject<Canvas | null>,
  drawingState: MutableRefObject<{ origin?: fabric.Point; activeObject?: fabric.Object | null }>,
  isPanningRef: MutableRefObject<boolean>,
  arrowDrawingRef: ArrowDrawingRef,
  measuringRef: MeasuringRef,
): MouseHandlers => {
  const handlersMap = {
    hand: () => getHandHandlers(canvasRef, isPanningRef),
    select: () => getEmptyHandlers(),
    pencil: () => getDrawPencilHandlers(canvasRef),
    rect: () => getDrawRectHandlers(canvasRef, drawingState),
    circle: () => getDrawCircleHandlers(canvasRef, drawingState),
    arrow: () => getDrawArrowHandlers(canvasRef, arrowDrawingRef),
    text: () => getTextHandlers(canvasRef),
    measure: () => getMeasureHandlers(canvasRef, measuringRef),
    moveLayer: () => getEmptyHandlers(),
  };
  return handlersMap[activeTool]() ?? getEmptyHandlers();
};

const cleanToolsAfterChange = (canvas: Canvas, arrowDrawingRef: ArrowDrawingRef, measuringRef: MeasuringRef) => {
  if (SceneStore.activeTool !== "measure" && measuringRef.current) {
    const { line, arrow, label } = measuringRef.current;
    canvas.remove(line);
    canvas.remove(arrow);
    canvas.remove(label);
    measuringRef.current = null;
    canvas.requestRenderAll();
  }
  if (SceneStore.activeTool !== "arrow" && arrowDrawingRef.current) {
    const { line, head } = arrowDrawingRef.current;
    canvas.remove(line);
    canvas.remove(head);
    arrowDrawingRef.current = null;
    canvas.requestRenderAll();
  }
};

const useCanvasMouseEvents = (canvasRef: MutableRefObject<Canvas | null>) => {
  const drawingState = useRef<{
    origin?: fabric.Point;
    activeObject?: fabric.Object | null;
  }>({});
  const isPanningRef = useRef<boolean>(false);
  const arrowDrawingRef = useRef<{
    start: fabric.Point;
    line: fabric.Line;
    head: fabric.Triangle;
  } | null>(null);

  const measuringRef = useRef<{
    start: fabric.Point;
    line: fabric.Line;
    arrow: fabric.Triangle;
    label: fabric.Text;
  } | null>(null);

  const unsubscribeCallbackRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (!canvasRef.current) return;
    console.log("=====> useEffect useCanvasMouseEvents:");
    const autorunDispose = autorun(() => {
      unsubscribeCallbackRef.current();
      console.log("activeTool changed");

      if (canvasRef.current === null) return;
      const canvas = canvasRef.current;

      cleanToolsAfterChange(canvas, arrowDrawingRef, measuringRef);
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
      canvas.selection = SceneStore.activeTool === "select";
      canvas.isDrawingMode = false;

      const { onMouseDown, onMouseUp, onMouseMove, handlerDisposer } = getMouseHandlers(
        SceneStore.activeTool,
        canvasRef,
        drawingState,
        isPanningRef,
        arrowDrawingRef,
        measuringRef,
      );
      const mouseEventsDisposer = canvas.on({
        "mouse:down": onMouseDown,
        "mouse:move": onMouseMove,
        "mouse:up": onMouseUp,
      });
      canvas.renderAll();
      unsubscribeCallbackRef.current = () => {
        mouseEventsDisposer();
        handlerDisposer();
      };
    });
    return () => {
      autorunDispose();
      unsubscribeCallbackRef.current();
    };
  });
};

export default useCanvasMouseEvents;
