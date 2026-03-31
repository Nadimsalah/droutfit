import { createClient } from "@supabase/supabase-js"
import { Users, TrendingUp, DollarSign, Activity, Settings, MessageSquare, ListTree, CreditCard, ShieldCheck, Image as ImageIcon, Zap, ChevronRight, UserPlus, Database } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

async function getStats() {
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { count: totalUsers } = await adminClient.from('profiles').select('*', { count: 'exact', head: true })
    const { count: activeSubs } = await adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('is_subscribed', true)

    // Fetch usage logs for cost analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: logs } = await adminClient
        .from('usage_logs')
        .select('status')
        .gte('created_at', thirtyDaysAgo.toISOString());

    let totalGenerations = 0;

    logs?.forEach(log => {
        if (log.status === 200) {
            totalGenerations++;
        }
    });

    const totalCost = totalGenerations * 0.01;

    // Merge profile names with auth emails for complete mapping
    const [profilesRes, usersRes] = await Promise.all([
        adminClient.from('profiles').select('id, full_name, credits'),
        adminClient.auth.admin.listUsers()
    ])

    const totalUserCredits = profilesRes.data?.reduce((sum: number, p: any) => sum + (p.credits || 0), 0) || 0

    const profilesMapping = profilesRes.data?.map(p => ({
        ...p,
        email: usersRes.data.users.find(u => u.id === p.id)?.email || null
    })) || []

    const { data: transactions } = await adminClient
        .from('transactions')
        .select('*')
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(6)

    const recentTransactions = transactions?.map(tx => ({
        ...tx,
        profiles: profilesMapping?.find(p => p.id === tx.user_id) || null
    })) || []

    return {
        totalUsers: totalUsers || 0,
        activeSubs: activeSubs || 0,
        totalUserCredits,
        recentTransactions,
        totalCost,
        totalGenerations
    }
}

export default async function AdminDashboard() {
    const stats = await getStats();

    const quickLinks = [
        { title: "Manage Users", desc: "View & edit client accounts", icon: <Users className="h-5 w-5" />, href: "/xdash/users", color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Revenue Stream", desc: "Track earnings & subscriptions", icon: <DollarSign className="h-5 w-5" />, href: "/xdash/revenue", color: "text-green-500", bg: "bg-green-500/10" },
        { title: "Pricing Engine", desc: "Adjust SaaS plans and limits", icon: <Settings className="h-5 w-5" />, href: "/xdash/settings", color: "text-purple-500", bg: "bg-purple-500/10" },
        { title: "Prompt Studio", desc: "Fine-tune AI system prompts", icon: <MessageSquare className="h-5 w-5" />, href: "/xdash/prompts", color: "text-orange-500", bg: "bg-orange-500/10" },
        { title: "System Logs", desc: "Audit API requests & errors", icon: <ListTree className="h-5 w-5" />, href: "/xdash/logs", color: "text-sky-500", bg: "bg-sky-500/10" }
    ];

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <div className="h-8 w-1.5 bg-indigo-500 rounded-full" />
                        Command Center
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium">Real-time system health, infrastructure costs, and business metrics.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        System Active
                    </div>
                </div>
            </div>

            {/* Quick Actions (SaaS Management) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {quickLinks.map((link, idx) => (
                    <Link key={idx} href={link.href} className="flex flex-col p-4 bg-[#131720] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all group">
                        <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${link.bg} ${link.color}`}>
                            {link.icon}
                        </div>
                        <h3 className="text-white font-bold text-sm mb-1 group-hover:text-indigo-400 transition-colors">{link.title}</h3>
                        <p className="text-gray-500 text-xs">{link.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[#131720] to-[#0A0D14] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                            <Users className="h-6 w-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
                            <TrendingUp className="h-3 w-3" /> Total
                        </span>
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total ecosystem Users</p>
                    <h2 className="text-3xl font-black text-white">{stats.totalUsers}</h2>
                </div>

                <div className="bg-gradient-to-br from-[#131720] to-[#0A0D14] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                            <UserPlus className="h-6 w-6" />
                        </div>
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Active Subscribers</p>
                    <h2 className="text-3xl font-black text-white">{stats.activeSubs}</h2>
                </div>

                <div className="bg-gradient-to-br from-[#131720] to-[#0A0D14] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                            <ImageIcon className="h-6 w-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
                            30 Days
                        </span>
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Generations</p>
                    <h2 className="text-3xl font-black text-white">{stats.totalGenerations.toLocaleString()}</h2>
                </div>

                <div className="bg-gradient-to-br from-[#131720] to-[#0A0D14] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                            <Database className="h-6 w-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-md">
                            30 Days
                        </span>
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Pruna AI Infra Cost</p>
                    <h2 className="text-3xl font-black text-white">${stats.totalCost.toFixed(2)}</h2>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-[#131720] border border-gray-800/60 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                            <Activity className="h-4 w-4 text-indigo-500" />
                            Recent Revenue Events
                        </h3>
                        <Link href="/xdash/revenue" className="text-xs font-bold text-indigo-400 hover:text-white transition-colors flex items-center gap-1">
                            View All <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="pb-3 text-xs font-bold text-gray-500">Customer</th>
                                    <th className="pb-3 text-xs font-bold text-gray-500">Package</th>
                                    <th className="pb-3 text-xs font-bold text-gray-500 text-right">Amount</th>
                                    <th className="pb-3 text-xs font-bold text-gray-500 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {stats.recentTransactions.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-3">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                    {tx.profiles?.full_name || tx.profiles?.email?.split('@')[0] || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-gray-500">{tx.profiles?.email || 'No email'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-xs font-bold text-gray-300">
                                                <Zap className="h-3 w-3 text-yellow-500" />
                                                {tx.description}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <span className="text-sm font-black text-green-400">${tx.amount?.toFixed(2)}</span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <span className="text-xs font-medium text-gray-500">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {stats.recentTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-xs font-bold text-gray-600 uppercase tracking-widest">
                                            No successfull transactions
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Status & AI Infra Cost Breakdown */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-[#131720] border border-gray-800/60 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                            System Health
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-sm font-bold text-gray-300">Supabase DB</span>
                                <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-1 rounded-md uppercase tracking-widest">Operational</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-sm font-bold text-gray-300">Pruna AI API</span>
                                <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-1 rounded-md uppercase tracking-widest">Connected</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-sm font-bold text-gray-300">Core Services</span>
                                <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-1 rounded-md uppercase tracking-widest">Healthy</span>
                            </div>
                        </div>
                    </div>

                    {/* Infrastructure Audit */}
                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border border-indigo-500/20 rounded-2xl p-6">
                        <h3 className="text-sm font-black text-indigo-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                            <Zap className="h-4 w-4" />
                            Pruna AI Audit
                        </h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-medium">Flat Generation Rate</span>
                                <span className="font-black text-white">$0.01 / Gen</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-t border-white/5 pt-4">
                                <span className="text-gray-400 font-medium">Yield per $10.00</span>
                                <span className="font-black text-indigo-300 text-lg">1,000 Images</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <ShieldCheck className="h-5 w-5 text-indigo-400" />
                            <p className="text-xs font-medium text-indigo-200">
                                Cost calculations optimized exclusively via Pruna AI integration endpoint.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
