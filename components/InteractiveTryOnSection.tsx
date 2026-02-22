"use client";

import React, { useState, useRef } from "react";
import { Upload, ArrowRight, RefreshCw, Wand2, Sparkles, CheckCircle2, Download } from "lucide-react";
import { uploadImage } from "@/lib/supabase";

export default function InteractiveTryOnSection() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setUploadedImage(imageUrl);
            setUploadedFile(file);
            setResultImage(null); // Reset result
            setErrorMsg(null);

            // To ensure the same file triggers onChange again if removed later
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleTryOnDrOutfit = async () => {
        if (!uploadedFile) return;
        setIsGenerating(true);
        setErrorMsg(null);

        try {
            // Convert file to base64 directly in the browser
            const base64Image = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(uploadedFile);
            });

            // Use the reliable public URL for the jacket
            const garmentUrl = 'https://plyvtxtapvhenkumknai.supabase.co/storage/v1/object/public/tryimages/alaska-jacket.webp';

            const response = await fetch('/api/generate-demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userImageUrl: base64Image,
                    garmentUrl: garmentUrl
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Generation failed server side.");
            }

            setResultImage(data.result_url);
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const resetProcess = () => {
        setUploadedImage(null);
        setUploadedFile(null);
        setResultImage(null);
        setIsGenerating(false);
        setErrorMsg(null);
    };

    return (
        <section id="demo" className="py-24 px-6 relative overflow-hidden bg-[#050608]">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white shadow-xl shadow-blue-900/10">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        Powered by Dr Outfit Vision
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        Experience the Magic.
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Upload a photo of yourself to try on our <b className="text-white">Alaska Puffer Jacket</b>. Powered by our custom Dr Outfit API framework for hyper-realistic virtual fitting.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-12">

                    {/* Before / Upload Container */}
                    <div className="w-full md:w-[400px] aspect-[4/5] bg-[#10141d] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative group">
                        {uploadedImage ? (
                            <>
                                <img src={uploadedImage} alt="User Upload" className="w-full h-full object-cover" />
                                {!isGenerating && !resultImage && (
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all border border-white/20"
                                        >
                                            Change Photo
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div
                                className="w-full h-full flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-white/[0.02] transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform pointer-events-none">
                                    <Upload className="w-10 h-10 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 pointer-events-none">Upload Your Photo</h3>
                                <p className="text-gray-500 text-sm pointer-events-none">Supported formats: JPG, PNG, WEBP</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        {uploadedImage && <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 pointer-events-none">BEFORE</div>}
                    </div>

                    {/* Center Action */}
                    <div className="flex flex-col items-center gap-4 z-20">
                        {/* Target Garment Preview */}
                        {!isGenerating && !resultImage && (
                            <div className="flex flex-col items-center scale-90 md:scale-100 pointer-events-none">
                                <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-2xl shadow-blue-500/20 border-4 border-white/10 mb-4 z-10 relative">
                                    <img src="/alaska-jacket.webp" alt="Alaska Puffer" className="w-full h-full object-contain rounded-xl" />
                                </div>
                                <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest text-center">Trying On: <br /><span className="text-white">Alaska Puffer</span></p>
                            </div>
                        )}

                        <button
                            onClick={handleTryOnDrOutfit}
                            disabled={!uploadedImage || isGenerating || resultImage !== null}
                            className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)] group relative"
                        >
                            {isGenerating ? (
                                <RefreshCw className="w-8 h-8 text-white animate-spin" />
                            ) : (
                                <ArrowRight className="w-8 h-8 text-white" />
                            )}

                            {/* Dr Outfit Label */}
                            {!isGenerating && !resultImage && uploadedImage && (
                                <span className="absolute top-full mt-4 whitespace-nowrap text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Apply Dr Outfit API
                                </span>
                            )}
                        </button>

                        {resultImage && (
                            <button onClick={resetProcess} className="mt-4 px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full border border-white/10">
                                Start Over
                            </button>
                        )}
                    </div>

                    {/* After / Result Container */}
                    <div className="w-full md:w-[400px] aspect-[4/5] bg-[#10141d] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative group">
                        {!isGenerating && !resultImage ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-gray-900 to-black">
                                <Wand2 className="w-12 h-12 text-gray-700 mb-4" />
                                <p className="text-gray-500 font-medium">Your AI Try-On result <br /> will appear here.</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/40 relative overflow-hidden">
                                {uploadedImage && <img src={uploadedImage} className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30" />}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6 relative z-10" />
                                <p className="text-white font-bold animate-pulse relative z-10">Dr Outfit Engine Processing...</p>
                                <p className="text-xs text-blue-400 mt-2 relative z-10">Analyzing pose and lighting.</p>
                                {/* Scanning Effect */}
                                <div className="absolute top-0 left-0 w-full h-2 bg-blue-500 shadow-[0_0_20px_4px_#3b82f6] animate-scan z-20 transform translate-z-0" />
                            </div>
                        ) : errorMsg ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#10141d]">
                                <p className="text-red-400 font-bold mb-2">Generation Failed</p>
                                <p className="text-xs text-gray-400 max-w-[90%] whitespace-pre-wrap">{errorMsg}</p>
                                <button onClick={resetProcess} className="mt-4 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors">
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div className="w-full h-full relative border border-purple-500/50">
                                <img src={resultImage!} alt="AI Try-On Result" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

                                <div className="absolute top-4 right-4 bg-purple-600 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1">
                                    AFTER <Sparkles className="w-3 h-3" />
                                </div>

                                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-white">Alaska Puffer Jacket</p>
                                        <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                            <CheckCircle2 className="w-3 h-3" /> Seamless Fit Generated
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
                                        <Download className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div >
        </section >
    );
}
