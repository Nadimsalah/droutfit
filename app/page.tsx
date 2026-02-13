
import Navbar from "@/components/Navbar";
import PricingSection from "@/components/PricingSection";
import { ArrowRight, Zap, Shield, BarChart3, ChevronRight, CheckCircle2, Play, Smartphone, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0B0E14] text-white font-sans selection:bg-purple-500/30">
            <Navbar />

            {/* Hero Section ... stays same ... */}
            {/* ... */}
            <section className="relative pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                            Now available for Shopify & WooCommerce
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                            Bringing the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient-x">
                                Physical Dressing Room
                            </span> <br />
                            to Digital Stores.
                        </h1>

                        <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                            Empower your customers to try before they buy. Boost conversion rates by <span className="text-white font-bold">+35%</span> and drastically reduce returns with our high-fidelity AI try-on engine.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href="/dashboard" className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 group">
                                Start Free Trial
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 group backdrop-blur-sm">
                                <Play className="h-5 w-5 fill-current" />
                                Watch Demo
                            </button>
                        </div>

                        <div className="pt-8 flex items-center gap-8 text-sm text-gray-500 font-medium">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                No code required
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                14-day free trial
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Cancel anytime
                            </div>
                        </div>
                    </div>

                    {/* Right Visuals */}
                    <div className="relative h-[600px] w-full flex items-center justify-center">
                        {/* Rack Representation (Left visual in split) */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[280px] h-[400px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border border-white/10 shadow-2xl skew-y-3 transform -translate-x-12 z-10 flex flex-col items-center justify-center p-6 backdrop-blur-xl">
                            <div className="w-full h-full bg-black/40 rounded-2xl border border-white/5 p-4 flex flex-col items-center gap-4">
                                <div className="w-full h-2 bg-gray-700 rounded-full mb-4"></div>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-full h-16 bg-white/5 rounded-xl border border-white/5 flex items-center px-4 gap-3">
                                        <div className="h-10 w-10 bg-gray-700 rounded-md"></div>
                                        <div className="h-2 w-20 bg-gray-700 rounded-full"></div>
                                    </div>
                                ))}
                                <div className="mt-auto text-center">
                                    <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">Physical Inventory</p>
                                </div>
                            </div>
                        </div>

                        {/* Phone Representation (Right visual in split) */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[580px] bg-black rounded-[3rem] border-8 border-gray-800 shadow-[0_0_50px_-10px_rgba(124,58,237,0.3)] z-20 overflow-hidden relative">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-30"></div>

                            {/* Screen Content */}
                            <div className="w-full h-full bg-gray-900 relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 to-black/80 z-0"></div>

                                {/* Placeholder App UI */}
                                <div className="relative z-10 p-6 pt-12 text-white h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <ChevronRight className="rotate-180 text-gray-400" />
                                        <span className="font-bold text-sm">Product Details</span>
                                        <ShoppingBag className="h-5 w-5 text-gray-400" />
                                    </div>

                                    <div className="flex-1 rounded-2xl bg-gray-800/50 border border-white/10 mb-6 overflow-hidden relative group">
                                        {/* Mock Image */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                                            <span className="text-gray-400 text-xs uppercase tracking-widest">Virtual Model</span>
                                        </div>

                                        {/* Scanning Effect */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_20px_2px_rgba(168,85,247,0.8)] animate-[scan_3s_ease-in-out_infinite]"></div>

                                        <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between">
                                            <div className="text-xs font-medium">Generating Try-On...</div>
                                            <div className="h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </div>

                                    <button className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm mb-2">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Connection Line ... */}
                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-32 z-0 opacity-30 pointer-events-none" viewBox="0 0 400 100">
                            <path d="M 100,50 L 300,50" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" />
                            <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="transparent" />
                                    <stop offset="50%" stopColor="#A855F7" />
                                    <stop offset="100%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Floating Glass Card */}
                        <div className="absolute bottom-[15%] left-[-20%] md:left-[0%] bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-xl z-30 animate-[float_6s_ease-in-out_infinite]">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                    <BarChart3 className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Conversion Rate</p>
                                    <p className="text-2xl font-bold text-white">+35.4% <span className="text-xs font-normal text-green-400 ml-1">↑</span></p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Companies / Trusted By */}
            <section className="py-10 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-8">Trusted by 500+ innovative brands</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40">
                        {/* Simple text placeholders for logos to maintain minimalist feel */}
                        <span className="text-xl font-bold font-serif">VOGUE</span>
                        <span className="text-xl font-bold font-sans tracking-tighter">NIKE</span>
                        <span className="text-xl font-bold font-mono">ADIDAS</span>
                        <span className="text-xl font-bold italic">ZARA</span>
                        <span className="text-xl font-bold">H&M</span>
                    </div>
                </div>
            </section>

            {/* FeaturesGrid */}
            <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Supercharge Your Store</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">Our platform integrates seamlessly with your existing stack to provide next-gen experiences.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Zap className="h-6 w-6 text-yellow-400" />,
                            title: "Instant Results",
                            desc: "High-quality AI generation in under 3 seconds. Keep your buyers engaged without the wait.",
                            gradient: "from-yellow-400/20 to-orange-500/20"
                        },
                        {
                            icon: <Shield className="h-6 w-6 text-blue-400" />,
                            title: "Privacy First",
                            desc: "User photos are processed on edge servers and deleted instantly. GDPR & CCPA compliant.",
                            gradient: "from-blue-400/20 to-cyan-500/20"
                        },
                        {
                            icon: <BarChart3 className="h-6 w-6 text-purple-400" />,
                            title: "Deep Analytics",
                            desc: "Track every interaction. Understand which products perform best with virtual try-on.",
                            gradient: "from-purple-400/20 to-pink-500/20"
                        }
                    ].map((f, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.gradient} blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300 relative z-10">
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 relative z-10">{f.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-sm relative z-10">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <PricingSection />

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-pink-900/40 border border-white/10 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden backdrop-blur-sm">
                    {/* Abstract background elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-30">
                        <div className="absolute top-[-50%] left-[-20%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px]" />
                        <div className="absolute bottom-[-50%] right-[-20%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">
                            Ready to transform <br /> your customer experience?
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Join 500+ forward-thinking brands using Droutfit to bridge the gap between physical and digital retail.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                            <Link href="/dashboard" className="px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5">
                                Launch Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#05070a] pt-20 pb-10 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-6 w-6 bg-gradient-to-tr from-blue-600 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">D</div>
                            <span className="text-lg font-bold tracking-tight">Droutfit</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            The standard for AI virtual try-on. <br />
                            San Francisco, CA.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-600 text-sm">© 2026 Droutfit Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        {/* Social Icons Placeholder */}
                        <div className="h-5 w-5 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"></div>
                        <div className="h-5 w-5 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"></div>
                        <div className="h-5 w-5 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"></div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
