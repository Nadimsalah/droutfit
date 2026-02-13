"use client"

import { useState, useEffect } from "react"
import { Check, Sparkles, ChevronRight, Calculator, Zap, CheckCircle2, ArrowRight, BarChart3 } from "lucide-react"
import { getPricing, PricingConfig, DEFAULT_PRICING } from "@/lib/pricing"

export default function PricingSection() {
    const [images, setImages] = useState(500)
    const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING)

    useEffect(() => {
        getPricing().then(setPricing)
    }, [])

    const getPricePerImage = (amount: number) => {
        if (amount >= 1000) return pricing.CREDIT_PRICE_TIER_3
        if (amount >= 500) return pricing.CREDIT_PRICE_TIER_2
        return pricing.CREDIT_PRICE_TIER_1
    }

    const pricePerImage = getPricePerImage(images)
    const imagesCost = images * pricePerImage
    const subscriptionFee = pricing.SUBSCRIPTION_FEE
    const totalMonthly = (imagesCost + subscriptionFee).toFixed(2)

    return (
        <section id="pricing" className="py-24 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#0B0E14]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0B0E14] to-[#0B0E14]" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                        Simple, Transparent <span className="text-blue-500">Pricing</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Start with our accessible Merchant Plan and scale your AI generation as you grow. No hidden fees.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Access Plan Card */}
                    <div className="bg-[#13171F] border border-blue-500/30 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300 shadow-2xl shadow-blue-900/10">
                        <div className="absolute top-0 right-0 p-4 bg-blue-600 text-white text-xs font-bold rounded-bl-2xl uppercase tracking-wider">
                            Most Popular
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                                <Zap className="h-8 w-8 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Merchant Access Plan</h3>
                                <p className="text-blue-400 font-medium text-sm">Everything you need to start</p>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-black text-white tracking-tighter">${pricing.SUBSCRIPTION_FEE.toFixed(2)}</span>
                            <span className="text-gray-500 font-medium">/month</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-gray-300">Full access to <span className="text-white font-bold">Virtual Dressing Room</span></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-gray-300">Unlimited <span className="text-white font-bold">Try-On Sessions</span></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-gray-300">Access to <span className="text-white font-bold">Volume Discounts</span></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-gray-300">Priority Support & API Access</span>
                            </li>
                        </ul>

                        <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group-hover:scale-[1.02]">
                            Get Started Now
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Calculator Section */}
                    <div className="bg-[#0B0E14] border border-gray-800 rounded-3xl p-8 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-purple-500" />
                            Estimate Your Costs
                        </h3>
                        <p className="text-gray-400 text-sm mb-8">Calculate your total monthly investment based on image usage.</p>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-4">
                                    <span className="text-gray-300">I need</span>
                                    <span className="text-white bg-white/10 px-3 py-1 rounded-lg">{images} images / mo</span>
                                </div>
                                <input
                                    type="range"
                                    min="100"
                                    max="5000"
                                    step="100"
                                    value={images}
                                    onChange={(e) => setImages(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                                    <span>100</span>
                                    <span>5000+</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#13171F] p-4 rounded-xl border border-gray-800">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Price per Image</p>
                                    <p className="text-2xl font-black text-white">${pricePerImage.toFixed(2)}</p>
                                    <div className="mt-2 text-[10px] font-bold text-green-500 flex items-center gap-1">
                                        {images >= 1000 ? (
                                            <>
                                                <Sparkles className="h-3 w-3" /> Max Savings (-50%)
                                            </>
                                        ) : images >= 500 ? (
                                            <>
                                                <Sparkles className="h-3 w-3" /> Gold Savings (-25%)
                                            </>
                                        ) : (
                                            <span className="text-gray-500">Standard Rate</span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-[#13171F] p-4 rounded-xl border border-gray-800">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Image Cost</p>
                                    <p className="text-2xl font-black text-white">${imagesCost.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-800 pt-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400 text-sm">Access Plan</span>
                                    <span className="text-white font-mono">${pricing.SUBSCRIPTION_FEE.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-400 text-sm">Image Credits ({images})</span>
                                    <span className="text-white font-mono">${imagesCost.toFixed(2)}</span>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/10">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Monthly Investment</p>
                                        <p className="text-[10px] text-gray-600">Billed monthly + usage</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-white tracking-tighter">${totalMonthly}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
