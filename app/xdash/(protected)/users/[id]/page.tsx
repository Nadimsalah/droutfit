import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
    ArrowLeft, User, Store, ImageIcon, CreditCard, ShieldCheck,
    Calendar, Clock, TrendingUp, DollarSign, Activity, Package,
    History, CheckCircle2, XCircle, ChevronRight
} from "lucide-react"

export const dynamic = 'force-dynamic'

async function getUserDetail(id: string) {
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

    // Build image logs from transactions — each credit purchase = image log entry
    const imageLogs = succeededTx.map((t: any) => {
        const match = t.description?.match(/(\d+)/)
        const qty = match ? parseInt(match[1]) : 0
        return { ...t, imageQty: qty }
    })

    const totalImagesEverPurchased = imageLogs.reduce((s: number, l: any) => s + l.imageQty, 0)

    return {
        profile: { ...profileRes.data, email },
        transactions,
        succeededTx,
        totalSpent,
        imageLogs,
        totalImagesEverPurchased
    }
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const data = await getUserDetail(id)
    if (!data) notFound()

    const { profile, transactions, succeededTx, totalSpent, imageLogs, totalImagesEverPurchased } = data

    const joined = new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    })

    // Running balance logic (oldest first for accumulation)
    const logsOldestFirst = [...imageLogs].reverse()
    let runningBalance = 0
    const logsWithBalance = logsOldestFirst.map((log: any) => {
        runningBalance += log.imageQty
        return { ...log, balanceAfter: runningBalance }
    }).reverse()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Link
                        href="/xdash/users"
                        className="p-2 rounded-xl bg-white/5 border border-gray-800 text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold text-white tracking-tight truncate">{profile.full_name || 'User'}</h1>
                        <p className="text-gray-400 mt-1 truncate">{profile.email || 'No email'}</p>
                    </div>
                </div>
                {profile.is_subscribed && (
                    <span className="sm:ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> Pro
                    </span>
                )}
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-[#0B0E14] border border-blue-500/20 rounded-2xl p-5 col-span-2 md:col-span-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Current Balance</p>
                    <p className="text-4xl font-black text-blue-400">{(profile.credits || 0).toLocaleString('de-DE')}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-blue-500 font-bold">
                        <ImageIcon className="h-3 w-3" /> Images held now
                    </div>
                </div>
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Ever Purchased</p>
                    <p className="text-3xl font-black text-white">{totalImagesEverPurchased.toLocaleString('de-DE')}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-gray-500 font-bold">
                        <History className="h-3 w-3" /> All time images
                    </div>
                </div>
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Spent</p>
                    <p className="text-3xl font-black text-green-500">${totalSpent.toFixed(2)}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-green-600 font-bold">
                        <DollarSign className="h-3 w-3" /> All time
                    </div>
                </div>
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Orders</p>
                    <p className="text-3xl font-black text-white">{succeededTx.length}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-purple-400 font-bold">
                        <Package className="h-3 w-3" /> Completed
                    </div>
                </div>
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Avg per Order</p>
                    <p className="text-3xl font-black text-yellow-500">
                        {succeededTx.length > 0 ? Math.round(totalImagesEverPurchased / succeededTx.length).toLocaleString('de-DE') : '—'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-yellow-600 font-bold">
                        <TrendingUp className="h-3 w-3" /> Images/order
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Profile Info */}
                <div className="space-y-4">
                    <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6 space-y-5">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" /> Profile
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-2xl shrink-0">
                                {(profile.full_name || profile.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-black text-white">{profile.full_name || 'No Name'}</p>
                                <p className="text-xs text-gray-500 break-all">{profile.email || 'No email'}</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-gray-800/60">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] text-gray-500 flex items-center gap-2"><Store className="h-3 w-3" /> Store</span>
                                <span className="text-[11px] font-bold text-white">{profile.store_domain || '—'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] text-gray-500 flex items-center gap-2"><Activity className="h-3 w-3" /> IP Limit</span>
                                <span className="text-[11px] font-bold text-white">{profile.ip_limit ?? '—'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] text-gray-500 flex items-center gap-2"><Calendar className="h-3 w-3" /> Joined</span>
                                <span className="text-[11px] font-bold text-white">{joined}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] text-gray-500 flex items-center gap-2"><Clock className="h-3 w-3" /> Updated</span>
                                <span className="text-[11px] font-bold text-white">
                                    {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between items-start pt-2 border-t border-gray-800/60">
                                <span className="text-[11px] text-gray-500 flex items-center gap-2"><CreditCard className="h-3 w-3" /> ID</span>
                                <span className="font-mono text-[9px] text-gray-600 max-w-[140px] text-right break-all">{profile.id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Image Logs + Transaction History */}
                <div className="lg:col-span-2 space-y-6">

                    {/* IMAGE LOGS */}
                    <div className="bg-[#0B0E14] border border-blue-500/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-blue-500" />
                            Image Purchase Logs
                            <span className="ml-auto text-[10px] font-black text-gray-600 uppercase tracking-widest">{imageLogs.length} purchases</span>
                        </h3>

                        {logsWithBalance.length === 0 ? (
                            <div className="text-center py-10 text-gray-600 text-xs font-bold uppercase tracking-widest">
                                No image purchases yet
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-4 top-0 bottom-0 w-px bg-blue-500/10" />

                                <div className="space-y-3 pl-10">
                                    {logsWithBalance.map((log: any, i: number) => (
                                        <div key={log.id} className="relative">
                                            {/* Timeline dot */}
                                            <div className="absolute -left-10 top-3.5 h-3 w-3 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                            </div>

                                            <div className="flex items-center gap-4 p-3 rounded-xl bg-blue-500/[0.03] border border-blue-500/10 hover:border-blue-500/20 transition-all">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-xs font-black text-white">
                                                            +{log.imageQty.toLocaleString('de-DE')} Images
                                                        </span>
                                                        <span className="text-[9px] text-blue-500 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded-full">
                                                            #{imageLogs.length - i}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500">
                                                        {new Date(log.created_at).toLocaleString('en-US', {
                                                            day: '2-digit', month: 'short', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-black text-green-500">${log.amount?.toFixed(2)}</p>
                                                    <p className="text-[9px] text-gray-600 font-bold">
                                                        Balance after: <span className="text-blue-400">{log.balanceAfter.toLocaleString('de-DE')}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FULL TRANSACTION HISTORY */}
                    <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                            <History className="h-5 w-5 text-gray-400" />
                            All Transactions
                            <span className="ml-auto text-[10px] font-black text-gray-600 uppercase tracking-widest">{transactions.length} total</span>
                        </h3>

                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {transactions.length === 0 ? (
                                <div className="text-center py-10 text-gray-600 text-xs font-bold uppercase tracking-widest">
                                    No transactions found
                                </div>
                            ) : transactions.map((tx: any) => {
                                const isSuccess = tx.status === 'succeeded'
                                const qtyMatch = tx.description?.match(/(\d+)/)
                                const qty = qtyMatch ? qtyMatch[1] : null
                                return (
                                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-gray-800/60 hover:border-gray-700 transition-all">
                                        {isSuccess
                                            ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                            : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                                        }
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{tx.description || 'Transaction'}</p>
                                            <p className="text-[10px] text-gray-600">
                                                {new Date(tx.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {qty && (
                                            <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">
                                                {qty} imgs
                                            </span>
                                        )}
                                        <div className="text-right shrink-0">
                                            <p className={`text-sm font-black ${isSuccess ? 'text-green-500' : 'text-gray-500'}`}>
                                                ${tx.amount?.toFixed(2) || '0.00'}
                                            </p>
                                            <p className={`text-[9px] uppercase font-bold ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                                                {tx.status}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
