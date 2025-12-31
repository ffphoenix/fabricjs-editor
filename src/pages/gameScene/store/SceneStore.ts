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
      color: string;
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
    rightClick: {
      isRightButtonDown: boolean;
      isPanning: boolean;
      startPos: { x: number; y: number } | null;
    };
    contextMenu: {
      visible: boolean;
      x: number;
      y: number;
    };
  };
  setCurrentZoom: (zoom: number) => void;
  setContextMenu: (visible: boolean, x?: number, y?: number) => void;
  getLayerById: (layerId: string) => SceneLayer | undefined;
  activeLayerId: string;
  currentZoom: number;
  setActiveTool: (tool: Tool) => void;
  activeTool: Tool;
  activeDrawTool: Tool;
  setActiveDrawTool: (tool: Tool) => void;
  setDrawToolStrokeColor: (color: string) => void;
  setDrawToolFillColor: (color: string) => void;
  setDrawToolStrokeWidth: (width: number) => void;
  setTextToolFontSize: (size: number) => void;
  setTextToolColor: (color: string) => void;
  setTextToolFillColor: (color: string) => void;
  setTextToolFontWeight: (weight: "normal" | "bold") => void;
  setTextToolFontStyle: (style: "normal" | "italic") => void;
  setTextToolFontFamily: (family: string) => void;
  setDrawToolFillColorTransparent: () => void;
  setRightClickPanning: (isPanning: boolean) => void;
  setRightClickStartPos: (pos: { x: number; y: number }) => void;
  setRightClickIsRightButtonDown: (isRightButtonDown: boolean) => void;
};

const sceneStore: SceneStore = makeAutoObservable<SceneStore>({
  UI: {
    currentZoom: 100,
    rightClick: {
      isRightButtonDown: false,
      isPanning: false,
      startPos: null,
    },
    contextMenu: {
      visible: false,
      x: 0,
      y: 0,
    },
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
      color: "#000000",
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
  setContextMenu: (visible: boolean, x?: number, y?: number) => {
    sceneStore.UI.contextMenu.visible = visible;
    if (x !== undefined) sceneStore.UI.contextMenu.x = x;
    if (y !== undefined) sceneStore.UI.contextMenu.y = y;
  },
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
  setActiveDrawTool: (tool: Tool) => {
    sceneStore.tools.drawTools.active = tool;
    sceneStore.tools.active = tool;
  },
  setDrawToolStrokeColor: (color: string) => (sceneStore.tools.drawTools.strokeColor = color),
  setDrawToolFillColor: (color: string) => (sceneStore.tools.drawTools.fillColor = color),
  setDrawToolStrokeWidth: (width: number) => (sceneStore.tools.drawTools.strokeWidth = width),
  setTextToolFontSize: (size: number) => (sceneStore.tools.textTool.fontSize = size),
  setTextToolColor: (color: string) => (sceneStore.tools.textTool.color = color),
  setTextToolFillColor: (color: string) => (sceneStore.tools.textTool.fillColor = color),
  setTextToolFontWeight: (weight: "normal" | "bold") => (sceneStore.tools.textTool.fontWeight = weight),
  setTextToolFontStyle: (style: "normal" | "italic") => (sceneStore.tools.textTool.fontStyle = style),
  setTextToolFontFamily: (family: string) => (sceneStore.tools.textTool.fontFamily = family),
  setDrawToolFillColorTransparent: () => (sceneStore.tools.drawTools.fillColor = "rgba(0,0,0,0)"),
  setRightClickPanning: (isPanning: boolean) => (sceneStore.UI.rightClick.isPanning = isPanning),
  setRightClickStartPos: (pos: { x: number; y: number }) => (sceneStore.UI.rightClick.startPos = pos),
  setRightClickIsRightButtonDown: (isRightButtonDown: boolean) =>
    (sceneStore.UI.rightClick.isRightButtonDown = isRightButtonDown),
});

export default sceneStore;
