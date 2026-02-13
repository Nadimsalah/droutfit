"use client"

import { useParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Upload, X, Sparkles, ArrowRight, ShieldCheck, RefreshCw, ShoppingBag, Loader2, Image as ImageIcon } from "lucide-react"
import { uploadImage } from "@/lib/supabase"
import { generateTryOn } from "@/lib/nanobanana"
import { getProductById, incrementProductUsage } from "@/lib/storage"

export default function WidgetPage() {
    const params = useParams()
    const [step, setStep] = useState<"upload" | "processing" | "result">("upload")
    const [userImage, setUserImage] = useState<string | null>(null)
    const [userFile, setUserFile] = useState<File | null>(null)
    const [resultImage, setResultImage] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [product, setProduct] = useState<{ id: string, name: string, image: string, storeUrl?: string } | null>(null)

    useEffect(() => {
        const loadProduct = async () => {
            const id = params.id as string
            const stored = await getProductById(id)
            if (stored) {
                setProduct({
                    id: stored.id,
                    name: stored.name || "Your Custom Garment",
                    image: stored.image,
                    storeUrl: stored.storeUrl
                })
            } else {
                setProduct({
                    id: id,
                    name: "Classic Denim Jacket",
                    image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
                    storeUrl: "https://example.com"
                })
            }
        }
        loadProduct()
    }, [params.id])

    if (!product) return null

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
        if (!userFile) return
        setStep("processing")
        setProgress(0)

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev
                return prev + Math.random() * 5
            })
        }, 400)

        try {
            const publicUrl = await uploadImage(userFile)
            const response = await generateTryOn(product?.image || "", publicUrl)

            if (response.status === 'success') {
                if (product?.id) {
                    await incrementProductUsage(product.id)
                }

                clearInterval(progressInterval)
                setProgress(100)
                setTimeout(() => {
                    setResultImage(response.result_url)
                    setStep("result")
                }, 800)
            } else {
                throw new Error(response.error || "Generation failed")
            }
        } catch (error) {
            clearInterval(progressInterval)
            alert("Generation failed: " + (error as Error).message)
            setStep("upload")
        }
    }

    const reset = () => {
        setUserImage(null)
        setResultImage(null)
        setStep("upload")
        setProgress(0)
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4 font-sans text-gray-800">
            {/* Main Glass Card */}
            <div className="w-full max-w-[480px] bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden transition-all duration-500">

                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Virtual Try-On
                        </h1>
                        <p className="text-xs text-gray-500 font-medium mt-1">Powered by AI</p>
                    </div>
                    <div className="h-10 w-10 rounded-2xl bg-white shadow-sm border border-gray-100 p-1 flex items-center justify-center overflow-hidden">
                        <img src={product.image} alt="Product" className="h-full w-full object-cover rounded-xl" />
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 min-h-[420px] flex flex-col">

                    {step === "upload" && (
                        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex-1 flex flex-col justify-center">
                                {!userImage ? (
                                    <div
                                        className={`
                                            relative rounded-[24px] border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300
                                            ${isDragging
                                                ? 'border-blue-400 bg-blue-50/50 scale-[1.02]'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50'
                                            }
                                        `}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20 text-white">
                                            <Upload className="h-7 w-7" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">Upload Your Photo</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                                            Drag & drop or tap to browse. Clear full-body shots work best.
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
                                    <div className="relative rounded-[24px] overflow-hidden group shadow-lg">
                                        <img src={userImage} alt="User" className="w-full h-[320px] object-cover" />
                                        <button
                                            onClick={() => setUserImage(null)}
                                            className="absolute top-3 right-3 bg-white/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/50 transition-all border border-white/20"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-6 pt-12">
                                            <p className="text-white text-sm font-medium">Ready to generate?</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Privacy Notice */}
                            <div className="mt-6 flex items-start gap-3 bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                                <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    <span className="font-bold text-gray-800">Privacy First:</span> We process your photo in real-time and do NOT store it. Your data is automatically deleted after the session.
                                </p>
                            </div>

                            {userImage && (
                                <button
                                    onClick={handleGenerate}
                                    className="mt-6 w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                    Generate Try-On
                                </button>
                            )}
                        </div>
                    )}

                    {step === "processing" && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                            <div className="relative w-24 h-24 mb-8">
                                <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                                <div
                                    className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
                                    style={{ animationDuration: '1.5s' }}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-bold text-gray-800">{Math.round(progress)}%</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Fabric</h3>
                            <p className="text-sm text-gray-500 max-w-[240px] leading-relaxed">
                                Our AI is mapping the garment to your pose. This typically takes 5-10 seconds.
                            </p>

                            <div className="mt-12 bg-gray-50 rounded-2xl p-4 w-full flex items-center gap-3">
                                <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                                <span className="text-xs text-gray-500 font-medium">Processing high-resolution mesh...</span>
                            </div>
                        </div>
                    )}

                    {step === "result" && resultImage && (
                        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="relative flex-1 rounded-[24px] overflow-hidden shadow-2xl shadow-blue-900/5 group border border-gray-100">
                                <img src={resultImage} alt="Result" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                    <p className="text-white font-medium">✨ Looks great on you!</p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-5 gap-3">
                                <button
                                    onClick={reset}
                                    className="col-span-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Retry
                                </button>
                                <button
                                    className="col-span-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                                    onClick={() => {
                                        if (product.storeUrl) window.open(product.storeUrl, '_blank')
                                    }}
                                >
                                    Shop Now
                                    <ShoppingBag className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[100px] opacity-50"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-100 rounded-full blur-[100px] opacity-50"></div>
            </div>
        </div>
    )
}
