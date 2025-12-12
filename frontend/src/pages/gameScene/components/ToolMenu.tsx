import React, { useRef } from "react";
import ToolButton from "./ToolButton";
import { Button } from "primereact/button";

type Tool = "select" | "pen" | "rect" | "circle" | "text";

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
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const CursorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <polygon points="7.79,6.86 14.24,26.95 17.01,17.33 25.47,13.62" fill="black" />
    </svg>
  );
  return (
    <div className="flex h-full w-full flex-col gap-3 pb-70">
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
          aria-label="Select Tool"
          text
          raised
          icon="pi pi-pencil"
          className={(tool == "pen" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("pen")}
        />
        <Button
          aria-label="Select Tool"
          text
          raised
          icon="pi pi-stop"
          className={(tool == "rect" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("rect")}
        />
        <ToolButton label="Circle" active={tool === "circle"} onClick={() => setTool("circle")} />
        <ToolButton label="Text" active={tool === "text"} onClick={() => setTool("text")} />
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
          <ToolButton
            label="Image"
            onClick={() => {
              fileInputRef.current?.click();
            }}
          />
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
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={onDeleteSelected}>
          Delete Selected
        </button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default ToolMenu;
