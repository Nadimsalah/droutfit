"use client"

import { CheckCircle, Search, XCircle, Filter, Download, Loader2 } from "lucide-react"
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

    const filteredLogs = logs.filter(log =>
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.status.toString().includes(searchQuery)
    )

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Logs</h1>
                    <p className="text-gray-400 text-sm font-medium mt-1">
                        Recent API requests and system events.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#1A1F29] hover:bg-[#232936] text-white text-xs font-bold rounded-lg border border-gray-800 transition-colors">
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-[#13171F] rounded-2xl border border-gray-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search logs by ID, path, or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#0B0E14] border border-gray-800 rounded-xl text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0B0E14] hover:bg-gray-900 text-gray-300 text-sm font-medium rounded-xl border border-gray-800 transition-colors">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                    </button>
                    <select className="px-4 py-2 bg-[#0B0E14] hover:bg-gray-900 text-gray-300 text-sm font-medium rounded-xl border border-gray-800 transition-colors outline-none cursor-pointer">
                        <option>Last 24 Hours</option>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-[#13171F] rounded-2xl border border-gray-800 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-20">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#0B0E14] text-gray-400 uppercase text-xs font-bold border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4">Path</th>
                                    <th className="px-6 py-4">Latency</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4 text-right">Request ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-gray-300">
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {log.type === "success" ? (
                                                        <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                                                        </div>
                                                    )}
                                                    <span className={`font-bold text-xs ${log.type === "success" ? "text-green-500" : "text-red-500"}`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`
                                                    px-2 py-1 rounded-md text-[10px] font-bold border
                                                    ${log.method === "POST" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : ""}
                                                    ${log.method === "GET" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : ""}
                                                    ${log.method === "DELETE" ? "bg-red-500/10 text-red-400 border-red-500/20" : ""}
                                                    ${log.method === "PUT" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : ""}
                                                `}>
                                                    {log.method}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-400 group-hover:text-white transition-colors">
                                                {log.path}
                                                {log.message && <div className="text-red-400 mt-1">{log.message}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                                                {log.latency}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {log.date}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-xs text-gray-600">
                                                {log.id.slice(0, 12)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-gray-500 font-medium">
                                            No logs found for your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-500">Showing {filteredLogs.length} logs</p>
                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-xl bg-[#13171F] border border-gray-800 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all disabled:opacity-50">
                        Previous
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-[#13171F] border border-gray-800 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
