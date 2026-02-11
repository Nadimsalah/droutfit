"use client"

import Link from "next/link"
import { Plus, Search, Link as LinkIcon, Code, Eye, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getProducts, Product, deleteProduct } from "@/lib/storage"
import Toast from "@/components/Toast"

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [toast, setToast] = useState<{ isVisible: boolean; message: string }>({
        isVisible: false,
        message: ""
    })

    useEffect(() => {
        const fetchProducts = async () => {
            const data = await getProducts();
            setProducts(data);
        };
        fetchProducts();
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            alert("Delete failed: " + (error as Error).message);
        }
    }

    const handleCopyUrl = (id: string) => {
        const url = `${window.location.origin}/widget/${id}`
        navigator.clipboard.writeText(url)
        setToast({ isVisible: true, message: "Widget URL copied! ✨" })
    }

    const handleCopyHtml = (id: string) => {
        const html = `<iframe src="${window.location.origin}/widget/${id}" width="100%" height="600" frameborder="0"></iframe>`
        navigator.clipboard.writeText(html)
        setToast({ isVisible: true, message: "Embed code copied! 🚀" })
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic">Products</h2>
                    <p className="text-lg font-bold text-gray-600 border-l-4 border-black pl-4 mt-2">
                        Manage your visual catalogue.
                    </p>
                </div>
                <Link href="/dashboard/products/add">
                    <button className="flex items-center gap-2 border-2 border-black bg-pink-400 px-6 py-3 text-sm font-bold text-black shadow-[4px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
                        <Plus className="h-5 w-5" />
                        ADD IMAGE
                    </button>
                </Link>
            </div>

            <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_black]">
                <div className="flex items-center p-6 border-b-2 border-black bg-blue-100">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-black font-bold" />
                        <input
                            type="search"
                            placeholder="Search images..."
                            className="h-10 w-full border-2 border-black bg-white pl-10 pr-4 text-sm font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-500"
                        />
                    </div>
                </div>
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm font-bold">
                        <thead className="[&_tr]:border-b-2 border-black bg-gray-100">
                            <tr className="border-b-2 border-black">
                                <th className="h-12 px-6 text-left align-middle font-black text-black uppercase tracking-wider">Product Image</th>
                                <th className="h-12 px-6 text-left align-middle font-black text-black uppercase tracking-wider">Quick Actions</th>
                                <th className="h-12 px-6 text-left align-middle font-black text-black uppercase tracking-wider">Actions</th>
                                <th className="h-12 px-6 text-left align-middle font-black text-black uppercase tracking-wider">Delete</th>
                                <th className="h-12 px-6 text-right align-middle font-black text-black uppercase tracking-wider">Total Usage</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0 bg-white">
                            {products.map((product) => (
                                <tr
                                    key={product.id}
                                    className="border-b-2 border-black hover:bg-yellow-50 transition-colors"
                                >
                                    <td className="p-6 align-middle">
                                        <img src={product.image} alt="Product" className="h-32 w-24 object-cover border-2 border-black shadow-[4px_4px_0px_0px_black]" />
                                    </td>
                                    <td className="p-6 align-middle">
                                        <div className="flex flex-col gap-3 items-start">
                                            <button
                                                onClick={() => handleCopyUrl(product.id)}
                                                className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2 text-xs font-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_black] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all uppercase w-40 justify-center"
                                            >
                                                <LinkIcon className="h-3 w-3" /> Copy URL
                                            </button>
                                            <button
                                                onClick={() => handleCopyHtml(product.id)}
                                                className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2 text-xs font-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_black] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all uppercase w-40 justify-center"
                                            >
                                                <Code className="h-3 w-3" /> Copy Embed
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-6 align-middle">
                                        <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2 text-xs font-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_black] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all uppercase w-40 justify-center text-center">
                                            <Eye className="h-3 w-3" /> View Details
                                        </Link>
                                    </td>
                                    <td className="p-6 align-middle">
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2 text-xs font-black hover:bg-red-500 hover:text-white shadow-[2px_2px_0px_0px_black] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all uppercase w-40 justify-center text-center"
                                        >
                                            Delete Product
                                        </button>
                                    </td>
                                    <td className="p-6 align-middle text-right">
                                        <span className="text-3xl font-black">{product.usage}</span>
                                        <span className="text-xs font-bold text-gray-500 block uppercase pt-1">Try-ons generated</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    )
}
