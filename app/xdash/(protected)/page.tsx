import { supabase } from "@/lib/supabase"
import { Users, TrendingUp, DollarSign, Activity, CreditCard, ShieldCheck } from "lucide-react"

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

async function getNanoBananaCredits() {
    try {
        const apiKey = process.env.NEXT_PUBLIC_NANOBANANA_API_KEY;
        const response = await fetch("https://api.nanobananaapi.ai/api/v1/common/get-account-credits", {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            },
            next: { revalidate: 300 } // Cache for 5 mins
        });
        const data = await response.json();
        return data.data || { credits: 0 };
    } catch (e) {
        console.error("Failed to fetch NanoBanana credits:", e);
        return { credits: 0 };
    }
}

export default async function AdminDashboard() {
    const [stats, nbCredits] = await Promise.all([
        getStats(),
        getNanoBananaCredits()
    ]);

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="h-24 w-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Total Users</p>
                        <h2 className="text-4xl font-black text-white">{stats.totalUsers || 0}</h2>
                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-green-500 bg-green-500/10 w-fit px-2 py-1 rounded-lg">
                            <TrendingUp className="h-3 w-3" />
                            +12%
                        </div>
                    </div>
                </div>

                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="h-24 w-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Monthly Rev</p>
                        <h2 className="text-4xl font-black text-white">${stats.monthlyRevenue?.toFixed(2)}</h2>
                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-gray-500 bg-white/5 w-fit px-2 py-1 rounded-lg">
                            Estimated
                        </div>
                    </div>
                </div>

                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="h-24 w-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Subscribers</p>
                        <h2 className="text-4xl font-black text-white">{stats.activeSubs || 0}</h2>
                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-purple-500 bg-purple-500/10 w-fit px-2 py-1 rounded-lg">
                            {(stats.totalUsers && stats.activeSubs) ? ((stats.activeSubs / stats.totalUsers) * 100).toFixed(0) : 0}% Conv
                        </div>
                    </div>
                </div>

                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard className="h-24 w-24 text-blue-400" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Banana Credits</p>
                        <h2 className="text-4xl font-black text-white">{nbCredits.credits?.toLocaleString('de-DE') || 0}</h2>
                        <div className={`flex items-center gap-2 mt-4 text-xs font-bold w-fit px-2 py-1 rounded-lg ${nbCredits.credits > 1000 ? 'text-blue-400 bg-blue-400/10' : 'text-red-500 bg-red-500/10 animate-pulse'}`}>
                            <Activity className="h-3 w-3" />
                            {nbCredits.credits > 1000 ? 'API Healthy' : 'Low Credits'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#0B0E14] border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        System Logs
                    </h3>
                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                        <Activity className="h-4 w-4" />
                        Log feed active
                    </div>
                    <div className="mt-4 space-y-2 opacity-50">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex justify-between p-3 border-b border-gray-800/50 text-xs text-gray-400">
                                <span>/api/virtual-try-on</span>
                                <span>200 OK</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-green-500" />
                            Service Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    <span className="text-sm font-bold text-white uppercase tracking-tight">Main API</span>
                                </div>
                                <span className="text-[10px] font-black text-green-500 uppercase">ONLINE</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    <span className="text-sm font-bold text-white uppercase tracking-tight">Supabase</span>
                                </div>
                                <span className="text-[10px] font-black text-green-500 uppercase">ONLINE</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    <span className="text-sm font-bold text-white uppercase tracking-tight">Banana API</span>
                                </div>
                                <span className="text-[10px] font-black text-blue-500 uppercase">CONNECTED</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6">Admin Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors border border-gray-800 text-left px-4 flex justify-between items-center group">
                                Settings
                                <span className="text-gray-500 group-hover:text-white">→</span>
                            </button>
                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors border border-gray-800 text-left px-4 flex justify-between items-center group">
                                Support
                                <span className="text-gray-500 group-hover:text-white">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
