import { createClient } from "@supabase/supabase-js"
import { Users, TrendingUp, DollarSign, Activity, CreditCard, ShieldCheck, Image as ImageIcon } from "lucide-react"


const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

async function getStats() {
    const { count: totalUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
    const { count: activeSubs } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('is_subscribed', true)

    const { data: profilesData } = await supabaseAdmin.from('profiles').select('id, credits, full_name, email')
    const totalUserCredits = profilesData?.reduce((sum, p) => sum + (p.credits || 0), 0) || 0

    const { data: transactions } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(10)

    const recentTransactions = transactions?.map(tx => ({
        ...tx,
        profiles: profilesData?.find(p => p.id === tx.user_id) || null
    })) || []

    return { totalUsers, activeSubs, totalUserCredits, recentTransactions }
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
                        Recent Transactions
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">User</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Qty Images</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 text-right">Price</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {stats.recentTransactions.map((tx: any) => {
                                    const qtyMatch = tx.description?.match(/(\d[\d.]*)/)
                                    const qty = qtyMatch ? qtyMatch[0] : '-'
                                    return (
                                        <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 px-2">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                                                        {tx.profiles?.full_name || tx.profiles?.email?.split('@')[0] || 'Unknown'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-600 font-medium">{tx.profiles?.email || 'No email'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                    <span className="text-xs font-black text-gray-300">{qty.toLocaleString('de-DE')}</span>
                                                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tight">Images</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 text-right">
                                                <span className="text-xs font-black text-green-500">${tx.amount?.toFixed(2)}</span>
                                            </td>
                                            <td className="py-4 px-2 text-right">
                                                <span className="text-[10px] font-bold text-gray-600">
                                                    {new Date(tx.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {stats.recentTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-xs font-bold text-gray-600 uppercase tracking-[0.2em]">
                                            No successfull transactions found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
                        {(() => {
                            const imageCapacity = Math.floor((nbCredits.credits || 0) / 4);
                            const missingImages = Math.max(0, stats.totalUserCredits - imageCapacity);
                            const requiredAPICredits = missingImages * 4;
                            const refillCost = missingImages * 0.02;
                            const isHealthy = imageCapacity >= stats.totalUserCredits;

                            return (
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-xl border space-y-3 transition-all ${isHealthy ? 'bg-green-500/5 border-green-500/10' : 'bg-yellow-500/5 border-yellow-500/10'}`}>
                                        {isHealthy ? (
                                            <div className="flex items-center gap-3 text-green-500 pb-2">
                                                <ShieldCheck className="h-5 w-5" />
                                                <span className="text-xs font-black uppercase tracking-widest italic">Healthy Status</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-bold uppercase tracking-wider">Required API Credits</span>
                                                    <span className="text-white font-black">
                                                        {requiredAPICredits.toLocaleString('de-DE')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-bold uppercase tracking-wider">Est. Refill Cost</span>
                                                    <span className="text-yellow-500 font-black">
                                                        ${refillCost.toFixed(2)}
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}
                                                style={{ width: `${Math.min(100, (imageCapacity / (stats.totalUserCredits || 1)) * 100)}%` }}
                                            />
                                        </div>

                                        <p className="text-[9px] text-gray-500 font-medium leading-tight italic">
                                            {isHealthy
                                                ? `Balance sufficient. Capacity (${imageCapacity.toLocaleString('de-DE')} images) covers all user holdings.`
                                                : `Shortage: (User Balance - Capacity) * 4 = ${requiredAPICredits.toLocaleString('de-DE')} missing credits.`
                                            }
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    )
}
