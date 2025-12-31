import React, { useRef } from "react";
import { ContextMenu } from "primereact/contextmenu";
import SceneStore from "../../../store/SceneStore";
import { observer } from "mobx-react-lite";
import { autorun } from "mobx";

const SceneContextMenu: React.FC = () => {
  const cm = useRef<ContextMenu>(null);

  const items = [
    { label: "Copy", icon: "pi pi-copy", command: () => console.log("Copy") },
    { label: "Paste", icon: "pi pi-file-paste", command: () => console.log("Paste") },
    { separator: true },
    { label: "Delete", icon: "pi pi-trash", command: () => console.log("Delete") },
  ];

  autorun(() => {
    if (SceneStore.UI.contextMenu.visible) {
      const mouseEvent = new MouseEvent("contextmenu", {
        bubbles: true,
        clientX: SceneStore.UI.contextMenu.x,
        clientY: SceneStore.UI.contextMenu.y,
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      cm.current?.show(mouseEvent);
    }
  });

  return <ContextMenu model={items} ref={cm} />;
};

export default observer(SceneContextMenu);
