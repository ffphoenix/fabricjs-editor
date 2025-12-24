import { makeAutoObservable } from "mobx";
import type { FabricObject } from "fabric";

type Action = "add" | "modify" | "remove";
type Pan = { x: number; y: number };
export type HistoryItem = {
  action: Action;
  UUID: string;
  item: Partial<FabricObject>;
  pan: Pan;
};
type SceneHistory = {
  maxHistoryLength: number;
  undoHistory: HistoryItem[];
  redoHistory: HistoryItem[];
  addUndoHistoryItem: (action: Action, UUID: string, pan: Pan, item?: Partial<FabricObject>) => void;
  addRedoHistoryItem: (action: Action, UUID: string, pan: Pan, item?: Partial<FabricObject>) => void;
  latestUndoHistoryItem: HistoryItem | undefined;
  latestRedoHistoryItem: HistoryItem | undefined;
};

const sceneHistoryStore = makeAutoObservable<SceneHistory>({
  maxHistoryLength: 50,
  undoHistory: [],
  redoHistory: [],
  addUndoHistoryItem: (action, UUID, pan, item = {}) => {
    sceneHistoryStore.undoHistory.push({ action, UUID, item, pan });

    if (sceneHistoryStore.undoHistory.length > sceneHistoryStore.maxHistoryLength) {
      sceneHistoryStore.undoHistory.shift();
    }
    sceneHistoryStore.redoHistory = [];
  },
  addRedoHistoryItem: (action, UUID, pan, item = {}) => {
    sceneHistoryStore.redoHistory.push({ action, UUID, item, pan });

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
