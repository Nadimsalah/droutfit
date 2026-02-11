"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import { Copy, Check, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function ProductDetailsPage() {
    const params = useParams()
    const [copied, setCopied] = useState(false)
    const [embedType, setEmbedType] = useState<"iframe" | "script">("iframe")

    // Mock product data
    const product = {
        id: params.id,
        name: "Vintage Denim Jacket",
        image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category: "Outerwear"
    }

    const embedCode = embedType === "iframe"
        ? `<iframe src="http://localhost:3000/widget/${product.id}" width="100%" height="600" frameborder="0"></iframe>`
        : `<script src="http://localhost:3000/widget-loader.js" data-product-id="${product.id}"></script>`

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard/products" className="text-sm font-bold text-gray-500 hover:text-black hover:underline mb-2 block">
                        &larr; Back to Products
                    </Link>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic">{product.name}</h2>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="bg-pink-400 border-2 border-black px-3 py-1 text-sm font-bold shadow-[2px_2px_0px_0px_black]">
                            {product.category}
                        </span>
                    </div>
                </div>
                <a href={`/widget/${product.id}`} target="_blank" className="flex items-center gap-2 text-sm font-bold border-b-2 border-black pb-0.5 hover:text-pink-500 hover:border-pink-500 transition-colors">
                    Preview Widget <ExternalLink className="h-4 w-4" />
                </a>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_black] p-4">
                    <img src={product.image} alt={product.name} className="w-full h-[400px] object-cover border-2 border-black" />
                </div>

                <div className="space-y-6">
                    <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_black] p-6">
                        <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                            Integration Code
                        </h3>
                        <p className="text-sm font-bold text-gray-600 mb-6">
                            Copy this code to your website to visualize this product.
                        </p>

                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setEmbedType("iframe")}
                                className={`flex-1 py-2 text-sm font-black border-2 border-black transition-all uppercase ${embedType === "iframe" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
                            >
                                Iframe
                            </button>
                            <button
                                onClick={() => setEmbedType("script")}
                                className={`flex-1 py-2 text-sm font-black border-2 border-black transition-all uppercase ${embedType === "script" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
                            >
                                Script Tag
                            </button>
                        </div>

                        <div className="relative">
                            <pre className="bg-gray-100 border-2 border-black p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap min-h-[100px]">
                                {embedCode}
                            </pre>
                            <button
                                onClick={handleCopy}
                                className="absolute top-2 right-2 p-2 bg-white border-2 border-black hover:bg-pink-200 transition-colors shadow-[2px_2px_0px_0px_black] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                            >
                                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="border-2 border-black bg-yellow-300 shadow-[8px_8px_0px_0px_black] p-6">
                        <h3 className="text-lg font-black uppercase mb-2">Need Help?</h3>
                        <p className="text-sm font-bold text-black mb-4">
                            Check our documentation for advanced integration options including customized sizing and styling.
                        </p>
                        <button className="text-sm font-black underline hover:text-white transition-colors">
                            Read Documentation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
