"use client";
import React, { useState } from "react";
 import { DraggableSVG } from "./DraggableSvg.jsx";

let nextId = 0;

const SVGPromptModal = () => {
  const [prompt, setPrompt] = useState("");
  const [svgShapes, setSvgShapes] = useState([]);

  const generateSVG = async () => {
    try {
      const res = await fetch("/api/generate-svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error Response:", text);
        return;
      }

      const data = await res.json();
      if (data?.svg) {
        setSvgShapes((prev) => [
          ...prev,
          {
            id: nextId++,
            markup: data.svg,
            x: 100,
            y: 100,
            z: prev.length + 1,
          },
        ]);
      } else {
        console.error("No SVG received", data);
      }
    } catch (error) {
      console.error("Error generating SVG:", error);
    }
  };

  const updatePosition = (id, x, y) => {
    setSvgShapes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x, y } : s))
    );
  };

  const deleteShape = (id) => {
    setSvgShapes((prev) => prev.filter((shape) => shape.id !== id));
  };

  const bringToFront = (id) => {
    const maxZ = Math.max(...svgShapes.map((s) => s.z));
    setSvgShapes((prev) =>
      prev.map((shape) => (shape.id === id ? { ...shape, z: maxZ + 1 } : shape))
    );
  };

  return (
    <>
      {/* Prompt Box */}
<div className="fixed top-4 left-[40%] z-20 p-1 ">
        <div className="flex items-center bg-gradient-to-br from-[#1c1c1c] to-[#2a2a2a] rounded-full shadow-lg px-2 py-1">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe a shape"
            className="bg-transparent text-white px-4 py-2 focus:outline-none flex-1 placeholder-gray-400"
          />
          <div className="ml-2 p-[2px] rounded-full bg-gradient-to-b from-[#282829] to-[#171616]">
            <button
              onClick={generateSVG}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#171717] to-[#242522] hover:opacity-90 transition-all shadow-inner"
            >
              <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
                ✨ Generate
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Render all draggable SVGs */}
      {svgShapes.map((shape) => (
        <DraggableSVG
          key={shape.id}
          id={shape.id}
          svgMarkup={shape.markup}
          initialPos={{ x: shape.x, y: shape.y }}
          zIndex={shape.z}
          onMove={updatePosition}
          onDelete={deleteShape}
          onBringToFront={bringToFront}
        />
      ))}
    </>
  );
};

export default SVGPromptModal;








 
