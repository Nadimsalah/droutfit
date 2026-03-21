"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RotateCcw, ShoppingCart, Heart, Share2, Star, Truck, Shield, RotateCw, Sparkles, CheckCircle2, AlertCircle, ChevronRight, Minus, Plus } from "lucide-react";
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
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState("M");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const garmentUrl = demoImage || "/alaska-jacket.webp";
    const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

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
        <section id="demo" className="py-24 px-4 bg-[#050608] relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Section header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">
                        <Sparkles className="h-3 w-3 text-blue-400" />
                        {dict.demoSection?.badge || "Demo your store with AI Virtual Try-On"}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        {dict.demoSection?.title1 || "See How It Looks"}{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            {dict.demoSection?.title2 || "On Your Store"}
                        </span>
                    </h2>
                    <p className="text-gray-500 text-base max-w-lg mx-auto">
                        {dict.demoSection?.description || "This is how your product page looks with AI Try-On embedded. Test it instantly below."}
                    </p>
                </div>

                {/* E-Commerce Store Mockup */}
                <div className="rounded-[28px] border border-white/8 overflow-hidden shadow-2xl" style={{ background: '#0a0c10' }}>

                    {/* Store top bar (fake browser + store nav) */}
                    <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between" style={{ background: '#080a0d' }}>
                        {/* Browser dots */}
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500/60" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                            <div className="h-3 w-3 rounded-full bg-green-500/60" />
                            <div className="ml-4 px-4 py-1 rounded-md text-xs text-gray-600 font-mono" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.05)' }}>
                                yourstore.com/products/premium-jacket
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-6 text-[11px] font-bold text-gray-600 uppercase tracking-widest">
                            <span>Home</span>
                            <span>Collections</span>
                            <span className="text-white">Products</span>
                            <span>About</span>
                            <div className="h-7 w-7 bg-white/5 rounded-full flex items-center justify-center">
                                <ShoppingCart className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Breadcrumb */}
                    <div className="px-8 py-3 flex items-center gap-2 text-[11px] text-gray-600 border-b border-white/5">
                        <span>Home</span><ChevronRight className="h-3 w-3" /><span>Men</span><ChevronRight className="h-3 w-3" /><span>Jackets</span><ChevronRight className="h-3 w-3" /><span className="text-gray-300">Premium Striped Oxford Shirt</span>
                    </div>

                    {/* Product Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                        {/* ── Left: Product Images ── */}
                        <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-white/5">
                            {/* Main image */}
                            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#0d1017] mb-4 shadow-xl border border-white/5">

                                <AnimatePresence mode="wait">
                                    {(status === "idle") && (
                                        <motion.img key="product" src={garmentUrl} alt="Product"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="w-full h-full object-cover" />
                                    )}

                                    {status === "processing" && (
                                        <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#050810]">
                                            {uploadedImage && <img src={uploadedImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 blur-md scale-110" />}
                                            <div className="relative z-10 text-center">
                                                <div className="relative w-24 h-24 mx-auto mb-5">
                                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                                                        <motion.circle cx="50" cy="50" r="42" fill="none" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round"
                                                            strokeDasharray={264}
                                                            animate={{ strokeDashoffset: 264 - (264 * progress) / 100 }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-white font-black text-xl">{Math.round(progress)}%</span>
                                                    </div>
                                                </div>
                                                <p className="text-white font-black text-sm tracking-tight">AI Generating Try-On…</p>
                                                <p className="text-gray-600 text-xs mt-1">Powered by Pruna AI</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {status === "success" && resultImage && (
                                        <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                                            <img src={resultImage} alt="Try-On Result" className="w-full h-full object-cover" />
                                            <div className="absolute top-4 left-4">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg"
                                                    style={{ background: 'rgba(34,197,94,0.9)', color: 'white' }}>
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {dict.demoSection?.tryonResult || "Try-On Result"}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {status === "error" && (
                                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4 bg-red-950/20">
                                            <AlertCircle className="h-10 w-10 text-red-400" />
                                            <p className="text-white font-bold text-sm">Generation Failed</p>
                                            <p className="text-gray-500 text-xs">{errorMsg}</p>
                                            <button onClick={reset} className="px-5 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-sm font-bold text-white transition-all">Retry</button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Wishlist & Share */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                                    <button className="h-9 w-9 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
                                        <Heart className="h-4 w-4" />
                                    </button>
                                    <button className="h-9 w-9 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                        <Share2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Thumbnail strip */}
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {[garmentUrl, garmentUrl, garmentUrl].map((img, i) => (
                                    <div key={i} className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border transition-all cursor-pointer ${i === 0 ? 'border-blue-500' : 'border-white/10 opacity-50 hover:opacity-80'}`}>
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Right: Product Info + Actions ── */}
                        <div className="p-6 lg:p-8 flex flex-col gap-6">

                            {/* Rating + badge */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    {[1,2,3,4,5].map(i => (
                                        <Star key={i} className={`h-4 w-4 ${i <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
                                    ))}
                                    <span className="text-xs text-gray-500 ml-1 font-medium">4.9 (128 reviews)</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>In Stock</span>
                            </div>

                            {/* Title */}
                            <div>
                                <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2">{dict.demoSection?.productBrand || "Premium Collection"}</p>
                                <h3 className="text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight">
                                    {dict.demoSection?.productName || "Premium Striped Oxford Shirt"}
                                </h3>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-4 pt-1 pb-4 border-b border-white/5">
                                <span className="text-4xl font-black text-white">$50.00</span>
                                <span className="text-xl text-gray-600 line-through font-medium">$65.00</span>
                                <span className="text-sm font-black text-green-500">Save 23%</span>
                            </div>

                            {/* Size selector */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Size</span>
                                    <span className="text-xs text-blue-400 font-bold cursor-pointer hover:underline">Size Guide</span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {sizes.map(s => (
                                        <button key={s} onClick={() => setSelectedSize(s)}
                                            className={`h-10 w-12 rounded-xl text-xs font-black border transition-all ${selectedSize === s
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── AI Try-On Banner ── */}
                            <div className="rounded-2xl p-4 border flex items-center gap-3" style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.15)' }}>
                                <div className="h-10 w-10 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-black text-sm">AI Virtual Try-On Available</p>
                                    <p className="text-gray-500 text-xs mt-0.5">See how this looks on you before buying</p>
                                </div>
                            </div>

                            {/* Quantity + Add to Cart */}
                            <div className="space-y-3">
                                {/* Qty */}
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest w-16">Qty</span>
                                    <div className="flex items-center gap-0 border border-white/10 rounded-xl overflow-hidden">
                                        <button onClick={() => setQty(q => Math.max(1, q - 1))} className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-10 text-center text-white font-black text-sm">{qty}</span>
                                        <button onClick={() => setQty(q => q + 1)} className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Try-On CTA */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={status === "processing"}
                                    className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 8px 24px rgba(59,130,246,0.25)', color: 'white' }}
                                >
                                    {status === "processing" ? (
                                        <><span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Generating…</>
                                    ) : status === "success" ? (
                                        <><RotateCcw className="h-5 w-5" /> {dict.demoSection?.tryDifferent || "Try Different Photo"}</>
                                    ) : (
                                        <><Camera className="h-5 w-5" /> {dict.demoSection?.virtualTryon || "Try On with AI"}</>
                                    )}
                                </button>

                                {/* Add to Cart */}
                                <button disabled className="w-full py-4 bg-white/5 border border-white/8 text-gray-600 rounded-2xl font-bold text-base flex items-center justify-center gap-3 cursor-not-allowed">
                                    <ShoppingCart className="h-5 w-5" />
                                    {dict.demoSection?.addToCart || "Add to Cart"}
                                </button>

                                {status === "success" && (
                                    <button onClick={reset} className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors font-medium">
                                        ← {dict.demoSection?.back || "Back to Product"}
                                    </button>
                                )}
                            </div>

                            {/* Shipping badges */}
                            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
                                {[
                                    { icon: Truck, label: "Free Shipping", sub: "Orders over $50" },
                                    { icon: Shield, label: "Secure Pay", sub: "SSL Protected" },
                                    { icon: RotateCw, label: "30-Day Return", sub: "Easy returns" }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                        <item.icon className="h-4 w-4 text-blue-500" />
                                        <span className="text-[9px] font-black text-white uppercase tracking-wide leading-tight">{item.label}</span>
                                        <span className="text-[9px] text-gray-600">{item.sub}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </section>
    );
}
