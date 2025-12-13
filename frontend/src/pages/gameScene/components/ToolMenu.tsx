import React, { useRef } from "react";
import { Button } from "primereact/button";

type Tool = "select" | "pen" | "rect" | "circle" | "text" | "measure" | "hand";

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
          aria-label="Hand Tool"
          text
          raised
          icon={HandIcon}
          className={(tool == "hand" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => setTool("hand")}
          tooltip="Hand (pan)"
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
