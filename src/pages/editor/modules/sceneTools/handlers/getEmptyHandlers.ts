import type { MouseHandlers } from "../useSceneTools";

const getEmptyHandlers = (): MouseHandlers => {
  return {
    onMouseDown: () => {},
    onMouseUp: () => {},
    onMouseMove: () => {},
    handlerDisposer: () => {},
  };
};
export default getEmptyHandlers;
