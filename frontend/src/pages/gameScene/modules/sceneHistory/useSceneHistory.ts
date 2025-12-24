import { type MutableRefObject, useEffect } from "react";
import SceneHistoryStore from "./store/SceneHistoryStore";
import { type Canvas, type ModifiedEvent } from "fabric";
import isKeyDownInterceptable from "../../utils/isKeyDownInterceptable";
import undoSceneAction from "./store/actions/undoSceneAction";
import redoSceneAction from "./store/actions/redoSceneAction";
import getPan from "./utils/getPan";
import { autorun, toJS } from "mobx";

export default function useSceneHistory(canvasRef: MutableRefObject<Canvas | null>) {
  useEffect(() => {
    autorun(
      () => {
        console.log("Scene History undo changed", toJS(SceneHistoryStore.undoHistory));
      },
      { delay: 500 },
    );
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onObjectAddedDisposer = canvas.on("sc:object:added", (e) => {
      const object = e.target;
      if (!object || object.changeMadeBy !== "self") return;
      if (object.isChangedByHistory) {
        object.set({ isChangedByHistory: false });
        return;
      }
      if (!object.UUID) throw new Error("Object must have UUID");
      console.log("[object:added][history]", object);
      SceneHistoryStore.addUndoHistoryItem("add", object.UUID, getPan(canvasRef), object.toJSON());
    });

    const onModify = (e: ModifiedEvent) => {
      const object = e.target;
      console.log("[object:modified][history]", object, e.transform, object.get("type"));
      if (!object || object.changeMadeBy !== "self") return;
      if (object.isChangedByHistory) {
        object.set({ isChangedByHistory: false });
        return;
      }
      const transform = e.transform;
      if (!object.UUID) throw new Error("Object must have UUID");
      if (!transform) throw new Error("Object must have transform:" + JSON.stringify(e));
      SceneHistoryStore.addUndoHistoryItem("modify", object.UUID, getPan(canvasRef), transform.original);
    };
    const onObjectModifiedDisposer = canvas.on("sc:object:modified", onModify);

    const onObjectRemovedDisposer = canvas.on("sc:object:removed", ({ producer, target }) => {
      const object = Array.isArray(target) ? target[0] : target;
      console.log("[object:removed][history]", object);
      if (producer !== "user") return;
      if (!object.UUID) throw new Error("Object must have UUID");
      console.log("[object:removed][history]", object);
      SceneHistoryStore.addUndoHistoryItem("remove", object.UUID, getPan(canvasRef), object.toJSON());
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isKeyDownInterceptable(e, canvas)) return;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (isCtrlOrMeta && e.key.toLowerCase() === "z") {
        console.log(`[history][ctrl + z][shift: ${e.shiftKey}]`);

        if (e.shiftKey) {
          redoSceneAction(canvasRef);
        } else {
          undoSceneAction(canvasRef);
        }

        e.preventDefault();
        return;
      }
      if (isCtrlOrMeta && e.key.toLowerCase() === "y") {
        redoSceneAction(canvasRef);
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      onObjectAddedDisposer();
      onObjectModifiedDisposer();
      onObjectRemovedDisposer();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
