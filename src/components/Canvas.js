"use client";
import React, { useEffect, useState, useRef } from "react";
import { useTool } from "../context/ToolContext";
import { brushTypes } from "../utils/Brushes";
import { dabImages } from "../utils/Dabs";
import SVGPromptModal from "./SvgPromptModal";
 
import DraggableSVG from "./DraggableSvg.jsx"
let ffmpeg = null;
let fetchFileFn = null;

//  Lazy-load FFmpeg only in browser (SSR safe)
// const getFFmpeg = async () => {
//     if (!ffmpeg) {
//         const { createFFmpeg, fetchFile } = await import("@ffmpeg/ffmpeg");
//         ffmpeg = createFFmpeg({ log: true });
//         fetchFileFn = fetchFile;
//         await ffmpeg.load();
//     }
//     return ffmpeg;
// };

const getFFmpeg = async () => {
    if (!ffmpeg) {
        const ffmpegModule = await import("@ffmpeg/ffmpeg");
        console.log("FFmpeg module:", ffmpegModule); // 👀 check what’s inside

        const createFFmpeg =
            ffmpegModule.createFFmpeg ||
            (ffmpegModule.default && ffmpegModule.default.createFFmpeg);

        const fetchFile =
            ffmpegModule.fetchFile || (ffmpegModule.default && ffmpegModule.default.fetchFile);

        if (!createFFmpeg || !fetchFile) {
            throw new Error("❌ Could not find createFFmpeg or fetchFile export");
        }

        ffmpeg = createFFmpeg({ log: true });
        fetchFileFn = fetchFile;
        await ffmpeg.load();
    }
    return ffmpeg;
};

