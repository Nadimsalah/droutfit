"use client"

import { useSearchParams } from "next/navigation"
import { useState, useRef, useEffect, Suspense } from "react"
import { Upload, X, Sparkles, RefreshCw, ShoppingBag, Loader2, ShieldCheck } from "lucide-react"
import { uploadImage } from "@/lib/supabase"
// Removed NanoBanana import

function ShopifyWidgetContent() {
    const searchParams = useSearchParams()

    // Shopify Data from Query Params
    const productId = searchParams.get("productId")
    const shop = searchParams.get("shop")
    let productImage = searchParams.get("img")
    const productUrl = searchParams.get("url")

    // Sanitize protocol-relative URLs
    if (productImage && productImage.startsWith('//')) {
        productImage = 'https:' + productImage;
    }

    const [step, setStep] = useState<"upload" | "processing" | "result" | "limit-reached">("upload")
    const [userImage, setUserImage] = useState<string | null>(null)
    const [userFile, setUserFile] = useState<File | null>(null)
    const [resultImage, setResultImage] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUserImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            processFile(file)
        }
    }

    const processFile = (file: File) => {
        setUserFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setUserImage(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            processFile(file)
        }
    }

    const handleGenerate = async () => {
        if (!userFile || !productImage) return
        setStep("processing")
        setProgress(0)

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev
                return prev + Math.random() * 5
            })
        }, 400)

        try {
            const publicUserUrl = await uploadImage(userFile)

            // Call the real AI API
            const response = await fetch("/api/virtual-try-on", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: null as any,
                body: JSON.stringify({
                    imageUrls: [publicUserUrl, productImage],
                    productId: productId,
                    shop: shop,
                    type: "person" // Default type
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Generation failed");
            }

            clearInterval(progressInterval)
            setProgress(100)
            setTimeout(() => {
                setResultImage(data.result_url)
                setStep("result")
            }, 800)
        } catch (error: any) {
            clearInterval(progressInterval)
            if (error.name === 'AbortError') return;

            const msg = error.message
            if (msg === "STORE_LIMIT_REACHED") {
                setStep("limit-reached")
            } else {
                alert("Generation failed: " + msg)
                setStep("upload")
            }
        }
    }

    const reset = () => {
        setUserImage(null)
        setResultImage(null)
        setStep("upload")
        setProgress(0)
    }

    if (!productImage) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4 text-gray-900">
                <div className="text-center">
                    <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold">Missing Product Image</h2>
                    <p className="text-gray-500">Please open this widget from a Shopify product page.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-0 font-sans text-gray-900 overflow-hidden">
            <div className="w-full h-full max-w-[500px] flex flex-col relative px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Virtual Try-On</h1>
                        <p className="text-xs text-gray-400 font-medium">Powered by DrOutfit</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col">
                    {step === "upload" && (
                        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {!userImage ? (
                                <div
                                    className={`
                                        flex-1 flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed transition-all duration-300
                                        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 bg-gray-50/50'}
                                    `}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className="w-20 h-20 rounded-3xl bg-[#3B82F6] flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10">
                                        <Upload className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-gray-900">Upload Your Photo</h3>
                                    <p className="text-sm text-gray-500 text-center max-w-[220px] leading-relaxed">
                                        Drag & drop or tap to browse. Clear full-body shots work best for realistic results.
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleUserImageUpload}
                                    />
                                </div>
                            ) : (
                                <div className="relative flex-1 rounded-[32px] overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                                    <img src={userImage} alt="User" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setUserImage(null)}
                                        className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-black/70 transition-all"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {/* Action Button */}
                            {userImage && (
                                <button
                                    onClick={handleGenerate}
                                    className="mt-6 w-full bg-black text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-gray-800 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                                >
                                    <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                    Generate Try-On
                                </button>
                            )}

                            {/* Privacy Badge */}
                            <div className="mt-6 flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <ShieldCheck className="h-5 w-5 text-gray-400 shrink-0" />
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    <span className="text-gray-900 font-bold">Privacy:</span> Your photo is processed securely in real-time and deleted automatically.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === "processing" && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                            <div className="relative w-28 h-28 mb-8">
                                <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                                <div
                                    className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"
                                    style={{ animationDuration: '1s' }}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-bold text-gray-900">{Math.round(progress)}%</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Generating Your Look</h3>
                            <p className="text-sm text-gray-500 max-w-[240px]">
                                Our AI is stitching the garment onto your photo. This takes just a moment...
                            </p>
                        </div>
                    )}

                    {step === "result" && resultImage && (
                        <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500">
                            <div className="relative flex-1 rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100">
                                <img src={resultImage} alt="Result" className="w-full h-full object-cover" />
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <button
                                    onClick={reset}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try Another
                                </button>
                                <button
                                    onClick={() => {
                                        // Communicate to Shopify Parent to close modal & focus on product
                                        if (window.parent) {
                                            window.parent.postMessage({ type: 'droutfit_add_to_cart' }, '*')
                                        }
                                    }}
                                    className="bg-black text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                >
                                    Complete Purchase
                                    <ShoppingBag className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "limit-reached" && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 px-4">
                            <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center mb-8 relative">
                                <div className="absolute inset-0 rounded-full border border-amber-200 animate-ping opacity-20"></div>
                                <ShieldCheck className="h-10 w-10 text-amber-500" />
                            </div>

                            <h3 className="text-2xl font-black mb-4 text-gray-900 uppercase italic">Service Unavailable</h3>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-[280px] mb-10">
                                This service is currently unavailable. Please <span className="text-gray-900 font-bold">contact the store brand</span> for more information.
                            </p>

                            <button
                                onClick={reset}
                                className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-gray-800 transition-all active:scale-[0.98]"
                            >
                                Close Widget
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ShopifyWidgetPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        }>
            <ShopifyWidgetContent />
        </Suspense>
    )
}
