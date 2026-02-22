"use client"

import { useParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Upload, X, Sparkles, ArrowRight, ShieldCheck, RefreshCw, ShoppingBag, Loader2, Image as ImageIcon } from "lucide-react"
import { uploadImage } from "@/lib/supabase"
import { generateTryOn, getTryOnLimit } from "@/lib/nanobanana"
import { getProductByIdPublic, incrementProductUsage } from "@/lib/storage"

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
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [remainingTries, setRemainingTries] = useState<number | null>(null)

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const id = params.id as string
                const stored = await getProductByIdPublic(id)

                if (stored) {
                    setProduct({
                        id: stored.id,
                        name: stored.name || "Virtual Try-On Product",
                        image: stored.image,
                        storeUrl: stored.storeUrl
                    })

                    // Fetch remaining tries using new helper
                    console.log("Fetching limit for product:", stored.id)
                    try {
                        const limitStatus = await getTryOnLimit(stored.id)
                        console.log("Limit status received:", limitStatus)
                        setRemainingTries(limitStatus.remaining)
                    } catch (limitErr) {
                        console.error("Failed to fetch limit:", limitErr)
                        // Default to 5 if fetch fails to avoid blocking user completely, or 0 if we want to be safe?
                        // Let's set it to valid number so it displays something.
                        setRemainingTries(5)
                    }
                } else {
                    setError("Product not found")
                }
            } catch (err) {
                console.error(err)
                setError("Failed to load product")
            } finally {
                setLoading(false)
            }
        }
        loadProduct()
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm">
                    <X className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Product Not Found</h3>
                    <p className="text-gray-500 text-sm">
                        The product you are looking for does not exist or has been removed.
                    </p>
                </div>
            </div>
        )
    }

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
            // Pass product.id to the generator for rate limiting and usage tracking
            const response = await generateTryOn(product?.image || "", publicUrl, product?.id || "")

            if (response.status === 'success') {
                if (product?.id) {
                    // Usage is now incremented on the server
                    // Update local state to reflect usage
                    setRemainingTries(prev => prev !== null ? Math.max(0, prev - 1) : null)
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
                                    <>
                                        <div
                                            className={`
                                            relative rounded-[24px] border-2 border-dashed p-8 text-center transition-all duration-300
                                            ${remainingTries !== null && remainingTries <= 0
                                                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                                    : isDragging
                                                        ? 'border-blue-400 bg-blue-50/50 scale-[1.02] cursor-pointer'
                                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50 cursor-pointer'
                                                }
                                        `}
                                            onClick={() => {
                                                if (remainingTries === null || remainingTries <= 0) return
                                                fileInputRef.current?.click()
                                            }}
                                            onDragOver={remainingTries === null || remainingTries <= 0 ? undefined : handleDragOver}
                                            onDragLeave={remainingTries === null || remainingTries <= 0 ? undefined : handleDragLeave}
                                            onDrop={remainingTries === null || remainingTries <= 0 ? undefined : handleDrop}
                                        >
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg text-white ${remainingTries !== null && remainingTries <= 0 ? 'bg-gray-400 shadow-gray-400/20' : 'bg-gradient-to-br from-blue-500 to-violet-500 shadow-blue-500/20'}`}>
                                                {remainingTries !== null && remainingTries <= 0 ? (
                                                    <ShieldCheck className="h-7 w-7" />
                                                ) : (
                                                    <Upload className="h-7 w-7" />
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                                {remainingTries !== null && remainingTries <= 0 ? "Daily Limit Reached" : "Upload Your Photo"}
                                            </h3>

                                            <p className="text-sm text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                                                {remainingTries !== null && remainingTries <= 0
                                                    ? "You have used all your free try-ons for today. Please try again tomorrow."
                                                    : "Drag & drop or tap to browse. Clear full-body shots work best."
                                                }
                                            </p>

                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleUserImageUpload}
                                                disabled={remainingTries === null || (remainingTries !== null && remainingTries <= 0)}
                                            />
                                        </div>

                                        {remainingTries !== null && remainingTries <= 0 && product?.storeUrl && (
                                            <button
                                                onClick={() => window.open(product.storeUrl, '_blank')}
                                                className="mt-4 w-full bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                            >
                                                <ShoppingBag className="h-4 w-4" />
                                                Back to Store
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="relative rounded-[24px] overflow-hidden group shadow-lg">
                                        <img src={userImage || ""} alt="User" className="w-full h-[320px] object-cover" />
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
                                <div className="space-y-3 mt-6">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={remainingTries === null || (remainingTries !== null && remainingTries <= 0)}
                                        className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {remainingTries === null ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Checking Limit...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                                {remainingTries !== null && remainingTries <= 0 ? "Daily Limit Reached" : "Generate Try-On"}
                                            </>
                                        )}
                                    </button>

                                    {remainingTries !== null && (
                                        <p className="text-center text-xs text-gray-400 font-medium animate-in fade-in">
                                            {remainingTries} free try-ons remaining today
                                        </p>
                                    )}
                                </div>
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

            </div >
            <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[100px] opacity-50"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-100 rounded-full blur-[100px] opacity-50"></div>
            </div>
        </div >
    )
}
