"use client"

import Link from "next/link"
import { Plus, Search, Link as LinkIcon, Code, Eye, Trash2, MoreHorizontal, Copy } from "lucide-react"
import { useEffect, useState } from "react"
import { getProducts, Product, deleteProduct } from "@/lib/storage"
import Toast from "@/components/Toast"

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" }>({
        isVisible: false,
        message: "",
        type: "success"
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
            setToast({ isVisible: true, message: "Product deleted successfully", type: "success" });
        } catch (error) {
            console.error(error);
            setToast({ isVisible: true, message: "Delete failed. Check database permissions.", type: "error" });
        }
    }

    const handleCopyUrl = (id: string) => {
        const url = `${window.location.origin}/widget/${id}`
        navigator.clipboard.writeText(url)
        setToast({ isVisible: true, message: "Widget URL copied to clipboard", type: "success" })
    }

    const handleCopyHtml = (id: string) => {
        const html = `<iframe src="${window.location.origin}/widget/${id}" width="100%" height="600" frameborder="0"></iframe>`
        navigator.clipboard.writeText(html)
        setToast({ isVisible: true, message: "Embed code copied to clipboard", type: "success" })
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Products</h1>
                    <p className="text-gray-400 text-sm font-medium">
                        Manage your visual catalogue and track performance.
                    </p>
                </div>
                <Link href="/dashboard/products/add" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </button>
                </Link>
            </div>

            {/* Main Content Card */}
            <div className="bg-[#13171F] border border-gray-800/40 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                {/* Toolbar */}
                <div className="p-6 border-b border-gray-800/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#13171F]">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <input
                            type="search"
                            placeholder="Search products..."
                            className="h-10 w-full bg-[#0B0E14] border border-gray-800/50 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            {/* Mobile Grid View */}
                            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                                {products.map((product) => (
                                    <div key={product.id} className="bg-[#0B0E14] border border-gray-800/50 rounded-xl p-4 space-y-4">
                                        <div className="flex gap-4">
                                            <div className="h-20 w-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={product.image} alt="Product" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-white font-bold truncate">Product #{product.id.slice(0, 6)}</h3>
                                                        <p className="text-gray-500 text-xs mt-1">{product.usage} Try-ons</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    <button onClick={() => handleCopyUrl(product.id)} className="p-2 bg-gray-800/50 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                        <LinkIcon className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleCopyHtml(product.id)} className="p-2 bg-gray-800/50 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                        <Code className="h-4 w-4" />
                                                    </button>
                                                    <Link href={`/dashboard/products/${product.id}`} className="p-2 bg-gray-800/50 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-800/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">Product</th>
                                            <th className="px-6 py-4">Integration</th>
                                            <th className="px-6 py-4">Performance</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {products.map((product) => (
                                            <tr key={product.id} className="group hover:bg-[#1A1F29] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-16 w-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                                                            <img src={product.image} alt="" className="h-full w-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <span className="text-white font-medium block">ID: {product.id.slice(0, 8)}...</span>
                                                            <span className="text-gray-500 text-xs">Added recently</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleCopyUrl(product.id)}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#0B0E14] border border-gray-800/50 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                                                        >
                                                            <LinkIcon className="h-3 w-3" /> Copy URL
                                                        </button>
                                                        <button
                                                            onClick={() => handleCopyHtml(product.id)}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#0B0E14] border border-gray-800/50 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                                                        >
                                                            <Code className="h-3 w-3" /> Embed
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-bold text-lg">{product.usage}</span>
                                                        <span className="text-gray-500 text-xs">Total Try-ons</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            href={`/dashboard/products/${product.id}`}
                                                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-96 text-center p-6">
                            <div className="h-16 w-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-gray-600" />
                            </div>
                            <h3 className="text-white font-bold text-lg">No products found</h3>
                            <p className="text-gray-500 text-sm mt-2 max-w-sm">
                                You haven&apos;t added any products yet. Click the "Add Product" button to get started with your visual catalogue.
                            </p>
                        </div>
                    )}
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
