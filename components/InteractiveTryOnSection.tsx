"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RotateCcw, Sparkles, ArrowRight, CheckCircle2, AlertCircle, ShoppingCart, Zap } from "lucide-react";
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
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const garmentUrl = demoImage || "/alaska-jacket.webp";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedImage(URL.createObjectURL(file));
            setResultImage(null);
            setErrorMsg(null);
            setStatus("processing");
            handleTryOn(file);
        }
    };

    const handleTryOn = async (file: File) => {
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(p => p >= 90 ? p : p + Math.random() * 5 + 1);
        }, 400);
        try {
            const { base64: base64Image, metadata } = await optimizeImageForGemini(file);
            const res = await fetch('/api/generate-demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userImageUrl: base64Image, garmentUrl, metadata: { ...metadata, isMobile: window.innerWidth < 768 } })
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
    };

    const reset = () => {
        setStatus("idle"); setUploadedImage(null);
        setResultImage(null); setProgress(0); setErrorMsg(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <section id="demo" className="py-28 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #f8f6f2 0%, #eef0f7 50%, #f0eef8 100%)' }}>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #c7d2fe 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #ddd6fe 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-6" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                        <Sparkles className="h-3 w-3" />
                        {dict.demoSection?.badge || "AI-Powered Technology"}
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-5" style={{ color: '#0f0f1a' }}>
                        {dict.demoSection?.title1 || "Demo Your Store"}<br />
                        <span style={{ color: '#6366f1' }}>{dict.demoSection?.title2 || "with AI Try-On"}</span>
                    </h2>
                    <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
                        {dict.demoSection?.description || "Test our hyper-realistic AI instantly. Give your customers the confidence to buy."}
                    </p>
                </div>

                {/* Demo Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

                    {/* ── Left: Big Visual ── */}
                    <div className="relative">
                        {/* Tag label */}
                        <div className="absolute -top-4 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg" style={{ background: '#6366f1', color: 'white' }}>
                            <Zap className="h-3 w-3" />
                            {dict.demoSection?.environment || "Live Demo"}
                        </div>

                        <div className="rounded-[32px] overflow-hidden shadow-2xl" style={{ aspectRatio: '4/5', maxHeight: '600px', background: '#e2e5f0', position: 'relative' }}>
                            <AnimatePresence mode="wait">
                                {status === "idle" && (
                                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                                        <img src={garmentUrl} alt="Product" className="w-full h-full object-cover" />
                                        {/* Upload overlay hint */}
                                        <div className="absolute inset-0 flex flex-col items-end justify-end p-8">
                                            <div className="px-5 py-3 rounded-2xl backdrop-blur-md shadow-xl text-sm font-bold flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.9)', color: '#0f0f1a' }}>
                                                <Camera className="h-4 w-4" style={{ color: '#6366f1' }} />
                                                Upload your photo to try on →
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {status === "processing" && (
                                    <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-8" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
                                        {uploadedImage && (
                                            <img src={uploadedImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 blur-lg scale-110" />
                                        )}
                                        <div className="relative z-10 flex flex-col items-center gap-6">
                                            {/* Animated spinner */}
                                            <div className="relative w-28 h-28">
                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                                                    <motion.circle
                                                        cx="50" cy="50" r="42" fill="none"
                                                        stroke="url(#grad)" strokeWidth="5" strokeLinecap="round"
                                                        strokeDasharray={264}
                                                        animate={{ strokeDashoffset: 264 - (264 * progress) / 100 }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                    <defs>
                                                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                            <stop offset="0%" stopColor="#818cf8" />
                                                            <stop offset="100%" stopColor="#c084fc" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-white font-black text-2xl">{Math.round(progress)}%</span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-black text-lg tracking-tight">Generating…</p>
                                                <p className="text-indigo-300 text-sm mt-1 font-medium">Applying garment to your photo</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {status === "success" && resultImage && (
                                    <motion.div key="success" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="absolute inset-0">
                                        <img src={resultImage} alt="Try-On Result" className="w-full h-full object-cover" />
                                        <div className="absolute top-5 right-5">
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md" style={{ background: 'rgba(34,197,94,0.9)', color: 'white' }}>
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                {dict.demoSection?.tryonResult || "Try-On Result"}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {status === "error" && (
                                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-10 text-center" style={{ background: '#fef2f2' }}>
                                        <AlertCircle className="h-14 w-14" style={{ color: '#ef4444' }} />
                                        <div>
                                            <p className="font-black text-gray-900 mb-2">Something went wrong</p>
                                            <p className="text-sm text-gray-500 leading-relaxed">{errorMsg}</p>
                                        </div>
                                        <button onClick={reset} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95" style={{ background: '#ef4444' }}>Try Again</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>


                    {/* ── Right: Controls Panel ── */}
                    <div className="flex flex-col gap-6">

                        {/* Product card */}
                        <div className="rounded-3xl p-6 shadow-md border" style={{ background: 'white', borderColor: '#e8eaf0' }}>
                            <div className="flex items-center gap-2 mb-4">
                                {[1,2,3,4,5].map(i => (
                                    <span key={i} className={`text-sm ${i <= 5 ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                ))}
                                <span className="text-xs font-medium ml-1" style={{ color: '#94a3b8' }}>(128 reviews)</span>
                            </div>
                            <h3 className="text-xl font-black leading-tight mb-2" style={{ color: '#0f0f1a' }}>
                                {dict.demoSection?.productName || "Let your clients try before they buy"}
                            </h3>
                            <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748b' }}>
                                {dict.demoSection?.productDesc || "Revolutionize your storefront with hyper-realistic AI try-on. Build trust and reduce returns."}
                            </p>
                            <div className="flex items-center gap-4 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#94a3b8' }}>Sale Price</p>
                                    <span className="text-3xl font-black" style={{ color: '#0f0f1a' }}>$50</span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#94a3b8' }}>MSRP</p>
                                    <span className="text-lg font-bold line-through" style={{ color: '#cbd5e1' }}>$65</span>
                                </div>
                            </div>
                        </div>

                        {/* Try-On CTA */}
                        <div className="rounded-3xl p-6 shadow-md border" style={{ background: 'white', borderColor: '#e8eaf0' }}>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>AI Virtual Try-On</p>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={status === "processing"}
                                className="w-full py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg mb-3"
                                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}
                            >
                                {status === "processing" ? (
                                    <><span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Generating…</>
                                ) : status === "success" ? (
                                    <><RotateCcw className="h-5 w-5" /> {dict.demoSection?.tryDifferent || "Try Different Photo"}</>
                                ) : (
                                    <><Camera className="h-5 w-5" /> {dict.demoSection?.virtualTryon || "Upload Your Photo"}</>
                                )}
                            </button>

                            <button disabled className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed" style={{ background: '#f8fafc', color: '#94a3b8', border: '1.5px solid #e2e8f0' }}>
                                <ShoppingCart className="h-4 w-4" />
                                {dict.demoSection?.addToCart || "Add to Cart"} (demo only)
                            </button>

                            {status === "success" && (
                                <button onClick={reset} className="w-full mt-2 py-3 text-sm font-medium transition-colors" style={{ color: '#94a3b8' }}>
                                    ← {dict.demoSection?.back || "Back to Product"}
                                </button>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: dict.demoSection?.stats?.privacy || "Privacy", value: dict.demoSection?.stats?.secure || "Secure" },
                                { label: dict.demoSection?.stats?.engine || "AI Engine", value: dict.demoSection?.stats?.neural || "Pruna AI" },
                                { label: dict.demoSection?.stats?.latency || "Speed", value: dict.demoSection?.stats?.global || "~8s" }
                            ].map((s, i) => (
                                <div key={i} className="rounded-2xl p-4 text-center border" style={{ background: 'white', borderColor: '#e8eaf0' }}>
                                    <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>{s.label}</p>
                                    <p className="text-xs font-black" style={{ color: '#0f0f1a' }}>{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* CTA link */}
                        <a href="#" className="flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all hover:gap-3" style={{ color: '#6366f1' }}>
                            Start using on your store <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </section>
    );
}
