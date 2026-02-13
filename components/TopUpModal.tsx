"use client"

import { useState, useEffect } from "react"
import { Check, Info, Loader2, Sparkles, Shield, AlertCircle } from "lucide-react"
import { Modal } from "@/components/Modal"
import { supabase } from "@/lib/supabase"
import { getPricing, PricingConfig, DEFAULT_PRICING } from "@/lib/pricing"

interface TopUpModalProps {
    isOpen: boolean
    onClose: () => void
}

export function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
    const [credits, setCredits] = useState(0)
    const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingSubscription, setIsCheckingSubscription] = useState(true)

    // Check subscription status & pricing on mount
    useEffect(() => {
        const init = async () => {
            const [pricingData, { data: { user } }] = await Promise.all([
                getPricing(),
                supabase.auth.getUser()
            ])

            setPricing(pricingData)

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_subscribed')
                    .eq('id', user.id)
                    .single()
                setIsSubscribed(profile?.is_subscribed || false)
            }
            setIsCheckingSubscription(false)
        }
        if (isOpen) {
            init()
        }
    }, [isOpen])

    const getPricePerCredit = (amount: number) => {
        if (amount >= 1000) return pricing.CREDIT_PRICE_TIER_3
        if (amount >= 500) return pricing.CREDIT_PRICE_TIER_2
        return pricing.CREDIT_PRICE_TIER_1
    }

    const pricePerCredit = getPricePerCredit(credits)
    const creditsCost = credits * pricePerCredit
    const subscriptionFee = isSubscribed ? 0 : pricing.SUBSCRIPTION_FEE
    const totalCost = (creditsCost + subscriptionFee).toFixed(2)

    const handleCheckout = async () => {
        setIsLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user found")

            // Simulate Payment Success & Update DB
            // In a real app, this would happen via Stripe Webhook
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    is_subscribed: true,
                    credits: (credits + 500) // Mock existing + new (in reality you'd fetch current first)
                })
                .eq('id', user.id)

            if (profileError) throw profileError

            // Mock success
            setTimeout(() => {
                setIsLoading(false)
                onClose()
                window.location.reload() // Refresh to show new credits/status
            }, 1000)

        } catch (error) {
            console.error("Checkout failed", error)
            alert("Payment failed. Please try again.")
            setIsLoading(false)
        }
    }

    if (isCheckingSubscription) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Loading...">
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </Modal>
        )
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Generation Power-Up">
            <div className="space-y-6">
                {/* Subscription Notice for non-subscribers */}
                {!isSubscribed ? (
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-4">
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-white text-sm">Merchant Plan Required</h4>
                            <p className="text-gray-400 text-xs mt-1">
                                To acquire images, you'll be subscribed to the <span className="text-blue-500 font-bold">${pricing.SUBSCRIPTION_FEE.toFixed(2)}/mo Access Plan</span> automatically.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-start gap-4">
                        <Check className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-green-500 text-sm">Active Merchant Plan</h4>
                            <p className="text-gray-400 text-xs mt-1">
                                Your ${pricing.SUBSCRIPTION_FEE.toFixed(2)}/mo subscription is active. You are eligible for pro pricing and volume discounts.
                            </p>
                        </div>
                    </div>
                )}

                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block ml-1">How many Generated AI image u wanna buy?</label>
                    <div className="flex items-center bg-[#0B0E14] border border-gray-800 rounded-2xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                        <input
                            type="number"
                            value={credits}
                            onChange={(e) => setCredits(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-transparent border-none text-white text-2xl font-black p-5 focus:ring-0 outline-none"
                            placeholder="0"
                            min="0"
                            step="100"
                        />
                        <div className="px-6 text-xs font-black text-gray-500 border-l border-gray-800 bg-white/5 h-full flex items-center py-5 uppercase tracking-tighter">
                            Images
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                            <Sparkles className="h-3 w-3 text-yellow-500" />
                            {credits >= 1000 ? "Max generation discount reached" : credits >= 500 ? "Gold Tier: 25% OFF" : "Min 100 images for Basic Tier"}
                        </div>
                        <div className="text-[10px] font-bold text-blue-500">
                            ${pricePerCredit.toFixed(2)}/img
                        </div>
                    </div>
                </div>

                <div className="bg-[#13171F] rounded-2xl p-6 border border-gray-800/50 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">{credits} AI Images Cost</span>
                        <span className="text-white font-medium">${creditsCost.toFixed(2)}</span>
                    </div>

                    {!isSubscribed ? (
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex flex-col">
                                <span className="text-blue-400 font-bold">Subscription Monthly Fee</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Required once</span>
                            </div>
                            <span className="text-blue-400 font-bold">+${pricing.SUBSCRIPTION_FEE.toFixed(2)}</span>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center text-sm border-t border-gray-800/30 pt-4">
                            <div className="flex flex-col">
                                <span className="text-green-500 font-bold">Monthly Plan Status</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active & Paid</span>
                            </div>
                            <span className="text-green-500 font-bold">$0.00</span>
                        </div>
                    )}

                    <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Total Payment</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Stripe Secure</span>
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter">${totalCost}</span>
                    </div>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={isLoading || credits < 100}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 group"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            Checkout Now
                            <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        </>
                    )}
                </button>

                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                        <span>PCI Compliant</span>
                        <span className="h-1 w-1 bg-gray-800 rounded-full" />
                        <span>SSL Encrypted</span>
                    </div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-crosshair" />
                </div>
            </div>
        </Modal>
    )
}
