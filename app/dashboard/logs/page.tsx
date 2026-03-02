"use client"
import { CheckCircle, Search, XCircle, Filter, Download, Loader2, Image as ImageIcon, ExternalLink, Clock, Calendar, Hash } from "lucide-react"
import { useEffect, useState } from "react"
import { getLogs } from "@/lib/storage"

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await getLogs()
                setLogs(data)
            } finally {
                setIsLoading(false)
            }
        }
        fetchLogs()
    }, [])

    const getResultUrl = (log: any): string | null => {
        try {
            if (!log.message || !log.message.startsWith('{')) return null;
            const meta = JSON.parse(log.message);
            return meta.result_url || null;
        } catch { return null; }
    }

    const filteredLogs = logs.filter(log =>
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.status.toString().includes(searchQuery)
    )

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">System Logs</h1>
                    <p className="text-gray-500 text-sm font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Real-time Transaction Monitor
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-2 bg-[#13171F]/50 backdrop-blur-md rounded-2xl border border-gray-800/50 shadow-2xl">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <input
                        type="text"
                        placeholder="Search by ID, Status, Path..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-[#0B0E14] border border-gray-800/50 rounded-xl text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 p-1">
                    <button className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/5 text-gray-400 text-xs font-black uppercase tracking-widest rounded-lg transition-colors">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                    <div className="h-6 w-px bg-gray-800 mx-2" />
                    <select className="bg-transparent text-gray-400 text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:text-white transition-colors pr-4">
                        <option>Last 24 Hours</option>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-[#13171F] rounded-3xl border border-gray-800/50 shadow-2xl overflow-hidden min-h-[500px] flex flex-col relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-[#13171F]/80 backdrop-blur-sm z-20 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                            <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Loading transactions...</p>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-[#0B0E14]">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-gray-800/50">Result</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-gray-800/50">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-gray-800/50">Endpoint</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-gray-800/50">Performance</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-gray-800/50">Timestamp</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-gray-800/50 text-right">Request ID</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log, i) => {
                                    const resultUrl = getResultUrl(log);
                                    const isSuccess = log.status >= 200 && log.status < 300;

                                    return (
                                        <tr key={log.id} className={`group hover:bg-white/[0.03] transition-all cursor-default ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}>
                                            <td className="px-6 py-4 border-b border-gray-800/30">
                                                <div className="relative h-14 w-11 rounded-xl overflow-hidden bg-[#0B0E14] border border-gray-800 group-hover:border-blue-500/50 transition-colors shadow-2xl">
                                                    {resultUrl ? (
                                                        <>
                                                            <img src={resultUrl} alt="Output" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                                            <a
                                                                href={resultUrl}
                                                                target="_blank"
                                                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <ExternalLink className="h-4 w-4 text-white" />
                                                            </a>
                                                        </>
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <ImageIcon className="h-5 w-5 text-gray-800" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-gray-800/30 text-xs">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 px-3 rounded-lg flex items-center gap-2 font-black tracking-widest border ${isSuccess
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        }`}>
                                                        {isSuccess ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                                        {log.status}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-gray-800/30">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/80">{log.method}</span>
                                                    <span className="text-xs font-mono text-gray-500 group-hover:text-gray-300 transition-colors">{log.path}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-gray-800/30">
                                                <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors">
                                                    <Clock className="h-3.5 w-3.5 text-gray-600" />
                                                    <span className="text-xs font-mono">{log.latency || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-gray-800/30">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-gray-300 text-xs font-bold">
                                                        <Calendar className="h-3 w-3 text-gray-600" />
                                                        {log.created_at ? new Date(log.created_at).toLocaleDateString() : '—'}
                                                    </div>
                                                    <span className="text-[10px] text-gray-600 font-mono ml-5">
                                                        {log.created_at ? new Date(log.created_at).toLocaleTimeString() : '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-gray-800/30 text-right">
                                                <div className="inline-flex items-center gap-2 px-2 py-1 bg-white/[0.03] rounded-lg border border-white/[0.05] text-[10px] font-mono text-gray-500 group-hover:text-gray-300">
                                                    <Hash className="h-3 w-3 text-gray-700" />
                                                    {log.id.slice(0, 8).toUpperCase()}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-50">
                                            <ImageIcon className="h-12 w-12 text-gray-700" />
                                            <p className="text-gray-500 text-sm font-black uppercase tracking-widest">No transactions discovered</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Section */}
                <div className="p-6 bg-[#0B0E14] flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                        Total Trace: <span className="text-blue-500">{filteredLogs.length} Records</span>
                    </p>
                    <div className="flex gap-2">
                        <button className="px-6 py-2 rounded-xl bg-[#13171F] border border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-gray-800 transition-all disabled:opacity-30 active:scale-95 cursor-pointer">
                            Previous
                        </button>
                        <button className="px-6 py-2 rounded-xl bg-[#13171F] border border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-gray-800 transition-all active:scale-95 cursor-pointer">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
