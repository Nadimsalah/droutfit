"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Copy, ExternalLink, ArrowLeft, Trash2, Eye, ShoppingBag, CheckCircle2, XCircle, Clock, ImageIcon, RefreshCw, Calendar, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { getProductById, Product, deleteProduct } from "@/lib/storage"
import Toast from "@/components/Toast"
import { supabase } from "@/lib/supabase"

export default function DashboardProductDetailsClient({ dict, locale }: { dict: any, locale: string }) {
    const params = useParams()
    const router = useRouter()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [tryonLogs, setTryonLogs] = useState<any[]>([])
    const [logsLoading, setLogsLoading] = useState(true)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
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

    const fetchLogs = async () => {
        if (!params.id) return;
        setLogsLoading(true);

        let { data, error } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('product_id', params.id as string)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error("Error fetching logs:", error);
        }

        if (data) setTryonLogs(data);
        setLogsLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, [params.id]);

    const confirmDelete = async () => {
        if (!product) return
        setIsDeleting(true)
        try {
            await deleteProduct(product.id)
            setToast({ isVisible: true, message: dict.productDetailsPage.archivedSuccess, type: "success" })
            setTimeout(() => router.push(`/${locale}/dashboard/products`), 1500)
        } catch (error) {
            console.error(error)
            setToast({ isVisible: true, message: dict.productDetailsPage.deleteFailed, type: "error" })
            setIsDeleteModalOpen(false)
            setIsDeleting(false)
        }
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setToast({ isVisible: true, message: dict.productDetailsPage.copied, type: "success" })
    }

    const getResultUrl = (log: any): string | null => {
        try {
            const meta = JSON.parse(log.error_message || '{}');
            return meta.result_url || null;
        } catch { return null; }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
                </div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{dict.productDetailsPage.accessingData}</p>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                <div className="bg-[#13171F] p-12 rounded-[3rem] border border-white/5 shadow-2xl">
                    <XCircle className="h-16 w-16 text-red-500/50 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">{dict.productDetailsPage.disconnected}</h2>
                    <p className="text-gray-500 mb-8 max-w-[280px] mx-auto text-sm font-medium">{dict.productDetailsPage.idMismatch}</p>
                    <Link
                        href={`/${locale}/dashboard/products`}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {dict.productDetailsPage.returnToVault}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="text-left">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-4 text-[10px] font-black uppercase tracking-widest"
                    >
                        <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                        {dict.productDetailsPage.backToInventory}
                    </button>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4">
                        <div className="h-10 w-2 bg-blue-600 rounded-full" />
                        {dict.productDetailsPage.title}
                    </h1>
                </div>
                <div className="flex gap-4">
                    <a
                        href={`/widget/${product.id}`}
                        target="_blank"
                        className="flex items-center gap-2 px-6 py-3.5 bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.08] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                        <Eye className="h-4 w-4 text-blue-500" />
                        {dict.productDetailsPage.previewWidget}
                    </a>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-500/5"
                    >
                        <Trash2 className="h-4 w-4" />
                        {dict.productDetailsPage.archive}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10 text-left">
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[#13171F] border border-white/5 rounded-[2.5rem] p-8 shadow-3xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4">
                            <div className="px-3 py-1 bg-blue-600 rounded-full text-[9px] font-black text-white shadow-lg">{dict.productDetailsPage.premiumGen}</div>
                        </div>
                        <div className="aspect-[3/4] w-full bg-[#0B0E14] rounded-3xl overflow-hidden border border-white/5 relative shadow-inner">
                            <img
                                src={product.image}
                                alt={dict.productsPage.product}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="mt-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-gray-500 font-black uppercase tracking-widest text-[10px]">{dict.productDetailsPage.coreIdentity}</h3>
                                <p className="text-white font-mono text-xs mt-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">{product.id.toUpperCase()}</p>
                            </div>
                            <button
                                onClick={() => handleCopy(product.id)}
                                className="h-10 w-10 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg"
                                title={dict.productDetailsPage.copyUuid}
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#13171F] border border-white/5 rounded-[2.5rem] p-8 shadow-3xl">
                        <h3 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            {dict.productDetailsPage.liveMetrics}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0B0E14] border border-white/5 rounded-2xl p-5 shadow-inner">
                                <p className="text-gray-500 font-black text-[9px] uppercase tracking-widest">{dict.productDetailsPage.successfulTryons}</p>
                                <p className="text-3xl font-black text-white mt-2 tracking-tighter italic">{product.usage}</p>
                            </div>
                            <div className="bg-[#0B0E14] border border-white/5 rounded-2xl p-5 shadow-inner">
                                <p className="text-gray-500 font-black text-[9px] uppercase tracking-widest">{dict.productDetailsPage.uplinkStatus}</p>
                                <div className="flex items-center gap-2 mt-4">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                    <span className="text-xs font-black text-green-500 uppercase tracking-widest">{dict.productDetailsPage.active}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-[#13171F] border border-white/5 rounded-[2.5rem] p-8 shadow-3xl">
                        <div className="flex items-center gap-3 mb-2">
                            <ShoppingBag className="h-5 w-5 text-purple-500" />
                            <h3 className="text-white font-black uppercase tracking-widest text-xs italic">{dict.productDetailsPage.integrationHub}</h3>
                        </div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-6 opacity-60">{dict.productDetailsPage.integrationDesc}</p>

                        <div className="bg-[#0B0E14] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 shadow-inner relative overflow-hidden group">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/widget/${product.id}`}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-6 pr-4 text-xs font-mono text-blue-400 focus:outline-none cursor-pointer truncate text-left"
                                        onClick={(e) => (e.target as HTMLInputElement).select()}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                        <button
                                            onClick={() => handleCopy(`${window.location.origin}/widget/${product.id}`)}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all border border-white/5"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <a
                                    href={`/widget/${product.id}`}
                                    target="_blank"
                                    className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5 active:scale-95"
                                >
                                    {dict.productDetailsPage.launchWidget} <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-white/[0.02]">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0B0E14] bg-white opacity-10" />
                                    ))}
                                </div>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{dict.productDetailsPage.compatibility}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#13171F] border border-white/5 rounded-[2.5rem] shadow-3xl overflow-hidden min-h-[400px] flex flex-col relative group/table">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#0B0E14]/30">
                            <div>
                                <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-3 italic">
                                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                                    {dict.productDetailsPage.transactionSequence}
                                </h3>
                                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50">{dict.productDetailsPage.historyDesc}</p>
                            </div>
                            <button
                                onClick={fetchLogs}
                                disabled={logsLoading}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-blue-500 disabled:opacity-30 active:scale-95 shadow-lg"
                                title={dict.productDetailsPage.refresh}
                            >
                                <RefreshCw className={`h-4 w-4 ${logsLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {logsLoading && tryonLogs.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4 animate-in fade-in duration-500">
                                <div className="h-12 w-12 border-t-2 border-blue-500 border-r-2 border-transparent rounded-full animate-spin" />
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] animate-pulse">{dict.productDetailsPage.decryptingLogs}</p>
                            </div>
                        ) : tryonLogs.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-8">
                                <div className="h-20 w-20 bg-[#0B0E14] border border-white/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl transition-transform group-hover/table:scale-110">
                                    <ImageIcon className="h-8 w-8 text-gray-800" />
                                </div>
                                <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-2 tracking-tighter">{dict.productDetailsPage.noSequence}</h4>
                                <p className="text-gray-600 text-xs font-medium max-w-[240px] leading-relaxed mx-auto italic opacity-60">
                                    {dict.productDetailsPage.noSequenceDesc}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-separate border-spacing-0">
                                    <thead className="bg-[#0B0E14]/50">
                                        <tr>
                                            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">{dict.productDetailsPage.visual}</th>
                                            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">{dict.productDetailsPage.outcome}</th>
                                            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">{dict.productDetailsPage.latency}</th>
                                            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">{dict.productDetailsPage.timestamp}</th>
                                            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.02]">
                                        {tryonLogs.map((log, i) => {
                                            const resultUrl = getResultUrl(log);
                                            const isSuccess = log.status >= 200 && log.status < 300;
                                            return (
                                                <tr key={log.id} className="hover:bg-white/[0.02] transition-all group/row">
                                                    <td className="p-6">
                                                        <div className="relative h-16 w-12 rounded-xl overflow-hidden bg-[#0B0E14] border border-white/5 shadow-2xl transition-transform group-hover/row:scale-105">
                                                            {resultUrl ? (
                                                                <img src={resultUrl} alt={dict.productDetailsPage.visual} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center">
                                                                    <ImageIcon className="h-5 w-5 text-gray-800" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${isSuccess
                                                            ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-lg shadow-green-500/5'
                                                            : 'bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-500/5'
                                                            }`}>
                                                            <div className={`h-1.5 w-1.5 rounded-full ${isSuccess ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                            {isSuccess ? dict.productDetailsPage.success : dict.productDetailsPage.failed}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-2 text-gray-500 text-xs font-mono italic">
                                                            <Clock className="h-3 w-3 text-gray-700" />
                                                            {log.latency || '—'}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-2 text-white font-bold text-xs tracking-tight">
                                                                <Calendar className="h-3.5 w-3.5 text-blue-500/70" />
                                                                {new Date(log.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 font-mono tracking-tighter pl-5 uppercase">
                                                                {new Date(log.created_at).toLocaleTimeString(locale === 'ar' ? 'ar-EG' : locale === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        {resultUrl && (
                                                            <a
                                                                href={resultUrl}
                                                                target="_blank"
                                                                className="h-10 w-10 inline-flex items-center justify-center bg-white/5 hover:bg-blue-600 hover:text-white border border-white/5 text-gray-400 rounded-xl transition-all hover:shadow-xl hover:shadow-blue-600/40 transform hover:-translate-y-0.5"
                                                                title={dict.productDetailsPage.openResult}
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
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

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B0E14]/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="relative w-full max-w-md bg-[#13171F] border border-white/5 rounded-[2.5rem] p-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden scale-in-center text-center">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-[60px]" />

                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="h-20 w-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-6 border border-red-500/20 shadow-2xl">
                                <AlertTriangle className="h-10 w-10 text-red-500 animate-pulse" />
                            </div>

                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{dict.productDetailsPage.finalConfirmation}</h2>
                            <p className="text-gray-500 text-sm font-medium mb-8">
                                {dict.productDetailsPage.archiveConfirm} <span className="text-white font-bold">{product.name}</span>. {dict.productDetailsPage.archiveNote}
                            </p>

                            <div className="flex flex-col w-full gap-3">
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            {dict.productDetailsPage.purging}
                                        </>
                                    ) : (
                                        dict.productDetailsPage.confirmDeletion
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={isDeleting}
                                    className="w-full py-4 bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/5"
                                >
                                    {dict.productDetailsPage.abortCommand}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    )
}
