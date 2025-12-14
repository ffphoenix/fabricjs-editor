import React, { useRef } from "react";
import { Button } from "primereact/button";
import {
  ArrowIcon,
  CursorIcon,
  EyeIcon,
  EyeOffIcon,
  LayersIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ClearIcon,
  ImageIcon,
  HandIcon,
  PencilIcon,
  SquareIcon,
  CircleIcon,
  TextIcon,
  MeasureIcon,
  LockUnlockedIcon,
  LockLockedIcon,
  PlusIcon,
  XIcon,
  TrashIcon,
} from "../icons";

type Tool = "select" | "pen" | "rect" | "circle" | "arrow" | "text" | "measure" | "hand" | "moveLayer";

type Layer = {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
};

type Props = {
  tool: Tool;
  setTool: (t: Tool) => void;
  strokeColor: string;
  setStrokeColor: (c: string) => void;
  fillColor: string;
  setFillColor: (c: string) => void;
  strokeWidth: number;
  setStrokeWidth: (n: number) => void;
  onNoFill: () => void;
  onDeleteSelected: () => void;
  onClear: () => void;
  onAddImage: (file: File) => void;
  // Layers
  layers: Layer[];
  activeLayerId: string;
  onSetActiveLayer: (id: string) => void;
  onAddLayer: () => void;
  onRenameLayer: (id: string, name: string) => void;
  onToggleLayerVisibility: (id: string) => void;
  onToggleLayerLock: (id: string) => void;
  onMoveLayerOrder: (id: string, dir: "up" | "down") => void;
  onDeleteLayer: (id: string) => void;
};

const ToolMenu: React.FC<Props> = ({
  tool,
  setTool,
  strokeColor,
  setStrokeColor,
  fillColor,
  setFillColor,
  strokeWidth,
  setStrokeWidth,
  onNoFill,
  onDeleteSelected,
  onClear,
  onAddImage,
  layers,
  activeLayerId,
  onSetActiveLayer,
  onAddLayer,
  onRenameLayer,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onMoveLayerOrder,
  onDeleteLayer,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const EyeIconContent = ({ off = false }: { off?: boolean }) => (off ? <EyeIcon /> : <EyeOffIcon />);
  const LockIconContent = ({ locked = false }: { locked?: boolean }) =>
    locked ? <LockLockedIcon /> : <LockUnlockedIcon />;

  return (
    <div className="flex h-full w-full flex-col gap-3 pb-70">
      {/* Tools */}
      <div className="flex flex-col gap-2">
        <Button
          aria-label="Select Tool"
          text
          raised
          icon={<CursorIcon />}
          className={(tool == "select" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("select")}
        />
        <Button
          aria-label="Hand Tool"
          text
          raised
          icon={<HandIcon />}
          className={(tool == "hand" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("hand")}
          tooltip="Hand (pan)"
        />
        <Button
          aria-label="Move Layer"
          text
          raised
          icon={<LayersIcon />}
          className={(tool == "moveLayer" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("moveLayer")}
          tooltip="Move active layer"
        />
        <Button
          aria-label="Pen Tool"
          text
          raised
          icon={<PencilIcon />}
          className={(tool == "pen" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("pen")}
        />
        <Button
          aria-label="Rectangle Tool"
          text
          raised
          icon={<SquareIcon />}
          className={(tool == "rect" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("rect")}
        />
        <Button
          aria-label="Circle Tool"
          text
          raised
          icon={<CircleIcon />}
          className={(tool == "circle" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("circle")}
        />
        <Button
          aria-label="Arrow Tool"
          text
          raised
          icon={<ArrowIcon />}
          className={(tool == "arrow" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("arrow")}
        />
        <Button
          aria-label="Text Tool"
          text
          raised
          icon={<TextIcon />}
          className={(tool == "text" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("text")}
        />
        <Button
          aria-label="Measure Tool"
          text
          raised
          icon={<MeasureIcon />}
          className={(tool == "measure" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("measure")}
          tooltip="Measure (distance)"
        />
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              if (file) {
                onAddImage(file);
                // clear the input so the same file can be selected again if needed
                e.currentTarget.value = "";
              }
            }}
          />
          <Button
            aria-label="Add Image"
            text
            raised
            icon={<ImageIcon />}
            className={"tooltip-button"}
            onClick={() => {
              fileInputRef.current?.click();
            }}
          />
        </div>
      </div>

      <div className="h-px w-full bg-gray-200" />

      {/* Layers */}
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

      <div className="h-px w-full bg-gray-200" />

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-600">Stroke</label>
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          className="h-8 w-full cursor-pointer rounded border"
          title="Stroke color"
        />

        <label className="text-xs text-gray-600">Fill</label>
        <input
          type="color"
          value={fillColor.startsWith("rgba") ? "#000000" : fillColor}
          onChange={(e) => setFillColor(e.target.value)}
          className="h-8 w-full cursor-pointer rounded border"
          title="Fill color"
        />
        <button type="button" className="px-2 py-1 text-xs border rounded" onClick={onNoFill} title="No fill">
          No Fill
        </button>

        <label className="text-xs text-gray-600">Width: {strokeWidth}px</label>
        <input
          type="range"
          min={1}
          max={20}
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
        />
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <Button
          aria-label="Delete Selected"
          text
          raised
          icon={<TrashIcon />}
          className="tooltip-button"
          onClick={onDeleteSelected}
        />
        <Button
          aria-label="Clear Canvas"
          text
          raised
          icon={<ClearIcon />}
          className="tooltip-button"
          onClick={onClear}
        />
      </div>
    </div>
  );
};

export default ToolMenu;
