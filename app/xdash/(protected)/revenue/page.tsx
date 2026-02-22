"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { DollarSign, TrendingUp, CreditCard, Calendar, BarChart3, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"

// Types
type Period = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'all'
type RevenueStats = {
    total: number
    subscription: number
    credits: number
    period: Period
}

export default function RevenuePage() {
    const [period, setPeriod] = useState<Period>('month')
    const [stats, setStats] = useState<RevenueStats>({ total: 0, subscription: 0, credits: 0, period: 'month' })
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<any[]>([])

    useEffect(() => {
        fetchRevenueData(period)
    }, [period])

    const fetchRevenueData = async (selectedPeriod: Period) => {
        setLoading(true)

        // Calculate date range
        const now = new Date()
        let startDate = new Date()

        switch (selectedPeriod) {
            case 'today':
                startDate.setHours(0, 0, 0, 0)
                break
            case 'yesterday':
                startDate.setDate(now.getDate() - 1)
                startDate.setHours(0, 0, 0, 0)
                // Need end date for yesterday? Logic below simplifies to >= startDate
                // For yesterday specific, we might need a subtle range check, but let's do "Last 24h" style or "Since Yesterday Start" for simplicity first
                break
            case 'week':
                startDate.setDate(now.getDate() - 7)
                break
            case 'month':
                startDate.setDate(1) // Start of this month
                break
            case 'year':
                startDate.setMonth(0, 1) // Start of this year
                break
            case 'all':
                startDate = new Date(0) // Epoch
                break
        }

        // Fetch Transactions
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching revenue:', error)
            setLoading(false)
            return
        }

        // Calculate Aggregates
        const total = data.reduce((acc, curr) => acc + Number(curr.amount), 0)
        const subscription = data.filter(t => t.type === 'SUBSCRIPTION').reduce((acc, curr) => acc + Number(curr.amount), 0)
        const credits = data.filter(t => t.type === 'CREDITS').reduce((acc, curr) => acc + Number(curr.amount), 0)

        setStats({ total, subscription, credits, period: selectedPeriod })
        setTransactions(data)
        setLoading(false)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Revenue Analytics</h1>
                    <p className="text-gray-400 mt-1"> detailed breakdown of your platform's income.</p>
                </div>

                {/* Time Range Selector */}
                <div className="flex bg-[#0B0E14] p-1 rounded-xl border border-gray-800 overflow-x-auto max-w-full">
                    {(['today', 'yesterday', 'week', 'month', 'year', 'all'] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${period === p
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <>
                    {/* Big Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Total Revenue</p>
                                <h2 className="text-4xl font-black text-white">${stats.total.toFixed(2)}</h2>
                                <div className="mt-4 flex items-center gap-2 text-xs text-blue-300/80">
                                    <Calendar className="h-3 w-3" />
                                    <span>{period === 'all' ? 'All time' : `Since ${period} start`}</span>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10">
                                <DollarSign className="h-32 w-32 -mr-6 -mb-6" />
                            </div>
                        </div>

                        <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">Subscriptions</p>
                                <h2 className="text-4xl font-black text-white">${stats.subscription.toFixed(2)}</h2>
                                <div className="w-full bg-gray-800 h-1.5 mt-4 rounded-full overflow-hidden">
                                    <div
                                        className="bg-purple-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${stats.total > 0 ? (stats.subscription / stats.total) * 100 : 0}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 text-right">
                                    {stats.total > 0 ? ((stats.subscription / stats.total) * 100).toFixed(1) : 0}% of total
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-sm font-bold text-green-400 uppercase tracking-wider mb-2">Credit Top-ups</p>
                                <h2 className="text-4xl font-black text-white">${stats.credits.toFixed(2)}</h2>
                                <div className="w-full bg-gray-800 h-1.5 mt-4 rounded-full overflow-hidden">
                                    <div
                                        className="bg-green-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${stats.total > 0 ? (stats.credits / stats.total) * 100 : 0}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 text-right">
                                    {stats.total > 0 ? ((stats.credits / stats.total) * 100).toFixed(1) : 0}% of total
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-gray-500" />
                                Recent Transactions
                            </h3>
                            <button className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider">Export CSV</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-gray-400 font-medium border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {transactions.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">No transactions found for this period.</td></tr>
                                    ) : (
                                        transactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${t.type === 'SUBSCRIPTION'
                                                        ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        }`}>
                                                        {t.type === 'SUBSCRIPTION' ? <CreditCard className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 font-medium">{t.description || 'Payment'}</td>
                                                <td className="px-6 py-4 text-gray-500 text-xs font-mono">{new Date(t.created_at).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right font-bold text-white font-mono">+${Number(t.amount).toFixed(2)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
