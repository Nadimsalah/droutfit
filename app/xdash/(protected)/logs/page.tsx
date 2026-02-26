"use client"

import { useEffect, useState, useMemo } from "react"
import { getSystemLogsAction } from "@/app/xdash/(protected)/settings/actions"
import { Loader2, Server, CheckCircle2, XCircle, Clock, RefreshCw, Image as ImageIcon, Search, ChevronLeft, ChevronRight } from "lucide-react"

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

            return storeName.includes(lowerTerm) ||
                fullName.includes(lowerTerm) ||
                email.includes(lowerTerm) ||
                taskId.includes(lowerTerm)
        })
    }, [logs, searchTerm])

    // Pagination
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1) // Reset to page 1 on search
    }

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">API Transaction Logs</h1>
                    <p className="text-gray-400 mt-1">Monitor real-time virtual try-on requests, inputs, and outcomes.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by ID, name, email..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full bg-[#13171F] border border-gray-800 text-white text-sm pl-10 pr-4 py-2.5 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="p-2.5 bg-[#13171F] border border-gray-800 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors flex-shrink-0"
                        title="Refresh Logs"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl shadow-xl overflow-hidden relative min-h-[500px] flex flex-col">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0B0E14]/80 backdrop-blur-sm z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : paginatedLogs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-32">
                        <Server className="h-12 w-12 mb-4 opacity-50" />
                        <p className="font-medium text-white mb-1">No transactions found</p>
                        <p className="text-sm">Try adjusting your search or wait for new API hits.</p>
                    </div>
                ) : null}

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#13171F] border-b border-gray-800 sticky top-0 z-20">
                            <tr>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Date & Time</th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Account</th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Authored IDs</th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Status</th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-wider text-xs text-center">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {paginatedLogs.map((log) => {
                                const isSuccess = log.status === 200
                                const isPending = log.status === 202
                                const hasImages = log.meta.input_images && log.meta.input_images.length >= 2;

                                const displayName = log.user.store_name && log.user.store_name !== 'Unknown'
                                    ? log.user.store_name
                                    : (log.user.full_name !== 'Unknown' ? log.user.full_name : 'Guest User / Demo');

                                const isDemo = log.user.full_name === 'Unknown' || log.user.full_name === 'Guest User';

                                return (
                                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 text-gray-400">
                                            <span className="font-medium text-gray-300 block">
                                                {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className="text-xs">
                                                {new Date(log.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-white flex items-center gap-2">
                                                {displayName}
                                                {isDemo && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-black ${log.path === '/api/generate-demo'
                                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                        }`}>
                                                        {log.path === '/api/generate-demo' ? 'Live Demo' : 'Guest'}
                                                    </span>
                                                )}
                                            </div>
                                            {!isDemo && log.user.store_domain && (
                                                <div className="text-xs text-gray-500 mt-0.5">{log.user.store_domain}</div>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-xs text-gray-400">
                                            {log.meta.taskId && log.meta.taskId !== "—" ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="bg-white/5 px-2 py-1 rounded inline-block truncate max-w-[150px] border border-white/5 text-blue-400" title={log.meta.taskId}>
                                                        {log.meta.taskId.replace("nanobanana-", "nb-").substring(0, 16)}...
                                                    </span>
                                                    <span className="text-[10px] text-gray-600">DB: {log.id.split('-')[0]}...</span>
                                                </div>
                                            ) : log.path === '/api/generate-demo' ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="bg-blue-500/5 px-2 py-1 rounded inline-block border border-blue-500/20 text-blue-400 font-bold">LIVE-DEMO</span>
                                                    <span className="text-[10px] text-gray-600">DB: {log.id.split('-')[0]}...</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600">—</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {isSuccess ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Success
                                                </span>
                                            ) : isPending ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] max-w-[150px]" title={log.meta.error}>
                                                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">Failed</span>
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4 text-center">
                                            {log.meta.result_url ? (
                                                <a
                                                    href={log.meta.result_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm shadow-blue-500/5 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105"
                                                    title="View Generated Image"
                                                >
                                                    <ImageIcon className="h-5 w-5" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-700">—</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="border-t border-gray-800 bg-[#0B0E14] p-4 flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                            Showing <span className="font-bold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-white">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="font-bold text-white">{filteredLogs.length}</span> entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-[#13171F] border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <div className="flex gap-1 items-center">
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    // Complex logic for showing page numbers around current page
                                    let pageNum = currentPage;
                                    if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;

                                    if (pageNum <= 0 || pageNum > totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : 'bg-[#13171F] border border-gray-800 text-gray-400 hover:bg-white/10 hover:text-white'
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
                                className="p-2 bg-[#13171F] border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
