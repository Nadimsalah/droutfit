"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Copy, Check, ExternalLink, ArrowLeft, Code, Trash2, Eye, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { getProductById, Product, deleteProduct } from "@/lib/storage"
import Toast from "@/components/Toast"

export default function ProductDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [embedType, setEmbedType] = useState<"iframe" | "script" | "popup" | "wordpress">("iframe")
    const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" }>({
        isVisible: false,
        message: "",
        type: "success"
    })

    useEffect(() => {
        const fetchProduct = async () => {
            if (params.id) {
                const data = await getProductById(params.id as string)
                setProduct(data || null)
                setLoading(false)
            }
        }
        fetchProduct()
    }, [params.id])

    const handleDelete = async () => {
        if (!product || !confirm("Are you sure you want to delete this product?")) return

        try {
            await deleteProduct(product.id)
            router.push("/dashboard/products")
        } catch (error) {
            console.error(error)
            setToast({ isVisible: true, message: "Delete failed. Check database permissions.", type: "error" })
        }
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setToast({ isVisible: true, message: "Copied to clipboard", type: "success" })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
                <p className="text-gray-400 mb-6">The product you are looking for does not exist or has been deleted.</p>
                <Link
                    href="/dashboard/products"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
                >
                    Return to Products
                </Link>
            </div>
        )
    }

    const getEmbedCode = () => {
        const origin = window.location.origin
        switch (embedType) {
            case "iframe":
                return `<iframe src="${origin}/widget/${product.id}" width="100%" height="600" frameborder="0"></iframe>`
            case "script":
                return `<script src="${origin}/widget-loader.js" data-product-id="${product.id}"></script>`
            case "popup":
                return `<!-- Include this once -->
<script src="${origin}/widget-loader.js"></script>

<!-- Place this button anywhere -->
<button onclick="DrOutfit.open('${product.id}')" style="padding: 12px 24px; background: #000; color: #fff; border-radius: 8px; border: none; cursor: pointer; font-weight: bold;">
  Try On Now
</button>`
            case "wordpress":
                return `[droutfit_button id="${product.id}" label="Virtual Try-On"]

<!-- OR use Custom HTML block: -->
<script src="${origin}/widget-loader.js"></script>
<button onclick="DrOutfit.open('${product.id}')" class="droutfit-popup-btn">Virtual Try-On</button>`
            default:
                return ""
        }
    }

    const embedCode = getEmbedCode()

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Products
                    </button>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Product Details</h1>
                    <p className="text-gray-400 text-sm font-medium mt-1">
                        Manage integration and view performance stats.
                    </p>
                </div>
                <div className="flex gap-3">
                    <a
                        href={`/widget/${product.id}`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 bg-[#13171F] border border-gray-800 text-white hover:bg-gray-800 rounded-xl text-sm font-bold transition-all"
                    >
                        <Eye className="h-4 w-4" />
                        Preview Widget
                    </a>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-sm font-bold transition-all"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Image & Stats */}
                <div className="space-y-6">
                    {/* Image Card */}
                    <div className="bg-[#13171F] border border-gray-800/40 rounded-2xl p-6 shadow-xl">
                        <div className="aspect-[3/4] w-full bg-[#0B0E14] rounded-xl overflow-hidden border border-gray-800 relative group">
                            <img
                                src={product.image}
                                alt="Product"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="mt-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold text-lg">Product ID</h3>
                                <p className="text-gray-500 text-xs font-mono mt-1">{product.id}</p>
                            </div>
                            <button
                                onClick={() => handleCopy(product.id)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-[#13171F] border border-gray-800/40 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Eye className="h-4 w-4 text-blue-500" />
                            Performance
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0B0E14] border border-gray-800 rounded-xl p-4">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Try-ons</p>
                                <p className="text-2xl font-black text-white mt-1">{product.usage}</p>
                            </div>
                            <div className="bg-[#0B0E14] border border-gray-800 rounded-xl p-4">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Status</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-bold text-green-500">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Integration Infos */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Store Link Card */}
                    <div className="bg-[#13171F] border border-gray-800/40 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-purple-500" />
                            Store Connection
                        </h3>
                        <div className="bg-[#0B0E14] border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
                            <div className="flex-1 w-full relative">
                                <div className="absolute left-3 top-3 text-gray-500">
                                    <ExternalLink className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    readOnly
                                    value={product.storeUrl || "No store URL linked"}
                                    className="w-full bg-[#1A1F29] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-300 focus:outline-none"
                                />
                            </div>
                            {product.storeUrl && (
                                <a
                                    href={product.storeUrl}
                                    target="_blank"
                                    className="w-full sm:w-auto px-4 py-2.5 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    Visit Store <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Integration Code Card */}
                    <div className="bg-[#13171F] border border-gray-800/40 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Code className="h-4 w-4 text-green-500" />
                                Integration Method
                            </h3>
                        </div>

                        {/* Integration Tabs */}
                        <div className="flex space-x-1 mb-4 bg-[#0B0E14] p-1 rounded-xl border border-gray-800">
                            {["iframe", "script", "popup", "wordpress"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setEmbedType(type as any)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all uppercase ${embedType === type
                                        ? "bg-gray-800 text-white shadow-sm border border-gray-700"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="relative group">
                            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#0B0E14] to-transparent pointer-events-none rounded-t-xl" />
                            <pre className="bg-[#0B0E14] border border-gray-800 rounded-xl p-6 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap min-h-[160px] leading-relaxed selection:bg-blue-500/30">
                                <code className="language-html">{embedCode}</code>
                            </pre>
                            <button
                                onClick={() => handleCopy(embedCode)}
                                className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all border border-gray-700 shadow-lg opacity-0 group-hover:opacity-100"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-4">
                            {embedType === "popup" && (
                                <p className="text-gray-500 text-xs flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    This creates a button that opens the Try-On widget in a modal overlay.
                                </p>
                            )}
                            {embedType === "wordpress" && (
                                <p className="text-gray-500 text-xs flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    Use a Custom HTML block in WordPress to insert this button.
                                </p>
                            )}
                            {(embedType === "iframe" || embedType === "script") && (
                                <p className="text-gray-500 text-xs flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    Paste this code into your website's HTML where you want the widget to appear.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    )
}
