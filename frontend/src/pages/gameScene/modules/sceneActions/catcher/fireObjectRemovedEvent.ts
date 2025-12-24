import type { Canvas, FabricObject, TPointerEvent } from "fabric";
import type { ActionProducer } from "../types";

const fireObjectRemovedEvent = (
  canvas: Canvas,
  producer: ActionProducer,
  object: FabricObject | FabricObject[],
  event?: TPointerEvent,
) => {
  canvas.fire("sc:object:removed", { producer, target: object, e: event });
};
export default fireObjectRemovedEvent;
