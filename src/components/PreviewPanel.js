import React, { useRef, useState, useEffect } from "react";
import Save from "../assets/Save";
import Print from "../assets/Print";
import ZoomIn from "../assets/ZoomIn";
import ZoomOut from "../assets/ZoomOut";
import AddReference from "../assets/AddReference";
import RemoveReference from "../assets/RemoveReference";
import { useTool } from "../context/ToolContext";
import defaultRefImage from "../assets/refImage.png";

function PreviewPanel() {
    const { previewCanvasRef, zoomIn, zoomOut,zoom, saveCanvas, canvasContainerRef  } = useTool();
    const [refImageUrl, setRefImageUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setRefImageUrl(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (canvasContainerRef.current) {
            canvasContainerRef.current.style.transform = `scale(${zoom})`;
            canvasContainerRef.current.style.transformOrigin = "top left";  
        }
    }, [zoom]);

    const removeImage = () => {
        setRefImageUrl(null);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className="flex flex-col w-full bg-[#222222] border border-[#363434] rounded-[16px] items-center"
            style={{ boxShadow: "9px 9px 4px 0px #00000040" }}
        >
            {/* Toolbar */}
            <div className="flex flex-row w-[90%] mt-3 p-1 border border-[#363434] rounded-[12px] items-center justify-evenly bg-gradient-to-r from-[#292A29] to-[#1B1B1C] shadow-md">
                <button className="cursor-pointer" onClick={zoomIn}>
                    <ZoomIn />
                </button>
                <button className="cursor-pointer" onClick={zoomOut}>
                    <ZoomOut />
                </button>
                <button className="cursor-pointer" onClick={saveCanvas}>
                    <Save />
                </button>
                <button className="cursor-pointer">
                    <Print />
                </button>
            </div>

            {/* Canvas Preview */}
            <div className="flex mt-2 w-full items-center justify-center rounded-[12px]">
                <canvas ref={previewCanvasRef} className="rounded-[10px] my-3" />
            </div>

            {/* Reference Image Tools */}
            <div className="flex mt-2 w-[90%] items-center justify-center rounded-[12px]">
                <div className="flex flex-row justify-between items-center w-full px-2">
                    <label className="text-sm m-1">Reference image</label>
                    <div className="flex gap-2">
                        <button className="cursor-pointer" onClick={triggerFileInput}>
                            <AddReference />
                        </button>
                        <button className="cursor-pointer" onClick={removeImage}>
                            <RemoveReference />
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                id="fileInput"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />

            {/* Image Preview */}
            <div
                className="w-[80%] h-[45%] bg-cover bg-no-repeat bg-center rounded-[10px] mt-2 mb-2"
                style={{
                    backgroundImage: `url(${refImageUrl || defaultRefImage.src})`,
                    backgroundColor: "#eee",
                }}
            />
        </div>
    );
}

export default PreviewPanel;
