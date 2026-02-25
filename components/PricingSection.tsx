"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Sparkles, BarChart3, ArrowRight, Zap } from "lucide-react"
import { getPricing, PricingConfig, DEFAULT_PRICING } from "@/lib/pricing"

export default function PricingSection() {
    const [images, setImages] = useState(500)
    const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING)

    const packages = [
        { id: 'package_1', amount: pricing.PACKAGE_1_AMOUNT, price: pricing.PACKAGE_1_PRICE, label: "Starter Pack" },
        { id: 'package_2', amount: pricing.PACKAGE_2_AMOUNT, price: pricing.PACKAGE_2_PRICE, label: "Popular" },
        { id: 'package_3', amount: pricing.PACKAGE_3_AMOUNT, price: pricing.PACKAGE_3_PRICE, label: "Pro Value" },
        { id: 'package_4', amount: pricing.PACKAGE_4_AMOUNT, price: pricing.PACKAGE_4_PRICE, label: "Max Value" }
    ]

    const [isCustom, setIsCustom] = useState(false)

    useEffect(() => {
        getPricing().then(p => {
            setPricing(p)
            if (images === DEFAULT_PRICING.PACKAGE_1_AMOUNT) {
                setImages(p.PACKAGE_1_AMOUNT)
            }
        })
    }, [])

    const getImagesCost = (amount: number) => {
        if (amount === pricing.PACKAGE_1_AMOUNT) return pricing.PACKAGE_1_PRICE;
        if (amount === pricing.PACKAGE_2_AMOUNT) return pricing.PACKAGE_2_PRICE;
        if (amount === pricing.PACKAGE_3_AMOUNT) return pricing.PACKAGE_3_PRICE;
        if (amount === pricing.PACKAGE_4_AMOUNT) return pricing.PACKAGE_4_PRICE;
        return amount * pricing.CUSTOM_CREDIT_PRICE;
    }

    const imagesCost = getImagesCost(images)
    const pricePerImage = imagesCost / (images || 1)
    const totalMonthly = imagesCost.toFixed(2)

    return (
        <section itemScope itemType="https://schema.org/Offer" id="pricing" className="py-24 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#0B0E14]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0B0E14] to-[#0B0E14]" />

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="text-center mb-16">
                    <h2 itemProp="name" className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                        Affordable <span className="text-blue-500">Virtual Try-On</span> Pricing
                    </h2>
                    <p itemProp="description" className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Transparent API pricing designed for e-commerce growth. Unlock AI fitting rooms for your store today.
                    </p>
                </header>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Access Plan Card */}
                    <article className="bg-[#13171F] border border-blue-500/30 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300 shadow-2xl shadow-blue-900/10">
                        <div className="absolute top-0 right-0 p-4 bg-blue-600 text-white text-xs font-bold rounded-bl-2xl uppercase tracking-wider">
                            Most Popular Plan
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300 overflow-hidden p-2">
                                <img src="https://dvbuiiaymvynzwecefup.supabase.co/storage/v1/object/public/listing-images/logo-black.png" alt="Droutfit" className="w-full h-auto object-contain" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Pro Merchant Access</h3>
                                <p className="text-blue-400 font-medium text-sm">Everything required for Shopify & Custom Builds</p>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-black text-white tracking-tighter">Topup Credits</span>
                        </div>

                        <ul className="space-y-4 mb-8" aria-label="Features included in Merchant Access Plan">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-gray-300">Unlimited integration of <strong className="text-white">AI Virtual Try-On Widget</strong></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-gray-300">Full <strong className="text-white">API Access</strong> for custom builds</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-gray-300">High-fidelity <strong className="text-white">body & garment tracking</strong></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-gray-300">Priority Tier-1 Support</span>
                            </li>
                        </ul>

                        <a href="https://whop.com/checkout/plan_Uj2OAoYrP2Odp" target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group-hover:scale-[1.02]">
                            Start 14-Day Free Trial
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </article>

                    {/* Packages Section */}
                    <aside className="bg-[#0B0E14] border border-gray-800 rounded-3xl p-8 relative flex flex-col min-h-full">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                        <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2 uppercase tracking-tight">
                            <Sparkles className="h-6 w-6 text-blue-500" />
                            Select a Package
                        </h3>
                        <p className="text-gray-400 text-sm mb-8">Choose one of our optimized credit bundles to power your AI fitting room.</p>

                        <div className="space-y-4 flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                {packages.map((pkg) => (
                                    <button
                                        key={pkg.id}
                                        onClick={() => { setIsCustom(false); setImages(pkg.amount) }}
                                        className={`p-4 rounded-2xl border text-left transition-all ${!isCustom && images === pkg.amount ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-[#13171F] border-gray-800 hover:border-gray-600'}`}
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
                                <span className="text-[10px] font-bold text-gray-500 block mt-0.5">(${pricing.CUSTOM_CREDIT_PRICE}/img)</span>
                            </button>

                            {isCustom && (
                                <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Custom Volume</label>
                                    <div className="flex items-center bg-[#13171F] border border-gray-800 rounded-2xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                                        <input
                                            type="number"
                                            value={images || ''}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                setImages(val === '' ? 0 : Math.max(0, parseInt(val)))
                                            }}
                                            className="w-full bg-transparent border-none text-white text-xl font-black p-4 focus:ring-0 outline-none"
                                            placeholder="0"
                                            min="0"
                                            step="100"
                                        />
                                        <div className="px-5 text-xs font-black text-gray-500 border-l border-gray-800 bg-white/5 h-full flex items-center py-4 uppercase tracking-tighter">
                                            Images
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-800 pt-6 mt-6">
                            <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/10">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Package Price</p>
                                    <p className="text-[10px] text-gray-600">One-time payment</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-white tracking-tighter">${totalMonthly}</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    )
}
