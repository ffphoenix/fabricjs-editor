import { makeAutoObservable } from "mobx";
import type { FabricObject } from "fabric";
import * as fabric from "fabric";
import type { ModifyActionType } from "../../sceneActions/types";

type Action = "add" | "modify" | "remove";
type Pan = { x: number; y: number };
type EventItem = {
  pan: Pan;
  object: FabricObject | FabricObject[];
  originalProps?: Partial<FabricObject>;
  actionType?: ModifyActionType;
};
export type HistoryItem = {
  action: Action;
  object: FabricObject | FabricObject[];
  pan: Pan;
  originalProps?: Partial<FabricObject>;
  actionType?: ModifyActionType;
};
type SceneHistory = {
  maxHistoryLength: number;
  undoHistory: HistoryItem[];
  redoHistory: HistoryItem[];
  addUndoHistoryItem: (action: Action, eventItem: EventItem, isRedoAction?: boolean) => void;
  addRedoHistoryItem: (action: Action, eventItem: EventItem) => void;
  latestUndoHistoryItem: HistoryItem | undefined;
  latestRedoHistoryItem: HistoryItem | undefined;
  popUndoHistoryItem: () => HistoryItem | undefined;
  popRedoHistoryItem: () => HistoryItem | undefined;
};

const sceneHistoryStore = makeAutoObservable<SceneHistory>({
  maxHistoryLength: 50,
  undoHistory: [],
  redoHistory: [],
  addUndoHistoryItem: (action, eventItem: EventItem, isRedoAction = false) => {
    console.log("addUndoHistoryItem");
    sceneHistoryStore.undoHistory.push({ ...eventItem, action });

    if (sceneHistoryStore.undoHistory.length > sceneHistoryStore.maxHistoryLength) {
      sceneHistoryStore.undoHistory.shift();
    }
    if (!isRedoAction) {
      sceneHistoryStore.redoHistory = [];
    }
  },
  addRedoHistoryItem: (action, eventItem) => {
    sceneHistoryStore.redoHistory.push({ ...eventItem, action });

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
  popUndoHistoryItem: (): HistoryItem | undefined => {
    return sceneHistoryStore.undoHistory.pop();
  },
  popRedoHistoryItem: (): HistoryItem | undefined => {
    return sceneHistoryStore.redoHistory.pop();
  },
});

export default sceneHistoryStore;
