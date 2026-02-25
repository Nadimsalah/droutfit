import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
    ArrowLeft, User, Store, ImageIcon, CreditCard, ShieldCheck,
    Calendar, Clock, TrendingUp, DollarSign, Activity, Package
} from "lucide-react"

export const dynamic = 'force-dynamic'

async function getUserDetail(id: string) {
    // Validate UUID format before calling Supabase Auth
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) return null

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const [profileRes, txRes] = await Promise.all([
        adminClient.from('profiles').select('*').eq('id', id).single(),
        adminClient.from('transactions').select('*').eq('user_id', id).order('created_at', { ascending: false })
    ])

    if (!profileRes.data) return null

    // Fetch email safely after validating the profile exists
    let email: string | null = null
    try {
        const authRes = await adminClient.auth.admin.getUserById(id)
        email = authRes.data?.user?.email || null
    } catch {
        email = null
    }

    const transactions = txRes.data || []
    const totalSpent = transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
    const succeededTx = transactions.filter((t: any) => t.status === 'succeeded')

    return {
        profile: { ...profileRes.data, email },
        transactions,
        succeededTx,
        totalSpent
    }
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const data = await getUserDetail(id)
    if (!data) notFound()

    const { profile, transactions, succeededTx, totalSpent } = data

    const joined = new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    })

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/xdash/users"
                    className="p-2 rounded-xl bg-white/5 border border-gray-800 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">User Profile</h1>
                    <p className="text-gray-400 mt-1">{profile.email || 'No email'}</p>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5 col-span-2 md:col-span-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Image Qty</p>
                    <p className="text-4xl font-black text-white">{(profile.credits || 0).toLocaleString('de-DE')}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-blue-400 font-bold">
                        <ImageIcon className="h-3 w-3" /> Images Held
                    </div>
                </div>
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Spent</p>
                    <p className="text-4xl font-black text-green-500">${totalSpent.toFixed(2)}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-green-500 font-bold">
                        <DollarSign className="h-3 w-3" /> All time
                    </div>
                </div>
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Orders</p>
                    <p className="text-4xl font-black text-white">{succeededTx.length}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-purple-400 font-bold">
                        <Package className="h-3 w-3" /> Successful
                    </div>
                </div>
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Plan</p>
                    {profile.is_subscribed ? (
                        <div className="mt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                                <ShieldCheck className="h-3.5 w-3.5" /> Pro
                            </span>
                        </div>
                    ) : (
                        <div className="mt-2">
                            <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-black bg-gray-800 text-gray-400 uppercase tracking-wider">
                                Free
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-gray-500 font-bold">
                        <Calendar className="h-3 w-3" /> Joined {joined}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Profile Info */}
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 space-y-5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        Profile Info
                    </h3>

                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-2xl">
                            {(profile.full_name || profile.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-black text-white text-lg">{profile.full_name || 'No Name'}</p>
                            <p className="text-sm text-gray-400">{profile.email || 'No email'}</p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-800">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 flex items-center gap-2"><Store className="h-3.5 w-3.5" /> Store Domain</span>
                            <span className="font-bold text-white">{profile.store_domain || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 flex items-center gap-2"><Activity className="h-3.5 w-3.5" /> IP Limit</span>
                            <span className="font-bold text-white">{profile.ip_limit ?? '—'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Last Updated</span>
                            <span className="font-bold text-white">
                                {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 flex items-center gap-2"><CreditCard className="h-3.5 w-3.5" /> User ID</span>
                            <span className="font-mono text-[10px] text-gray-600 truncate max-w-[130px]">{profile.id}</span>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2 bg-[#0B0E14] border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Transaction History
                        <span className="ml-auto text-[10px] font-black text-gray-600 uppercase tracking-widest">{transactions.length} total</span>
                    </h3>

                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                        {transactions.length === 0 ? (
                            <div className="text-center py-12 text-gray-600 text-sm font-bold uppercase tracking-widest">
                                No transactions found
                            </div>
                        ) : (
                            transactions.map((tx: any) => {
                                const qtyMatch = tx.description?.match(/(\d[\d,.]*)/)
                                const qty = qtyMatch ? qtyMatch[0] : null
                                const isSuccess = tx.status === 'succeeded'
                                return (
                                    <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-gray-800 hover:border-gray-700 transition-all">
                                        <div className={`h-2 w-2 rounded-full shrink-0 ${isSuccess ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{tx.description || 'Transaction'}</p>
                                            <p className="text-[10px] text-gray-600 mt-0.5">
                                                {new Date(tx.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {qty && (
                                            <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold">
                                                <ImageIcon className="h-3 w-3" />
                                                {qty} imgs
                                            </div>
                                        )}
                                        <div className="text-right shrink-0">
                                            <span className={`text-sm font-black ${isSuccess ? 'text-green-500' : 'text-gray-500'}`}>
                                                ${tx.amount?.toFixed(2) || '0.00'}
                                            </span>
                                            <p className={`text-[9px] font-bold uppercase tracking-wider ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.status}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
