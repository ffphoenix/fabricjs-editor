import { type Transform } from "fabric";

type EventProducer = "self" | "history" | "websocket";
declare module "fabric" {
  export interface CanvasEvents {
    "sc:object:added": {
      producer: EventProducer;
      target: FabricObject | FabricObject[];
      e?: MouseEvent | TouchEvent | PointerEvent;
    };
    "sc:object:modified": {
      producer: EventProducer;
      target: FabricObject | FabricObject[];
      transform?: Transform;
      actionType?: "drag" | "scale" | "rotate" | "scaleX" | "scaleY" | "skew" | undefined;
      e?: MouseEvent | TouchEvent | PointerEvent;
    };
    "sc:object:removed": {
      producer: EventProducer;
      target: FabricObject | FabricObject[];
      e?: MouseEvent | TouchEvent | PointerEvent;
    };
  }
}
