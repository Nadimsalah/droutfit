"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ShoppingCart, Sparkles, RefreshCw, Wand2, ArrowLeft, Check, ShieldCheck, Zap, Image as ImageIcon } from "lucide-react";

export default function InteractiveTryOnSection() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
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

    // Auto-scroll logic if needed or just ensuring smooth transitions
    useEffect(() => {
        if (view === "tryon" && status === "idle") {
            // If we somehow get into tryon view without a status, set it
            setStatus("idle");
        }
    }, [view]);

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
        }
    };

    const handleTryOn = async (file: File) => {
        setProgress(0);
        setErrorMsg(null);

        // Simulate progress with more natural steps
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 98) return prev;
                const jump = Math.floor(Math.random() * 8) + 1;
                return Math.min(prev + jump, 98);
            });
        }, 400);

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

            // Artificial delay for smooth transition even if API is super fast
            await new Promise(r => setTimeout(r, 1000));

            setResultImage(data.result_url);
            setStatus("success");
            setProgress(100);
        } catch (err: any) {
            setErrorMsg(err.message);
            setStatus("error");
        } finally {
            clearInterval(interval);
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const reset = () => {
        setView("details");
        setStatus("idle");
        setUploadedImage(null);
        setResultImage(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <section id="demo" className="py-12 md:py-20 px-4 md:px-6 relative overflow-hidden bg-[#050608]">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/[0.03] rounded-full blur-[140px]" />
                <div className="absolute bottom-[0%] right-[-5%] w-[600px] h-[600px] bg-purple-600/[0.03] rounded-full blur-[140px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-10 md:mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-widest"
                    >
                        <ShoppingCart className="h-3 w-3" /> Digital Storefront
                    </motion.div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Magic.</span>
                    </h2>
                    <p className="text-gray-500 text-sm max-w-xl mx-auto font-medium px-4">
                        Test our hyper-realistic AI try-on technology instantly. Upload a photo and see the future of fashion.
                    </p>
                </div>

                <div className="bg-[#0D1117]/60 backdrop-blur-3xl rounded-[32px] md:rounded-[48px] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="flex flex-col lg:flex-row min-h-[500px] md:min-h-[600px]">

                        {/* Display Area (Left) */}
                        <div className="lg:w-1/2 relative bg-black/20 flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden lg:border-r border-white/5 min-h-[400px] lg:min-h-0">
                            <AnimatePresence mode="wait">
                                {view === "details" ? (
                                    <motion.div
                                        key="details-view"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                        className="w-full flex items-center justify-center"
                                    >
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="relative z-10 w-full h-auto max-w-[320px] md:max-w-full max-h-[350px] md:max-h-[450px] object-cover rounded-[24px] md:rounded-[40px] shadow-2xl"
                                            />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="tryon-view"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="w-full h-full flex flex-col items-center justify-center relative py-4 lg:py-0"
                                    >
                                        <div className="w-full max-w-[320px] md:max-w-[400px] aspect-[4/5] bg-[#0B0E14] rounded-[24px] md:rounded-[32px] overflow-hidden relative shadow-2xl border border-white/5">
                                            <AnimatePresence mode="wait">
                                                {status === "processing" ? (
                                                    <motion.div
                                                        key="processing"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-20 transition-all"
                                                    >
                                                        <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8 scale-110 md:scale-100">
                                                            <svg className="w-full h-full transform -rotate-90">
                                                                <circle
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    r="45%"
                                                                    className="stroke-white/5 fill-none"
                                                                    strokeWidth="4"
                                                                />
                                                                <motion.circle
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    r="45%"
                                                                    className="stroke-blue-500 fill-none"
                                                                    strokeWidth="4"
                                                                    strokeDasharray="283"
                                                                    initial={{ strokeDashoffset: 283 }}
                                                                    animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
                                                                    strokeLinecap="round"
                                                                />
                                                            </svg>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                <span className="text-white text-xl md:text-2xl font-black">{progress}%</span>
                                                                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-1">Neural AI</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-center space-y-2 px-6">
                                                            <p className="text-white text-xs md:text-sm font-black uppercase tracking-[0.2em] animate-pulse">Analyzing Frame...</p>
                                                            <p className="text-gray-500 text-[10px] font-medium leading-relaxed">Adjusting lighting & garment physics to match your pose.</p>
                                                        </div>
                                                    </motion.div>
                                                ) : status === "success" ? (
                                                    <motion.div
                                                        key="success"
                                                        initial={{ opacity: 0, scale: 1.05 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="absolute inset-0 z-10"
                                                    >
                                                        <img src={resultImage!} alt="VTO Result" className="w-full h-full object-cover" />
                                                        <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
                                                            <Check className="w-3 h-3" /> Result Ready
                                                        </div>
                                                    </motion.div>
                                                ) : status === "error" ? (
                                                    <motion.div
                                                        key="error"
                                                        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-red-500/5 backdrop-blur-sm"
                                                    >
                                                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                                                            <RefreshCw className="w-8 h-8 text-red-500" />
                                                        </div>
                                                        <h4 className="text-white font-black mb-2 uppercase text-xs tracking-widest">Processing Error</h4>
                                                        <p className="text-gray-400 text-[10px] mb-6 leading-relaxed">{errorMsg || "Try a clearer photo of yourself"}</p>
                                                        <button
                                                            onClick={triggerUpload}
                                                            className="px-6 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
                                                        >
                                                            Retry Upload
                                                        </button>
                                                    </motion.div>
                                                ) : null}
                                            </AnimatePresence>

                                            {/* Preview of uploaded image while processing */}
                                            {uploadedImage && status === "processing" && (
                                                <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover opacity-50 blur-sm scale-110" />
                                            )}
                                        </div>

                                        <button
                                            onClick={reset}
                                            className="absolute top-0 md:top-2 left-4 md:left-2 flex items-center gap-1.5 text-gray-500 hover:text-white transition-all font-black uppercase text-[9px] tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10"
                                        >
                                            <ArrowLeft className="w-3 h-3" /> Close Demo
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Content Area (Right) */}
                        <div className="lg:w-1/2 p-6 md:p-10 lg:p-14 flex flex-col justify-center gap-6 md:gap-8 bg-white/[0.01]">
                            <div className="space-y-6 md:space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                            Premium Collection
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Sparkles key={i} className="h-3 w-3 text-orange-400/80 fill-orange-400/20" />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Sale Price</span>
                                                <p className="text-3xl md:text-4xl font-black text-white">
                                                    {product.price}
                                                </p>
                                            </div>
                                            <div className="h-8 w-px bg-white/10 self-end mb-1" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400/50 font-black uppercase tracking-widest mb-0.5">Value</span>
                                                <p className="text-xl md:text-2xl font-bold text-gray-600 line-through decoration-red-500/30 decoration-2">
                                                    {product.originalPrice}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm md:text-base leading-relaxed font-medium">
                                    {product.description}
                                </p>

                                <div className="pt-2 md:pt-6 space-y-4">
                                    <button className="w-full py-4 bg-white/5 border border-white/5 text-white/10 rounded-2xl font-black text-sm cursor-not-allowed flex items-center justify-center gap-2 group transition-all">
                                        <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        Add to Cart
                                    </button>

                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                                        <button
                                            onClick={triggerUpload}
                                            className="relative w-full py-5 md:py-6 bg-white text-black rounded-full font-black text-base md:text-lg transition-all flex items-center justify-center gap-3 active:scale-95 overflow-hidden"
                                        >
                                            <span className="relative z-10 flex items-center gap-3">
                                                <Zap className="w-5 h-5 fill-black" />
                                                {view === "details" ? "Try it On Instantly" : "Try Different Photo"}
                                            </span>
                                            <motion.div
                                                className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: status === "processing" ? progress / 100 : 0 }}
                                                transition={{ duration: 0.1 }}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Trust System */}
                            <div className="grid grid-cols-3 gap-2 pt-8 border-t border-white/5">
                                {[
                                    { label: "Privacy", value: "Secure", icon: ShieldCheck },
                                    { label: "AI Engine", value: "Neural", icon: Wand2 },
                                    { label: "Latency", value: "3.2s", icon: Zap }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center text-center group">
                                        <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-2 group-hover:border-blue-500/50 transition-colors">
                                            <item.icon className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                                        </div>
                                        <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-0.5">{item.label}</p>
                                        <p className="text-white text-[10px] font-bold">{item.value}</p>
                                    </div>
                                ))}
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
