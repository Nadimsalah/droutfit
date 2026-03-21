"use client"
import { useEffect, useState, useMemo } from "react"
import { getSystemLogsAction } from "@/app/xdash/(protected)/settings/actions"
import { Loader2, Server, CheckCircle2, XCircle, Clock, RefreshCw, Image as ImageIcon, Search, ChevronLeft, ChevronRight, ExternalLink, Calendar, ShoppingBag, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

type Log = {
    id: string
    created_at: string
    status: number
    path?: string
    platform?: string
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
        provider?: string
    }
}

const PLATFORM_CONFIG: Record<string, { label: string; dot: string; cls: string }> = {
    shopify:   { label: "Shopify",    dot: "#95BF47", cls: "bg-[#95BF47]/10 text-[#95BF47] border-[#95BF47]/20" },
    wordpress: { label: "WordPress",  dot: "#21759B", cls: "bg-[#21759B]/10 text-[#21759B] border-[#21759B]/20" },
    widget:    { label: "Widget",     dot: "#a78bfa", cls: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    demo:      { label: "Demo Page",  dot: "#f59e0b", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    droutfit:  { label: "DrOutfit",   dot: "#3b82f6", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
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
        if (res.logs) setLogs(res.logs as Log[])
        setLoading(false)
    }

    useEffect(() => { fetchLogs() }, [])

    const filteredLogs = useMemo(() => {
        if (!searchTerm) return logs
        const t = searchTerm.toLowerCase()
        return logs.filter(log =>
            (log.user.store_name || "").toLowerCase().includes(t) ||
            (log.user.full_name || "").toLowerCase().includes(t) ||
            (log.user.email || "").toLowerCase().includes(t) ||
            (log.meta.taskId || "").toLowerCase().includes(t) ||
            (log.platform || "").toLowerCase().includes(t) ||
            (log.path || "").toLowerCase().includes(t)
        )
    }, [logs, searchTerm])

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4">
                        <div className="h-10 w-2 bg-blue-600 rounded-full" />
                        System Logs
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
                            placeholder="Search store, platform, task ID…"
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            className="w-full bg-[#13171F] border border-gray-800 text-white text-sm pl-12 pr-4 py-3.5 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-gray-700 font-medium"
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] rounded-2xl text-white font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 text-blue-500 ${loading ? "animate-spin" : ""}`} />
                        Sync Data
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#13171F] border border-white/5 rounded-[2.5rem] shadow-3xl overflow-hidden relative min-h-[600px] flex flex-col">
                {loading && logs.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0E14]/90 backdrop-blur-xl z-50">
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Loading Logs…</p>
                    </div>
                ) : paginatedLogs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-32">
                        <div className="bg-[#0B0E14] p-8 rounded-[2rem] border border-white/5 flex flex-col items-center shadow-inner">
                            <Server className="h-16 w-16 mb-6 text-gray-800" />
                            <p className="font-black text-white uppercase tracking-widest mb-2">No logs found</p>
                            <p className="text-sm font-medium opacity-60">Try a different search filter.</p>
                        </div>
                    </div>
                ) : null}

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="bg-[#0B0E14] sticky top-0 z-20">
                            <tr>
                                {["Date", "Store / Client", "Platform", "Task ID", "AI Provider", "Cost", "Status", "Output"].map(h => (
                                    <th key={h} className="p-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {paginatedLogs.map(log => {
                                const isSuccess = log.status >= 200 && log.status < 300
                                const isPending = log.status === 102 || log.status === 202
                                const platform = log.platform || log.meta.source || "droutfit"
                                const platformCfg = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG["droutfit"]
                                const storeName = log.user.store_name || log.user.store_domain || null
                                const displayName = storeName || log.user.full_name || "Unknown"
                                const isGuest = !storeName && (log.user.full_name === "Landing Page Visitor" || log.user.full_name === "Widget User" || log.user.full_name === "Guest User")
                                const provider = log.meta.provider || log.meta.channel || "—"
                                const cost = log.meta.estimated_cost

                                return (
                                    <tr key={log.id} className="hover:bg-white/[0.02] transition-all border-b border-white/5">
                                        {/* Date */}
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                                                    <Calendar className="h-3 w-3 text-blue-500/70" />
                                                    {new Date(log.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                                </div>
                                                <div className="text-[10px] text-gray-600 font-mono">
                                                    {new Date(log.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Store / Client */}
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center text-blue-400 font-black text-xs flex-shrink-0">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-white font-black text-xs uppercase tracking-tight">
                                                        {displayName}
                                                        {isGuest && (
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-black">GUEST</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-gray-600 flex items-center gap-1 mt-0.5">
                                                        <ShoppingBag className="h-2.5 w-2.5" />
                                                        {log.user.store_domain || log.user.email || log.path || "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Platform badge */}
                                        <td className="p-5">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap",
                                                platformCfg.cls
                                            )}>
                                                <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: platformCfg.dot }} />
                                                {platformCfg.label}
                                            </div>
                                        </td>

                                        {/* Task ID */}
                                        <td className="p-5">
                                            {log.meta.taskId && log.meta.taskId !== "—" ? (
                                                <div className="bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 text-blue-400 font-mono text-[10px] uppercase">
                                                    {log.meta.taskId.substring(0, 14)}
                                                </div>
                                            ) : (
                                                <span className="text-gray-700 text-xs">—</span>
                                            )}
                                            <div className="text-[9px] text-gray-700 font-mono mt-1 flex items-center gap-1">
                                                <Hash className="h-2 w-2" /> {log.id.split("-")[0].toUpperCase()}
                                            </div>
                                        </td>

                                        {/* AI Provider */}
                                        <td className="p-5">
                                            <span className="text-xs font-bold text-gray-400 capitalize">{provider}</span>
                                        </td>

                                        {/* Cost */}
                                        <td className="p-5">
                                            {cost != null ? (
                                                <span className="text-xs font-black text-green-400">${cost.toFixed(4)}</span>
                                            ) : (
                                                <span className="text-gray-700 text-xs">—</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="p-5">
                                            {isSuccess ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black border border-green-500/20 uppercase tracking-widest">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    Success
                                                </div>
                                            ) : isPending ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-black border border-yellow-500/20 uppercase tracking-widest">
                                                    <Clock className="h-3 w-3 animate-spin" />
                                                    Pending
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black border border-red-500/20 uppercase tracking-widest" title={log.meta.error}>
                                                    <XCircle className="h-3 w-3" />
                                                    Error {log.status}
                                                </div>
                                            )}
                                        </td>

                                        {/* Output thumbnail */}
                                        <td className="p-5">
                                            <div className="relative group/img h-16 w-12 rounded-xl overflow-hidden bg-[#0B0E14] border border-white/10 shadow-xl transition-transform hover:scale-110 inline-block">
                                                {log.meta.result_url ? (
                                                    <>
                                                        <img src={log.meta.result_url} alt="Result" className="h-full w-full object-cover transition-opacity group-hover/img:opacity-30" />
                                                        <a
                                                            href={log.meta.result_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                        >
                                                            <ExternalLink className="h-4 w-4 text-white" />
                                                        </a>
                                                    </>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <ImageIcon className="h-4 w-4 text-gray-800" />
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

                {/* Pagination */}
                <div className="p-6 bg-[#0B0E14] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        Showing <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="text-white">{filteredLogs.length}</span> entries
                    </div>
                    <div className="flex gap-2 p-1 bg-[#13171F] rounded-2xl border border-white/5">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-20 rounded-xl transition-all">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                            let pn = currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                            if (pn < 1 || pn > totalPages) return null;
                            return (
                                <button key={pn} onClick={() => setCurrentPage(pn)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${currentPage === pn ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
                                    {pn}
                                </button>
                            )
                        })}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-20 rounded-xl transition-all">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
