import type { TEvent } from "fabric";

declare module "fabric" {
  export interface CanvasEvents {
    "sc:object:added": Partial<TEvent> & {
      target: FabricObject | FabricObject[];
    };
    "sc:object:modified": Partial<TEvent> & {
      target: FabricObject | FabricObject[];
    };
    "sc:object:removed": Partial<TEvent> & {
      target: FabricObject | FabricObject[];
    };
  }
}
