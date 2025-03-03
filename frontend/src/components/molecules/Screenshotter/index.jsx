import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";

const ScreenshotWrapper = ({ children }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const containerRef = useRef(null);

  const startScreenshot = () => {
    setIsSelecting(true);
    setSelectionBox(null); // Reset selection box on new action
  };

  const handleMouseDown = (e) => {
    if (!isSelecting) return;

    const { offsetLeft, offsetTop } =
      containerRef.current.getBoundingClientRect();
    const { clientX: startX, clientY: startY } = e;

    setSelectionBox({
      startX: startX - offsetLeft,
      startY: startY - offsetTop,
      width: 0,
      height: 0,
    });
  };

  const handleMouseMove = (e) => {
    if (!isSelecting || !selectionBox) return;

    const { startX, startY } = selectionBox;
    const { offsetLeft, offsetTop } =
      containerRef.current.getBoundingClientRect();
    const { clientX: currentX, clientY: currentY } = e;

    const width = Math.abs(currentX - offsetLeft - startX);
    const height = Math.abs(currentY - offsetTop - startY);

    setSelectionBox({
      startX: Math.min(startX, currentX - offsetLeft),
      startY: Math.min(startY, currentY - offsetTop),
      width,
      height,
    });
  };

  const handleMouseUp = async () => {
    if (!isSelecting) return;

    setIsSelecting(false);

    if (selectionBox) {
      await captureScreenshot(selectionBox);
      setSelectionBox(null);
    }
  };

  const captureScreenshot = async (box) => {
    if (!containerRef.current) return;

    const canvas = await html2canvas(containerRef.current);
    const context = canvas.getContext("2d");

    const { startX, startY, width, height } = box;

    // Crop the canvas
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const croppedContext = croppedCanvas.getContext("2d");

    croppedContext.drawImage(
      canvas,
      startX,
      startY,
      width,
      height,
      0,
      0,
      width,
      height
    );

    // Convert cropped canvas to an image
    const croppedImage = croppedCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = croppedImage;
    link.download = "screenshot.png";
    link.click();
  };

  return (
    <div>
      <button
        onClick={startScreenshot}
        style={{
          marginBottom: "10px",
          padding: "10px 15px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Take Screenshot
      </button>
      <div
        ref={containerRef}
        style={{ position: "relative", backgroundColor: "red" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {children}
        {/* <div
          style={{ width: "500px", height: "500px", backgroundColor: "blue" }}
        ></div> */}
        {selectionBox && (
          <div
            style={{
              position: "absolute",
              border: "2px dashed #007bff",
              backgroundColor: "rgba(0, 123, 255, 0.2)",
              left: selectionBox.startX,
              top: selectionBox.startY,
              width: selectionBox.width,
              height: selectionBox.height,
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ScreenshotWrapper;
