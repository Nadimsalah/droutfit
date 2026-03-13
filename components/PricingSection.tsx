"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { CheckCircle2, Sparkles, ArrowRight, Zap, CreditCard, Flame, ShieldCheck, Star, MousePointer2 } from "lucide-react"
import Link from "next/link"
import { getPricing, PricingConfig, DEFAULT_PRICING } from "@/lib/pricing"
import { animate } from "framer-motion"

const formatNumber = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const CountUp = ({ to }: { to: number }) => {
    const [count, setCount] = useState(0)
    const nodeRef = useRef(null)

    useEffect(() => {
        const controls = animate(0, to, {
            duration: 2,
            ease: "easeOut",
            onUpdate: (value) => setCount(Math.floor(value))
        })
        return () => controls.stop()
    }, [to])

    return <>{formatNumber(count)}</>
}

// --- Custom Components for "Cool" UI ---

const MagicCard = ({ children, popular = false }: { children: React.ReactNode, popular?: boolean }) => {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    return (
        <div
            onMouseMove={handleMouseMove}
            className={`group relative rounded-[2rem] p-[1px] transition-all duration-500 overflow-hidden ${popular
                ? 'bg-gradient-to-b from-blue-500/40 via-purple-500/40 to-pink-500/40'
                : 'bg-white/10 hover:bg-white/20'
                }`}
        >
            {/* Interactive Glow Overlay */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.2), transparent 80%)`
                    ),
                }}
            />

            {/* Beam Border Effect for Popular */}
            {popular && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[2rem]">
                    <div className="absolute top-0 left-0 w-[200%] h-[200%] -translate-x-[50%] -translate-y-[50%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,#3b82f6_360deg)] opacity-40" />
                </div>
            )}

            <div className="relative h-full rounded-[1.95rem] bg-[#050608] backdrop-blur-3xl">
                {children}
            </div>
        </div>
    )
}

export default function PricingSection({ dict, locale }: { dict: any, locale: string }) {
    const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING)
    const [mounted, setMounted] = useState(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const packages = [
        {
            id: 'package_0',
            amount: pricing.FREE_AMOUNT || 100,
            price: 0,
            label: dict.pricingSection.packages.free,
            desc: dict.pricingSection.packages.freeDesc,
            icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
            color: "green"
        },
        {
            id: 'package_1',
            amount: pricing.PACKAGE_1_AMOUNT,
            price: pricing.PACKAGE_1_PRICE,
            label: dict.pricingSection.packages.starter,
            desc: dict.pricingSection.packages.starterDesc,
            icon: <Zap className="h-5 w-5 text-blue-400" />,
            color: "blue"
        },
        {
            id: 'package_2',
            amount: pricing.PACKAGE_2_AMOUNT,
            price: pricing.PACKAGE_2_PRICE,
            label: dict.pricingSection.packages.growth,
            desc: dict.pricingSection.packages.growthDesc,
            popular: true,
            icon: <Flame className="h-5 w-5 text-orange-400" />,
            color: "orange"
        },
        {
            id: 'package_3',
            amount: pricing.PACKAGE_3_AMOUNT,
            price: pricing.PACKAGE_3_PRICE,
            label: dict.pricingSection.packages.elite,
            desc: dict.pricingSection.packages.eliteDesc,
            icon: <Sparkles className="h-6 w-6 text-purple-400" />,
            color: "purple"
        }
    ]

    useEffect(() => {
        setMounted(true)
        getPricing().then(p => {
            setPricing(p)
        }).catch(err => {
            if (err.name !== 'AbortError') {
                console.error("Pricing fetch failed:", err)
            }
        })
    }, [])

    return (
        <section id="pricing" className="py-20 px-6 relative overflow-hidden bg-[#020305] min-h-[80vh] flex flex-col justify-center">
            {/* Cyberpunk Grid/Mesh Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse delay-1000" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.15)] mx-auto relative">
                        {dict.pricingSection.badge}
                    </div>

                    <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                        {dict.pricingSection.title1} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 italic drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">{dict.pricingSection.title2}</span>
                    </h2>
                </motion.div>

                <div
                    ref={scrollContainerRef}
                    className="flex lg:grid lg:grid-cols-4 gap-4 md:gap-5 overflow-x-auto pb-10 pt-4 snap-x snap-mandatory no-scrollbar -mx-6 px-6 md:mx-0 md:px-0"
                >
                    {packages.map((pkg, idx) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                            className="flex-shrink-0 w-[82vw] md:w-auto snap-center"
                        >
                            <MagicCard popular={pkg.popular}>
                                <article className="h-full rounded-[1.95rem] p-7 md:p-8 flex flex-col relative z-20">
                                    {/* Glass Reflections */}
                                    <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

                                    <div className="flex justify-between items-start mb-6">
                                        <motion.div
                                            animate={{ y: [0, -4, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-400"
                                        >
                                            {pkg.icon}
                                        </motion.div>
                                        {pkg.popular && (
                                            <span className="px-3 py-1 rounded-full bg-blue-600 text-[9px] font-black text-white uppercase tracking-widest italic shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                                                {dict.pricingSection.bestValue}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 mb-8 text-left">
                                        <h3 className="text-xl font-black text-white tracking-tight uppercase italic">{pkg.label}</h3>
                                        <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-none">{pkg.desc}</p>
                                    </div>

                                    <div className="flex flex-col mb-6 text-left">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-5xl font-black text-white tracking-tighter transition-all group-hover:text-blue-400">${pkg.price}</span>
                                            <span className="text-gray-600 font-bold text-[9px] uppercase tracking-[0.2em] leading-none">{dict.pricingSection.fixed}</span>
                                        </div>
                                    </div>

                                    {/* Big Try-on Highlights */}
                                    <div className="flex-grow flex flex-col justify-center items-center py-12">
                                        <div className="text-center">
                                            <span className="text-6xl font-black text-white tracking-tighter block leading-none">
                                                {mounted ? <CountUp to={pkg.amount} /> : formatNumber(pkg.amount)}
                                            </span>
                                            <span className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mt-4 block italic">
                                                {dict.pricingSection.tryons}
                                            </span>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => window.location.href = `/${locale}/dashboard`}
                                        className={`w-full py-4.5 rounded-[1.3rem] font-black text-[10px] transition-all flex items-center justify-center gap-2 relative overflow-hidden group/btn shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] ${pkg.popular
                                            ? 'bg-white text-black hover:bg-gray-100'
                                            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        <span className="relative z-10 uppercase tracking-[0.3em]">{dict.pricingSection.igniteSales}</span>
                                        <ArrowRight className="h-3.5 w-3.5 relative z-10 transition-transform group-hover/btn:translate-x-1.5" />

                                        {/* Luxury Shine Effect */}
                                        <div className="absolute top-0 -left-[100%] w-[100%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:left-[100%] transition-all duration-1000 pointer-events-none" />
                                    </motion.button>
                                </article>
                            </MagicCard>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        {dict.pricingSection.needVolume} <Link href={`/${locale}/contact`} className="text-blue-500 hover:underline">{dict.pricingSection.contactSales}</Link>
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-12 p-8 rounded-[2rem] bg-[#0A0D14] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden"
                >
                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <img
                                    key={i}
                                    src={`https://i.pravatar.cc/100?u=m${i}`}
                                    className="h-9 w-9 rounded-full border-3 border-[#0A0D14] bg-gray-900 object-cover"
                                    alt="merchant"
                                />
                            ))}
                        </div>
                        <div className="text-left">
                            <p className="text-white font-black text-xs uppercase italic tracking-widest leading-none">{dict.pricingSection.dominating}</p>
                            <div className="flex gap-0.5 mt-1.5">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-blue-500 text-blue-500" />)}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-10 gap-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{dict.pricingSection.whopManaged}</span>
                        </div>
                        <div className="h-6 w-[1px] bg-white/10 hidden lg:block" />
                        <div className="flex items-center gap-2">
                            <MousePointer2 className="h-4 w-4 text-blue-400" />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{dict.pricingSection.instantSetup}</span>
                        </div>
                        <div className="h-6 w-[1px] bg-white/10 hidden lg:block" />
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{dict.pricingSection.guarantee}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
