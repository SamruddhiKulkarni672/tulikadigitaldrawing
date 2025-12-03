"use client";
import React, { Fragment, useState, useEffect } from "react";
import { useTool } from "../context/ToolContext";
import Wheel from "@uiw/react-color-wheel";
import { hsvaToHex } from "@uiw/color-convert";
import { brushToDabMap } from "../utils/BrushDabMap";
import ShadeSlider from "@uiw/react-color-shade-slider";

import CustomEraser from "../assets/EraserIcon.js";
import FlatBrush from "../assets/FlatBrush";
import Marker from "../assets/Marker";
import Blender from "../assets/Blender";
import OilPaint from "../assets/OilPaint";
import Pencil from "../assets/Pencil";
import Sketchpen from "../assets/Sketchpen";
import Spray from "../assets/Spray";
import DryBrush from "../assets/DryBrush";
import Crayon from "../assets/Crayon";
import Waterstamp from "../assets/WaterStamp";
import BallPen from "../assets/BallPen";

const DrawPanel = () => {
    const { settings, setSettings } = useTool();
    const [hsva, setHsva] = useState({
        h: 214,
        s: 43,
        v: 90,
        a: settings.opacity,
    });

    useEffect(() => {
        const hex = hsvaToHex(hsva);
        setSettings((prev) => ({
            ...prev,
            color: hex,
            opacity: hsva.a,
        }));
    }, [hsva, setSettings]);

    return (
        <div className="flex flex-row w-full">
            {/* Color picker */}
            <div className="flex flex-col mt-0 p-1 lg:ml-2 xl:ml-4  w-[13%] ">
                <Fragment>
                    <div className="transform scale-[75%] origin-top-left">
                        <Wheel
                            color={hsva}
                            onChange={(color) => setHsva({ ...hsva, ...color.hsva })}
                        />
                    </div>
                </Fragment>
            </div>

            {/* Brush settings */}
            <div className="flex flex-col  w-[30%]">
                <div
                    className="flex flex-col m-3 rounded-[12px] mt-0 bg-[#222222] border border-[#2B2929]"
                    style={{ boxShadow: "4px 4px 4px 0px #00000040" }}
                >
                    <div className="flex flex-col mx-2 p-2 py-1">
                        <label className="block text-md ml-6">Brush Size</label>
                        <div className="flex justify-center items-center w-full">
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={settings.size}
                                onChange={(e) =>
                                    setSettings({ ...settings, size: +e.target.value })
                                }
                                className="w-[85%] h-3 custom-range"
                                style={{
                                    height: 10,
                                    width: "90%",
                                    background: `linear-gradient(to right, #4F4D4D 0%, #4F4D4D ${
                                        ((settings.size - 1) / 49) * 100
                                    }%, #000000 ${
                                        ((settings.size - 1) / 49) * 100
                                    }%, #000000 100%)`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col m-2 p-2 pt-0 mt-0">
                        <label className="block text-md ml-6">Opacity</label>
                        <div className="flex justify-center items-center w-full">
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.01"
                                value={settings.opacity}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        opacity: parseFloat(e.target.value),
                                    })
                                }
                                className="w-[85%] h-3 custom-range"
                                style={{
                                    height: 10,
                                    width: "90%",
                                    background: `linear-gradient(to right, #4F4D4D 0%, #4F4D4D ${
                                        (settings.opacity - 0.1) * 111.11
                                    }%, #000000 ${
                                        (settings.opacity - 0.1) * 111.11
                                    }%, #000000 100%)`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div
                    className="flex flex-row ml-3 w-[95%] mt-3 mx-2 p-3 border border-[#2D2C2C] rounded-[12px] items-center justify-evenly bg-gradient-to-r from-[#1B1B1C] to-[#292A29] shadow-md"
                    style={{ boxShadow: "4px 4px 4px 0px #00000040" }}
                >
                    <Fragment>
                        <ShadeSlider
                            className="rounded-2xl"
                            radius={12}
                            hsva={hsva}
                            style={{ width: "80%", marginTop: 2, height: 20 }}
                            onChange={(newShade) => {
                                setHsva({ ...hsva, ...newShade });
                            }}
                            pointer={({ color, style }) => (
                                <div style={style}>
                                    <div
                                        style={{
                                            width: 12,
                                            height: 12,
                                            backgroundColor: color,
                                        }}
                                    />
                                </div>
                            )}
                        />
                    </Fragment>
                </div>
            </div>

            {/* Brush selector */}
            <div className="flex w-[54%] overflow-x-auto whitespace-nowrap p-2 scroll-smooth">
                {/* Eraser */}
                <div
                    className="flex justify-center items-center flex-col ml-14 mt-8"
                    onClick={() =>
                        setSettings((prev) => ({
                            ...prev,
                            tool: "brush",
                            brushType: "eraserBrush",
                            dabType: brushToDabMap["eraserBrush"] || null,
                        }))
                    }
                >
                    <CustomEraser width={50} height={100} />

                    {settings.brushType === "eraserBrush" ? (
                        <div className="flex h-2 w-[40px] bg-[#4080C5] rounded-full"></div>
                    ) : (
                        <div></div>
                    )}
                </div>

                {/* Pencil */}
                <div
                    className="flex justify-center items-center flex-col mt-0"
                    onClick={() =>
                        setSettings((prev) => ({
                            ...prev,
                            tool: "brush",
                            brushType: "pencil",
                            dabType: brushToDabMap["pencil"] || null,
                        }))
                    }
                >
                    <Pencil width={80} height={160} />
                    {settings.brushType === "pencil" ? (
                        <div className="flex h-2 w-[40px] bg-[#4080C5] rounded-full"></div>
                    ) : (
                        <div></div>
                    )}
                </div>

                {/* ballpen  */}
                 <div
                    className="flex justify-center items-center flex-col mt-0"
                    onClick={() =>
                        setSettings((prev) => ({
                            ...prev,
                            tool: "brush",
                            brushType: "ballpen",
                            dabType: brushToDabMap["ballpen"] || null,
                        }))
                    }
                >
                    <BallPen width={80} height={160} />
                    {settings.brushType === "ballpen" ? (
                        <div className="flex h-2 w-[40px] bg-[#4080C5] rounded-full"></div>
                    ) : (
                        <div></div>
                    )}
                </div>

                {/* Flat Brush */}
                <div
                    className="flex justify-center items-center flex-col mt-0"
                    onClick={() =>
                        setSettings((prev) => ({
                            ...prev,
                            tool: "brush",
                            brushType: "flat",
                            dabType: brushToDabMap["flat"],
                        }))
                    }
                >
                    <FlatBrush width={70} height={160} />
                    {settings.brushType === "flat" ? (
                        <div className="flex h-2 w-[40px] bg-[#4080C5] rounded-full"></div>
                    ) : (
                        <div></div>
                    )}
                </div>

                {/* Dab Brush */}
                <div
                    className="flex justify-center items-center flex-col mt-2"
                    onClick={() =>
                        setSettings((prev) => ({
                            ...prev,
                            tool: "brush",
                            brushType: "dabBrush",
                            dabType: brushToDabMap["dabBrush"],
                        }))
                    }
                >
                    <Sketchpen width={70} height={160} />
                    {settings.brushType === "dabBrush" ? (
                        <div className="flex h-2 w-[40px] bg-[#4080C5] rounded-full"></div>
                    ) : (
                        <div></div>
                    )}
                </div>

                {/* Blender */}
                <div
                    className="flex justify-center items-center flex-col mt-2"
                    onClick={() =>
                        setSettings((prev) => ({
                            ...prev,
                            tool: "brush",
                            brushType: "blender",
                            dabType: brushToDabMap["blender"] || null,
                        }))
                    }
                >
                    <Blender width={70} height={160} />
                    {settings.brushType === "blender" ? (
                        <div className="flex h-2 w-[40px] bg-[#4080C5] rounded-full"></div>
                    ) : (
                        <div></div>
                    )}
                </div>

                {/* Watercolor */}
                <div
                    className="flex justify-center items-center flex-col mt-2"
                    onClick={() =>
                        setSettings((prev) => ({
                            ...prev,
                            tool: "brush",
                            brushType: "watercolor",
                            dabType: brushToDabMap["watercolor"] || null,
                        }))
                    }
                >
                    <Marker width={70} height={160} />
                    {settings.brushType === "watercolor" ? (
                        <div className="flex h-2 w-[40px] bg-[#4080C5] rounded-full"></div>
                    ) : (
                        <div></div>
                    )}
                </div>

                {/* Oil */}
                <div
                    className="flex justify-center items-center flex-col mt-0"
                    onClick={() =>
                        setSettings((prev) => ({
                            ...prev,
                            tool: "brush",
                            brushType: "oil",
                            dabType: brushToDabMap["oil"] || null,
                        }))
                    }
                >
                    <OilPaint width={70} height={160} />
                    {settings.brushType === "oil" ? (
                        <div className="flex h-2 w-[40px] bg-[#4080C5] rounded-full"></div>
                    ) : (
                        <div></div>
                    )}
                </div>

                {/* spray */}
                <div
                    className="flex justify-center items-center flex-col mt-0"
                    onClick={() =>
                        setSettings((prev) => ({
                            ...prev,
                            tool: "brush",
                            brushType: "spray",
                            dabType: brushToDabMap["spray"] || null,
                        }))
                    }
                >
                    <Spray width={100} height={170} />

                    {settings.brushType === "spray" ? (
                        <div className="flex h-2 justify-center items-center w-[60px] bg-[#4080C5] rounded-full"></div>
                    ) : (
                        <div></div>
                    )}
                </div>

                {/* Dry Brush */}
                <div
                    className="flex justify-center items-center flex-col mt-0"
                    onClick={() =>
                        setSettings((prev) => ({
                            ...prev,
                            tool: "brush",
                            brushType: "dry",
                            dabType: brushToDabMap["dry"] || null,
                        }))
                    }
                >
                    <DryBrush width={70} height={160} />
                    {settings.brushType === "dry" ? (
                        <div className="flex h-2 w-[40px] bg-[#4080C5] rounded-full"></div>
                    ) : (
                        <div></div>
                    )}
                </div>

                {/* Crayon */}
                <div
                    className="flex justify-center items-center flex-col mt-0"
                    onClick={() =>
                        setSettings((prev) => ({
                            ...prev,
                            tool: "brush",
                            brushType: "crayon",
                            dabType: brushToDabMap["crayon"] || null,
                        }))
                    }
                >
                    <Crayon width={70} height={160} />
                    {settings.brushType === "crayon" ? (
                        <div className="flex h-2 w-[40px] bg-[#4080C5] rounded-full"></div>
                    ) : (
                        <div></div>
                    )}
                </div>

                {/* Waterstamp */}
                <div
                    className="flex justify-center items-center flex-col mt-0"
                    onClick={() =>
                        setSettings((prev) => ({
                            ...prev,
                            tool: "brush",
                            brushType: "waterstamp",
                            dabType: brushToDabMap["waterstamp"] || null,
                        }))
                    }
                >
                    <Waterstamp width={70} height={160} />
                    {settings.brushType === "waterstamp" ? (
                        <div className="flex h-2 w-[40px] bg-[#4080C5] rounded-full"></div>
                    ) : (
                        <div></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DrawPanel;
