import { type MutableRefObject, useRef } from "react";
import type { Canvas } from "fabric";
import { Button, type ButtonProps } from "primereact/button";
import { ImageIcon } from "../../../icons";
import handleImageUpload from "../handleImageUpload";

type UploadImageButtonProps = ButtonProps & { canvasRef: MutableRefObject<Canvas | null> };
const UploadImageButton = ({ canvasRef }: UploadImageButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!canvasRef.current) return null;
  const canvas = canvasRef.current;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            handleImageUpload(canvas, file);
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
    </>
  );
};

export default UploadImageButton;
