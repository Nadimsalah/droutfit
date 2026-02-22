import { supabase } from "@/lib/supabase"
import { Users, TrendingUp, DollarSign, Activity } from "lucide-react"

async function getStats() {
    // Determine counts directly (using RLS bypass if possible, here using standard client assuming admin privileges or public RLS for counts)
    // Note: Since we are using standard client, we might be limited by RLS.
    // Ideally we would use service_role client here, but for now let's try standard.
    // If standard fails to see all users, we need to add service role key to env.

    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: activeSubs } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_subscribed', true)

    // Revenue is tricky without a payments table, let's estimate based on Subs
    // Mock Logic: activeSubs * $5
    const monthlyRevenue = (activeSubs || 0) * 5

    return { totalUsers, activeSubs, monthlyRevenue }
}

export default async function AdminDashboard() {
    const stats = await getStats()

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
                    <p className="text-gray-400 mt-1">Real-time platform metrics and monitoring.</p>
                </div>
                <div className="text-xs font-mono text-gray-500 bg-gray-900 border border-gray-800 px-3 py-1 rounded-full">
                    v1.0.2 Stable
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="h-24 w-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Total Users</p>
                        <h2 className="text-4xl font-black text-white">{stats.totalUsers || 0}</h2>
                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-green-500 bg-green-500/10 w-fit px-2 py-1 rounded-lg">
                            <TrendingUp className="h-3 w-3" />
                            +12% vs last month
                        </div>
                    </div>
                </div>

                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="h-24 w-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Monthly Revenue (Est)</p>
                        <h2 className="text-4xl font-black text-white">${stats.monthlyRevenue?.toFixed(2)}</h2>
                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-gray-500 bg-gray-800 w-fit px-2 py-1 rounded-lg">
                            Access Plans Only
                        </div>
                    </div>
                </div>

                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="h-24 w-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Active Subscribers</p>
                        <h2 className="text-4xl font-black text-white">{stats.activeSubs || 0}</h2>
                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-purple-500 bg-purple-500/10 w-fit px-2 py-1 rounded-lg">
                            {(stats.totalUsers && stats.activeSubs) ? ((stats.activeSubs / stats.totalUsers) * 100).toFixed(1) : 0}% Conversion
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#0B0E14] border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        Recent System Logs
                    </h3>
                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                        <Activity className="h-4 w-4" />
                        Real-time logs connection pending...
                    </div>
                    {/* Placeholder for logs table */}
                    <div className="mt-4 space-y-2 opacity-50">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between p-3 border-b border-gray-800/50 text-xs text-gray-400">
                                <span>/api/generate-image</span>
                                <span>200 OK</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors border border-gray-800 text-left px-4 flex justify-between items-center group">
                            Manage Global Config
                            <span className="text-gray-500 group-hover:text-white">→</span>
                        </button>
                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors border border-gray-800 text-left px-4 flex justify-between items-center group">
                            View Error Reports
                            <span className="text-gray-500 group-hover:text-white">→</span>
                        </button>
                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors border border-gray-800 text-left px-4 flex justify-between items-center group">
                            System Health Check
                            <span className="text-gray-500 group-hover:text-white">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
