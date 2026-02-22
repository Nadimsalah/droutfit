"use client"

import { Upload, X, Link as LinkIcon, ArrowLeft, Image as ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { saveProduct } from "@/lib/storage"
import { uploadImage } from "@/lib/supabase"

export default function AddProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [fileToUpload, setFileToUpload] = useState<File | null>(null)
    const [storeUrl, setStoreUrl] = useState("")
    const [isDragging, setIsDragging] = useState(false)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFileToUpload(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
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
            setFileToUpload(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!fileToUpload) return

        setLoading(true)

        try {
            // Upload to Supabase
            const publicUrl = await uploadImage(fileToUpload)

            // Save the PUBLIC URL and storeUrl to storage
            await saveProduct(publicUrl, storeUrl)
            router.push("/dashboard/products")
        } catch (error) {
            console.error("Upload failed", error)
            alert("Upload failed: " + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-medium"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Products
            </button>

            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Add New Product</h1>
                <p className="text-gray-400 text-sm">
                    Upload your product image and link it to your e-commerce store.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#13171F] border border-gray-800/40 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 space-y-8">
                    {/* Image Upload Section */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                            Product Image
                        </label>

                        {!imagePreview ? (
                            <div
                                className={`
                                    relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
                                    ${isDragging
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-gray-700 bg-[#0B0E14] hover:border-gray-600'
                                    }
                                `}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleImageUpload}
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-12 w-12 bg-gray-800 rounded-full flex items-center justify-center">
                                        <Upload className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white font-medium">Click to upload or drag and drop</p>
                                        <p className="text-gray-500 text-xs">SVG, PNG, JPG or GIF (max. 10MB)</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative group rounded-xl overflow-hidden bg-[#0B0E14] border border-gray-800">
                                <img src={imagePreview} alt="Preview" className="w-full h-64 object-contain" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setImagePreview(null)
                                            setFileToUpload(null)
                                        }}
                                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-red-500/20"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Store URL Section */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-blue-500" />
                            Store Link
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-3 text-gray-500">
                                <LinkIcon className="h-4 w-4" />
                            </div>
                            <input
                                type="url"
                                value={storeUrl}
                                onChange={(e) => setStoreUrl(e.target.value)}
                                placeholder="https://yourstore.com/products/..."
                                className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 ml-1">
                            Users will be redirected to this URL after trying on the item.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[#0B0E14]/50 border-t border-gray-800/50 p-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !imagePreview}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Product"
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
