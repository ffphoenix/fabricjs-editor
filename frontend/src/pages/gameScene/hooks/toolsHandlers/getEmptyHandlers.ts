import type { MouseHandlers } from "../useCanvasMouseEvents";

const getEmptyHandlers = (): MouseHandlers => {
  return {
    onMouseDown: () => {},
    onMouseUp: () => {},
    onMouseMove: () => {},
    handlerDisposer: () => {},
  };
};
export default getEmptyHandlers;