const Canvas = () => {
    const [drawing, setDrawing] = useState(false);
    const [recording, setRecording] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
    const [filter, setFilter] = useState("none");
    const [resolution, setResolution] = useState("720");
    const [musicFile, setMusicFile] = useState(null);
    const [editing, setEditing] = useState(false);

    const [svgShapes, setSvgShapes] = useState([]);
    const [topZIndex, setTopZIndex] = useState(1);

    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const lastX = useRef(0);
    const lastY = useRef(0);
    const brushImage = useRef(null);

    const {
        settings,
        pushToUndo,
        canvasRef,
        ctxRef,
        previewCanvasRef,
        zoom,
        canvasContainerRef,
        setZoom,
        backgroundImage,
        setBackgroundImage,
    } = useTool();

    const ASPECT_RATIO = 2.5;

    //  Load brush image
    useEffect(() => {
        const dabKey = settings.dabType;
        if (!dabKey || !dabImages[dabKey]) {
            brushImage.current = null;
            return;
        }
        const img = new Image();
        img.onload = () => (brushImage.current = img);
        img.src = dabImages[dabKey];
    }, [settings.dabType]);

    //  Zoom handling
    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        const newZoom = Math.min(Math.max(zoom + delta, 0.2), 5);
        const container = canvasContainerRef.current;
        if (!container || !canvasRef.current) return;
        const rect = container.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        container.style.transformOrigin = `${offsetX}px ${offsetY}px`;
        setZoom(newZoom);
    };

    const handleMove = (id, x, y) => {
        setSvgShapes((prev) =>
            prev.map((shape) => (shape.id === id ? { ...shape, initialPos: { x, y } } : shape))
        );
    };

    const handleDelete = (id) => {
        setSvgShapes((prev) => prev.filter((shape) => shape.id !== id));
    };

    const handleBringToFront = (id) => {
        setTopZIndex((prev) => prev + 1);
        setSvgShapes((prev) =>
            prev.map((shape) => (shape.id === id ? { ...shape, zIndex: topZIndex + 1 } : shape))
        );
    };

    //  Draw background image
    const drawBackgroundImage = () => {
        if (!canvasRef.current || !backgroundImage) return;
        const ctx = ctxRef.current;
        const img = new Image();
        img.onload = () => {
            ctx.fillStyle = "#323232";
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
            updatePreview();
        };
        img.src = backgroundImage;
    };

    const saveToLocalStorage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL("image/png");
        localStorage.setItem("canvas-image", dataUrl);
    };

    // Canvas resize
    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const container = canvas.parentElement;
        const displayWidth = container.offsetWidth;
        const displayHeight = displayWidth / ASPECT_RATIO;

        canvas.width = displayWidth;
        canvas.height = displayHeight;
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#323232";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctxRef.current = ctx;
    };

    useEffect(() => {
        resizeCanvas();
        const handle = () => resizeCanvas();
        window.addEventListener("resize", handle);

        const savedBg = localStorage.getItem("canvas-bg");
        if (savedBg) setBackgroundImage(savedBg);

        const savedCanvasImage = localStorage.getItem("canvas-image");
        if (savedCanvasImage) {
            const img = new Image();
            img.onload = () => {
                if (canvasRef.current && ctxRef.current) {
                    ctxRef.current.drawImage(
                        img,
                        0,
                        0,
                        canvasRef.current.width,
                        canvasRef.current.height
                    );
                    updatePreview();
                }
            };
            img.src = savedCanvasImage;
        }

        return () => window.removeEventListener("resize", handle);
    }, []);

    useEffect(() => {
        drawBackgroundImage();
    }, [backgroundImage]);

    const getOffset = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) / rect.width) * canvasRef.current.width,
            y: ((e.clientY - rect.top) / rect.height) * canvasRef.current.height,
        };
    };

    const updatePreview = () => {
        const mainCanvas = canvasRef.current;
        const previewCanvas = previewCanvasRef.current;
        if (!mainCanvas || !previewCanvas) return;
        const previewCtx = previewCanvas.getContext("2d");
        const scale = 0.25;
        const width = mainCanvas.width * scale;
        const height = mainCanvas.height * scale;
        previewCanvas.width = width;
        previewCanvas.height = height;
        previewCtx.clearRect(0, 0, width, height);
        previewCtx.drawImage(mainCanvas, 0, 0, width, height);
    };

    useEffect(() => {
        console.log("Current tool:", settings.tool);
        console.log("Current brush:", settings.brushType);
    }, [settings]);

    //  Drawing
    const startDrawing = (e) => {
        if (!["brush", "eraser"].includes(settings.tool)) return;
        const ctx = ctxRef.current;
        pushToUndo(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
        setDrawing(true);
        const { x, y } = getOffset(e);
        lastX.current = x;
        lastY.current = y;
        ctx.save();
        ctx.setTransform(zoom, 0, 0, zoom, 0, 0);
        ctx.beginPath();
        ctx.moveTo(x, y);
        console.log("Drawing with tool:", settings.tool);
    };

    const draw = (e) => {
        if (!drawing) return;
        const ctx = ctxRef.current;
        const { x, y } = getOffset(e);

        if (settings.tool === "eraser") {
            ctx.beginPath();
            ctx.moveTo(lastX.current, lastY.current);
            ctx.lineTo(x, y);
            ctx.strokeStyle = "#1e1e1e";
            ctx.lineWidth = settings.size;
            ctx.globalAlpha = 1.0;
            ctx.stroke();
        } else {
            const brush = brushTypes[settings.brushType] || brushTypes.ballpen || brushTypes.pencil;
            if (
                [
                    "dabBrush",
                    "watercolor",
                    "spray",
                    "flat",
                    "dry",
                    "crayon",
                    "waterstamp",
                    "eraserBrush",
                    "pencil",
                ].includes(settings.brushType) &&
                brushImage.current
            ) {
                brush(ctx, x, y, settings, lastX.current, lastY.current, brushImage.current);
            } else {
                brush(ctx, x, y, settings);
            }
        }

        lastX.current = x;
        lastY.current = y;
        updatePreview();
        saveToLocalStorage();
    };

    const endDrawing = () => {
        if (drawing) {
            const ctx = ctxRef.current;
            ctx.closePath();
            ctx.restore();
            setDrawing(false);
        }
    };

    //  Recording
    const toggleRecording = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (!recording) {
            const stream = canvas.captureStream(30);
            const recorder = new MediaRecorder(stream, {
                mimeType: "video/webm;codecs=vp9",
            });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
                recordedChunksRef.current = [];
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
                setShowModal(true);
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setRecording(true);
        } else {
            mediaRecorderRef.current?.stop();
            setRecording(false);
        }
    };

    //  Share video
    const shareVideo = async () => {
        const blob = await fetch(videoUrl).then((r) => r.blob());
        const file = new File([blob], "drawing-recording.webm", { type: "video/webm" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: "My Drawing Recording",
                text: "Check out my digital drawing!",
                files: [file],
            });
        } else {
            alert("Sharing not supported on this browser. Please download manually.");
        }
    };

    //  Edit and export with ffmpeg
    const editAndExport = async () => {
        if (!videoUrl) return;
        setEditing(true);

        try {
            const ff = await getFFmpeg();
            ff.FS("writeFile", "input.webm", await fetchFileFn(videoUrl));
            if (musicFile) {
                ff.FS("writeFile", "music.mp3", await fetchFileFn(musicFile));
            }

            const resolutionCmd = `scale=-2:${resolution}`;
            const filterCmd = filter !== "none" ? `,${filter}` : "";

            const args = [
                "-i",
                "input.webm",
                ...(musicFile ? ["-i", "music.mp3"] : []),
                "-vf",
                `${resolutionCmd}${filterCmd}`,
                ...(musicFile ? ["-shortest"] : []),
                "-c:v",
                "libvpx-vp9",
                "-c:a",
                "libvorbis",
                "output.webm",
            ];

            await ff.run(...args);
            const data = ff.FS("readFile", "output.webm");
            const editedUrl = URL.createObjectURL(new Blob([data.buffer], { type: "video/webm" }));
            setVideoUrl(editedUrl);
            alert("Video edited successfully!");
        } catch (err) {
            console.error("Editing failed:", err);
        } finally {
            setEditing(false);
        }
    };

    return (
        <div className="w-full max-w-[1050px] mx-1 space-y-1">
           <div className="flex items-center space-x-4">
    {/* Outer Circle */}
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#080808] to-[#2d2f2d] flex items-center justify-center">
        <button
            onClick={toggleRecording}
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                recording ? "from-[#ac4e62] to-[#8f4253]" : "from-[#464648] to-[#2d2d30]"
            } flex items-center justify-center shadow-lg`}
            style={{ boxShadow: "4px 4px 4px 0px #00000040" }}
        >
            {recording ? (
                <svg fill="white" viewBox="0 0 24 24" className="w-7 h-7">
                    <rect x="6" y="6" width="12" height="12" />
                </svg>
            ) : (
                <svg fill="#4080C5" viewBox="0 0 24 24" className="w-7 h-7 ml-1">
                    <path d="M8 5v14l11-7z" />
                </svg>
            )}
        </button>
    </div>

    {/* Text */}
    <span className="text-gray-400 text-lg">
        {recording ? "Stop Recording" : "Start Recording"}
    </span>

    {/* Force the modal button to be inline */}
    <div className="inline-flex ml-4">
        <SVGPromptModal setSvgShapes={setSvgShapes} />
    </div>
</div>


            <div ref={canvasContainerRef}>
                <canvas
                    ref={canvasRef}
                    className={`rounded-[12px] bg-[#323232] block p-0 w-full h-auto ${
                        settings.tool === "brush"
                            ? "cursor-crosshair"
                            : settings.tool === "eraser"
                            ? "cursor-cell"
                            : settings.tool === "fill"
                            ? "cursor-pointer"
                            : "cursor-default"
                    }`}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                />

                {svgShapes.map((shape) => (
                    <DraggableSVG
                        key={shape.id}
                        id={shape.id}
                        svgMarkup={shape.svgMarkup}
                        initialPos={shape.initialPos}
                        zIndex={shape.zIndex}
                        onMove={handleMove}
                        onDelete={handleDelete}
                        onBringToFront={handleBringToFront}
                    />
                ))}
            </div>

            {/*  Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[9999]  ">
                    <div
                        className="bg-[#1E1E1E] p-6 rounded-lg w-[500px] space-y-4 border-2 border-[#363434]"
                        style={{ boxShadow: "9px 9px 4px 0px #00000040" }}
                    >
                        <h2 className="text-lg font-semibold text-[#d8d7d3]">Video Preview</h2>
                        <video src={videoUrl} controls className="rounded-md w-full"></video>

                        <div className="space-y-2 text-[#b9b8b4]">
                            <label className="block text-sm">Resolution:</label>
                            <select
                                className="flex flex-row w-[100%] mt-3 p-1 px-5   border border-[#363434] rounded-[7px]   bg-gradient-to-r from-[#292A29] to-[#1B1B1C] shadow-xl"
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                            >
                                <option value="480">480p</option>
                                <option value="720">720p</option>
                                <option value="1080">1080p</option>
                            </select>

                            <label className="block text-sm mt-2">Filter:</label>
                            <select
                                className="flex flex-row w-[100%] mt-3 p-1 px-5 border border-[#363434] rounded-[7px]   bg-gradient-to-r from-[#292A29] to-[#1B1B1C] shadow-xl"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="none">None</option>
                                <option value="hue=s=0">Grayscale</option>
                                <option value="eq=brightness=0.1">Brighten</option>
                                <option value="noise=alls=20:allf=t">Noise</option>
                            </select>

                            <label className="block text-sm mt-2">Add Background Music:</label>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setMusicFile(e.target.files[0])}
                            />
                        </div>

                        {/* <div className="flex justify-between mt-4">
                            <button
                                className="bg-[#9e44edcb] text-white px-4 py-2 rounded"
                                onClick={() => {
                                    const a = document.createElement("a");
                                    a.href = videoUrl;
                                    a.download = "drawing-recording.webm";
                                    a.click();
                                }}
                            >
                                Download
                            </button>
                            <button
                                className="bg-[#c740d9bf] text-white px-4 py-2 rounded"
                                onClick={shareVideo}
                            >
                                Share
                            </button>
                            <button
                                className="bg-[#db3dd1c7] text-white px-4 py-2 rounded"
                                disabled={editing}
                                onClick={editAndExport}
                            >
                                {editing ? "Editing..." : "Edit & Export"}
                            </button>
                            <button
                                className="bg-[#f439c8c0] text-white px-4 py-2 rounded"
                                onClick={() => setShowModal(false)}
                            >
                                Close
                            </button>
                        </div> */}
                        <div className="flex justify-between mt-4">
                            <button
                                className="bg-[#9e44ed45] text-[#c48bf6] px-4 py-2 rounded [text-shadow:1px_1px_3px_rgba(0,0,0,0.6)]"
                                onClick={() => {
                                    const a = document.createElement("a");
                                    a.href = videoUrl;
                                    a.download = "drawing-recording.webm";
                                    a.click();
                                }}
                            >
                                Download
                            </button>

                            <button
                                className="bg-[#c740d956] text-[#f081ff] px-4 py-2 rounded [text-shadow:1px_1px_3px_rgba(0,0,0,0.6)]"
                                onClick={shareVideo}
                            >
                                Share
                            </button>

                            <button
                                className="bg-[#db3dd13a] text-[#f475ec] px-4 py-2 rounded [text-shadow:1px_1px_3px_rgba(0,0,0,0.6)]"
                                disabled={editing}
                                onClick={editAndExport}
                            >
                                {editing ? "Editing..." : "Edit & Export"}
                            </button>

                            <button
                                className="bg-[#f439c84d] text-[#f88bdf] px-4 py-2 rounded [text-shadow:1px_1px_3px_rgba(0,0,0,0.6)]"
                                onClick={() => setShowModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Canvas;
