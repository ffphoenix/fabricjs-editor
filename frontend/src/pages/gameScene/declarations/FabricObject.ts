import { FabricObject } from "fabric";

declare module "fabric" {
  // to have the properties recognized on the instance and in the constructor
  interface FabricObject {
    layerUUID?: string;
    UUID?: string;
  }
  // to have the properties typed in the exported object
  interface SerializedObjectProps {
    layerUUID?: string;
    UUID?: string;
  }
}

FabricObject.customProperties = ["UUID", "layerUUID"];
