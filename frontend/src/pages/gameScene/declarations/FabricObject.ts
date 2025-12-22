import { FabricObject } from "fabric";

declare module "fabric" {
  // to have the properties recognized on the instance and in the constructor
  interface FabricObject {
    layerUUID?: string;
    UUID?: string;
    isEditing?: boolean;
    isEnlivened?: boolean;
    isChangedByHistory?: boolean;
    changeMadeBy?: "self" | "websocket";
  }
  // to have the properties typed in the exported object
  interface SerializedObjectProps {
    layerUUID?: string;
    UUID?: string;
    isEditing?: boolean;
    isEnlivened?: boolean;
    changeMadeBy?: "self" | "websocket";
  }
}

FabricObject.customProperties = ["UUID", "layerUUID", "isEnlivened", "isChangedByHistory", "isEditing", "changeMadeBy"];
