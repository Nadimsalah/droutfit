"use client"

import { useState, useEffect } from "react"
import { Box, Zap, Gem, Crown, Check, Info, Loader2, Sparkles, Shield, AlertCircle } from "lucide-react"
import { Modal } from "@/components/Modal"
import { supabase } from "@/lib/supabase"
import { getPricing, PricingConfig, DEFAULT_PRICING } from "@/lib/pricing"

interface TopUpModalProps {
    isOpen: boolean
    onClose: () => void
    dict: any
    locale: string
}

export function TopUpModal({ isOpen, onClose, dict, locale }: TopUpModalProps) {
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
            } finally {
                setIsCheckingSubscription(false)
            }
        }
        if (isOpen) {
            init()
        }
    }, [isOpen])

    const packages = [
        { id: 'package_1', amount: Number(pricing.PACKAGE_1_AMOUNT), price: Number(pricing.PACKAGE_1_PRICE), label: dict.topUpModal.starterPack },
        { id: 'package_2', amount: Number(pricing.PACKAGE_2_AMOUNT), price: Number(pricing.PACKAGE_2_PRICE), label: dict.topUpModal.growthPack },
        { id: 'package_3', amount: Number(pricing.PACKAGE_3_AMOUNT), price: Number(pricing.PACKAGE_3_PRICE), label: dict.topUpModal.eliteValue }
    ]

    const [isCustom, setIsCustom] = useState(false);
    const activePackage = !isCustom ? packages.find(p => p.amount === Number(credits)) : null

    useEffect(() => {
        if (!isCheckingSubscription && credits === 0) {
            setCredits(Number(pricing.PACKAGE_1_AMOUNT) || 100)
        }
    }, [isCheckingSubscription, pricing])

    const creditsCost = activePackage
        ? activePackage.price
        : Number(credits) * (Number(pricing.CUSTOM_CREDIT_PRICE) || 0.035);

    const totalCost = creditsCost.toFixed(2)

    const handleCheckout = async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user found")

            const response = await fetch('/api/whop/checkout-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credits, user_id: user.id })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to create checkout")
            window.location.href = data.url
        } catch (error) {
            console.error("Checkout failed", error)
            alert(`${dict.topUpModal.paymentFailed}: ` + (error instanceof Error ? error.message : dict.topUpModal.tryAgain))
            setIsLoading(false)
        }
    }

    if (isCheckingSubscription) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={dict.common.loading}>
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </Modal>
        )
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={dict.topUpModal.title}>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <div className="space-y-4">
                    <label className="text-sm font-black text-white/90 uppercase tracking-[0.2em] block ml-2">
                        {dict.topUpModal.selectPackage}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { ...packages[0], icon: <Box className="h-4 w-4" /> },
                            { ...packages[1], icon: <Zap className="h-4 w-4" /> },
                            { ...packages[2], icon: <Gem className="h-4 w-4" /> }
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
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                                    <div className="relative z-10">
                                        <div className={`mb-3 flex items-center gap-2 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`}>
                                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                                                {pkg.icon}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{pkg.label}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-white tracking-tighter">
                                                {pkg.amount.toLocaleString(locale)}
                                                <span className="text-xs font-medium text-gray-400 ml-1.5 uppercase tracking-tighter">{dict.topUpModal.images}</span>
                                            </span>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className={`text-sm font-black ${isSelected ? 'text-blue-400' : 'text-blue-500/80'}`}>
                                                    ${pkg.price.toFixed(2)}
                                                </span>
                                                {isSelected && <Check className="h-4 w-4 text-blue-400" />}
                                            </div>
                                        </div>
                                    </div>
                                    {isSelected && <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full" />}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => { setIsCustom(true); if (credits < 50000) setCredits(50000); }}
                        className={`w-full p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md ${isCustom
                            ? 'bg-blue-500/10 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.2)]'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.08]'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-sm font-black text-white uppercase tracking-widest">{dict.topUpModal.bigVolume}</span>
                            <span className="text-[10px] font-bold text-gray-500 px-2 py-0.5 rounded-full bg-white/5">
                                ${pricing.CUSTOM_CREDIT_PRICE}/{dict.topUpModal.perImg}
                            </span>
                        </div>
                    </button>
                </div>

                {isCustom && (
                    <div className="animate-in fade-in slide-in-from-top-2 space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1">{dict.topUpModal.volumeSelection}</label>
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-md">
                                    {credits.toLocaleString(locale)} {dict.topUpModal.images}
                                </span>
                            </div>
                            <div className="relative h-12 flex items-center px-2 bg-white/5 rounded-2xl border border-white/10">
                                <input
                                    type="range"
                                    min="50000"
                                    max="1000000"
                                    step="10000"
                                    value={Math.max(50000, Math.min(1000000, credits))}
                                    onChange={(e) => setCredits(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                                />
                            </div>
                        </div>
                        {credits < (Number(pricing.MINIMUM_CUSTOM_AMOUNT) || 1) && (
                            <p className="mt-2 text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {dict.topUpModal.minimumOrder}: {pricing.MINIMUM_CUSTOM_AMOUNT} {dict.topUpModal.images}
                            </p>
                        )}
                    </div>
                )}

                <div className="bg-[#13171F] rounded-2xl p-6 border border-gray-800/50 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">{credits.toLocaleString(locale)} {dict.topUpModal.aiImagesCost}</span>
                        <span className="text-white font-medium">${creditsCost.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-white font-bold">{dict.topUpModal.totalPayment}</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                {credits.toLocaleString(locale)} {dict.topUpModal.images} {activePackage?.label ? `(${activePackage.label})` : ''}
                            </span>
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter">${totalCost}</span>
                    </div>
                    {credits > 80000 && (
                        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                {dict.topUpModal.enterpriseNote}
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => {
                        if (credits > 80000) {
                            window.location.href = `/${locale}/contact?type=sales`;
                        } else {
                            handleCheckout();
                        }
                    }}
                    disabled={isLoading || (isCustom && credits < (Number(pricing.MINIMUM_CUSTOM_AMOUNT) || 1))}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 group"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : credits > 80000 ? (
                        dict.topUpModal.contactSales
                    ) : (
                        <>
                            {dict.topUpModal.checkoutNow}
                            <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </Modal>
    )
}
