"use client"

import { useParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Upload, X, Camera, Sparkles, Loader2, ArrowRight } from "lucide-react"
import { uploadImage } from "@/lib/supabase"
import { generateTryOn } from "@/lib/nanobanana"
import { getProductById } from "@/lib/storage"
import NeoProgressBar from "@/components/NeoProgressBar"

export default function WidgetPage() {
    const params = useParams()
    const [step, setStep] = useState<"upload" | "processing" | "result">("upload")
    const [userImage, setUserImage] = useState<string | null>(null)
    const [userFile, setUserFile] = useState<File | null>(null)
    const [resultImage, setResultImage] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
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
                // Fallback mock
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
            setUserFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setUserImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleGenerate = async () => {
        if (!userFile) return
        setStep("processing")
        setProgress(0)

        // Progress simulation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev
                return prev + Math.random() * 5
            })
        }, 400)

        try {
            // 1. Upload User Image to Supabase
            const publicUrl = await uploadImage(userFile)

            // 2. Call the API with the PUBLIC URL
            const response = await generateTryOn(product.image, publicUrl)

            if (response.status === 'success') {
                clearInterval(progressInterval)
                setProgress(100)
                // Small delay to show 100%
                setTimeout(() => {
                    setResultImage(response.result_url)
                    setStep("result")
                }, 500)
            } else {
                clearInterval(progressInterval)
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
    }

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white border-2 border-black shadow-[8px_8px_0px_0px_black] overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-yellow-400 border-b-2 border-black p-4 flex items-center justify-between shrink-0">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                    <div className="text-[10px] font-black bg-black text-white px-2 py-1 uppercase tracking-widest">
                        vto engine
                    </div>
                </div>

                {/* Product Info Bar */}
                <div className="bg-white border-b-2 border-black p-3 flex items-center gap-3 shrink-0">
                    <img src={product.image} alt={product.name} className="h-12 w-12 object-cover border-2 border-black" />
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Trying On</p>
                        <p className="text-sm font-black uppercase text-black leading-tight">{product.name}</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-gray-50 p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-y-auto">

                    {step === "upload" && (
                        <div className="w-full text-center space-y-6">
                            {!userImage ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-black bg-white p-10 cursor-pointer hover:bg-pink-50 transition-colors group"
                                >
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black group-hover:scale-110 transition-transform">
                                        <Camera className="h-8 w-8 text-black" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase mb-2">Upload Your Photo</h3>
                                    <p className="text-sm font-bold text-gray-500">
                                        Ensure your face and body are clearly visible.
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
                                <div className="relative inline-block border-2 border-black shadow-[4px_4px_0px_0px_black]">
                                    <img src={userImage} alt="User" className="max-h-[300px] object-cover" />
                                    <button
                                        onClick={() => setUserImage(null)}
                                        className="absolute -top-3 -right-3 bg-red-500 border-2 border-black text-white p-1 hover:bg-red-600 shadow-[2px_2px_0px_0px_black]"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {userImage && (
                                <button
                                    onClick={handleGenerate}
                                    className="w-full border-2 border-black bg-black text-white py-4 text-lg font-black uppercase tracking-widest hover:bg-gray-800 shadow-[4px_4px_0px_0px_#ff90e8] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#ff90e8] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
                                >
                                    Generate Try-On <ArrowRight className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    )}

                    {step === "processing" && (
                        <div className="w-full flex flex-col items-center justify-center py-10">
                            <NeoProgressBar
                                progress={progress}
                                message={progress < 40 ? "Analyzing Style..." : progress < 80 ? "Stitching Fabric..." : "Finalizing Magic..."}
                            />
                            <p className="text-xs font-bold text-gray-400 mt-6 animate-pulse uppercase tracking-widest">
                                Your digital garment is being tailored
                            </p>
                        </div>
                    )}

                    {step === "result" && resultImage && (
                        <div className="w-full space-y-6">
                            <div className="border-2 border-black bg-white p-2 shadow-[8px_8px_0px_0px_black] rotate-1">
                                <img src={resultImage} alt="Result" className="w-full object-cover" />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={reset}
                                    className="flex-1 border-2 border-black bg-white py-3 font-black uppercase shadow-[4px_4px_0px_0px_black] hover:bg-gray-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_black]"
                                >
                                    Try Another
                                </button>
                                <button
                                    className="flex-1 flex items-center justify-center border-2 border-black bg-pink-400 py-3 font-black uppercase shadow-[4px_4px_0px_0px_black] hover:bg-pink-300 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_black]"
                                    onClick={() => {
                                        if (product.storeUrl) {
                                            window.open(product.storeUrl, '_blank')
                                        } else {
                                            alert("Redirecting to checkout...")
                                        }
                                    }}
                                >
                                    Complete Buying
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
