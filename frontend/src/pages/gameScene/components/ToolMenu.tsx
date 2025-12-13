import React, { useRef } from "react";
import { Button } from "primereact/button";

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

  const CursorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <polygon points="7.79,6.86 14.24,26.95 17.01,17.33 25.47,13.62" fill="black" />
    </svg>
  );
  const HandIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 13V5a2 2 0 0 1 4 0v6" />
      <path d="M12 11V3a2 2 0 0 1 4 0v8" />
      <path d="M16 10.5V6a2 2 0 0 1 4 0v7.5c0 3.59-2.91 6.5-6.5 6.5H12a6 6 0 0 1-6-6v-2a2 2 0 0 1 4 0" />
    </svg>
  );
  const PencilIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
  const SquareIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="1" ry="1" />
    </svg>
  );
  const CircleIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
  const ArrowIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="12" x2="18" y2="12" />
      <polyline points="12 6 18 12 12 18" />
    </svg>
  );
  const TextIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7V5h16v2" />
      <path d="M10 19h4" />
      <path d="M12 5v14" />
    </svg>
  );
  const MeasureIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 15l6-6 6 6 6-6" />
      <path d="M9 9V5" />
      <path d="M15 15v4" />
      <path d="M12 12v2" />
    </svg>
  );
  const ImageIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
  const TrashIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
  const ClearIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M19 5l-6 6" />
      <path d="M8 6l-5 5 5 5h6a4 4 0 0 0 4-4v-2" />
    </svg>
  );
  const LayersIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
  const EyeIcon = ({ off = false }: { off?: boolean }) =>
    off ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.46-1.06 1.13-2.05 1.96-2.94M4.22 4.22A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8- .3.69-.68 1.33-1.13 1.93M1 1l22 22" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  const LockIcon = ({ locked = false }: { locked?: boolean }) =>
    locked ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
      </svg>
    );
  const ChevronUp = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
  const ChevronDown = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
  const PlusIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
  const XIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <div className="flex h-full w-full flex-col gap-3 pb-70">
      {/* Tools */}
      <div className="flex flex-col gap-2">
        <Button
          aria-label="Select Tool"
          text
          raised
          icon={CursorIcon}
          className={(tool == "select" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("select")}
        />
        <Button
          aria-label="Hand Tool"
          text
          raised
          icon={HandIcon}
          className={(tool == "hand" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("hand")}
          tooltip="Hand (pan)"
        />
        <Button
          aria-label="Move Layer"
          text
          raised
          icon={LayersIcon}
          className={(tool == "moveLayer" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("moveLayer")}
          tooltip="Move active layer"
        />
        <Button
          aria-label="Pen Tool"
          text
          raised
          icon={PencilIcon}
          className={(tool == "pen" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("pen")}
        />
        <Button
          aria-label="Rectangle Tool"
          text
          raised
          icon={SquareIcon}
          className={(tool == "rect" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("rect")}
        />
        <Button
          aria-label="Circle Tool"
          text
          raised
          icon={CircleIcon}
          className={(tool == "circle" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("circle")}
        />
        <Button
          aria-label="Arrow Tool"
          text
          raised
          icon={ArrowIcon}
          className={(tool == "arrow" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("arrow")}
        />
        <Button
          aria-label="Text Tool"
          text
          raised
          icon={TextIcon}
          className={(tool == "text" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("text")}
        />
        <Button
          aria-label="Measure Tool"
          text
          raised
          icon={MeasureIcon}
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
            icon={ImageIcon}
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
                  <EyeIcon off={!layer.visible} />
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
                  <LockIcon locked={layer.locked} />
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
                  <ChevronUp />
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
                  <ChevronDown />
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
          icon={TrashIcon}
          className="tooltip-button"
          onClick={onDeleteSelected}
        />
        <Button aria-label="Clear Canvas" text raised icon={ClearIcon} className="tooltip-button" onClick={onClear} />
      </div>
    </div>
  );
};

export default ToolMenu;
