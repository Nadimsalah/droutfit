"use client"

import {
    Plus,
    Loader2,
    Bell
} from "lucide-react"
import Link from "next/link"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import { useState, useEffect } from "react"
import { TopUpModal } from "@/components/TopUpModal"
import { getDashboardStats, getChartData } from "@/lib/storage"
import { supabase } from "@/lib/supabase"

export default function DashboardOverviewClient({ dict, locale }: { dict: any, locale: string }) {
    const [isTopUpOpen, setIsTopUpOpen] = useState(false)
    const [stats, setStats] = useState<{
        credits: number;
        totalUsage: number;
        successRate: number;
        productCount: number;
        totalBlocked: number;
    } | null>(null)
    const [chartData, setChartData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showConnectPrompt, setShowConnectPrompt] = useState(false)
    const [shopDomain, setShopDomain] = useState<string | null>(null)

    useEffect(() => {
        const handlePaymentAndFetchStats = async () => {
            setIsLoading(true)

            let isShopifyContext = false
            let currentShop = null

            if (typeof window !== 'undefined') {
                const searchParams = new URLSearchParams(window.location.search)
                currentShop = searchParams.get('shop')
                if (searchParams.get('embedded') === '1' || currentShop) {
                    isShopifyContext = true
                    setShopDomain(currentShop)
                }
            }

            try {
                const { data: { user } } = await supabase.auth.getUser()

                const [dashboardStats, dailyStats, profileRes] = await Promise.all([
                    getDashboardStats(),
                    getChartData(14),
                    user ? supabase.from('profiles').select('store_website').eq('id', user.id).single() : Promise.resolve({ data: null })
                ])

                if (isShopifyContext && profileRes.data && !profileRes.data.store_website) {
                    setShowConnectPrompt(true)
                }

                const totalBlocked = dailyStats.reduce((sum: number, day: any) => sum + day.blocked, 0);
                const totalSuccess = dailyStats.reduce((sum: number, day: any) => sum + day.success, 0);
                const totalRequests = totalSuccess + totalBlocked;
                const successRate = totalRequests > 0 ? (totalSuccess / totalRequests) * 100 : 100;

                setStats({
                    ...dashboardStats,
                    totalUsage: totalRequests,
                    successRate,
                    totalBlocked
                } as any)
                setChartData(dailyStats)
            } catch (error) {
                console.error("Error fetching dashboard stats:", error)
            } finally {
                setIsLoading(false)
            }
        }
        handlePaymentAndFetchStats()
    }, [])

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold text-white tracking-tight">{dict.dashboard.overview}</h1>
                        <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse tracking-widest uppercase">{dict.dashboard.liveStatus}</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium">
                        {dict.dashboard.usageDescription}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsTopUpOpen(true)}
                        className="flex items-center gap-2 px-6 py-2 text-[13px] font-black text-white bg-[#2563EB] hover:bg-blue-500 rounded-full transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Plus className="h-4 w-4" />
                        {dict.dashboard.topUp}
                    </button>
                </div>
            </div>

            <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} dict={dict} locale={locale} />

            {showConnectPrompt && (
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Plus className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{dict.navbar.connectShopify}</h3>
                                <p className="text-gray-400 text-sm">{dict.navbar.linkStorePrompt}</p>
                            </div>
                        </div>
                        <Link
                            href={`/${locale}/dashboard/shopify/connect?shop=${shopDomain}&embedded=1`}
                            className="bg-white text-black px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-xl shadow-white/5 active:scale-[0.98]"
                        >
                            {dict.common.connectStore}
                        </Link>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                <div className="bg-[#13171F] border border-gray-800/40 rounded-2xl shadow-2xl">
                    <div className="p-7 space-y-6">
                        <h3 className="text-xl font-bold text-white">{dict.dashboard.last14Days}</h3>
                        <div className="space-y-6">
                            <div className="h-[6px] w-full bg-[#1F2937] rounded-full overflow-hidden flex">
                                <div
                                    className="h-full bg-[#10B981] transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                    style={{ width: `${stats?.successRate || 0}%` }}
                                />
                                <div
                                    className="h-full bg-red-500 transition-all duration-1000 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                                    style={{ width: `${100 - (stats?.successRate || 0)}%` }}
                                />
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                                        <span className="text-gray-400 text-sm font-medium">{dict.dashboard.success}</span>
                                    </div>
                                    <div className="text-white text-sm font-bold">
                                        {stats?.totalUsage! - stats?.totalBlocked!} <span className="text-gray-500 ml-1 font-medium">( {stats?.successRate.toFixed(1)}% )</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-red-500/80" />
                                        <span className="text-gray-400 text-sm font-medium">{dict.dashboard.blocked}</span>
                                    </div>
                                    <div className="text-white text-sm font-bold">
                                        {stats?.totalBlocked} <span className="text-gray-500 ml-1 font-medium">( {(100 - (stats?.successRate || 0)).toFixed(1)}% )</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-800/50 flex justify-between items-end">
                            <span className="text-gray-500 text-[13px] font-bold mb-1">{dict.dashboard.totalRequests}</span>
                            <span className="text-white text-4xl font-black">{stats?.totalUsage}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#13171F] border border-gray-800/40 rounded-2xl p-7 shadow-2xl relative flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">{dict.dashboard.remainingCredits}</h3>
                        <button className="text-gray-600 hover:text-white transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="mt-8">
                        <span className="text-8xl font-black text-white tracking-tighter">{stats?.credits}</span>
                    </div>
                </div>
            </div>

            <div className="bg-[#13171F] border border-gray-800/40 rounded-2xl p-7 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <h3 className="text-gray-400 text-sm font-bold tracking-tight">
                            {dict.dashboard.last14Days} <span className="text-gray-600 font-medium ml-1">( {dict.dashboard.total}</span>
                            <span className="text-white font-black mx-1">{stats?.totalUsage}</span>
                            <span className="text-gray-600 font-medium ml-1">)</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2 text-[#10B981]">
                            <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                            {dict.dashboard.success}
                        </div>
                        <div className="flex items-center gap-2 text-red-500/80">
                            <div className="h-2 w-2 rounded-full bg-red-500/80" />
                            {dict.dashboard.blocked}
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} stackOffset="sign">
                            <CartesianGrid vertical={false} stroke="#1F2937" strokeDasharray="0" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }}
                                dy={10}
                                tickFormatter={(str) => {
                                    const date = new Date(str);
                                    return `${date.getDate()}/${date.getMonth() + 1}`;
                                }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                contentStyle={{
                                    backgroundColor: '#0F1116',
                                    border: '1px solid #1F2937',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    color: '#fff',
                                    fontWeight: 'bold'
                                }}
                            />
                            <Bar
                                dataKey="success"
                                stackId="a"
                                fill="#10B981"
                                barSize={24}
                            />
                            <Bar
                                dataKey="blocked"
                                stackId="a"
                                fill="#EF4444"
                                barSize={24}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
