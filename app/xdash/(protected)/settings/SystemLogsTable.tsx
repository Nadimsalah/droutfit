"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, X, CheckCircle2, XCircle, Store, Link as LinkIcon, Loader2, Activity } from "lucide-react"
import { getSystemLogsAction } from "./actions"

export default function SystemLogsTable() {
    const [search, setSearch] = useState("")
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getSystemLogsAction().then(res => {
            if (res.logs) setLogs(res.logs)
            setLoading(false)
        })
    }, [])

    const filtered = useMemo(() => {
        let list = [...logs]

        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(l =>
                l.user?.full_name?.toLowerCase().includes(q) ||
                l.user?.email?.toLowerCase().includes(q) ||
                l.user?.store_domain?.toLowerCase().includes(q) ||
                l.meta?.taskId?.toLowerCase().includes(q)
            )
        }

        return list
    }, [logs, search])

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-500" />
                        System Logs
                    </h2>
                    <p className="text-gray-400 mt-1 text-sm">Un aperçu de vos demandes récentes</p>
                </div>

                {/* Search input */}
                <div className="relative w-full md:w-auto min-w-[260px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Entrez l'ID de tâche, l'utilisateur..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-colors"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#0B0E14] border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Temps</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Utilisateur</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Statut</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Crédits utilisés</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Canal</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">taskId</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Résultat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                            {filtered.map((log) => {
                                const isSuccess = log.status === 200 || log.status === 202;
                                return (
                                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-300 font-medium">
                                                {new Date(log.created_at).toISOString().split('T')[0]}
                                            </div>
                                            <div className="text-[11px] text-gray-600 mt-0.5">
                                                {new Date(log.created_at).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white text-xs">{log.user?.full_name || 'No Name'}</div>
                                            {log.user?.store_domain && (
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Store className="h-3 w-3 text-gray-600" />
                                                    <span className="text-[10px] text-gray-500 font-medium">{log.user.store_domain}</span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${isSuccess ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                <div className={`h-1.5 w-1.5 rounded-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />
                                                {isSuccess ? 'Succès' : 'Échec'}
                                            </div>
                                            {log.meta?.error && !isSuccess && (
                                                <div className="text-[9px] text-red-400 mt-1 max-w-[150px] truncate" title={log.meta.error}>
                                                    {log.meta.error}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className="font-black text-gray-300">{log.meta?.credits_used || 0}</span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-white whitespace-nowrap">
                                                {log.meta?.channel?.split(' ')[0] || 'Nano'}
                                                <br />
                                                {log.meta?.channel?.split(' ')[1] || 'Banana'}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[11px] text-gray-400">
                                                {log.meta?.taskId || '—'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            {log.meta?.result_url ? (
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={log.meta.result_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 max-w-[200px] truncate bg-blue-500/10 px-2 py-1 rounded transition-colors"
                                                    >
                                                        <LinkIcon className="h-3 w-3 shrink-0" />
                                                        <span className="truncate">result_urls: {log.meta.result_url}</span>
                                                    </a>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(log.meta.result_url)}
                                                        className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
                                                        title="Copy URL"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-600">—</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-600 font-bold text-xs uppercase tracking-widest">
                                        Aucun journal trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filtered.length > 0 && (
                    <div className="p-4 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-500">
                        <span>Lignes par page: 10</span>
                        <div className="flex items-center gap-2">
                            <span>1 of {Math.ceil(filtered.length / 10)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
