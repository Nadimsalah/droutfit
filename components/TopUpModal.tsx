"use client"

import { useState, useEffect } from "react"
import { Box, Zap, Gem, Crown, Check, Info, Loader2, Sparkles, Shield, AlertCircle } from "lucide-react"
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
            try {
                const pricingData = await getPricing()
                setPricing(pricingData)
            } catch (error) {
                console.error("Failed to fetch pricing:", error)
                // We keep DEFAULT_PRICING from initial state
            } finally {
                setIsCheckingSubscription(false)
            }
        }
        if (isOpen) {
            init()
        }
    }, [isOpen])

    const packages = [
        { id: 'package_1', amount: Number(pricing.PACKAGE_1_AMOUNT), price: Number(pricing.PACKAGE_1_PRICE), label: "Starter Pack" },
        { id: 'package_2', amount: Number(pricing.PACKAGE_2_AMOUNT), price: Number(pricing.PACKAGE_2_PRICE), label: "Popular" },
        { id: 'package_3', amount: Number(pricing.PACKAGE_3_AMOUNT), price: Number(pricing.PACKAGE_3_PRICE), label: "Pro Value" },
        { id: 'package_4', amount: Number(pricing.PACKAGE_4_AMOUNT), price: Number(pricing.PACKAGE_4_PRICE), label: "Max Value" }
    ]

    const [isCustom, setIsCustom] = useState(false);
    // Determine selected package (if not custom)
    const activePackage = !isCustom ? packages.find(p => p.amount === Number(credits)) : null

    // Default to package 1 amount when pricing loads
    useEffect(() => {
        if (!isCheckingSubscription && credits === 0) {
            setCredits(Number(pricing.PACKAGE_1_AMOUNT) || 100)
        }
    }, [isCheckingSubscription, pricing])

    const creditsCost = activePackage
        ? activePackage.price
        : Number(credits) * (Number(pricing.CUSTOM_CREDIT_PRICE) || 0.035);

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
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col items-center mb-6 pt-2">
                <img src="https://dvbuiiaymvynzwecefup.supabase.co/storage/v1/object/public/listing-images/logo-black.png" alt="Droutfit" className="h-10 w-auto object-contain mb-4" />
                <h2 className="text-2xl font-black text-white tracking-tight text-center">Topup Pro Credits</h2>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Purchase AI Generation Credits</p>
            </div>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

                <div className="space-y-4">
                    <label className="text-sm font-black text-white/90 uppercase tracking-[0.2em] block ml-2">
                        Select a Package
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { ...packages[0], icon: <Box className="h-4 w-4" /> },
                            { ...packages[1], icon: <Zap className="h-4 w-4" /> },
                            { ...packages[2], icon: <Gem className="h-4 w-4" /> },
                            { ...packages[3], icon: <Crown className="h-4 w-4" /> }
                        ].map((pkg) => {
                            const isSelected = !isCustom && credits === pkg.amount;
                            return (
                                <button
                                    key={pkg.id}
                                    onClick={() => { setIsCustom(false); setCredits(pkg.amount) }}
                                    className={`relative p-5 rounded-3xl border transition-all duration-300 text-left group overflow-hidden ${isSelected
                                        ? 'bg-blue-500/10 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.3)] ring-1 ring-blue-500/50'
                                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.08] backdrop-blur-md'
                                        }`}
                                >
                                    {/* Glass Highlight */}
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                                    <div className="relative z-10">
                                        <div className={`mb-3 flex items-center gap-2 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`}>
                                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                                                {pkg.icon}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{pkg.label}</span>
                                            {pkg.amount === Number(pricing.PACKAGE_4_AMOUNT) && (
                                                <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse ml-auto" />
                                            )}
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-white tracking-tighter">
                                                {pkg.amount.toLocaleString()}
                                                <span className="text-xs font-medium text-gray-400 ml-1.5 uppercase tracking-tighter">Images</span>
                                            </span>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className={`text-sm font-black ${isSelected ? 'text-blue-400' : 'text-blue-500/80'}`}>
                                                    ${pkg.price.toFixed(2)}
                                                </span>
                                                {isSelected && <Check className="h-4 w-4 text-blue-400" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selection Glow */}
                                    {isSelected && (
                                        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setIsCustom(true)}
                        className={`w-full p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md ${isCustom
                            ? 'bg-blue-500/10 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.2)]'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.08]'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-sm font-black text-white uppercase tracking-widest">Custom Amount</span>
                            <span className="text-[10px] font-bold text-gray-500 px-2 py-0.5 rounded-full bg-white/5">
                                ${pricing.CUSTOM_CREDIT_PRICE}/img
                            </span>
                        </div>
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
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                {credits} {credits === 1 ? 'Image' : 'Images'} {activePackage?.label ? `(${activePackage.label})` : ''}
                            </span>
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
