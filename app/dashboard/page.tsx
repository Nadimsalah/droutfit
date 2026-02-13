"use client"

import {
    Bell,
    Plus,
    Loader2
} from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'
import { useState, useEffect } from "react"
import { TopUpModal } from "@/components/TopUpModal"
import { getDashboardStats } from "@/lib/storage"

// We can mock the chart data to follow the total usage for now
const generateChartData = (total: number) => {
    const data = [
        { date: '2026-01-30', success: 0 },
        { date: '2026-01-31', success: 0 },
        { date: '2026-02-01', success: 0 },
        { date: '2026-02-02', success: 0 },
        { date: '2026-02-03', success: 0 },
        { date: '2026-02-04', success: 0 },
        { date: '2026-02-05', success: 0 },
        { date: '2026-02-06', success: 0 },
        { date: '2026-02-07', success: 0 },
        { date: '2026-02-08', success: 0 },
        { date: '2026-02-09', success: 0 },
        { date: '2026-02-10', success: 0 },
        { date: '2026-02-11', success: total },
        { date: '2026-02-12', success: 0 },
    ]
    return data
}

export default function OverviewPage() {
    const [isTopUpOpen, setIsTopUpOpen] = useState(false)
    const [stats, setStats] = useState<{
        credits: number;
        totalUsage: number;
        successRate: number;
        productCount: number;
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats()
                setStats(data)
            } catch (error) {
                console.error("Error fetching dashboard stats:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    const chartData = generateChartData(stats?.totalUsage || 0)

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold text-white tracking-tight">Overview</h1>
                        <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse tracking-widest uppercase">Live Status</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium">
                        Monitor your credit usage and API request performance in real-time.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsTopUpOpen(true)}
                        className="flex items-center gap-2 px-6 py-2 text-[13px] font-black text-white bg-[#2563EB] hover:bg-blue-500 rounded-full transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Plus className="h-4 w-4" />
                        Top Up
                    </button>
                </div>
            </div>

            <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Last 24 Hours Card */}
                <div className="bg-[#13171F] border border-gray-800/40 rounded-2xl shadow-2xl">
                    <div className="p-7 space-y-6">
                        <h3 className="text-xl font-bold text-white">Last 24 Hours</h3>

                        {/* Progress Bar Container */}
                        <div className="space-y-6">
                            <div className="h-[3px] w-full bg-[#1F2937] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#10B981] transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                    style={{ width: `${stats?.successRate || 0}%` }}
                                />
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                                        <span className="text-gray-400 text-sm font-medium">Success</span>
                                    </div>
                                    <div className="text-white text-sm font-bold">
                                        {stats?.totalUsage} <span className="text-gray-500 ml-1 font-medium">( {stats?.successRate.toFixed(1)}% )</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-red-500/80" />
                                        <span className="text-gray-400 text-sm font-medium">Failure</span>
                                    </div>
                                    <div className="text-white text-sm font-bold">
                                        0 <span className="text-gray-500 ml-1 font-medium">( 0.0% )</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-800/50 flex justify-between items-end">
                            <span className="text-gray-500 text-[13px] font-bold mb-1">Total Requests</span>
                            <span className="text-white text-4xl font-black">{stats?.totalUsage}</span>
                        </div>
                    </div>
                </div>

                {/* Remaining Credits Card */}
                <div className="bg-[#13171F] border border-gray-800/40 rounded-2xl p-7 shadow-2xl relative flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">Remaining credits</h3>
                        <button className="text-gray-600 hover:text-white transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="mt-8">
                        <span className="text-8xl font-black text-white tracking-tighter">{stats?.credits}</span>
                    </div>
                </div>
            </div>

            {/* Activity Analytics Chart */}
            <div className="bg-[#13171F] border border-gray-800/40 rounded-2xl p-7 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <h3 className="text-gray-400 text-sm font-bold tracking-tight">
                            Jan 30 - Feb 12 <span className="text-gray-600 font-medium ml-1">( total</span>
                            <span className="text-white font-black mx-1">{stats?.totalUsage}</span>
                            <span className="text-gray-600 font-medium ml-1">)</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2 text-[#10B981]">
                            <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                            Success
                        </div>
                        <div className="flex items-center gap-2 text-red-500/40">
                            <div className="h-2 w-2 rounded-full bg-red-500/40" />
                            Failure
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="#1F2937" strokeDasharray="0" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }}
                                dy={10}
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
                                radius={[3, 3, 0, 0]}
                                barSize={24}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={'#10B981'} className="hover:opacity-80 transition-opacity" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
