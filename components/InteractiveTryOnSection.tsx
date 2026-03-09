"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    ShoppingCart,
    Sparkles,
    RefreshCw,
    Wand2,
    ArrowLeft,
    Check,
    ShieldCheck,
    Zap,
    Image as ImageIcon,
    Star,
    Info,
    Camera,
    Activity
} from "lucide-react";

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
    const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [view, setView] = useState<"details" | "tryon">("details");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollTargetRef = useRef<HTMLDivElement>(null);

    const product = {
        name: dict.demoSection.productName,
        brand: dict.demoSection.productBrand,
        price: "$50.00",
        originalPrice: "$65.00",
        description: dict.demoSection.productDesc,
        image: demoImage || "/alaska-jacket.webp",
        garmentUrl: demoImage || "/alaska-jacket.webp",
        rating: 4.9,
        reviews: 128
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setUploadedImage(imageUrl);
            setResultImage(null);
            setErrorMsg(null);
            setView("tryon");
            setStatus("processing");
            handleTryOn(file);

            setTimeout(() => {
                scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    const handleTryOn = async (file: File) => {
        setProgress(0);
        setErrorMsg(null);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 98) return prev;
                const jump = Math.floor(Math.random() * 5) + 1;
                return Math.min(prev + jump, 98);
            });
        }, 300);

        try {
            const base64Image = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const response = await fetch('/api/generate-demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userImageUrl: base64Image,
                    garmentUrl: product.garmentUrl
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || dict.demoSection.generationFailed);

            await new Promise(r => setTimeout(r, 1000));

            setResultImage(data.result_url);
            setStatus("success");
            setProgress(100);
        } catch (err: any) {
            console.error("Try-on error:", err);
            if (err.name === 'AbortError') {
                setErrorMsg("The request was interrupted. Please try again.");
            } else {
                setErrorMsg(err.message);
            }
            setStatus("error");
        } finally {
            clearInterval(interval);
        }
    };

    const triggerUpload = () => fileInputRef.current?.click();

    const reset = () => {
        setView("details");
        setStatus("idle");
        setUploadedImage(null);
        setResultImage(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <section id="demo" className="py-24 px-6 relative overflow-hidden bg-[#050608]">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/10 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header with improved hierarchy */}
                <div className="text-center mb-20 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]"
                    >
                        <ShoppingCart className="h-3 w-3 text-blue-500" /> {dict.demoSection.badge}
                    </motion.div>

                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1] max-w-3xl mx-auto">
                        {dict.demoSection.title1} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                            {dict.demoSection.title2}
                        </span>
                    </h2>

                    <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
                        {dict.demoSection.description}
                    </p>
                </div>

                {/* Product Layout Grid */}
                <div ref={scrollTargetRef} className="bg-[#0D1117]/80 backdrop-blur-3xl rounded-[40px] border border-white/5 overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/10 group">
                    <div className="flex flex-col lg:flex-row min-h-[700px]">

                        {/* Media Section (Left) */}
                        <div className="lg:w-[55%] relative flex items-center justify-center p-6 lg:p-12 lg:border-r border-white/5 bg-black/40">
                            {/* Live Badge */}
                            <div className="absolute top-8 left-8 z-40">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                    {dict.demoSection.environment}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {view === "details" ? (
                                    <motion.div
                                        key="product-image"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        className="relative w-full aspect-[4/5] max-w-[450px]"
                                    >
                                        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700" />
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="relative z-10 w-full h-full object-cover rounded-[32px] shadow-3xl border border-white/5"
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="vto-result"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="w-full h-full flex items-center justify-center relative"
                                    >
                                        <div className="w-full aspect-[4/5] max-w-[450px] bg-[#0B0E14] rounded-[32px] overflow-hidden relative shadow-2xl border border-white/5">
                                            <AnimatePresence mode="wait">
                                                {status === "processing" ? (
                                                    <motion.div
                                                        key="processing-overlay"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xl z-20"
                                                    >
                                                        <div className="relative w-32 h-32 mb-10">
                                                            <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                                                            <svg className="w-full h-full transform -rotate-90">
                                                                <motion.circle
                                                                    cx="50%" cy="50%" r="45%"
                                                                    className="stroke-blue-500 fill-none"
                                                                    strokeWidth="4"
                                                                    strokeDasharray="283"
                                                                    initial={{ strokeDashoffset: 283 }}
                                                                    animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
                                                                    strokeLinecap="round"
                                                                />
                                                            </svg>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                <span className="text-3xl font-black text-white">{progress}%</span>
                                                                <Activity className="w-4 h-4 text-blue-400 mt-1 animate-pulse" />
                                                            </div>
                                                        </div>
                                                        <div className="text-center space-y-3 px-10">
                                                            <h4 className="text-white text-sm font-black uppercase tracking-[0.3em]">{dict.demoSection.neuralFitting}</h4>
                                                            <p className="text-gray-500 text-xs font-medium leading-relaxed">
                                                                {dict.demoSection.mapping}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ) : status === "success" ? (
                                                    <motion.div
                                                        key="success-image"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="absolute inset-0"
                                                    >
                                                        <img src={resultImage!} alt="Try-on Result" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                                                    </motion.div>
                                                ) : status === "error" ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-10 bg-red-500/5">
                                                        <RefreshCw className="w-12 h-12 text-red-500 mb-6" />
                                                        <p className="text-white font-black uppercase tracking-widest text-xs mb-2">{dict.demoSection.failed}</p>
                                                        <p className="text-gray-500 text-[11px] text-center mb-8">{errorMsg}</p>
                                                        <button
                                                            onClick={triggerUpload}
                                                            className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest"
                                                        >
                                                            {dict.demoSection.tryAgain}
                                                        </button>
                                                    </div>
                                                ) : null}
                                            </AnimatePresence>

                                            {status === "processing" && uploadedImage && (
                                                <img src={uploadedImage} alt="Reference" className="w-full h-full object-cover opacity-30 blur-sm scale-105" />
                                            )}
                                        </div>

                                        <button
                                            onClick={reset}
                                            className="absolute top-0 transform -translate-y-4 right-0 lg:-right-4 flex items-center gap-2 text-gray-400 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest bg-white/5 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-md z-30 shadow-xl"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" /> {dict.demoSection.back}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Content Section (Right) */}
                        <div className="lg:w-[45%] flex flex-col p-8 lg:p-16 bg-white/[0.01]">
                            <div className="flex-1 space-y-10">
                                {/* Brand & Rating */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[12px] font-black text-blue-500 uppercase tracking-[0.2em]">
                                            {product.brand}
                                        </span>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                                            <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                                            <span className="text-[11px] font-black text-white">{product.rating}</span>
                                            <span className="text-[11px] text-gray-600">({product.reviews})</span>
                                        </div>
                                    </div>
                                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                                        {product.name}
                                    </h1>
                                </div>

                                {/* Pricing */}
                                <div className="flex items-baseline gap-6 border-b border-white/5 pb-8">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{dict.demoSection.salePrice}</span>
                                        <div className="text-5xl font-black text-white">{product.price}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{dict.demoSection.msrp}</span>
                                        <div className="text-2xl font-bold text-gray-700 line-through decoration-red-500/20">{product.originalPrice}</div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Info className="w-3 h-3" /> {dict.demoSection.productIntel}
                                    </h4>
                                    <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                        {product.description}
                                    </p>
                                </div>

                                {/* Main Actions */}
                                <div className="space-y-5 pt-4">
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-[24px] blur-lg opacity-40 group-hover:opacity-100 transition duration-500" />
                                        <button
                                            onClick={triggerUpload}
                                            className="relative w-full py-6 bg-white text-black rounded-[20px] font-black text-xl flex items-center justify-center gap-4 transition-transform active:scale-95 shadow-2xl overflow-hidden"
                                        >
                                            {status === "processing" ? (
                                                <RefreshCw className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <>
                                                    <Camera className="w-6 h-6" />
                                                    {view === "details" ? dict.demoSection.virtualTryon : dict.demoSection.tryDifferent}
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <button className="w-full py-5 bg-white/5 border border-white/10 text-gray-700 rounded-[20px] font-black text-lg cursor-not-allowed flex items-center justify-center gap-3 transition-colors hover:bg-white/10">
                                        <ShoppingCart className="w-5 h-5" />
                                        {dict.demoSection.addToCart}
                                    </button>
                                </div>
                            </div>

                            {/* Trust Footer */}
                            <div className="pt-10 mt-12 border-t border-white/5 grid grid-cols-3 gap-4">
                                {[
                                    { label: dict.demoSection.stats.privacy, value: dict.demoSection.stats.secure, icon: ShieldCheck, color: "text-green-400" },
                                    { label: dict.demoSection.stats.engine, value: dict.demoSection.stats.neural, icon: Wand2, color: "text-blue-400" },
                                    { label: dict.demoSection.stats.latency, value: dict.demoSection.stats.global, icon: Zap, color: "text-yellow-400" }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                                        <item.icon className={`w-5 h-5 mb-2 ${item.color} group-hover:scale-110 transition-transform`} />
                                        <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-1">{item.label}</span>
                                        <span className="text-white text-[10px] font-black">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
        </section>
    );
}
