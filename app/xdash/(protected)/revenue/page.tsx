"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { DollarSign, TrendingUp, CreditCard, Calendar, BarChart3, ArrowUpRight, ArrowDownRight, Loader2, ImageIcon } from "lucide-react"

import { getRevenueData, type Period } from "./actions"

// Types
type RevenueStats = {
    gross: number
    net: number
    imageCost: number
    totalImages: number
    period: Period
}

export default function RevenuePage() {
    const [period, setPeriod] = useState<Period>('month')
    const [stats, setStats] = useState<RevenueStats>({ gross: 0, net: 0, imageCost: 0, totalImages: 0, period: 'month' })
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<any[]>([])

    useEffect(() => {
        fetchRevenueData(period)
    }, [period])

    const fetchRevenueData = async (selectedPeriod: Period) => {
        setLoading(true)

        // Fetch Transactions via Server Action
        const data = await getRevenueData(selectedPeriod)

        if (!data) {
            console.error('Error fetching revenue')
            setLoading(false)
            return
        }

        // Calculate Aggregates
        let gross = 0
        let totalImages = 0

        data.forEach(curr => {
            const amount = Number(curr.amount) || 0
            if (curr.status === 'succeeded') {
                gross += amount
                const qtyMatch = curr.description?.match(/(\d+)/)
                if (qtyMatch) {
                    totalImages += parseInt(qtyMatch[1], 10)
                }
            }
        })

        const imageCost = totalImages * 0.02
        const net = gross - imageCost

        setStats({ gross, net, imageCost, totalImages, period: selectedPeriod })
        setTransactions(data)
        setLoading(false)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Revenue Analytics</h1>
                    <p className="text-gray-400 mt-1">Detailed breakdown of gross vs net income.</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-48">
                            <div className="relative z-10">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Gross Revenue</p>
                                <h2 className="text-5xl font-black text-white">${stats.gross.toFixed(2)}</h2>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest">
                                    <TrendingUp className="h-4 w-4 text-green-500" /> All Customer Payments
                                </div>
                            </div>
                            <div className="absolute right-[-20px] bottom-[-20px] opacity-5">
                                <DollarSign className="h-48 w-48 text-white" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-48">
                            <div className="relative z-10 w-full flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-1">Net Revenue</p>
                                    <h2 className="text-5xl font-black text-white">${stats.net.toFixed(2)}</h2>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-blue-300/80 font-bold uppercase tracking-widest">
                                        <ArrowUpRight className="h-4 w-4 text-blue-400" /> Profit After API Costs
                                    </div>
                                </div>

                                <div className="text-right flex flex-col gap-1 mt-1">
                                    <div className="text-[10px] uppercase font-black tracking-widest text-red-400 bg-red-500/10 px-2 py-1 rounded inline-flex items-center gap-1 self-end">
                                        -{stats.imageCost.toFixed(2)}$ API Cost
                                    </div>
                                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                        ({stats.totalImages.toLocaleString()} imgs × $0.02)
                                    </div>
                                </div>
                            </div>
                            <div className="absolute right-10 bottom-4 opacity-10">
                                <BarChart3 className="h-24 w-24 text-blue-500" />
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
                                <thead className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-gray-500 border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4 text-right">Gross</th>
                                        <th className="px-6 py-4 text-right">Net</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/60">
                                    {transactions.length === 0 ? (
                                        <tr><td colSpan={4} className="p-16 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">No transactions found for this period.</td></tr>
                                    ) : (
                                        transactions.map((t) => {
                                            const amount = Number(t.amount) || 0
                                            const isSuccess = t.status === 'succeeded'
                                            const qtyMatch = t.description?.match(/(\d+)/)
                                            const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 0
                                            const cost = qty * 0.02
                                            const txNet = isSuccess ? amount - cost : 0

                                            return (
                                                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-xs shrink-0">
                                                                {t.user_name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="font-bold text-white text-sm">
                                                                {t.user_name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest mr-2 ${isSuccess ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                            {t.status}
                                                        </span>
                                                        <span className="text-gray-300 font-bold text-xs">{t.description || 'Payment'}</span>
                                                        <div className="text-gray-500 text-[10px] mt-1 font-medium">
                                                            {new Date(t.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="block font-black text-gray-300 text-sm">
                                                            ${isSuccess ? amount.toFixed(2) : '0.00'}
                                                        </span>
                                                        {qty > 0 && isSuccess && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 mt-0.5">
                                                                ({qty} <ImageIcon className="h-2.5 w-2.5" />)
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`font-black text-sm ${isSuccess ? 'text-blue-400' : 'text-gray-600'}`}>
                                                            ${isSuccess ? txNet.toFixed(2) : '0.00'}
                                                        </span>
                                                        {isSuccess && (
                                                            <div className="text-[9px] font-bold text-gray-600 mt-0.5 uppercase tracking-widest">
                                                                Profit
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })
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
