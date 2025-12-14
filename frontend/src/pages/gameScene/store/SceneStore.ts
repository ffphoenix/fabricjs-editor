import { makeAutoObservable } from "mobx";

const sceneStore = makeAutoObservable({
  UI: {
    currentZoom: 100,
  },
  setCurrentZoom: (zoom: number) => (sceneStore.UI.currentZoom = Math.ceil(zoom * 100)),
  get currentZoom(): number {
    return sceneStore.UI.currentZoom;
  },
});

export default sceneStore;
