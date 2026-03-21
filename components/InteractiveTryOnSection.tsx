"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, RotateCcw, Sparkles, ShoppingCart, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
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
    const garmentImage = demoImage || "/alaska-jacket.webp";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setUploadedImage(preview);
            setResultImage(null);
            setErrorMsg(null);
            setStatus("processing");
            handleTryOn(file);
        }
    };

    const handleTryOn = async (file: File) => {
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => prev >= 92 ? prev : prev + Math.random() * 4 + 1);
        }, 400);

        try {
            const { base64: base64Image, metadata } = await optimizeImageForGemini(file);

            const response = await fetch('/api/generate-demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userImageUrl: base64Image,
                    garmentUrl,
                    metadata: { ...metadata, isMobile: window.innerWidth < 768 }
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Generation failed");
            if (!data.result_url) throw new Error("No result image returned");

            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
                setResultImage(data.result_url);
                setStatus("success");
            }, 400);
        } catch (err: any) {
            clearInterval(interval);
            setErrorMsg(err.message);
            setStatus("error");
        }
    };

    const reset = () => {
        setStatus("idle");
        setUploadedImage(null);
        setResultImage(null);
        setProgress(0);
        setErrorMsg(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerUpload = () => fileInputRef.current?.click();

    return (
        <section id="demo" className="py-28 px-4 bg-[#05070a] relative overflow-hidden">
            {/* Soft background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/4 top-0 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px]" />
                <div className="absolute right-1/4 bottom-0 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Header */}
                <div className="text-center mb-16 space-y-5">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        <Sparkles className="h-3 w-3 text-blue-400" />
                        {dict.demoSection.badge || "Demo your store with AI"}
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-tight max-w-3xl mx-auto">
                        {dict.demoSection.title1 || "Demo Your Store with"}{" "}
                        <span className="text-blue-400">{dict.demoSection.title2 || "AI Virtual Try-On"}</span>
                    </h2>

                    <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
                        {dict.demoSection.description || "Test our hyper-realistic AI technology instantly. Give your customers the confidence to buy."}
                    </p>
                </div>

                {/* Main Demo Card */}
                <div className="bg-[#0c0f14] border border-white/8 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2">

                        {/* ── Left: Image Panel ── */}
                        <div className="relative bg-black/30 min-h-[520px] flex items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-white/5">
                            {/* Live badge */}
                            <div className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                {dict.demoSection.environment || "Demo Environment"}
                            </div>

                            <AnimatePresence mode="wait">
                                {status === "idle" && (
                                    /* Product image */
                                    <motion.div
                                        key="product"
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.97 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full max-w-[360px]"
                                    >
                                        <img
                                            src={garmentImage}
                                            alt="Product"
                                            className="w-full aspect-[3/4] object-cover rounded-2xl shadow-xl border border-white/5"
                                        />
                                    </motion.div>
                                )}

                                {status === "processing" && (
                                    <motion.div
                                        key="processing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-full max-w-[360px] relative"
                                    >
                                        {uploadedImage && (
                                            <img
                                                src={uploadedImage}
                                                alt="Your photo"
                                                className="w-full aspect-[3/4] object-cover rounded-2xl opacity-30 blur-sm"
                                            />
                                        )}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                                            {/* Progress ring */}
                                            <div className="relative w-24 h-24">
                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                                    <motion.circle
                                                        cx="50" cy="50" r="42"
                                                        fill="none"
                                                        stroke="#3b82f6"
                                                        strokeWidth="6"
                                                        strokeLinecap="round"
                                                        strokeDasharray={263}
                                                        animate={{ strokeDashoffset: 263 - (263 * progress) / 100 }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-white font-black text-xl">{Math.round(progress)}%</span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-bold text-sm">Generating Try-On…</p>
                                                <p className="text-gray-500 text-xs mt-1">Powered by Pruna AI</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {status === "success" && resultImage && (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="w-full max-w-[360px] relative group"
                                    >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500 text-white text-[10px] font-black uppercase tracking-widest z-10 shadow-lg">
                                            <CheckCircle2 className="h-3 w-3" />
                                            {dict.demoSection.tryonResult || "Try-on Result"}
                                        </div>
                                        <img
                                            src={resultImage}
                                            alt="Try-On Result"
                                            className="w-full aspect-[3/4] object-cover rounded-2xl shadow-xl border border-white/10"
                                        />
                                    </motion.div>
                                )}

                                {status === "error" && (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center gap-4 p-8 text-center"
                                    >
                                        <AlertCircle className="h-12 w-12 text-red-400" />
                                        <p className="text-white font-bold">Try-on failed</p>
                                        <p className="text-gray-500 text-sm max-w-xs">{errorMsg}</p>
                                        <button
                                            onClick={reset}
                                            className="px-6 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white text-sm font-bold transition-all"
                                        >
                                            Try Again
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Right: Product Info + CTA ── */}
                        <div className="flex flex-col p-8 lg:p-12 gap-8">

                            {/* Top label */}
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">
                                    {dict.demoSection.environment || "Demo Environment"}
                                </span>
                                <ArrowRight className="h-3 w-3 text-gray-700" />
                                <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest">
                                    {dict.demoSection.productBrand || "Imagine this: your products"}
                                </span>
                            </div>

                            {/* Product name + rating */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    {[1,2,3,4,5].map(i => (
                                        <span key={i} className={`text-sm ${i <= 4 ? "text-yellow-400" : "text-gray-600"}`}>★</span>
                                    ))}
                                    <span className="text-gray-500 text-xs font-medium">(128)</span>
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight">
                                    {dict.demoSection.productName || "Let your clients try before they buy"}
                                </h3>
                            </div>

                            {/* Pricing */}
                            <div className="flex items-baseline gap-4 py-5 border-y border-white/5">
                                <div>
                                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-1">
                                        {dict.demoSection.salePrice || "Sale Price"}
                                    </p>
                                    <span className="text-4xl font-black text-white">$50.00</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-1">
                                        {dict.demoSection.msrp || "MSRP"}
                                    </p>
                                    <span className="text-xl font-bold text-gray-600 line-through">$65.00</span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {dict.demoSection.productDesc || "Revolutionize your storefront with hyper-realistic AI try-on technology. Build trust, reduce returns, and watch conversion rates soar."}
                            </p>

                            {/* CTAs */}
                            <div className="space-y-3 mt-auto">
                                {/* Primary CTA — Try On */}
                                <button
                                    onClick={triggerUpload}
                                    disabled={status === "processing"}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                                >
                                    {status === "processing" ? (
                                        <>
                                            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                            Generating…
                                        </>
                                    ) : status === "success" ? (
                                        <>
                                            <RotateCcw className="h-4 w-4" />
                                            {dict.demoSection.tryDifferent || "Try Different Photo"}
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="h-4 w-4" />
                                            {dict.demoSection.virtualTryon || "Virtual Try-On — Upload Photo"}
                                        </>
                                    )}
                                </button>

                                {/* Secondary CTA — Add to Cart (disabled, demo only) */}
                                <button
                                    disabled
                                    className="w-full py-4 bg-white/5 border border-white/8 text-gray-600 rounded-2xl font-bold text-base flex items-center justify-center gap-3 cursor-not-allowed"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    {dict.demoSection.addToCart || "Add to Cart"}
                                </button>

                                {/* Back button (only when in result mode) */}
                                {status === "success" && (
                                    <button
                                        onClick={reset}
                                        className="w-full py-3 text-gray-500 hover:text-white text-sm font-medium transition-colors"
                                    >
                                        ← {dict.demoSection.back || "Back to Product"}
                                    </button>
                                )}
                            </div>

                            {/* Trust badges */}
                            <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
                                {[
                                    { label: dict.demoSection.stats?.privacy || "Privacy", value: dict.demoSection.stats?.secure || "Secure Eng" },
                                    { label: dict.demoSection.stats?.engine || "AI Engine", value: dict.demoSection.stats?.neural || "Neural 2.5" },
                                    { label: dict.demoSection.stats?.latency || "Latency", value: dict.demoSection.stats?.global || "~8s Global" }
                                ].map((badge, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">{badge.label}</p>
                                        <p className="text-[11px] font-bold text-gray-400 mt-0.5">{badge.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
        </section>
    );
}
