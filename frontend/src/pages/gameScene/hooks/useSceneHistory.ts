import { type MutableRefObject, useEffect } from "react";
import SceneHistoryStore from "../store/SceneHistoryStore";
import type { Canvas, ModifiedEvent } from "fabric";
import isKeyDownInterceptable from "../utils/isKeyDownInterceptable";
import undoSceneAction from "../store/actions/history/undoSceneAction";
import redoSceneAction from "../store/actions/history/redoSceneAction";

export default function useSceneHistory(canvasRef: MutableRefObject<Canvas | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onObjectAddedDisposer = canvas.on("object:added", (e) => {
      const object = e.target;
      if (!object || object.changeMadeBy !== "self") return;
      if (object.isChangedByHistory) {
        object.set({ isChangedByHistory: false });
        return;
      }
      if (!object.UUID) throw new Error("Object must have UUID");

      SceneHistoryStore.addUndoHistoryItem("add", object.UUID, object.toJSON());
    });

    const onModify = (e: ModifiedEvent) => {
      const object = e.target;
      if (!object || object.changeMadeBy !== "self") return;
      if (object.isChangedByHistory) {
        object.set({ isChangedByHistory: false });
        return;
      }
      const transform = e.transform;
      if (!object.UUID) throw new Error("Object must have UUID");
      if (!transform) throw new Error("Object must have transform:" + JSON.stringify(e));
      console.log("modify", e);
      SceneHistoryStore.addUndoHistoryItem("modify", object.UUID, transform.original);
    };
    const onObjectModifiedDisposer = canvas.on("object:modified", onModify);

    const onObjectRemovedDisposer = canvas.on("object:removed", (e) => {
      const object = e.target;
      if (!object || object.changeMadeBy !== "self") return;
      if (object.isChangedByHistory) {
        object.set({ isChangedByHistory: false });
        return;
      }
      if (!object.UUID) throw new Error("Object must have UUID");

      SceneHistoryStore.addUndoHistoryItem("remove", object.UUID, object.toJSON());
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isKeyDownInterceptable(e, canvas)) return;

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (isCtrlOrMeta && e.key.toLowerCase() === "z") {
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
