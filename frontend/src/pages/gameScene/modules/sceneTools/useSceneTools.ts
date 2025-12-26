import { type Canvas, type TPointerEventInfo } from "fabric";
import { type MutableRefObject, useEffect, useRef } from "react";
import SceneStore, { type Tool } from "../../store/SceneStore";
import { autorun } from "mobx";
import * as fabric from "fabric";
import getHandHandlers from "./handlers/getHandHandlers";
import getEmptyHandlers from "./handlers/getEmptyHandlers";
import getDrawRectHandlers from "./handlers/getDrawRectHandlers";
import getDrawCircleHandlers from "./handlers/getDrawCircleHandlers";
import getDrawArrowHandlers from "./handlers/getDrawArrowHandlers";
import getDrawPencilHandlers from "./handlers/getDrawPencilHandlers";
import getTextHandlers from "./handlers/getTextHandlers";
import getMeasureHandlers from "./handlers/getMeasureHandlers";
import setRightClickHandler from "./setRightClickHandler";

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

export type DrawingRef = MutableRefObject<{ origin?: fabric.Point; activeObject?: fabric.Object | null }>;

const getMouseHandlers = (
  activeTool: Tool,
  canvasRef: MutableRefObject<Canvas | null>,
  drawingRef: DrawingRef,
  isPanningRef: MutableRefObject<boolean>,
  arrowDrawingRef: ArrowDrawingRef,
  measuringRef: MeasuringRef,
): MouseHandlers => {
  const handlersMap = {
    hand: () => getHandHandlers(canvasRef, isPanningRef),
    select: () => getEmptyHandlers(),
    pencil: () => getDrawPencilHandlers(canvasRef),
    rect: () => getDrawRectHandlers(canvasRef, drawingRef),
    circle: () => getDrawCircleHandlers(canvasRef, drawingRef),
    arrow: () => getDrawArrowHandlers(canvasRef, arrowDrawingRef),
    text: () => getTextHandlers(canvasRef),
    measure: () => getMeasureHandlers(canvasRef, measuringRef),
    moveLayer: () => getEmptyHandlers(),
  };
  return handlersMap[activeTool]() ?? getEmptyHandlers();
};

const useSceneTools = (canvasRef: MutableRefObject<Canvas | null>) => {
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
    const autorunDispose = autorun(() => {
      unsubscribeCallbackRef.current();
      console.log("activeTool changed", SceneStore.activeTool);

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

    const rightClickEventDisposer = setRightClickHandler(canvasRef);
    return () => {
      rightClickEventDisposer();
      autorunDispose();
      unsubscribeCallbackRef.current();
    };
  });
};

export default useSceneTools;
