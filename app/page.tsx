import Navbar from "@/components/Navbar";
import InteractiveTryOnSection from "@/components/InteractiveTryOnSection";
import { ArrowRight, Zap, Shield, BarChart3, CheckCircle2, Play, Smartphone, ShoppingBag } from "lucide-react";
import Link from "next/link";
import ContactPopup from "@/components/ContactPopup";

export default function Home() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "DrOutfit",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "The leading AI Virtual Try-On widget for Shopify and e-commerce stores. Reduce returns and boost conversion.",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "120"
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0d14] text-white font-sans selection:bg-blue-500/30">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />

            {/* Clear & Direct Hero Section */}
            <section className="relative pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
                    <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-4xl mx-auto relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-blue-300 shadow-xl shadow-blue-900/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        The AI Virtual Fitting Room API
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                        Let your customers <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                            Try Before They Buy
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 mx-auto max-w-2xl leading-relaxed">
                        DrOutfit is the most advanced, realistic Virtual Try-On solution for your web store. Reduce returns by 40% and skyrocket engagement.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center items-center">
                        <Link href="/dashboard" className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all flex items-center justify-center gap-2 group shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                            Start in Minutes
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Video Demo Frame */}
                <div className="max-w-5xl w-full mx-auto relative z-10 mt-20 px-4">
                    <div className="relative w-full aspect-video rounded-3xl md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-[#0B0E14] group">
                        {/* Modern decorative elements */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none z-10"></div>
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent z-10 opacity-50"></div>

                        {/* YouTube Embed */}
                        <iframe
                            className="w-full h-full relative z-0"
                            src="https://www.youtube.com/embed/rp6U-FWZLIE?autoplay=0&controls=1&rel=0&modestbranding=1"
                            title="Virtual Try-On Platform Demo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>

                    {/* Glowing shadow effect under the video */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[60%] h-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-[80px] pointer-events-none -z-10"></div>
                </div>
            </section>

            {/* Features SEO Section */}
            <section id="features" className="py-24 px-6 max-w-7xl mx-auto flex flex-col items-center relative z-10">
                <header className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 mb-6 uppercase tracking-widest">
                        Why Choose Droutfit
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white">
                        Built for Scale. <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            Powered by AI.
                        </span>
                    </h2>
                    <p className="text-gray-400 mx-auto max-w-2xl text-lg leading-relaxed">
                        Our state-of-the-art vision models process thousands of garments per minute, providing hyper-realistic results that outclass traditional mannequins and simple overlays.
                    </p>
                </header>

                <div className="grid md:grid-cols-3 gap-8 w-full mb-16">
                    {[
                        {
                            icon: <Zap className="h-6 w-6 text-yellow-400" />,
                            title: "Instant Processing",
                            desc: "High-quality AI try-on rendering in under 3 seconds. Minimize store latency while users view clothes.",
                            gradient: "from-yellow-400/20 to-orange-500/20"
                        },
                        {
                            icon: <Shield className="h-6 w-6 text-blue-400" />,
                            title: "Privacy First",
                            desc: "Models are strictly isolated. We adhere to GDPR, CCPA & global privacy rules, sweeping edge caches instantly.",
                            gradient: "from-blue-400/20 to-cyan-500/20"
                        },
                        {
                            icon: <BarChart3 className="h-6 w-6 text-purple-400" />,
                            title: "Engagement Boost",
                            desc: "Radically lower your store's bounce rate. Shoppers spend 3x more time interacting with AI fitting rooms.",
                            gradient: "from-purple-400/20 to-pink-500/20"
                        }
                    ].map((f, i) => (
                        <article key={i} className="p-8 rounded-3xl bg-[#131720] border border-white/5 hover:border-white/10 hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden shadow-xl">
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.gradient} blur-[60px] rounded-full opacity-10 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className="h-14 w-14 rounded-2xl bg-[#1A1F2B] border border-white/5 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-inner">
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 relative z-10 text-white">{f.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-sm relative z-10">{f.desc}</p>
                        </article>
                    ))}
                </div>

                <div className="text-center w-full flex flex-col items-center justify-center">
                    <p className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">Stop guessing. Start seeing.</p>
                    <a href="#demo" className="px-10 py-5 bg-white text-black rounded-full font-black text-lg transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] flex items-center justify-center gap-3 hover:scale-105 hover:bg-gray-100">
                        <Play className="h-5 w-5 fill-current" />
                        Try Our AI Now
                    </a>
                </div>
            </section>

            {/* Interactive Try-On Demonstration Area */}
            <InteractiveTryOnSection />

            {/* CTA */}
            <section className="py-24 px-6 overflow-hidden">
                <div className="max-w-5xl mx-auto border border-blue-500/20 rounded-[3rem] p-12 md:p-24 text-center relative bg-gradient-to-tr from-[#131720] to-[#0a0d14]">
                    <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]"></div>
                    <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]"></div>

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                            Elevate your store today.
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Don't let returns eat away at your margins. Equip your brand with tomorrow's AI tools.
                        </p>
                        <div className="flex justify-center pt-8">
                            <Link href="/dashboard" className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full font-bold text-xl transition-all shadow-xl shadow-blue-500/20 scale-100 hover:scale-105">
                                Start Free Integration
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#050608] pt-20 pb-10 px-6 mt-12">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-12 mb-16">
                    <div className="space-y-6 max-w-sm">
                        <Link href="/" className="flex items-center gap-2 group">
                            <img src="/logo.png" alt="Droutfit" className="h-10 w-auto object-contain" />
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            The enterprise standard for API-driven virtual try-on. Increase conversions and reduce returns with realistic AI.
                        </p>

                        <div className="pt-2 flex flex-col gap-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Supported Payments</span>
                            <div className="flex gap-3 items-center">
                                {/* Visa */}
                                <div className="flex bg-white/5 rounded-lg border border-white/10 px-3 py-1.5 items-center justify-center">
                                    <span className="font-black italic text-white text-sm tracking-wider">VISA</span>
                                </div>
                                {/* Mastercard */}
                                <div className="flex bg-white/5 rounded-lg border border-white/10 px-3 py-1.5 items-center justify-center">
                                    <div className="flex -space-x-2 mr-1">
                                        <div className="w-3 h-3 rounded-full bg-red-500 mix-blend-screen opacity-80"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500 mix-blend-screen opacity-80"></div>
                                    </div>
                                    <span className="font-bold text-white text-xs tracking-wider">mastercard</span>
                                </div>
                                {/* AMEX / General */}
                                <div className="flex bg-white/5 rounded-lg border border-white/10 px-3 py-1.5 items-center justify-center">
                                    <span className="font-bold text-white text-xs tracking-wider">AMEX</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 w-full lg:w-auto">
                        <nav aria-label="Product Navigation">
                            <h4 className="font-bold text-white mb-6">Product</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link href="#demo" className="hover:text-white transition-colors">Live Demo</Link></li>
                            </ul>
                        </nav>

                        <nav aria-label="Portal Navigation">
                            <h4 className="font-bold text-white mb-6">Portal</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                                <li><Link href="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
                            </ul>
                        </nav>

                        <nav aria-label="Legal Navigation">
                            <h4 className="font-bold text-white mb-6">Legal</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><ContactPopup /></li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-gray-600 text-xs font-bold">
                    <p>© {new Date().getFullYear()} Droutfit. All rights reserved.</p>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        Secured by Stripe & Whop Payments
                    </div>
                </div>
            </footer>
        </div>
    );
}
