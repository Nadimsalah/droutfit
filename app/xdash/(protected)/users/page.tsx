import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { Users, Search, ShieldCheck, Eye, Image as ImageIcon, Store, TrendingUp } from "lucide-react"

export const dynamic = 'force-dynamic'

async function getUsers() {
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const [profilesRes, authRes, txRes] = await Promise.all([
        adminClient.from('profiles').select('*').order('created_at', { ascending: false }),
        adminClient.auth.admin.listUsers(),
        adminClient.from('transactions').select('user_id, amount').eq('status', 'succeeded')
    ])

    const authUsers = authRes.data?.users || []
    const transactions = txRes.data || []

    const users = profilesRes.data?.map(profile => {
        const authUser = authUsers.find(u => u.id === profile.id)
        const userTxs = transactions.filter(t => t.user_id === profile.id)
        const totalSpent = userTxs.reduce((sum, t) => sum + (t.amount || 0), 0)

        return {
            ...profile,
            email: authUser?.email || null,
            totalSpent,
            txCount: userTxs.length
        }
    }) || []

    return users
}

export default async function UsersPage() {
    const users = await getUsers()

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
                    <p className="text-gray-400 mt-1">{users.length} registered users</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</span>
                    </div>
                    <p className="text-3xl font-black text-white">{users.length}</p>
                </div>
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="h-5 w-5 text-purple-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subscribed</span>
                    </div>
                    <p className="text-3xl font-black text-white">{users.filter(u => u.is_subscribed).length}</p>
                </div>
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <ImageIcon className="h-5 w-5 text-green-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Image Inventory</span>
                    </div>
                    <p className="text-3xl font-black text-white">{users.reduce((s, u) => s + (u.credits || 0), 0).toLocaleString('de-DE')}</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Store</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Image Qty</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Spent</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Plan</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm shrink-0">
                                                {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">
                                                    {user.full_name || 'No Name'}
                                                </div>
                                                <div className="text-[11px] text-gray-500 font-medium">
                                                    {user.email || 'No email'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.store_domain ? (
                                            <div className="flex items-center gap-2">
                                                <Store className="h-3 w-3 text-gray-500" />
                                                <span className="text-xs font-bold text-gray-300">{user.store_domain}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-600">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="h-3 w-3 text-blue-400" />
                                            <span className="font-black text-white">{(user.credits || 0).toLocaleString('de-DE')}</span>
                                            <span className="text-[10px] text-gray-600 uppercase">imgs</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-black text-green-500 text-sm">
                                            ${user.totalSpent.toFixed(2)}
                                        </span>
                                        <span className="text-[10px] text-gray-600 ml-1">({user.txCount} orders)</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.is_subscribed ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                                                <ShieldCheck className="h-3 w-3" /> Pro
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-800 text-gray-500 uppercase tracking-wider">
                                                Free
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/xdash/users/${user.id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold hover:bg-blue-500/20 transition-all group-hover:border-blue-500/40"
                                        >
                                            <Eye className="h-3 w-3" />
                                            See More
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-gray-600 text-sm font-bold uppercase tracking-widest">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
