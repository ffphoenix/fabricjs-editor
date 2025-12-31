import React, { type MutableRefObject } from "react";
import { Button } from "primereact/button";
import { CursorIcon, LayersIcon, ClearIcon, HandIcon, MeasureIcon, TrashIcon, PrintIcon } from "../../../icons";
import DrawToolsMenu from "./drawToolsMenu/DrawToolsMenu";
import TextToolMenu from "./textToolMenu/TextToolMenu";
import "./ToolMenu.css";
import SceneStore from "../../../store/SceneStore";
import { observer } from "mobx-react-lite";
import UploadImageButton from "./UploadImageButton";
import type { Canvas } from "fabric";

type Props = {
  canvasRef: MutableRefObject<Canvas | null>;
};

const ToolMenu: React.FC<Props> = ({ canvasRef }) => {
  const printCanvas = () => console.log("Print canvas", canvasRef.current?.toJSON());
  const onClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.clear();
    // canvas.setBackgroundColor("#f8fafc", () => canvas.requestRenderAll());
  };
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
        <UploadImageButton canvasRef={canvasRef} />
      </div>

      <div className="h-px w-full bg-gray-200" />

      <div className="mt-auto flex flex-col gap-2">
        <Button
          aria-label="Delete Selected"
          text
          raised
          icon={<TrashIcon />}
          className="tooltip-button"
          onClick={() => {}}
        />
        <Button
          aria-label="Clear Canvas"
          text
          raised
          icon={<ClearIcon />}
          className="tooltip-button"
          onClick={onClear}
        />
        <Button
          aria-label="Print Canvas"
          text
          raised
          icon={<PrintIcon />}
          className="tooltip-button"
          onClick={() => printCanvas()}
          tooltip="Print Canvas"
        />
      </div>
    </div>
  );
};

export default observer(ToolMenu);
