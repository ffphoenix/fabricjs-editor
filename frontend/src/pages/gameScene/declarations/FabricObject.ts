import { FabricObject } from "fabric";

declare module "fabric" {
  // to have the properties recognized on the instance and in the constructor
  interface FabricObject {
    layerUUID?: string;
    UUID?: string;
    isEditing?: boolean;
    isEnlivened?: boolean;
    isChangedByHistory?: boolean;
    changeMadeBy?: "self" | "websocket" | "history";
  }
  // to have the properties typed in the exported object
  interface SerializedObjectProps {
    layerUUID?: string;
    UUID?: string;
    isEditing?: boolean;
    isEnlivened?: boolean;
    changeMadeBy?: "self" | "websocket" | "history";
  }
}

FabricObject.customProperties = ["UUID", "layerUUID", "isEnlivened", "isChangedByHistory", "isEditing", "changeMadeBy"];
