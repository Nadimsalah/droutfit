"use client"

import { Upload, X, Link as LinkIcon } from "lucide-react"
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
        <div className="space-y-8 max-w-2xl mx-auto">
            <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">Add Product Image</h2>
                <p className="text-lg font-bold text-gray-600 border-l-4 border-black pl-4 mt-2">
                    Start by uploading your garment image and linking it to your store.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_black] p-8 space-y-6">

                <div className="space-y-2">
                    <label className="text-sm font-black uppercase">Garment Image</label>
                    <div className="border-2 border-dashed border-black bg-gray-50 p-8 text-center cursor-pointer hover:bg-pink-50 transition-colors relative">
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImageUpload}
                        />

                        {imagePreview ? (
                            <div className="relative inline-block border-2 border-black shadow-[4px_4px_0px_0px_black]">
                                <img src={imagePreview} alt="Preview" className="h-64 object-cover" />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setImagePreview(null);
                                        setFileToUpload(null);
                                    }}
                                    className="absolute -top-3 -right-3 bg-red-500 border-2 border-black text-white p-1 hover:bg-red-600 shadow-[2px_2px_0px_0px_black]"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload className="h-10 w-10 mb-4 text-black" />
                                <p className="font-bold text-sm">DRAG IMAGE OR CLICK TO UPLOAD</p>
                                <p className="text-xs text-gray-500 mt-2 font-bold">PNG, JPG up to 10MB</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black uppercase">E-commerce Store URL</label>
                    <div className="relative border-2 border-black shadow-[4px_4px_0px_0px_black]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none border-r-2 border-black bg-yellow-300 pr-3">
                            <LinkIcon className="h-4 w-4 text-black" />
                        </div>
                        <input
                            type="url"
                            value={storeUrl}
                            onChange={(e) => setStoreUrl(e.target.value)}
                            placeholder="https://yourstore.com/product/123"
                            className="block w-full pl-14 pr-4 py-3 text-sm font-bold bg-white border-none outline-none focus:bg-blue-50 transition-colors"
                            required
                        />
                    </div>
                    <p className="text-xs font-bold text-gray-400 italic">Buyers will be redirected here after the try-on.</p>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="border-2 border-black bg-white px-6 py-3 text-sm font-black text-black hover:bg-red-200 shadow-[4px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !imagePreview}
                        className="border-2 border-black bg-pink-400 px-6 py-3 text-sm font-black text-black hover:bg-pink-300 shadow-[4px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? "Adding Product..." : "Add Product"}
                    </button>
                </div>

            </form>
        </div>
    )
}
