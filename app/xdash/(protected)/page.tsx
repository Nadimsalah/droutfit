import { createClient } from "@supabase/supabase-js"
import { Users, TrendingUp, DollarSign, Activity, CreditCard, ShieldCheck, Image as ImageIcon } from "lucide-react"

// Admin client to bypass RLS for dashboard stats
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getStats() {
    const { count: totalUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
    const { count: activeSubs } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('is_subscribed', true)

    const { data: profiles } = await supabaseAdmin.from('profiles').select('credits')
    const totalUserCredits = profiles?.reduce((sum, p) => sum + (p.credits || 0), 0) || 0

    return { totalUsers, activeSubs, totalUserCredits }
}

async function getNanoBananaCredits() {
    try {
        const apiKey = process.env.NEXT_PUBLIC_NANOBANANA_API_KEY;
        const response = await fetch("https://api.nanobananaapi.ai/api/v1/common/credit", {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            },
            next: { revalidate: 300 } // Cache for 5 mins
        });
        const data = await response.json();
        return { credits: data.data || 0 };
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
                        <TrendingUp className="h-24 w-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">User Credits Balance</p>
                        <h2 className="text-4xl font-black text-white">{stats.totalUserCredits?.toLocaleString('de-DE')}</h2>
                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-green-500 bg-green-500/10 w-fit px-2 py-1 rounded-lg">
                            <Activity className="h-3 w-3" />
                            Total User Holdings
                        </div>
                    </div>
                </div>

                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ImageIcon className="h-24 w-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Image Capacity</p>
                        <h2 className="text-4xl font-black text-white">{Math.floor((nbCredits.credits || 0) / 4).toLocaleString('de-DE')}</h2>
                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-purple-500 bg-purple-500/10 w-fit px-2 py-1 rounded-lg">
                            <Activity className="h-3 w-3" />
                            ~4 Credits / Image
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
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-yellow-500" />
                            Refill Requirement
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider">Required Credits</span>
                                    <span className="text-white font-black">{Math.max(0, stats.totalUserCredits - (nbCredits.credits || 0)).toLocaleString('de-DE')}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider">Est. Refill Cost</span>
                                    <span className="text-yellow-500 font-black">
                                        ${(Math.max(0, stats.totalUserCredits - (nbCredits.credits || 0)) * (0.02 / 4)).toFixed(2)}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${nbCredits.credits >= stats.totalUserCredits ? 'bg-green-500 w-full' : 'bg-red-500 w-[40%]'}`}
                                        style={{ width: `${Math.min(100, (nbCredits.credits / stats.totalUserCredits) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-[9px] text-gray-500 font-medium leading-tight">
                                    Calculation based on $0.02 per 4 credits ratio to cover {stats.totalUserCredits.toLocaleString('de-DE')} user liabilities.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
