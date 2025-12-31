import { ActiveSelection, type Canvas, type FabricObject, Group } from "fabric";
import { getFabricObjectByUuid } from "../../../../utils/getFabricObjectByUuid";
import { getObjectTransformProps } from "../../utils/getObjectTransformProps";

export default function doActionWithGroup(
  canvas: Canvas,
  objects: FabricObject[],
  callback: (groupObject: FabricObject) => void,
) {
  const canvasObjects = objects.map((obj) => {
    if (obj.UUID === undefined) throw new Error("Object must have UUID");
    return getFabricObjectByUuid(canvas, obj.UUID);
  }) as FabricObject[];

  const groupObject = new Group(canvasObjects, { canvas });
  const originalProps = getObjectTransformProps(groupObject);
  callback(groupObject);

  const removedObjects = groupObject.removeAll();
  const activeSelection = new ActiveSelection(removedObjects, { canvas });
  canvas.setActiveObject(activeSelection);
  canvas.discardActiveObject();
  return originalProps;
}
