"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ShoppingCart, Sparkles, RefreshCw, Wand2, ArrowLeft, Check, ShieldCheck, Zap } from "lucide-react";

export default function InteractiveTryOnSection() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [view, setView] = useState<"details" | "tryon">("details");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const product = {
        name: "Alaska Puffer Jacket",
        price: "$50.00",
        originalPrice: "$65.00",
        description: "Engineered for excellence. High-loft synthetic insulation meets a weather-resistant shell for the ultimate urban explorer jacket.",
        image: "/alaska-jacket.webp",
        garmentUrl: 'https://plyvtxtapvhenkumknai.supabase.co/storage/v1/object/public/tryimages/alaska-jacket.webp'
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setUploadedImage(imageUrl);
            setResultImage(null);
            setErrorMsg(null);
            setView("tryon");
            handleTryOn(file);
        }
    };

    const handleTryOn = async (file: File) => {
        setIsGenerating(true);
        setProgress(0);
        setErrorMsg(null);

        // Simulate progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev;
                return prev + Math.floor(Math.random() * 5) + 1;
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
            if (!response.ok) throw new Error(data.error || "Generation failed.");
            setResultImage(data.result_url);
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
                setIsGenerating(false);
            }, 500);
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <section id="demo" className="py-16 px-6 relative overflow-hidden bg-[#050608]">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/[0.02] rounded-full blur-[140px]" />
                <div className="absolute bottom-[0%] right-[-5%] w-[600px] h-[600px] bg-purple-600/[0.02] rounded-full blur-[140px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-widest">
                        <ShoppingCart className="h-3 w-3" /> Storefront Simulation
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        See it in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Action.</span>
                    </h2>
                    <p className="text-gray-500 text-sm max-w-xl mx-auto font-medium">
                        Experience the exact interface your customers will use. A seamless, high-converting virtual fitting room integrated directly into your product pages.
                    </p>
                </div>

                <div className="bg-[#0D1117]/70 backdrop-blur-2xl rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="flex flex-col lg:flex-row min-h-[500px] lg:min-h-[550px]">

                        {/* Display Area (Left) */}
                        <div className="lg:w-1/2 relative bg-[#0B0E14]/30 flex items-center justify-center p-6 lg:p-12 overflow-hidden lg:border-r border-white/5">
                            <AnimatePresence mode="wait">
                                {view === "details" ? (
                                    <motion.div
                                        key="details-img"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full flex items-center justify-center"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full scale-110" />
                                            <img src={product.image} alt={product.name} className="relative z-10 w-full h-auto max-h-[400px] object-cover rounded-[32px] shadow-2xl" />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="tryon-container"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="w-full h-full flex flex-col items-center justify-center relative"
                                    >
                                        {!resultImage && !isGenerating ? (
                                            <div
                                                onClick={triggerUpload}
                                                className="w-full h-[350px] max-w-[300px] rounded-[32px] border-2 border-dashed border-white/10 hover:border-blue-500/30 flex flex-col items-center justify-center gap-4 cursor-pointer bg-white/[0.01] transition-all group"
                                            >
                                                <Upload className="w-8 h-8 text-blue-500/50 group-hover:text-blue-500 transition-colors" />
                                                <p className="text-gray-500 text-xs text-center px-8">Click to upload your photo</p>
                                            </div>
                                        ) : isGenerating ? (
                                            <div className="text-center space-y-6">
                                                <div className="relative w-20 h-20 mx-auto">
                                                    <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full" />
                                                    <motion.div
                                                        className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
                                                        style={{ rotate: progress * 3.6 }}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-white text-xs font-black">{progress}%</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Processing AI</p>
                                                    <div className="w-32 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-blue-500"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={resultImage!} alt="Try On Result" className="w-full h-auto max-h-[450px] object-contain rounded-[24px] shadow-2xl" />
                                        )}

                                        <button
                                            onClick={() => setView("details")}
                                            className="absolute top-0 left-0 flex items-center gap-1.5 text-gray-500 hover:text-white transition-all font-bold uppercase text-[9px] tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
                                        >
                                            <ArrowLeft className="w-3 h-3" /> Back
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Content Area (Right) */}
                        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center gap-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                                        Best Seller
                                    </div>
                                    <Zap className="h-3 w-3 text-orange-400" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                                        {product.name}
                                    </h2>
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-3xl font-black text-white">
                                            {product.price}
                                        </p>
                                        <p className="text-lg font-bold text-gray-600 line-through opacity-50">
                                            {product.originalPrice}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {product.description}
                                </p>

                                <div className="pt-4 space-y-4">
                                    <button className="w-full py-4 bg-white/5 border border-white/5 text-white/20 rounded-2xl font-black text-sm cursor-not-allowed flex items-center justify-center gap-2">
                                        <ShoppingCart className="w-4 h-4" />
                                        Add to Cart
                                    </button>

                                    <button
                                        onClick={triggerUpload}
                                        className="w-full py-5 bg-white text-black rounded-full font-black text-base transition-all shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 active:scale-95 group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 flex items-center gap-2 group-hover:text-white">
                                            <Sparkles className="w-5 h-5" />
                                            {view === "details" ? "Virtual Try-On" : "Try Another Photo"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Trust Markers */}
                            <div className="pt-6 border-t border-white/5 flex items-center justify-between text-center">
                                <div className="flex-1">
                                    <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-1">Privacy</p>
                                    <p className="text-white text-[10px] font-bold">Secure</p>
                                </div>
                                <div className="w-px h-6 bg-white/5" />
                                <div className="flex-1">
                                    <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-1">Quality</p>
                                    <p className="text-white text-[10px] font-bold">4K Neural</p>
                                </div>
                                <div className="w-px h-6 bg-white/5" />
                                <div className="flex-1">
                                    <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-1">Results</p>
                                    <p className="text-white text-[10px] font-bold">Realistic</p>
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
            </div>
        </section>
    );
}
