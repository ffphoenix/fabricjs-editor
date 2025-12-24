import React, { useState } from "react";
import SceneStore from "../../../../store/SceneStore";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { TextIcon } from "../../../../icons";
import { OverlayPanel } from "primereact/overlaypanel";

export default observer(() => {
  const overlayPanelRef = React.useRef<OverlayPanel | null>(null);
  const [overlayPanelVisible, setOverlayPanelVisibility] = useState(false);
  return (
    <>
      <span id="text-tool-overlay-anchor" className="tools-menu-overlay-anchor" />
      <Button
        aria-label="Text Tool"
        tooltip={overlayPanelVisible ? undefined : "Text Tools"}
        text
        raised
        icon={<TextIcon />}
        className={(SceneStore.activeTool == "text" ? "tooltip-button-selected" : "") + " tooltip-button"}
        onClick={(e) => {
          if (overlayPanelRef.current) {
            overlayPanelRef.current.toggle(e);
            SceneStore.setActiveTool("text");
          }
        }}
      />
      <OverlayPanel
        ref={overlayPanelRef}
        className="tools-menu-overlay"
        onHide={() => setOverlayPanelVisibility(false)}
        onShow={() => setOverlayPanelVisibility(true)}
        appendTo={document.getElementById("text-tool-overlay-anchor")}
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-row p-2 w-full">
            <div className="flex-col pr-2 w-1/2">
              <label className="text-xs text-gray-600">Stroke</label>
              <input
                type="color"
                value={SceneStore.tools.textTool.color}
                onChange={(e) => SceneStore.setTextToolColor(e.target.value)}
                className="h-8 w-full cursor-pointer rounded border"
                title="Stroke color"
              />
            </div>
            <div className="flex-col w-1/2">
              <label className="text-xs text-gray-600">Fill</label>
              <input
                type="color"
                value={SceneStore.tools.textTool.fillColor}
                onChange={(e) => SceneStore.setTextToolFillColor(e.target.value)}
                className="h-8 w-full cursor-pointer rounded border"
                title="Fill color"
              />
            </div>
          </div>
          <div className="flex flex-row p-2 w-full">
            <label className="text-xs text-gray-600">Font Size: </label>
            <input
              className="cursor-pointer rounded border w-full"
              type="number"
              min={10}
              max={300}
              value={SceneStore.tools.textTool.fontSize}
              onChange={(e) => SceneStore.setTextToolFontSize(parseInt(e.target.value))}
            />
          </div>
        </div>
      </OverlayPanel>
    </>
  );
});
