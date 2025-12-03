"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

const DraggableSVG = ({
  id,
  svgMarkup,
  initialPos,
  zIndex,
  onMove,
  onDelete,
  onBringToFront,
}) => {
  const [position, setPosition] = useState(initialPos);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;  
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    onBringToFront(id);
    setShowMenu(false);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;
    setPosition({ x: newX, y: newY });
    onMove(id, newX, newY);
  };

  const handleMouseUp = () => setDragging(false);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowMenu(true);
    onBringToFront(id);
  };

  return (
    <div
      className="absolute"
      style={{
        left: position.x,
        top: position.y,
        zIndex: zIndex,
        cursor: dragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Right-click menu */}
      {showMenu && (
        <div className="flex justify-end items-center bg-black/50 backdrop-blur-sm rounded-t p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="text-red-500 hover:text-red-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SVG content */}
      <div
        className="  "
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </div>
  );
};

export default DraggableSVG;
