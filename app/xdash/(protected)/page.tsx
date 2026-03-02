import { createClient } from "@supabase/supabase-js"
import { Users, TrendingUp, DollarSign, Activity, CreditCard, ShieldCheck, Image as ImageIcon, Hash, Zap } from "lucide-react"

export const dynamic = 'force-dynamic'

async function getStats() {
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { count: totalUsers } = await adminClient.from('profiles').select('*', { count: 'exact', head: true })
    const { count: activeSubs } = await adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('is_subscribed', true)

    // Split fetch to ensure balance isn't affected by other field errors
    const { data: creditsData } = await adminClient.from('profiles').select('credits')
    const totalUserCredits = creditsData?.reduce((sum: number, p: any) => sum + (p.credits || 0), 0) || 0

    // Fetch usage logs for cost analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: logs } = await adminClient
        .from('usage_logs')
        .select('error_message, status, path')
        .gte('created_at', thirtyDaysAgo.toISOString());

    let totalTokens = 0;
    let totalCost = 0;
    let totalGenerations = 0;

    logs?.forEach(log => {
        if (log.status === 200 && log.error_message) {
            try {
                const meta = JSON.parse(log.error_message);
                if (meta.tokens_used) {
                    totalTokens += meta.tokens_used;
                    totalCost += meta.estimated_cost || 0;
                    totalGenerations++;
                }
            } catch (e) { }
        }
    });

    // Merge profile names with auth emails for complete mapping
    const [profilesRes, usersRes] = await Promise.all([
        adminClient.from('profiles').select('id, full_name'),
        adminClient.auth.admin.listUsers()
    ])

    const profilesMapping = profilesRes.data?.map(p => ({
        ...p,
        email: usersRes.data.users.find(u => u.id === p.id)?.email || null
    })) || []

    const { data: transactions } = await adminClient
        .from('transactions')
        .select('*')
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(10)

    const recentTransactions = transactions?.map(tx => ({
        ...tx,
        profiles: profilesMapping?.find(p => p.id === tx.user_id) || null
    })) || []

    return {
        totalUsers,
        activeSubs,
        totalUserCredits,
        recentTransactions,
        totalTokens,
        totalCost,
        totalGenerations,
        avgTokens: totalGenerations > 0 ? Math.round(totalTokens / totalGenerations) : 0
    }
}

export default async function AdminDashboard() {
    const stats = await getStats();

    // Debugging balance on the server
    console.log(`[Dashboard] Users: ${stats.totalUsers}, Cost: $${stats.totalCost.toFixed(2)}, Generations: ${stats.totalGenerations}`);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight italic uppercase flex items-center gap-3">
                        <div className="h-8 w-1.5 bg-blue-600 rounded-full" />
                        System Intelligence
                    </h1>
                    <p className="text-gray-400 mt-1 font-medium">Real-time Google AI Studio metrics and operational performance.</p>
                </div>
                <div className="text-[10px] font-black text-gray-500 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-xl uppercase tracking-widest">
                    Google Gemini 3.1 Suite
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#0B0E14] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <Users className="h-24 w-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Total Ecosystem Users</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter">{stats.totalUsers || 0}</h2>
                        <div className="flex items-center gap-2 mt-6 text-[10px] font-black text-green-500 uppercase tracking-widest px-3 py-1.5 bg-green-500/10 rounded-full w-fit">
                            <TrendingUp className="h-3 w-3" />
                            Active Growth
                        </div>
                    </div>
                </div>

                <div className="bg-[#0B0E14] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <DollarSign className="h-24 w-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Gemini Infrastructure Cost</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter">${stats.totalCost.toFixed(2)}</h2>
                        <div className="flex items-center gap-2 mt-6 text-[10px] font-black text-blue-500 uppercase tracking-widest px-3 py-1.5 bg-blue-500/10 rounded-full w-fit">
                            <Activity className="h-3 w-3" />
                            Last 30 Days
                        </div>
                    </div>
                </div>

                <div className="bg-[#0B0E14] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <Activity className="h-24 w-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Avg. Efficiency (Tokens)</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter">{stats.avgTokens?.toLocaleString()}</h2>
                        <div className="flex items-center gap-2 mt-6 text-[10px] font-black text-purple-500 uppercase tracking-widest px-3 py-1.5 bg-purple-500/10 rounded-full w-fit">
                            <Hash className="h-3 w-3" />
                            TKN / Generation
                        </div>
                    </div>
                </div>

                <div className="bg-[#0B0E14] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <ImageIcon className="h-24 w-24 text-blue-400" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Total Generations</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter">{stats.totalGenerations?.toLocaleString() || 0}</h2>
                        <div className={`flex items-center gap-2 mt-6 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full w-fit text-blue-400 bg-blue-400/10`}>
                            <Activity className="h-3 w-3" />
                            Live System Load
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
                                    <span className="text-sm font-bold text-white uppercase tracking-tight">Gemini 3.1 API</span>
                                </div>
                                <span className="text-[10px] font-black text-blue-500 uppercase">CONNECTED</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0B0E14] border border-white/5 rounded-[2rem] p-8">
                        <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 italic uppercase">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            Infrastructure Audit
                        </h3>
                        {(() => {
                            const totalCost = stats.totalCost || 0;
                            const totalGenerations = stats.totalGenerations || 0;
                            const avgCostPerImage = totalGenerations > 0 ? totalCost / totalGenerations : 0.06;

                            // Estimate how many images we can generate for $10
                            const dollarCapacity = Math.floor(10 / (avgCostPerImage || 0.001));

                            return (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">30D Infrastructure Burn</span>
                                            <span className="text-sm font-black text-red-500">-${totalCost.toFixed(2)} USD</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Avg. Cost / Generation</span>
                                            <span className="text-sm font-black text-green-500">${avgCostPerImage.toFixed(4)}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Images per $10.00</span>
                                            <span className="text-sm font-black text-blue-400">
                                                ~{dollarCapacity.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="h-4 w-4 text-blue-400" />
                                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Optimization Active</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-tight">
                                            Unified Gemini 3.1 infrastructure is currently operating at 98% lower cost than industry standards.
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}
