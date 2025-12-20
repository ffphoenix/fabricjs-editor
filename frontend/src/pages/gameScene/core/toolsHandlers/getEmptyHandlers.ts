import type { MouseHandlers } from "../../hooks/useCanvasMouseEvents";

const getEmptyHandlers = (): MouseHandlers => {
  return {
    onMouseDown: () => {},
    onMouseUp: () => {},
    onMouseMove: () => {},
    handlerDisposer: () => {},
  };
};
export default getEmptyHandlers;
