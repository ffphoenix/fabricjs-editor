import React, { useState } from "react";
import SceneStore from "../../../../store/SceneStore";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { PencilIcon, SquareIcon, CircleIcon, ArrowIcon } from "../../../../icons";
import { OverlayPanel } from "primereact/overlaypanel";

type ToolsIcons = {
  [k: string]: React.ReactNode;
};
const toolsIcons: ToolsIcons = {
  pencil: <PencilIcon />,
  rect: <SquareIcon />,
  circle: <CircleIcon />,
  arrow: <ArrowIcon />,
};

export default observer(() => {
  const overlayPanelRef = React.useRef<OverlayPanel | null>(null);
  const [overlayPanelVisible, setOverlayPanelVisibility] = useState(false);
  return (
    <>
      <span id="draw-tools-overlay-anchor" className="tools-menu-overlay-anchor" />
      <Button
        aria-label="Drawing Tool"
        tooltip={overlayPanelVisible ? undefined : "Drawing Tools"}
        text
        raised
        icon={toolsIcons[SceneStore.activeDrawTool]}
        className={
          (SceneStore.activeTool == SceneStore.activeDrawTool ? "tooltip-button-selected" : "") + " tooltip-button"
        }
        onClick={(e) => {
          if (overlayPanelRef.current) {
            overlayPanelRef.current.toggle(e);
            SceneStore.setActiveTool(SceneStore.activeDrawTool);
          }
        }}
      />
      <OverlayPanel
        ref={overlayPanelRef}
        className="tools-menu-overlay"
        onHide={() => setOverlayPanelVisibility(false)}
        onShow={() => setOverlayPanelVisibility(true)}
        appendTo={document.getElementById("draw-tools-overlay-anchor")}
      >
        <div className="flex gap-2 items-center p-2">
          <Button
            aria-label="Pen Tool"
            text
            raised
            icon={<PencilIcon />}
            className={(SceneStore.activeDrawTool == "pencil" ? "tooltip-button-selected" : "") + " tooltip-button"}
            onClick={() => SceneStore.setActiveDrawTool("pencil")}
          />
          <Button
            aria-label="Rectangle Tool"
            text
            raised
            icon={<SquareIcon />}
            className={(SceneStore.activeDrawTool == "rect" ? "tooltip-button-selected" : "") + " tooltip-button"}
            onClick={() => SceneStore.setActiveDrawTool("rect")}
          />
          <Button
            aria-label="Circle Tool"
            text
            raised
            icon={<CircleIcon />}
            className={(SceneStore.activeDrawTool == "circle" ? "tooltip-button-selected" : "") + " tooltip-button"}
            onClick={() => SceneStore.setActiveDrawTool("circle")}
          />
          <Button
            aria-label="Arrow Tool"
            text
            raised
            icon={<ArrowIcon />}
            className={(SceneStore.activeDrawTool == "arrow" ? "tooltip-button-selected" : "") + " tooltip-button"}
            onClick={() => SceneStore.setActiveDrawTool("arrow")}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex flex-row p-2 w-full">
            <div className="flex-col pr-2 w-1/2">
              <label className="text-xs text-gray-600">Stroke</label>
              <input
                type="color"
                value={SceneStore.tools.drawTools.strokeColor}
                onChange={(e) => SceneStore.setDrawToolStrokeColor(e.target.value)}
                className="h-8 w-full cursor-pointer rounded border"
                title="Stroke color"
              />
            </div>
            <div className="flex-col w-1/2">
              <label className="text-xs text-gray-600">Fill</label>
              <input
                type="color"
                value={SceneStore.tools.drawTools.fillColor}
                onChange={(e) => SceneStore.setDrawToolFillColor(e.target.value)}
                className="h-8 w-full cursor-pointer rounded border"
                title="Fill color"
              />
            </div>
          </div>
          <div className="flex flex-row p-2 w-full">
            <label className="text-xs text-gray-600">Width: {SceneStore.tools.drawTools.strokeWidth}px</label>
            <input
              className="cursor-pointer rounded border w-full"
              type="range"
              min={1}
              max={20}
              value={SceneStore.tools.drawTools.strokeWidth}
              onChange={(e) => SceneStore.setDrawToolStrokeWidth(parseInt(e.target.value))}
            />
          </div>
        </div>
      </OverlayPanel>
    </>
  );
});
