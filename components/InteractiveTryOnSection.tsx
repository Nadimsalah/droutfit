"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RotateCcw, Sparkles, CheckCircle2 } from "lucide-react";
import { optimizeImageForGemini } from "@/lib/image-processing";

export default function InteractiveTryOnSection({
    dict,
    locale,
    demoImage
}: {
    dict: any,
    locale: string,
    demoImage: string | null
}) {
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const garmentUrl = demoImage || "/alaska-jacket.webp";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedImage(URL.createObjectURL(file));
        setResultImage(null);
        setErrorMsg(null);
        setStatus("processing");
        setProgress(0);

        (async () => {
            const interval = setInterval(() => setProgress(p => p >= 90 ? p : p + Math.random() * 4 + 1), 400);
            try {
                const { base64, metadata } = await optimizeImageForGemini(file);
                const res = await fetch('/api/generate-demo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userImageUrl: base64, garmentUrl, metadata: { ...metadata, isMobile: window.innerWidth < 768 } })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed");
                if (!data.result_url) throw new Error("No result");
                clearInterval(interval);
                setProgress(100);
                setTimeout(() => { setResultImage(data.result_url); setStatus("success"); }, 300);
            } catch (err: any) {
                clearInterval(interval);
                setErrorMsg(err.message);
                setStatus("error");
            }
        })();
    };

    const reset = () => {
        setStatus("idle"); setResultImage(null); setUploadedImage(null);
        setProgress(0); setErrorMsg(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <section id="demo" className="py-28 px-4 bg-[#050608] relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-blue-600/6 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[140px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">

                {/* Header */}
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">
                        <Sparkles className="h-3 w-3 text-blue-400" />
                        {dict.demoSection?.badge || "Live Demo"}
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.05] mb-5">
                        {dict.demoSection?.title1 || "Try Before You Buy"}
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                            {dict.demoSection?.title2 || "AI Virtual Try-On"}
                        </span>
                    </h2>
                    <p className="text-gray-500 text-lg max-w-lg mx-auto">
                        {dict.demoSection?.description || "Upload your photo and see how this product looks on you — instantly."}
                    </p>
                </div>

                {/* Demo card: product + result */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">

                    {/* Product image */}
                    <div className="rounded-3xl overflow-hidden bg-[#0d1017] border border-white/5 shadow-2xl">
                        <div className="aspect-[3/4] relative">
                            <img src={garmentUrl} alt="Product" className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-center border border-white/10">
                                    {dict.demoSection?.productBrand || "Your Product"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Result / upload area */}
                    <div className="rounded-3xl overflow-hidden bg-[#0d1017] border border-white/5 shadow-2xl">
                        <div className="aspect-[3/4] relative flex items-center justify-center">
                            <AnimatePresence mode="wait">

                                {/* Idle — upload invite */}
                                {status === "idle" && (
                                    <motion.button key="idle"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center cursor-pointer hover:bg-white/5 transition-all group w-full h-full">
                                        <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-300">
                                            <Camera className="h-9 w-9 text-gray-600 group-hover:text-blue-400 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-base mb-1 group-hover:text-blue-400 transition-colors">Your photo here</p>
                                            <p className="text-gray-600 text-sm group-hover:text-gray-400 transition-colors">Upload to see the magic</p>
                                        </div>
                                    </motion.button>
                                )}

                                {/* Processing */}
                                {status === "processing" && (
                                    <motion.div key="processing"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#08090d]">
                                        {uploadedImage && (
                                            <img src={uploadedImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 blur-md scale-110" />
                                        )}
                                        <div className="relative z-10 flex flex-col items-center gap-5">
                                            <div className="relative w-20 h-20">
                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                                                    <motion.circle
                                                        cx="50" cy="50" r="42" fill="none"
                                                        stroke="#3b82f6" strokeWidth="6" strokeLinecap="round"
                                                        strokeDasharray={264}
                                                        animate={{ strokeDashoffset: 264 - (264 * progress) / 100 }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-white font-black text-base">{Math.round(progress)}%</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-400 font-bold text-sm">Generating…</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Success */}
                                {status === "success" && resultImage && (
                                    <motion.div key="success"
                                        initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                                        className="absolute inset-0">
                                        <img src={resultImage} alt="Result" className="w-full h-full object-cover" />
                                        <div className="absolute top-4 left-4">
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg"
                                                style={{ background: 'rgba(34,197,94,0.9)', color: 'white' }}>
                                                <CheckCircle2 className="h-3 w-3" /> Result
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Error */}
                                {status === "error" && (
                                    <motion.div key="error"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                                        <p className="text-red-400 font-bold text-sm">Failed</p>
                                        <p className="text-gray-600 text-xs">{errorMsg}</p>
                                        <button onClick={reset} className="px-5 py-2 bg-white/8 hover:bg-white/12 border border-white/10 rounded-xl text-sm font-bold text-white transition-all">Retry</button>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Single CTA Button */}
                <div className="flex flex-col items-center gap-4 mt-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-[20px] blur-lg opacity-50 group-hover:opacity-80 transition duration-500" />
                    <button
                        onClick={() => {
                            if (status === "success") {
                                reset();
                                setTimeout(() => fileInputRef.current?.click(), 100);
                            } else {
                                fileInputRef.current?.click();
                            }
                        }}
                        disabled={status === "processing"}
                        className="relative px-10 py-5 bg-white text-black rounded-[16px] font-black text-lg flex items-center gap-3 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-2xl"
                    >
                        {status === "processing" ? (
                            <><span className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-black animate-spin" /> Generating…</>
                        ) : (
                            <><Camera className="h-5 w-5" /> {status === "success" ? "Try Another Photo" : (dict.demoSection?.virtualTryon || "Try On — Upload Your Photo")}</>
                        )}
                    </button>
                    </div>
                    <p className="text-gray-700 text-xs font-medium">
                        {dict.demoSection?.guarantee || "Free · No account required · Results in ~10s"}
                    </p>
                </div>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </section>
    );
}
