"use client"

import { motion } from "framer-motion"
import { ShoppingCart, TrendingUp, Sparkles, ArrowDownCircle, Clock, Share2, Zap } from "lucide-react"

const stats = [
    {
        value: "81",
        unit: "%",
        label: "Add to Cart Lift",
        icon: <ShoppingCart className="h-6 w-6 text-blue-400" />,
        color: "blue",
        size: "large"
    },
    {
        value: "67",
        unit: "%",
        label: "",
        icon: <TrendingUp className="h-5 w-5 text-purple-400" />,
        color: "purple",
        size: "small"
    },
    {
        value: "20",
        unit: "%",
        label: "",
        icon: <Zap className="h-5 w-5 text-orange-400" />,
        color: "orange",
        size: "small"
    },
    {
        value: "25",
        unit: "%",
        label: "Returns Avoided",
        icon: <ArrowDownCircle className="h-6 w-6 text-green-400" />,
        color: "green",
        size: "medium"
    },
    {
        value: "61",
        unit: "s",
        label: "Avg. Engagement",
        icon: <Clock className="h-6 w-6 text-rose-400" />,
        color: "rose",
        size: "medium"
    },
    {
        value: "2.2",
        unit: "x",
        label: "Brand Sharing",
        icon: <Share2 className="h-5 w-5 text-cyan-400" />,
        color: "cyan",
        size: "wide"
    }
]

export default function StatsSection() {
    return (
        <section className="py-24 px-6 relative overflow-hidden bg-[#050608]">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-20 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 uppercase tracking-widest">
                        <Sparkles className="h-3 w-3" /> Real-time Impact
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
                        Bye-bye buyer's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">remorse.</span>
                    </h2>
                </header>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[160px] md:auto-rows-[200px]">
                    {/* Stat 1: Large - Left Span */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="col-span-2 row-span-2 bg-[#131720]/80 border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] group-hover:opacity-30 transition-opacity" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                    {stats[0].icon}
                                </div>
                                <div className="px-3 py-1 bg-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase">Live Metrics</div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-7xl md:text-9xl font-black text-white tracking-tighter tabular-nums">81</span>
                                    <span className="text-3xl md:text-4xl font-black text-blue-500">%</span>
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm md:text-base">Lift in Add To Cart</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stat 2: Small */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="col-span-1 row-span-1 bg-[#131720]/80 border border-white/5 rounded-[32px] p-6 relative overflow-hidden group shadow-xl"
                    >
                        <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="p-2.5 w-fit rounded-xl bg-purple-500/10 border border-purple-500/20">
                                {stats[1].icon}
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white tracking-tighter">67</span>
                                <span className="text-lg font-black text-purple-500">%</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stat 3: Small */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="col-span-1 row-span-1 bg-[#131720]/80 border border-white/5 rounded-[32px] p-6 relative overflow-hidden group shadow-xl"
                    >
                        <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="p-2.5 w-fit rounded-xl bg-orange-500/10 border border-orange-500/20">
                                {stats[2].icon}
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white tracking-tighter">20</span>
                                <span className="text-lg font-black text-orange-400">%</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stat 4: Medium Vertical */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="col-span-2 row-span-1 md:col-span-1 md:row-span-2 bg-[#131720]/80 border border-white/5 rounded-[32px] p-8 relative overflow-hidden group shadow-xl"
                    >
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px]" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="p-3 w-fit rounded-2xl bg-green-500/10 border border-green-500/20">
                                {stats[3].icon}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white tracking-tighter">25</span>
                                    <span className="text-xl font-black text-green-500">%</span>
                                </div>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none">Reduced Returns</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stat 5: Medium Vertical */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="col-span-2 row-span-1 md:col-span-1 md:row-span-2 bg-[#131720]/80 border border-white/5 rounded-[32px] p-8 relative overflow-hidden group shadow-xl"
                    >
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/10 blur-[50px]" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="p-3 w-fit rounded-2xl bg-rose-500/10 border border-rose-500/20">
                                {stats[4].icon}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white tracking-tighter">61</span>
                                    <span className="text-xl font-black text-rose-500">s</span>
                                </div>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none">Time Engagement</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stat 6: Wide Bottom */}
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="col-span-2 row-span-1 md:col-span-2 md:row-span-1 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/5 rounded-[32px] p-8 flex items-center justify-between group shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent)]" />
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                                {stats[5].icon}
                            </div>
                            <div>
                                <h4 className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Viral Growth</h4>
                                <p className="text-white text-sm font-bold opacity-60">Lift In Brand Sharing</p>
                            </div>
                        </div>
                        <div className="relative z-10 flex items-baseline gap-1">
                            <span className="text-5xl font-black text-white">2.2</span>
                            <span className="text-xl font-black text-cyan-400">x</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
