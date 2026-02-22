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
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingSubscription, setIsCheckingSubscription] = useState(true)

    // Fetch pricing on mount
    useEffect(() => {
        const init = async () => {
            const pricingData = await getPricing()
            setPricing(pricingData)
            setIsCheckingSubscription(false)
        }
        if (isOpen) {
            init()
        }
    }, [isOpen])

    const packages = [
        { id: 'package_1', amount: pricing.PACKAGE_1_AMOUNT, price: pricing.PACKAGE_1_PRICE, label: "Starter Pack" },
        { id: 'package_2', amount: pricing.PACKAGE_2_AMOUNT, price: pricing.PACKAGE_2_PRICE, label: "Popular" },
        { id: 'package_3', amount: pricing.PACKAGE_3_AMOUNT, price: pricing.PACKAGE_3_PRICE, label: "Pro Value" },
        { id: 'package_4', amount: pricing.PACKAGE_4_AMOUNT, price: pricing.PACKAGE_4_PRICE, label: "Max Value" }
    ]

    const [isCustom, setIsCustom] = useState(false)

    // Default to package 1 amount when pricing loads
    useEffect(() => {
        if (!isCheckingSubscription && credits === 0) {
            setCredits(pricing.PACKAGE_1_AMOUNT)
        }
    }, [isCheckingSubscription, pricing])

    let creditsCost = 0;
    if (credits === pricing.PACKAGE_1_AMOUNT) creditsCost = pricing.PACKAGE_1_PRICE;
    else if (credits === pricing.PACKAGE_2_AMOUNT) creditsCost = pricing.PACKAGE_2_PRICE;
    else if (credits === pricing.PACKAGE_3_AMOUNT) creditsCost = pricing.PACKAGE_3_PRICE;
    else if (credits === pricing.PACKAGE_4_AMOUNT) creditsCost = pricing.PACKAGE_4_PRICE;
    else creditsCost = credits * pricing.CUSTOM_CREDIT_PRICE;

    const processingFee = credits > 0 ? (creditsCost * 0.027) + 0.30 : 0;
    const totalCost = (creditsCost + processingFee).toFixed(2)

    const handleCheckout = async () => {
        setIsLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user found")

            // Create Whop Checkout link via our API
            const response = await fetch('/api/whop/checkout-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credits, user_id: user.id })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to create checkout")
            }

            // Redirect user to Whop checkout URL
            window.location.href = data.url

        } catch (error) {
            console.error("Checkout failed", error)
            alert("Payment failed: " + (error instanceof Error ? error.message : "Please try again."))
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
        <Modal isOpen={isOpen} onClose={onClose} title="Topup Pro Generation Credits">
            <div className="space-y-6">

                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1">Select a Package</label>
                    <div className="grid grid-cols-2 gap-3">
                        {packages.map((pkg) => (
                            <button
                                key={pkg.id}
                                onClick={() => { setIsCustom(false); setCredits(pkg.amount) }}
                                className={`p-4 rounded-2xl border text-left transition-all ${!isCustom && credits === pkg.amount ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-[#13171F] border-gray-800 hover:border-gray-600'}`}
                            >
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    {pkg.amount === pricing.PACKAGE_4_AMOUNT && <Sparkles className="h-3 w-3 text-yellow-500" />}
                                    {pkg.label}
                                </div>
                                <div className="text-xl font-black text-white">{pkg.amount} <span className="text-sm font-medium text-gray-400">images</span></div>
                                <div className="text-sm font-bold text-blue-400 mt-2">${pkg.price.toFixed(2)}</div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsCustom(true)}
                        className={`w-full p-4 rounded-xl border text-center transition-all ${isCustom ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-[#13171F] border-gray-800 hover:border-gray-600'}`}
                    >
                        <span className="text-sm font-bold text-white">Custom Amount</span>
                        <span className="text-[10px] font-bold text-gray-500 block">(${pricing.CUSTOM_CREDIT_PRICE}/img)</span>
                    </button>
                </div>

                {isCustom && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block ml-1">Custom Amount</label>
                        <div className="flex items-center bg-[#0B0E14] border border-gray-800 rounded-2xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                            <input
                                type="number"
                                value={credits || ''}
                                onChange={(e) => {
                                    const val = e.target.value
                                    setCredits(val === '' ? 0 : Math.max(0, parseInt(val)))
                                }}
                                className="w-full bg-transparent border-none text-white text-2xl font-black p-5 focus:ring-0 outline-none"
                                placeholder="0"
                                min="0"
                                step="100"
                            />
                            <div className="px-6 text-xs font-black text-gray-500 border-l border-gray-800 bg-white/5 h-full flex items-center py-5 uppercase tracking-tighter">
                                Images
                            </div>
                        </div>
                    </div>
                )}


                <div className="bg-[#13171F] rounded-2xl p-6 border border-gray-800/50 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">{credits} AI Images Cost</span>
                        <span className="text-white font-medium">${creditsCost.toFixed(2)}</span>
                    </div>

                    {credits > 0 && (
                        <div className="flex justify-between items-center text-sm border-t border-gray-800/30 pt-4">
                            <div className="flex flex-col">
                                <span className="text-gray-400 font-medium">Processing Fee</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">2.7% + 30¢</span>
                            </div>
                            <span className="text-white font-medium">${processingFee.toFixed(2)}</span>
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
