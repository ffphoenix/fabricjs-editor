import { ActiveSelection, type Canvas, type FabricObject, type ModifiedEvent } from "fabric";
import { checkObjectUUIDs } from "../utils/checkObjectUUIDs";
import type { ModifyActionType } from "../types";

const fireObjectModifiedEvent = (canvas: Canvas, event: ModifiedEvent) => {
  const { target, transform } = event;
  const producer = target.get("changeMadeBy") ?? "self";
  if (producer !== "self") return;

  if (target.get("type") === "i-text" && !transform) return;

  if (target.isChangedByHistory) {
    target.set({ isChangedByHistory: false });
    return;
  }
  if (!transform) throw new Error("Object must have transform:" + JSON.stringify(event));
  let object: FabricObject | FabricObject[];
  if (target instanceof ActiveSelection) {
    object = target.getObjects();
  } else {
    object = target;
  }
  checkObjectUUIDs(object);
  const actionType = (
    ["drag", "scale", "rotate", "scaleX", "scaleY", "skew"].includes(event.action ?? "") ? event.action : undefined
  ) as ModifyActionType;
  canvas.fire("sc:object:modified", { producer, target: object, actionType, transform });
};
export default fireObjectModifiedEvent;
