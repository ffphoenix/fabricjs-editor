import type { ActionProducer } from "../types";
import type { Canvas, FabricObject, TPointerEvent } from "fabric";

const fireObjectAddedEvent = (
  canvas: Canvas,
  producer: ActionProducer,
  object: FabricObject,
  event?: TPointerEvent,
) => {
  canvas.fire("sc:object:added", { producer, target: object, e: event });
};
export default fireObjectAddedEvent;
