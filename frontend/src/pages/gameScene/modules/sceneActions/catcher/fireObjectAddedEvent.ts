import type { ActionProducer } from "../types";
import type { Canvas, FabricObject, TPointerEvent } from "fabric";
import { checkObjectUUIDs } from "../utils/checkObjectUUIDs";

const fireObjectAddedEvent = (
  canvas: Canvas,
  producer: ActionProducer,
  object: FabricObject,
  event?: TPointerEvent,
) => {
  checkObjectUUIDs(object);
  canvas.fire("sc:object:added", { producer, target: object, e: event });
};
export default fireObjectAddedEvent;
