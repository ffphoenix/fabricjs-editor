import { makeAutoObservable } from "mobx";

export type SceneLayer = {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
};

export type Tool = "select" | "pencil" | "rect" | "circle" | "arrow" | "text" | "measure" | "hand" | "moveLayer";

type SceneStore = {
  layers: {
    activeLayerId: string;
    list: SceneLayer[];
  };
  tools: {
    active: Tool;
    drawTools: {
      active: Tool;
      strokeColor: string;
      fillColor: string;
      strokeWidth: number;
      strokeStyle: "solid" | "dashed" | "dotted";
    };
    textTool: {
      colors: string;
      fillColor: string;
      fontSize: number;
      fontFamily: string;
      fontWeight: "normal" | "bold";
      fontStyle: "normal" | "italic";
    };
    measurementTool: {
      shape: "line" | "circle";
      delay: number;
    };
  };
  UI: {
    currentZoom: number;
  };
  setCurrentZoom: (zoom: number) => void;
  getLayerById: (layerId: string) => SceneLayer | undefined;
  activeLayerId: string;
  currentZoom: number;
  setActiveTool: (tool: Tool) => void;
  activeTool: Tool;
  activeDrawTool: Tool;
  setDrawToolStrokeColor: (color: string) => void;
  setDrawToolFillColor: (color: string) => void;
  setDrawToolStrokeWidth: (width: number) => void;
};

const sceneStore: SceneStore = makeAutoObservable<SceneStore>({
  UI: {
    currentZoom: 100,
  },
  tools: {
    active: "select",
    drawTools: {
      active: "pencil",
      strokeColor: "#000000",
      fillColor: "#ffffff",
      strokeWidth: 3,
      strokeStyle: "solid",
    },
    textTool: {
      colors: "#000000",
      fillColor: "#ffffff",
      fontSize: 16,
      fontFamily: "Arial",
      fontWeight: "normal",
      fontStyle: "normal",
    },
    measurementTool: {
      shape: "line",
      delay: 0,
    },
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
  setActiveTool: (tool: Tool) => (sceneStore.tools.active = tool),
  get activeTool(): Tool {
    return sceneStore.tools.active;
  },
  get activeDrawTool(): Tool {
    return sceneStore.tools.drawTools.active;
  },
  setDrawToolStrokeColor: (color: string) => (sceneStore.tools.drawTools.strokeColor = color),
  setDrawToolFillColor: (color: string) => (sceneStore.tools.drawTools.fillColor = color),
  setDrawToolStrokeWidth: (width: number) => (sceneStore.tools.drawTools.strokeWidth = width),
});

export default sceneStore;
