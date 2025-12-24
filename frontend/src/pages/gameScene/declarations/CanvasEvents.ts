import { type ModifiedEvent } from "fabric";

type EventProducer = "user" | "history" | "websocket";
declare module "fabric" {
  export interface CanvasEvents {
    "sc:object:added": {
      producer: EventProducer;
      target: FabricObject;
      e?: MouseEvent | TouchEvent | PointerEvent;
    };
    "sc:object:modified": Partial<ModifiedEvent> & {
      producer: EventProducer;
      target: FabricObject | FabricObject[];
      e?: MouseEvent | TouchEvent | PointerEvent;
    };
    "sc:object:removed": {
      producer: EventProducer;
      target: FabricObject | FabricObject[];
      e?: MouseEvent | TouchEvent | PointerEvent;
    };
  }
}
