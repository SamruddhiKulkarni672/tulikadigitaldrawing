// "use client";
// import React from "react";
// import { useTool } from "../context/ToolContext";

// import Select from "@/assets/Select";
// import Fill from "@/assets/Fill";
// import Undo from "@/assets/Undo";
// import Redo from "@/assets/Redo";
// import Save from "@/assets/Save";
// import Rect from "@/assets/Rect.js";
// import BrushIcon from "@/assets/BrushIcon";
// import Clear from "@/assets/Clear";
// import Pallet from "@/assets/Pallet";

// const Toolbar = ({ onClear }) => {
//     const { settings, setSettings, undo, redo, clearCanvas, setBackgroundImage } = useTool();

//     const setTool = (tool) => {
//         setSettings({ ...settings, tool });
//     };

//     const handleSelectTool = () => {
//         setTool("cursor");
//         const bg = "/brushes/waterpaper.jpg";
//         setBackgroundImage(bg);
//     };

//     const getIconClasses = (toolName) =>
//         `${settings.tool === toolName ? "text-[#4080C5]" : "text-[#B3B1B1]"} 
//          w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-10 lg:h-10 xl:w-12 xl:h-12`;

//     return (
//         <div
//             className="flex flex-col gap-4 md:gap-4 lg:gap-6 p-2 bg-[#222222] h-auto border border-[#363434] rounded-[10px] sm:rounded-[12px] md:rounded-[14px] lg:rounded-[16px] items-center w-full"
//             style={{
//                 boxShadow: `
//                4px 4px 8px 0px #00000040,     
//                 -4px -4px 8px 0px #534D4D80     
//                         `,
//             }}
//         >
//             <button className="mt-10 cursor-pointer" onClick={handleSelectTool}>
//                 <Select className={getIconClasses("cursor")} />
//             </button>
//             <button className="cursor-pointer" onClick={() => setTool("brush")}>
//                 <BrushIcon className={getIconClasses("brush")} />
//             </button>
//             <button className="cursor-pointer" onClick={() => setTool("pallet")}>
//                 <Pallet className={getIconClasses("fill")} />
//             </button>
//             <button className="cursor-pointer" onClick={() => setTool("shape")}>
//                 <Rect className={getIconClasses("shape")} />
//             </button>
//             <button className="cursor-pointer" onClick={undo}>
//                 <Undo className="text-[#B3B1B1] w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12" />
//             </button>
//             <button className="cursor-pointer" onClick={redo}>
//                 <Redo className="text-[#B3B1B1] w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12" />
//             </button>

//             <button className="cursor-pointer" onClick={clearCanvas}>
//                 <Clear className="text-[#B3B1B1] w-8 h-8 sm:w-8 sm:h-8 md:w-8 md:h-8lg:w-8 lg:h-8 xl:w-10 xl:h-10" />
//             </button>
//         </div>
//     );
// };

// export default Toolbar;




"use client";
import React, { useState } from "react";
import { useTool } from "../context/ToolContext";

import Select from "../assets/Select";
import Undo from "../assets/Undo";
import Redo from "../assets/Redo";
import Rect from "../assets/Rect.js";
import BrushIcon from "../assets/BrushIcon";
import Clear from "../assets/Clear";
import Pallet from "../assets/Pallet";

import ColorHistoryModal from "./ColorHistoryModal";

const Toolbar = () => {
  const {
    settings,
    setSettings,
    undo,
    redo,
    clearCanvas,
    setBackgroundImage,
    addToColorHistory,
  } = useTool();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const setTool = (tool) => {
    setSettings({ ...settings, tool });
  };

  const handleSelectTool = () => {
    setTool("cursor");
    const bg = "/brushes/waterpaper.jpg";
    setBackgroundImage(bg);
  };

  const handlePalletClick = () => {
    addToColorHistory(settings.color); // save current color before opening
    setIsModalOpen(!isModalOpen);
  };

  const getIconClasses = (toolName) =>
    `${settings.tool === toolName ? "text-[#4080C5]" : "text-[#B3B1B1]"} 
     w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-10 lg:h-10 xl:w-12 xl:h-12`;

  return (
    <div className="relative">
      <div
        className="flex flex-col gap-4 md:gap-4 lg:gap-6 p-2 bg-[#222222] h-auto border border-[#363434] rounded-[10px] sm:rounded-[12px] md:rounded-[14px] lg:rounded-[16px] items-center w-full"
        style={{
          boxShadow: `
           4px 4px 8px 0px #00000040,     
            -4px -4px 8px 0px #534D4D80     
                    `,
        }}
      >
        <button className="mt-10 cursor-pointer" onClick={handleSelectTool}>
          <Select className={getIconClasses("cursor")} />
        </button>

        <button className="cursor-pointer" onClick={() => setTool("brush")}>
          <BrushIcon className={getIconClasses("brush")} />
        </button>

        <button className="cursor-pointer" onClick={handlePalletClick}>
          <Pallet className={getIconClasses("pallet")} />
        </button>

        <button className="cursor-pointer" onClick={() => setTool("shape")}>
          <Rect className={getIconClasses("shape")} />
        </button>

        <button className="cursor-pointer" onClick={undo}>
          <Undo className="text-[#B3B1B1] w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12" />
        </button>

        <button className="cursor-pointer" onClick={redo}>
          <Redo className="text-[#B3B1B1] w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12" />
        </button>

        <button className="cursor-pointer" onClick={clearCanvas}>
          <Clear className="text-[#B3B1B1] w-8 h-8 sm:w-8 sm:h-8 md:w-8 md:h-8 lg:w-8 lg:h-8 xl:w-10 xl:h-10" />
        </button>
      </div>

      {/* Color History Modal */}
      <ColorHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Toolbar;
