import { type Canvas, type TPointerEventInfo } from "fabric";
import { type MutableRefObject, useEffect, useRef } from "react";
import SceneStore, { type Tool } from "../store/SceneStore";
import { autorun } from "mobx";
import * as fabric from "fabric";
import getHandHandlers from "./toolsHandlers/getHandHandlers";
import getEmptyHandlers from "./toolsHandlers/getEmptyHandlers";
import getDrawRectHandlers from "./toolsHandlers/getDrawRectHandlers";
import getDrawCircleHandlers from "./toolsHandlers/getDrawCircleHandlers";
import getDrawArrowHandlers from "./toolsHandlers/getDrawArrowHandlers";
import getDrawPencilHandlers from "./toolsHandlers/getDrawPencilHandlers";
import getTextHandlers from "./toolsHandlers/getTextHandlers";

export type MouseHandlers = {
  onMouseDown: (options: TPointerEventInfo) => void;
  onMouseUp: (options: TPointerEventInfo) => void;
  onMouseMove: (options: TPointerEventInfo) => void;
  handlerDisposer: () => void;
};

const getMouseHandlers = (
  activeTool: Tool,
  canvasRef: MutableRefObject<Canvas | null>,
  drawingState: MutableRefObject<{ origin?: fabric.Point; activeObject?: fabric.Object | null }>,
  isPanningRef: MutableRefObject<boolean>,
  arrowDrawingRef: MutableRefObject<{
    start: fabric.Point;
    line: fabric.Line;
    head: fabric.Triangle;
  } | null>,
): MouseHandlers => {
  const handlersMap = {
    hand: () => getHandHandlers(canvasRef, isPanningRef),
    select: () => getEmptyHandlers(),
    pencil: () => getDrawPencilHandlers(canvasRef),
    rect: () => getDrawRectHandlers(canvasRef, drawingState),
    circle: () => getDrawCircleHandlers(canvasRef, drawingState),
    arrow: () => getDrawArrowHandlers(canvasRef, arrowDrawingRef),
    text: () => getTextHandlers(canvasRef),
    measure: () => getEmptyHandlers(),
    moveLayer: () => getEmptyHandlers(),
  };
  return handlersMap[activeTool]() ?? getEmptyHandlers();
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

  const unsubscribeCallbackRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (!canvasRef.current) return;
    console.log("=====> useEffect useCanvasMouseEvents:");
    const autorunDispose = autorun(() => {
      unsubscribeCallbackRef.current();
      console.log("activeTool changed");

      if (canvasRef.current === null) return;
      const canvas = canvasRef.current;

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
