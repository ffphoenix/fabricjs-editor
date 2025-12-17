import { makeAutoObservable } from "mobx";
type = {};

const HistoryStore = makeAutoObservable({
  UI: {
    currentZoom: 100,
  },
} as SceneStore);

export default HistoryStore;
