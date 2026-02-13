"use client"

import { Check, CreditCard, Shield, Info, Sparkles, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Modal } from "@/components/Modal"
import { getPricing, PricingConfig, DEFAULT_PRICING } from "@/lib/pricing"

export default function BillingPage() {
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING)

    useEffect(() => {
        getPricing().then(setPricing)
    }, [])

    const handleSubscribe = () => {
        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            setIsSubscribed(true)
            setShowSubscriptionModal(false)
            setIsLoading(false)
        }, 1500)
    }

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
                                <span className="text-5xl font-black text-white">${pricing.SUBSCRIPTION_FEE}</span>
                                <span className="text-gray-500 font-bold">/mo</span>
                            </div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-8">All Features Included</p>

                            {isSubscribed ? (
                                <div className="w-full py-4 px-6 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                                    <Check className="h-4 w-4" />
                                    Active Plan
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowSubscriptionModal(true)}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                >
                                    Subscribe Now
                                </button>
                            )}

                            <div className="mt-6 flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                <Shield className="h-3 w-3" />
                                Secure with Stripe
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
                                {isSubscribed ? (
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500 uppercase">INV-{Math.random().toString(36).substring(7)}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                                Paid
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-white">${pricing.SUBSCRIPTION_FEE.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-gray-500">{new Date().toLocaleDateString()}</td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center text-gray-500 font-medium">
                                            No billing history available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Subscription Modal */}
            <Modal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                title="Confirm Subscription"
            >
                <div className="space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl flex flex-col items-center text-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h4 className="font-black text-white text-xl">Merchant Access</h4>
                            <p className="text-gray-400 text-xs mt-1">Unlock all premium merchant features</p>
                        </div>
                    </div>

                    <div className="bg-[#0B0E14] rounded-2xl p-6 border border-gray-800 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-medium">Monthly Access Fee</span>
                            <span className="text-white font-black text-xl">${pricing.SUBSCRIPTION_FEE.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-white font-bold">Total Due Today</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Recurring Monthly</span>
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">${pricing.SUBSCRIPTION_FEE.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 group"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Subscribe & Pay ${pricing.SUBSCRIPTION_FEE.toFixed(2)}
                                <Check className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="flex flex-col items-center gap-2">
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Secure Checkout Powered by Stripe</p>
                        <p className="text-[9px] text-gray-700 max-w-xs text-center">
                            By clicking subscribe, you agree to our Terms of Service and authorize the monthly charge to your payment method.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
