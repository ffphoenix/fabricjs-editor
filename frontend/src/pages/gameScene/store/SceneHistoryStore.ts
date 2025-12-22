import { makeAutoObservable } from "mobx";
import type { FabricObject } from "fabric";

type Action = "add" | "modify" | "remove";
export type HistoryItem = {
  action: Action;
  UUID: string;
  item: Partial<FabricObject>;
};
type SceneHistory = {
  maxHistoryLength: number;
  undoHistory: HistoryItem[];
  redoHistory: HistoryItem[];
  addUndoHistoryItem: (action: Action, UUID: string, item?: Partial<FabricObject>) => void;
  addRedoHistoryItem: (action: Action, UUID: string, item?: Partial<FabricObject>) => void;
  latestUndoHistoryItem: HistoryItem | undefined;
  latestRedoHistoryItem: HistoryItem | undefined;
};

const sceneHistoryStore = makeAutoObservable<SceneHistory>({
  maxHistoryLength: 50,
  undoHistory: [],
  redoHistory: [],
  addUndoHistoryItem: (action, UUID, item = {}) => {
    //console.log("addUndoHistoryItem", action, UUID, item);
    sceneHistoryStore.undoHistory.push({ action, UUID, item });

    if (sceneHistoryStore.undoHistory.length > sceneHistoryStore.maxHistoryLength) {
      sceneHistoryStore.undoHistory.shift();
    }
    sceneHistoryStore.redoHistory = [];
  },
  addRedoHistoryItem: (action, UUID, item = {}) => {
    //console.log("addRedoHistoryItem", action, UUID, item);
    sceneHistoryStore.redoHistory.push({ action, UUID, item });

    if (sceneHistoryStore.redoHistory.length > sceneHistoryStore.maxHistoryLength) {
      sceneHistoryStore.redoHistory.shift();
    }
  },
  get latestUndoHistoryItem(): HistoryItem | undefined {
    return sceneHistoryStore.undoHistory[sceneHistoryStore.undoHistory.length - 1];
  },
  get latestRedoHistoryItem(): HistoryItem | undefined {
    return sceneHistoryStore.redoHistory[sceneHistoryStore.redoHistory.length - 1];
  },
});

export default sceneHistoryStore;
