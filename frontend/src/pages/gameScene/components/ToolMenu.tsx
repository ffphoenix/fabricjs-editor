import React, { useRef } from "react";
import { Button } from "primereact/button";
import { CursorIcon, LayersIcon, ClearIcon, ImageIcon, HandIcon, MeasureIcon, TrashIcon } from "../icons";
import DrawToolsMenu from "./drawToolsMenu/DrawToolsMenu";
import TextToolMenu from "./textToolMenu/TextToolMenu";
import "./ToolMenu.css";
import SceneStore from "../store/SceneStore";
import { observer } from "mobx-react-lite";

type Props = {
  onDeleteSelected: () => void;
  onClear: () => void;
  onAddImage: (file: File) => void;
};

const ToolMenu: React.FC<Props> = ({ onDeleteSelected, onClear, onAddImage }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex h-full w-full flex-col gap-3 pb-70">
      {/* Tools */}
      <div className="flex flex-col gap-2">
        <Button
          aria-label="Select Tool"
          text
          raised
          icon={<CursorIcon />}
          className={(SceneStore.activeTool == "select" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => SceneStore.setActiveTool("select")}
        />
        <Button
          aria-label="Hand Tool"
          text
          raised
          icon={<HandIcon />}
          className={(SceneStore.activeTool === "hand" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => SceneStore.setActiveTool("hand")}
          tooltip="Hand (pan)"
        />
        <Button
          aria-label="Move Layer"
          text
          raised
          icon={<LayersIcon />}
          className={(SceneStore.activeTool == "moveLayer" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => SceneStore.setActiveTool("moveLayer")}
          tooltip="Move active layer"
        />
        <div className="h-px w-full bg-gray-200" />
        <DrawToolsMenu />
        <TextToolMenu />

        <Button
          aria-label="Measure Tool"
          text
          raised
          icon={<MeasureIcon />}
          className={(SceneStore.activeTool == "measure" ? "tooltip-button-selected" : "") + " tooltip-button"}
          onClick={() => SceneStore.setActiveTool("measure")}
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

export default observer(ToolMenu);
