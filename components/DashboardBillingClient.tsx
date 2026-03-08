"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Check, CreditCard, Shield, Info, Sparkles, Loader2, FileText } from "lucide-react"
import { TopUpModal } from "@/components/TopUpModal"
import { generateInvoicePDF } from "@/lib/invoice-generator"

export default function DashboardBillingClient({ dict, locale }: { dict: any, locale: string }) {
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
    const [transactions, setTransactions] = useState<any[]>([])
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [downloadingId, setDownloadingId] = useState<string | null>(null)

    const fetchTransactions = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: txData } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (txData) setTransactions(txData)

            const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, store_name')
                .eq('id', user.id)
                .single()

            if (profileData) setProfile(profileData)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchTransactions()
    }, [])

    const handleDownloadInvoice = async (tx: any) => {
        setDownloadingId(tx.id)
        try {
            await generateInvoicePDF({
                ...tx,
                user: {
                    full_name: profile?.full_name || dict.invoice.valuedMerchant,
                    store_name: profile?.store_name || dict.invoice.independentStore
                }
            }, dict.invoice)
        } catch (error) {
            console.error('Download failed', error)
            alert(dict.billingPage.downloadFailed)
        } finally {
            setDownloadingId(null)
        }
    }

    return (
        <div className="space-y-8 pb-12 max-w-4xl mx-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="text-center space-y-2 mb-12">
                <h1 className="text-4xl font-bold text-white tracking-tight">{dict.billingPage.title}</h1>
                <p className="text-gray-400 text-sm font-medium">
                    {dict.billingPage.description}
                </p>
            </div>

            <div className="relative group text-left">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#0B0E14] border border-gray-800 rounded-2xl overflow-hidden p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                <Sparkles className="h-3 w-3" />
                                {dict.billingPage.lifetimeValue}
                            </div>
                            <h2 className="text-3xl font-black text-white">{dict.billingPage.proMerchantPlan}</h2>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                                {dict.billingPage.proMerchantDesc}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-green-500" />
                                    </div>
                                    {dict.billingPage.unlimitedApi}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-green-500" />
                                    </div>
                                    {dict.billingPage.merchantDashboard}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-green-500" />
                                    </div>
                                    {dict.billingPage.tieredPricing}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-green-500" />
                                    </div>
                                    {dict.billingPage.prioritySupport}
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-80 bg-[#13171F] p-8 rounded-2xl border border-gray-800 flex flex-col items-center text-center">
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-5xl font-black text-white tracking-tighter">{dict.billingPage.topupImages}</span>
                            </div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-8">{dict.billingPage.purchasePro}</p>

                            <button
                                onClick={() => setShowSubscriptionModal(true)}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex justify-center items-center gap-2"
                            >
                                <Sparkles className="h-5 w-5" />
                                {dict.billingPage.topUpButton}
                            </button>

                            <div className="mt-6 flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                <Shield className="h-3 w-3" />
                                {dict.billingPage.secureWithWhop}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 text-left">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-500/10 rounded-xl flex items-center justify-center border border-gray-500/20 text-gray-400">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        {dict.billingPage.billingHistory}
                    </h3>
                </div>

                <div className="bg-[#13171F] rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#0B0E14] text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800 tracking-widest">
                                <tr>
                                    <th className="px-6 py-5">{dict.billingPage.table.description}</th>
                                    <th className="px-6 py-5">{dict.billingPage.table.status}</th>
                                    <th className="px-6 py-5 text-right">{dict.billingPage.table.amount}</th>
                                    <th className="px-6 py-5 text-right">{dict.billingPage.table.date}</th>
                                    <th className="px-6 py-5 text-center">{dict.billingPage.table.invoice}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-gray-300">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-gray-500 font-medium">
                                            {dict.billingPage.noHistory}
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5 font-semibold text-white">
                                                {tx.description || tx.type}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${tx.status === 'succeeded' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gray-500/10 text-gray-400'}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right font-mono font-bold">
                                                ${parseFloat(tx.amount).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-5 text-right text-gray-500 font-medium">
                                                {new Date(tx.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <button
                                                    onClick={() => handleDownloadInvoice(tx)}
                                                    disabled={downloadingId === tx.id}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-gray-800 text-gray-400 hover:text-white hover:bg-white/10 transition-all group-hover:border-blue-500/30 disabled:opacity-50"
                                                    title={dict.billingPage.downloadInvoice}
                                                >
                                                    {downloadingId === tx.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <FileText className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 items-start">
                    <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-200/70 font-medium leading-relaxed">
                        {dict.billingPage.invoiceNote}
                    </p>
                </div>
            </div>

            <TopUpModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                dict={dict}
                locale={locale}
            />
        </div>
    )
}
