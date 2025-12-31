import { type Canvas, FabricImage } from "fabric";
import SceneStore from "../../store/SceneStore";

const handleImageUpload = (canvas: Canvas, file: File) => {
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result as string;
    console.log("dataUrl", dataUrl);
    // use fabric.Image.fromURL to create image
    console.log("dataUrl", reader);
    FabricImage.fromURL(dataUrl, { crossOrigin: "anonymous" }).then((img) => {
      console.log("Image loaded:", img);
      const cw = canvas.getWidth() || 800;
      const ch = canvas.getHeight() || 600;
      const padding = 20;
      const maxW = Math.max(10, cw - padding * 2);
      const maxH = Math.max(10, ch - padding * 2);

      const iw = img.width ?? 0;
      const ih = img.height ?? 0;
      if (iw > 0 && ih > 0) {
        const scale = Math.min(maxW / iw, maxH / ih, 1);
        img.set({ scaleX: scale, scaleY: scale });
      }

      img.set({ selectable: true, objectCaching: true });
      img.layerUUID = SceneStore.activeLayerId;
      canvas.add(img);
      canvas.centerObject(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
      // setTool("select");
    });
  };
  reader.onerror = () => {
    console.warn("Failed to read image file");
  };
  reader.readAsDataURL(file);
};
export default handleImageUpload;
