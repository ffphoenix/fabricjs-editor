import { makeAutoObservable } from "mobx";
import type { FabricObject } from "fabric";

type Action = "add" | "modify" | "remove";
type HistoryItem = {
  action: Action;
  UUID: string;
  item: Partial<FabricObject>;
};
type SceneHistory = {
  historyUndo: HistoryItem[];
  historyRedo: HistoryItem[];
  addUndoHistoryItem: (action: Action, UUID: string, item?: Partial<FabricObject>) => void;
  latestUndoHistoryItem: HistoryItem | undefined;
};

const sceneHistoryStore = makeAutoObservable<SceneHistory>({
  historyUndo: [],
  historyRedo: [],
  addUndoHistoryItem: (action, UUID, item = {}) => {
    console.log("addUndoHistoryItem", action, UUID, item);
    sceneHistoryStore.historyUndo.push({ action, UUID, item });
  },
  get latestUndoHistoryItem(): HistoryItem | undefined {
    return sceneHistoryStore.historyUndo[sceneHistoryStore.historyUndo.length - 1];
  },
});

export default sceneHistoryStore;
