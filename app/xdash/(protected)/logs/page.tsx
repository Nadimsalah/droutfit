"use client"
import { useEffect, useState, useMemo } from "react"
import { getSystemLogsAction } from "@/app/xdash/(protected)/settings/actions"
import { Loader2, Server, CheckCircle2, XCircle, Clock, RefreshCw, Image as ImageIcon, Search, ChevronLeft, ChevronRight, ExternalLink, Calendar, User, ShoppingBag, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

type Log = {
    id: string
    created_at: string
    status: number
    path?: string
    user: { full_name: string; store_name?: string | null; store_domain: string | null; email: string | null }
    meta: {
        taskId: string
        result_url: string
        credits_used: number
        channel: string
        error: string
        input_images?: string[]
        tokens_used?: number
        estimated_cost?: number
        source?: string
    }
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    const itemsPerPage = 10

    const fetchLogs = async () => {
        setLoading(true)
        const res = await getSystemLogsAction()
        if (res.logs) {
            setLogs(res.logs as Log[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const filteredLogs = useMemo(() => {
        if (!searchTerm) return logs

        const lowerTerm = searchTerm.toLowerCase()
        return logs.filter(log => {
            const storeName = log.user.store_name?.toLowerCase() || ""
            const fullName = log.user.full_name?.toLowerCase() || ""
            const email = log.user.email?.toLowerCase() || ""
            const taskId = log.meta.taskId?.toLowerCase() || ""
            const source = log.meta.source?.toLowerCase() || ""

            return storeName.includes(lowerTerm) ||
                fullName.includes(lowerTerm) ||
                email.includes(lowerTerm) ||
                taskId.includes(lowerTerm) ||
                source.includes(lowerTerm)
        })
    }, [logs, searchTerm])

    // Pagination
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4">
                        <div className="h-10 w-2 bg-blue-600 rounded-full" />
                        Admin Command Center
                    </h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase tracking-[0.3em] flex items-center gap-3 text-xs">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Live Transactional Intelligence
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                    <div className="relative group flex-1 sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 transition-colors group-focus-within:text-blue-500" />
                        <input
                            type="text"
                            placeholder="Universal search: ID, Name, Task..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full bg-[#13171F] border border-gray-800 text-white text-sm pl-12 pr-4 py-3.5 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-gray-700 font-medium"
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] rounded-2xl text-white font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 text-blue-500 ${loading ? 'animate-spin' : ''}`} />
                        Sync Data
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-[#13171F] border border-white/5 rounded-[2.5rem] shadow-3xl overflow-hidden relative min-h-[600px] flex flex-col">
                {loading && logs.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0E14]/90 backdrop-blur-xl z-50">
                        <div className="relative h-24 w-24">
                            <div className="absolute inset-0 rounded-full border-b-2 border-l-2 border-blue-500 animate-spin" />
                            <div className="absolute inset-4 rounded-full border-t-2 border-r-2 border-purple-500 animate-spin-reverse" />
                        </div>
                        <p className="mt-8 text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Decrypting Logs...</p>
                    </div>
                ) : paginatedLogs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-32">
                        <div className="bg-[#0B0E14] p-8 rounded-[2rem] border border-white/5 flex flex-col items-center shadow-inner">
                            <Server className="h-16 w-16 mb-6 text-gray-800" />
                            <p className="font-black text-white uppercase tracking-widest mb-2">No data sequences found</p>
                            <p className="text-sm font-medium opacity-60">Adjust your parameters or check system uplink.</p>
                        </div>
                    </div>
                ) : null}

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="bg-[#0B0E14] sticky top-0 z-20">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">Sequence Date</th>
                                <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">Entity Identity</th>
                                <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">Task Metadata</th>
                                <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">Source</th>
                                <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5 text-center">Resources</th>
                                <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">Status</th>
                                <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5 text-center">Output</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {paginatedLogs.map((log, i) => {
                                const isSuccess = log.status === 200
                                const isPending = log.status === 202

                                const displayName = log.user.store_name && log.user.store_name !== 'Unknown'
                                    ? log.user.store_name
                                    : (log.user.full_name !== 'Unknown' ? log.user.full_name : 'Guest User');

                                const isDemo = log.user.full_name === 'Unknown' || log.user.full_name === 'Guest User';

                                return (
                                    <tr key={log.id} className="hover:bg-white/[0.03] transition-all group border-b border-white/5">
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-white font-bold tracking-tight">
                                                    <Calendar className="h-3.5 w-3.5 text-blue-500/70" />
                                                    {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono tracking-tighter">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(log.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center text-blue-500 font-black text-xs shadow-lg">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="font-black text-white flex items-center gap-2 text-xs tracking-tight uppercase">
                                                        {displayName}
                                                        {isDemo && (
                                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black">DEMO</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-medium flex items-center gap-2 italic">
                                                        <ShoppingBag className="h-2.5 w-2.5" />
                                                        {log.user.store_domain || log.user.email || "System Level Access"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-2">
                                                {log.meta.taskId && log.meta.taskId !== "—" ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 text-blue-400 font-mono text-[10px] shadow-sm uppercase tracking-tighter" title={log.meta.taskId}>
                                                            ID: {log.meta.taskId.replace("nanobanana-", "NB-").substring(0, 18)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-700 font-mono text-xs">—</span>
                                                )}
                                                <div className="flex items-center gap-2 text-[9px] text-gray-600 font-black uppercase tracking-widest">
                                                    <Hash className="h-2.5 w-2.5" />
                                                    REF: {log.id.split('-')[0].toUpperCase()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all",
                                                log.meta.source === "shopify"
                                                    ? "bg-[#95BF47]/10 text-[#95BF47] border-[#95BF47]/20 shadow-[0_0_10px_rgba(149,191,71,0.1)]"
                                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                                            )}>
                                                <div className={cn(
                                                    "h-1 w-1 rounded-full animate-pulse",
                                                    log.meta.source === "shopify" ? "bg-[#95BF47]" : "bg-blue-500"
                                                )} />
                                                {log.meta.source === "shopify" ? "Shopify" : "DrOutfit UI"}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col items-center gap-1.5 ">
                                                {log.meta.tokens_used ? (
                                                    <>
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/5 border border-blue-500/10 text-blue-400 font-mono text-[10px]">
                                                            <Hash className="h-3 w-3" />
                                                            {log.meta.tokens_used.toLocaleString()} TKN
                                                        </div>
                                                        <div className="text-[10px] font-black text-green-500/80 uppercase tracking-widest">
                                                            ${log.meta.estimated_cost?.toFixed(4)} USD
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-700 font-mono text-xs">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {isSuccess ? (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black border border-green-500/20 uppercase tracking-widest shadow-lg shadow-green-500/5">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    Success
                                                </div>
                                            ) : isPending ? (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-black border border-yellow-500/20 uppercase tracking-widest shadow-lg shadow-yellow-500/5">
                                                    <Clock className="h-3 w-3 animate-spin" />
                                                    Pending
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black border border-red-500/20 uppercase tracking-widest shadow-lg shadow-red-500/5" title={log.meta.error}>
                                                    <XCircle className="h-3 w-3" />
                                                    Failure
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-6 text-center">
                                            <div className="relative group/img inline-block h-16 w-12 rounded-2xl overflow-hidden bg-[#0B0E14] border border-white/10 shadow-2xl transition-transform group-hover:scale-110">
                                                {log.meta.result_url ? (
                                                    <>
                                                        <img src={log.meta.result_url} alt="Result" className="h-full w-full object-cover transition-opacity group-hover/img:opacity-40" />
                                                        <a
                                                            href={log.meta.result_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                        >
                                                            <ExternalLink className="h-5 w-5 text-white" />
                                                        </a>
                                                    </>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <ImageIcon className="h-5 w-5 text-gray-800" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <div className="p-8 bg-[#0B0E14] flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5">
                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        Showing <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="text-white">{filteredLogs.length}</span> entries
                    </div>

                    <div className="flex gap-2 p-1 bg-[#13171F] rounded-2xl border border-white/5 shadow-inner">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-3 bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 rounded-xl transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <div className="flex items-center px-4 space-x-2">
                            {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                                let pageNum = currentPage;
                                if (currentPage <= 2) pageNum = i + 1;
                                else if (currentPage >= totalPages - 1) pageNum = totalPages - 2 + i;
                                else pageNum = currentPage - 1 + i;

                                if (pageNum <= 0 || pageNum > totalPages) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${currentPage === pageNum
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/40'
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-3 bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 rounded-xl transition-all"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
