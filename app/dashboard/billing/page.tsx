"use client"

import { Check, CreditCard, Shield, Info, Sparkles, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Modal } from "@/components/Modal"
import { TopUpModal } from "@/components/TopUpModal"
import { getPricing, PricingConfig, DEFAULT_PRICING } from "@/lib/pricing"

export default function BillingPage() {
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
    const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING)

    useEffect(() => {
        getPricing().then(setPricing)
    }, [])

    return (
        <div className="space-y-8 pb-12 max-w-4xl mx-auto">
            <div className="text-center space-y-2 mb-12">
                <h1 className="text-4xl font-bold text-white tracking-tight">Billing & Subscription</h1>
                <p className="text-gray-400 text-sm font-medium">
                    Manage your access and view your billing history.
                </p>
            </div>

            {/* Main Subscription Card */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#0B0E14] border border-gray-800 rounded-2xl overflow-hidden p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                <Sparkles className="h-3 w-3" />
                                Lifetime Value
                            </div>
                            <h2 className="text-3xl font-black text-white">Merchant Access Plan</h2>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                                Get full access to the AI Try-On engine, merchant dashboard, and advanced analytics.
                                Unlock tiered credit pricing and priority support.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-green-500" />
                                    </div>
                                    Unlimited API Access
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-green-500" />
                                    </div>
                                    Merchant Dashboard
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-green-500" />
                                    </div>
                                    Tiered Credit Pricing
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-green-500" />
                                    </div>
                                    Priority Support
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-80 bg-[#13171F] p-8 rounded-2xl border border-gray-800 flex flex-col items-center text-center">
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-5xl font-black text-white">Pay as you go</span>
                            </div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-8">Purchase Credits Dynamically</p>

                            <button
                                onClick={() => setShowSubscriptionModal(true)}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex justify-center items-center gap-2"
                            >
                                <Sparkles className="h-5 w-5" />
                                Top Up Images
                            </button>

                            <div className="mt-6 flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                <Shield className="h-3 w-3" />
                                Secure with Whop
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Billing History */}
            <div className="pt-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    Billing History
                </h3>
                <div className="bg-[#13171F] rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#0B0E14] text-gray-400 uppercase text-xs font-bold border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-4">Invoice</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-gray-300">
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500 font-medium">
                                        Billing history is tracked directly in your Whop Portal.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <TopUpModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
            />
        </div >
    )
}
