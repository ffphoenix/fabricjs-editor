import { type MutableRefObject, useEffect } from "react";
import SceneHistoryStore from "./store/SceneHistoryStore";
import { type Canvas } from "fabric";
import isKeyDownInterceptable from "../../utils/isKeyDownInterceptable";
import undoSceneAction from "./store/actions/undoSceneAction";
import redoSceneAction from "./store/actions/redoSceneAction";
import getPan from "./utils/getPan";
import { autorun, toJS } from "mobx";

export default function useSceneHistory(canvasRef: MutableRefObject<Canvas | null>) {
  useEffect(() => {
    autorun(
      () => {
        console.log("Scene History UNDO changed", toJS(SceneHistoryStore.undoHistory));
        console.log("Scene History REDO changed", toJS(SceneHistoryStore.redoHistory));
      },
      { delay: 500 },
    );
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onObjectAddedDisposer = canvas.on("sc:object:added", (e) => {
      const object = e.target;
      console.log("[object:added][history]", object);
      SceneHistoryStore.addUndoHistoryItem("add", { pan: getPan(canvasRef), object });
    });

    const onObjectModifiedDisposer = canvas.on("sc:object:modified", (e) => {
      const object = e.target;
      const transform = e.transform;

      SceneHistoryStore.addUndoHistoryItem("modify", {
        object,
        pan: getPan(canvasRef),
        originalProps: transform?.original ?? undefined,
        actionType: e.actionType,
      });
    });

    const onObjectRemovedDisposer = canvas.on("sc:object:removed", ({ producer, target }) => {
      if (producer !== "self") return;
      SceneHistoryStore.addUndoHistoryItem("remove", { pan: getPan(canvasRef), object: target });
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isKeyDownInterceptable(e, canvas)) return;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (isCtrlOrMeta && e.code === "KeyZ") {
        console.log(`[history][ctrl + z][shift: ${e.shiftKey}]`);

        if (e.shiftKey) {
          redoSceneAction(canvasRef);
        } else {
          undoSceneAction(canvasRef);
        }

        e.preventDefault();
        return;
      }
      if (isCtrlOrMeta && e.code === "KeyY") {
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
