"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Copy, ExternalLink, ArrowLeft, Trash2, Eye, ShoppingBag, CheckCircle2, XCircle, Clock, ImageIcon, RefreshCw } from "lucide-react"
import Link from "next/link"
import { getProductById, Product, deleteProduct } from "@/lib/storage"
import Toast from "@/components/Toast"
import { supabase } from "@/lib/supabase"

export default function ProductDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [tryonLogs, setTryonLogs] = useState<any[]>([])
    const [logsLoading, setLogsLoading] = useState(true)
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

    useEffect(() => {
        const fetchLogs = async () => {
            if (!params.id) return;
            setLogsLoading(true);
            const { data, error } = await supabase
                .from('usage_logs')
                .select('*')
                .eq('product_id', params.id as string)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                setTryonLogs(data);
            }
            setLogsLoading(false);
        };
        fetchLogs();
    }, [params.id]);

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

    const getResultUrl = (log: any): string | null => {
        try {
            const meta = JSON.parse(log.error_message || '{}');
            return meta.result_url || null;
        } catch { return null; }
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
                        <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-purple-500" />
                            Store Connection
                        </h3>
                        <p className="text-gray-500 text-xs mb-4">Your DrOutfit product Try-On widget URL — embed this link into your store product page.</p>
                        <div className="bg-[#0B0E14] border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
                            <div className="flex-1 w-full relative">
                                <div className="absolute left-3 top-3 text-gray-500">
                                    <ExternalLink className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    readOnly
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/widget/${product.id}`}
                                    className="w-full bg-[#1A1F29] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-300 focus:outline-none cursor-pointer"
                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => handleCopy(`${window.location.origin}/widget/${product.id}`)}
                                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    <Copy className="h-3 w-3" /> Copy
                                </button>
                                <a
                                    href={`/widget/${product.id}`}
                                    target="_blank"
                                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    Preview <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Try-On Logs Table */}
                    <div className="bg-[#13171F] border border-gray-800/40 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Eye className="h-4 w-4 text-green-500" />
                                Try-On Activity Logs
                            </h3>
                            <button
                                onClick={() => {
                                    setLogsLoading(true);
                                    supabase.from('usage_logs').select('*').eq('product_id', product.id).order('created_at', { ascending: false }).limit(50)
                                        .then(({ data }) => { if (data) setTryonLogs(data); setLogsLoading(false); });
                                }}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                title="Refresh"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>

                        {logsLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                            </div>
                        ) : tryonLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                                    <ImageIcon className="h-8 w-8 text-gray-600" />
                                </div>
                                <p className="text-gray-500 font-bold text-sm">No try-ons recorded yet</p>
                                <p className="text-gray-600 text-xs mt-1">Results will appear here when customers use the widget.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-800">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-800 bg-[#0B0E14]">
                                            <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Result</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Latency</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</th>
                                            <th className="py-3 px-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tryonLogs.map((log, i) => {
                                            const resultUrl = getResultUrl(log);
                                            const isSuccess = log.status >= 200 && log.status < 300;
                                            return (
                                                <tr key={log.id} className={`border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                                                    <td className="py-3 px-4">
                                                        <div className="h-12 w-10 rounded-lg overflow-hidden bg-[#0B0E14] border border-gray-800 flex items-center justify-center">
                                                            {resultUrl ? (
                                                                <img src={resultUrl} alt="Result" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <ImageIcon className="h-4 w-4 text-gray-600" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isSuccess ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                            }`}>
                                                            {isSuccess ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="flex items-center gap-1.5 text-gray-400 text-xs font-mono">
                                                            <Clock className="h-3 w-3 text-gray-600" />
                                                            {log.latency || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-gray-500 text-xs">
                                                            {new Date(log.created_at).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {resultUrl && (
                                                            <a
                                                                href={resultUrl}
                                                                target="_blank"
                                                                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors inline-flex"
                                                                title="Open full image"
                                                            >
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
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
