import React, { type MutableRefObject, useEffect, useRef, useState } from "react";
import SceneStore, { type SceneLayer } from "../../../store/SceneStore";
import { type Canvas } from "fabric";
import { EyeIcon, EyeOffIcon, LockLockedIcon, LockUnlockedIcon } from "../../../icons";
import * as fabric from "fabric";
import applyLayerPropsToObjects from "../applyLayerPropsToObjects";

type LayerMenuProps = {
  canvasRef: MutableRefObject<Canvas | null>;
};
export default ({ canvasRef }: LayerMenuProps) => {
  const EyeIconContent = ({ off = false }: { off?: boolean }) => (off ? <EyeIcon /> : <EyeOffIcon />);
  const LockIconContent = ({ locked = false }: { locked?: boolean }) =>
    locked ? <LockLockedIcon /> : <LockUnlockedIcon />;

  //// ----------------- Layer management ------------------ ////
  //const layers = SceneStore.layers;

  // Layers state
  const [layers, setLayers] = useState<SceneLayer[]>([
    { id: "layer-1", name: "Layer 1", visible: true, locked: false },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>("layer-1");

  // Move-layer drag state
  const layerMoveRef = useRef<{
    lastX: number;
    lastY: number;
  } | null>(null);

  // Helpers for layer application
  const getLayerById = (id: string | undefined | null): SceneLayer | undefined => layers.find((l) => l.id === id);

  const reorderObjectsByLayers = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const order = layers.map((l) => l.id);
    const objs = canvas.getObjects();
    // stable order: by layer index, then by original index
    const withIdx = objs.map((o, i) => ({ o, i }));
    withIdx.sort((a, b) => {
      const la = order.indexOf(((a.o as any).layerId as string) || "");
      const lb = order.indexOf(((b.o as any).layerId as string) || "");
      if (la !== lb) return la - lb;
      return a.i - b.i;
    });
    withIdx.forEach(({ o }, idx) => canvas.moveTo(o, idx));
    canvas.requestRenderAll();
  };

  // Layer CRUD operations
  const addLayer = () => {
    const id = `layer-${Date.now()}`;
    setLayers((prev) => {
      const next = [...prev, { id, name: `Layer ${prev.length + 1}`, visible: true, locked: false }];
      return next;
    });
    setActiveLayerId(id);
    setTimeout(() => {
      reorderObjectsByLayers();
      applyLayerPropsToObjects();
      captureState();
    }, 0);
  };

  const renameLayer = (layerId: string, name: string) => {
    setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, name } : l)));
    setTimeout(() => captureState(), 0);
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)));
    setTimeout(() => {
      applyLayerPropsToObjects();
      captureState();
    }, 0);
  };

  const toggleLayerLock = (layerId: string) => {
    setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, locked: !l.locked } : l)));
    setTimeout(() => {
      applyLayerPropsToObjects();
      captureState();
    }, 0);
  };

  const moveLayerOrder = (layerId: string, direction: "up" | "down") => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === layerId);
      if (idx < 0) return prev;
      const target = direction === "up" ? idx + 1 : idx - 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(target, 0, item);
      return next;
    });
    setTimeout(() => {
      reorderObjectsByLayers();
      captureState();
    }, 0);
  };

  const deleteLayer = (layerId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Move objects of this layer to previous layer if exists, else next, otherwise block deletion
    setLayers((prev) => {
      if (prev.length <= 1) return prev; // do not delete last layer
      const idx = prev.findIndex((l) => l.id === layerId);
      if (idx === -1) return prev;
      const fallback = prev[idx === 0 ? 1 : idx - 1].id;
      // reassign objects
      canvas.getObjects().forEach((o) => {
        if ((o as any).layerId === layerId) (o as any).layerId = fallback;
      });
      const next = prev.filter((l) => l.id !== layerId);
      if (activeLayerId === layerId) setActiveLayerId(fallback);
      setTimeout(() => {
        applyLayerPropsToObjects();
        reorderObjectsByLayers();
        canvas.requestRenderAll();
        captureState();
      }, 0);
      return next;
    });
  };

  // Ensure newly created paths (free drawing) get active layerId
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = (e: any) => {
      const path = e.path as fabric.Path;
      if (path) {
        (path as any).layerId = activeLayerId;
        applyLayerPropsToObjects();
        reorderObjectsByLayers();
        captureState();
      }
    };
    canvas.on("path:created", handler as any);
    return () => {
      canvas.off("path:created", handler as any);
    };
  }, [activeLayerId]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">Layers</span>
        <button
          type="button"
          className="p-1 border rounded hover:bg-gray-50"
          onClick={() => onAddLayer()}
          title="Add layer"
        >
          <PlusIcon />
        </button>
      </div>
      <div className="flex flex-col gap-1 max-h-72 overflow-auto">
        {layers.map((layer) => {
          const isActive = layer.id === activeLayerId;
          return (
            <div
              key={layer.id}
              className={`flex items-center gap-1 rounded border px-2 py-1 ${isActive ? "bg-blue-50 border-blue-300" : "bg-white"}`}
              onClick={() => onSetActiveLayer(layer.id)}
            >
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLayerVisibility(layer.id);
                }}
                title={layer.visible ? "Hide layer" : "Show layer"}
              >
                <EyeIconContent off={!layer.visible} />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLayerLock(layer.id);
                }}
                title={layer.locked ? "Unlock layer" : "Lock layer"}
              >
                <LockIconContent locked={layer.locked} />
              </button>
              <div
                className="flex-1 truncate cursor-text"
                title="Rename layer"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  const name = prompt("Rename layer", layer.name);
                  if (name && name.trim()) onRenameLayer(layer.id, name.trim());
                }}
              >
                {layer.name}
              </div>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveLayerOrder(layer.id, "up");
                }}
                title="Move up"
              >
                <ChevronUpIcon />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveLayerOrder(layer.id, "down");
                }}
                title="Move down"
              >
                <ChevronDownIcon />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLayer(layer.id);
                }}
                title="Delete layer"
              >
                <XIcon />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
