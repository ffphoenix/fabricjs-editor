import type { Canvas, FabricObject, TPointerEvent } from "fabric";
import type { ActionProducer } from "../types";

const fireObjectModifiedEvent = (
  canvas: Canvas,
  producer: ActionProducer,
  object: FabricObject,
  event?: TPointerEvent,
) => {
  canvas.fire("sc:object:modified", { producer, target: object, e: event });
};
export default fireObjectModifiedEvent;
