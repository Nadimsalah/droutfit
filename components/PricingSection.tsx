"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle2, Sparkles, ArrowRight, Zap, CreditCard, Flame } from "lucide-react"
import { getPricing, PricingConfig, DEFAULT_PRICING } from "@/lib/pricing"

export default function PricingSection() {
    const [images, setImages] = useState(500)
    const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING)
    const [activeIndex, setActiveIndex] = useState(0)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const popularCardRef = useRef<HTMLDivElement>(null)

    const packages = [
        { id: 'package_1', amount: pricing.PACKAGE_1_AMOUNT, price: pricing.PACKAGE_1_PRICE, label: "Starter Pack", icon: <Zap className="h-6 w-6 text-blue-400" /> },
        { id: 'package_2', amount: pricing.PACKAGE_2_AMOUNT, price: pricing.PACKAGE_2_PRICE, label: "Growth", icon: <Flame className="h-6 w-6 text-orange-400" /> },
        { id: 'package_3', amount: pricing.PACKAGE_3_AMOUNT, price: pricing.PACKAGE_3_PRICE, label: "Pro Merchant", popular: true, icon: <Sparkles className="h-7 w-7 text-purple-400" /> },
        { id: 'package_4', amount: pricing.PACKAGE_4_AMOUNT, price: pricing.PACKAGE_4_PRICE, label: "Enterprise", icon: <CreditCard className="h-6 w-6 text-emerald-400" /> }
    ]

    useEffect(() => {
        getPricing().then(p => {
            setPricing(p)
            setImages(p.PACKAGE_3_AMOUNT)
        })
    }, [])

    // Track active dot on mobile scroll
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            const containerWidth = container.offsetWidth;
            const index = Math.round(scrollLeft / (containerWidth * 0.78));
            setActiveIndex(Math.max(0, Math.min(index, 3)));
        };
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const getImagesCost = (amount: number) => {
        if (amount === pricing.PACKAGE_1_AMOUNT) return pricing.PACKAGE_1_PRICE;
        if (amount === pricing.PACKAGE_2_AMOUNT) return pricing.PACKAGE_2_PRICE;
        if (amount === pricing.PACKAGE_3_AMOUNT) return pricing.PACKAGE_3_PRICE;
        if (amount === pricing.PACKAGE_4_AMOUNT) return pricing.PACKAGE_4_PRICE;
        return amount * pricing.CUSTOM_CREDIT_PRICE;
    }

    return (
        <section id="pricing" className="py-24 px-6 relative overflow-hidden bg-[#050608]">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 text-center">
                <header className="mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 uppercase tracking-widest">
                        Scale on Demand
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                        Choose your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Perfect Package</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                        Pay only for what you need. Real-time AI processing with no hidden fees or monthly lock-ins.
                    </p>
                </header>

                {/* Mobile scroll hint: drag arrows */}
                <div className="flex md:hidden items-center justify-center gap-2 mb-6 text-gray-500">
                    <span className="text-lg animate-bounce">←</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Swipe to explore plans</span>
                    <span className="text-lg animate-bounce">→</span>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8 mb-8 md:mb-16 overflow-x-auto pb-6 pt-10 snap-x snap-mandatory md:overflow-visible md:pb-0 no-scrollbar scroll-smooth -mx-4 px-[12%] md:mx-0 md:px-0"
                >
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            ref={pkg.popular ? popularCardRef : null}
                            className={`flex-shrink-0 w-[76vw] max-w-[320px] md:w-auto snap-center rounded-[32px] transition-all duration-500 ${pkg.popular
                                ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-[2px] scale-[1.03] md:scale-110 z-20 shadow-[0_40px_80px_-15px_rgba(59,130,246,0.4)]'
                                : 'bg-white/5 shadow-xl hover:bg-white/10 p-[1px] md:hover:scale-[1.02]'
                                }`}
                        >
                            <article className={`h-full rounded-[30px] p-8 flex flex-col items-center bg-[#0d1117]/95 backdrop-blur-sm transition-all duration-300 relative overflow-hidden`}>
                                {pkg.popular && (
                                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white tracking-widest uppercase border border-white/10 z-20">
                                        Best Value
                                    </div>
                                )}

                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 ${pkg.popular ? 'bg-blue-600/10' : 'bg-white/5'} border border-white/5 transition-transform duration-500`}>
                                    {pkg.icon}
                                </div>

                                <h3 className="text-lg font-bold text-gray-300 mb-2">{pkg.label}</h3>

                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-black text-white">{pkg.amount}</span>
                                    <span className="text-gray-500 font-bold text-xs tracking-tighter uppercase">Images</span>
                                </div>

                                <div className="space-y-4 mb-10 w-full text-left">
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span>Full API Access</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span>Instant Generation</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span>HD Quality Result</span>
                                    </div>
                                </div>

                                <div className="mt-auto w-full pt-8 border-t border-white/5">
                                    <div className="mb-6">
                                        <p className="text-3xl font-black text-white">
                                            ${pkg.price.toFixed(0)}
                                            <span className="text-xs font-bold text-gray-500 ml-1 tracking-tight">USD</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            window.location.href = '/dashboard';
                                        }}
                                        className={`w-full py-4 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 ${pkg.popular
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40'
                                            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        Select Package
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>

                {/* Mobile dot indicators */}
                <div className="flex md:hidden items-center justify-center gap-2 mb-8">
                    {packages.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                const container = scrollContainerRef.current;
                                if (container) {
                                    container.scrollTo({ left: i * container.offsetWidth * 0.78, behavior: 'smooth' });
                                }
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === i
                                    ? 'w-6 bg-blue-500'
                                    : 'w-1.5 bg-white/20'
                                }`}
                        />
                    ))}
                </div>

                <div className="max-w-xl mx-auto p-1 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent">
                    <p className="text-gray-500 text-sm font-bold flex items-center justify-center gap-6 py-4">
                        <span className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Secure Stripe Payment</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> No Monthly Fees</span>
                    </p>
                </div>
            </div>
        </section>
    )
}
