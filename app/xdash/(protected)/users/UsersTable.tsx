"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Eye, Store, ImageIcon, X } from "lucide-react"

type User = {
    id: string
    full_name: string | null
    email: string | null
    store_domain: string | null
    credits: number
    totalSpent: number
    txCount: number
    is_subscribed: boolean
    created_at: string
}

type SortKey = 'name' | 'credits' | 'totalSpent' | 'txCount' | 'joined'
type SortDir = 'asc' | 'desc'

export default function UsersTable({ users }: { users: User[] }) {
    const [search, setSearch] = useState("")
    const [sortKey, setSortKey] = useState<SortKey>('credits')
    const [sortDir, setSortDir] = useState<SortDir>('desc')
    const [storeFilter, setStoreFilter] = useState<'all' | 'with' | 'without'>('all')

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir('desc')
        }
    }

    const filtered = useMemo(() => {
        let list = [...users]

        // Search
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(u =>
                u.full_name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.store_domain?.toLowerCase().includes(q)
            )
        }

        // Store filter
        if (storeFilter === 'with') list = list.filter(u => !!u.store_domain)
        if (storeFilter === 'without') list = list.filter(u => !u.store_domain)

        // Sort
        list.sort((a, b) => {
            let av: any, bv: any
            switch (sortKey) {
                case 'name': av = a.full_name || ''; bv = b.full_name || ''; break
                case 'credits': av = a.credits; bv = b.credits; break
                case 'totalSpent': av = a.totalSpent; bv = b.totalSpent; break
                case 'txCount': av = a.txCount; bv = b.txCount; break
                case 'joined': av = new Date(a.created_at).getTime(); bv = new Date(b.created_at).getTime(); break
                default: av = 0; bv = 0
            }
            if (av < bv) return sortDir === 'asc' ? -1 : 1
            if (av > bv) return sortDir === 'asc' ? 1 : -1
            return 0
        })

        return list
    }, [users, search, sortKey, sortDir, storeFilter])

    const SortIcon = ({ col }: { col: SortKey }) => (
        <span className={`ml-1 text-[10px] ${sortKey === col ? 'text-blue-400' : 'text-gray-700'}`}>
            {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
    )

    return (
        <div className="space-y-4">
            {/* Search + Filters bar */}
            <div className="flex flex-wrap gap-3 items-center">
                {/* Search input */}
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by name, email or store..."
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

                {/* Store filter pills */}
                <div className="flex items-center gap-1.5 bg-[#0B0E14] border border-gray-800 rounded-xl p-1">
                    {(['all', 'with', 'without'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setStoreFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${storeFilter === f
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {f === 'all' ? 'All Stores' : f === 'with' ? 'Has Store' : 'No Store'}
                        </button>
                    ))}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-1.5 bg-[#0B0E14] border border-gray-800 rounded-xl p-1">
                    {([
                        { k: 'credits' as SortKey, label: 'Images' },
                        { k: 'totalSpent' as SortKey, label: 'Spent' },
                        { k: 'txCount' as SortKey, label: 'Orders' },
                        { k: 'joined' as SortKey, label: 'Joined' },
                    ]).map(({ k, label }) => (
                        <button
                            key={k}
                            onClick={() => handleSort(k)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${sortKey === k
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {label} {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                        </button>
                    ))}
                </div>

                {/* Result count */}
                <span className="text-[11px] text-gray-600 font-bold whitespace-nowrap">
                    {filtered.length} of {users.length}
                </span>
            </div>

            {/* Table */}
            <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 border-b border-gray-800">
                            <tr>
                                <th
                                    className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-gray-300 select-none"
                                    onClick={() => handleSort('name')}
                                >
                                    User <SortIcon col="name" />
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Store</th>
                                <th
                                    className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-gray-300 select-none"
                                    onClick={() => handleSort('credits')}
                                >
                                    Image Qty <SortIcon col="credits" />
                                </th>
                                <th
                                    className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-gray-300 select-none"
                                    onClick={() => handleSort('totalSpent')}
                                >
                                    Total Spent <SortIcon col="totalSpent" />
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                            {filtered.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm shrink-0">
                                                {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{user.full_name || 'No Name'}</div>
                                                <div className="text-[11px] text-gray-500 font-medium">{user.email || 'No email'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.store_domain ? (
                                            <div className="flex items-center gap-2">
                                                <Store className="h-3 w-3 text-gray-500" />
                                                <span className="text-xs font-bold text-gray-300">{user.store_domain}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-700">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="h-3 w-3 text-blue-400" />
                                            <span className="font-black text-white">{(user.credits || 0).toLocaleString('de-DE')}</span>
                                            <span className="text-[10px] text-gray-600 uppercase">imgs</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-black text-green-500 text-sm">${user.totalSpent.toFixed(2)}</span>
                                        <span className="text-[10px] text-gray-600 ml-1">({user.txCount} orders)</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/xdash/users/${user.id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold hover:bg-blue-500/20 transition-all group-hover:border-blue-500/40"
                                        >
                                            <Eye className="h-3 w-3" />
                                            See More
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-gray-600 text-sm font-bold uppercase tracking-widest">
                                        {search ? `No users matching "${search}"` : 'No users found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
