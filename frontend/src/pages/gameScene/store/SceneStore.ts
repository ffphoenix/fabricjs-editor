import { makeAutoObservable } from "mobx";

export type SceneLayer = {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
};

type SceneStore = {
  layers: {
    activeLayerId: string;
    list: SceneLayer[];
  };
  UI: {
    currentZoom: number;
  };
  setCurrentZoom: (zoom: number) => void;
  getLayerById: (layerId: string) => SceneLayer | undefined;
  activeLayerId: string;
};

const sceneStore = makeAutoObservable({
  UI: {
    currentZoom: 100,
  },
  layers: {
    activeLayerId: "background",
    list: [{ id: "background", name: "Background", visible: true, locked: false }],
  },
  setCurrentZoom: (zoom: number) => (sceneStore.UI.currentZoom = Math.ceil(zoom * 100)),
  get currentZoom(): number {
    return sceneStore.UI.currentZoom;
  },
  get activeLayerId(): string {
    return sceneStore.layers.activeLayerId;
  },
  getLayerById: (layerId: string) => {
    return sceneStore.layers.list.find((layer) => layer.id === layerId);
  },
} as SceneStore);

export default sceneStore;
