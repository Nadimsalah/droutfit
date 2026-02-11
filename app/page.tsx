
import Navbar from "@/components/Navbar";
import { ArrowRight, Zap, Shield, BarChart3, Rocket, Sparkles, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-20 px-6 bg-yellow-400 border-b-4 border-black overflow-hidden">
                {/* Abstract Shapes */}
                <div className="absolute top-10 right-10 w-32 h-32 border-4 border-black rotate-12 opacity-20"></div>
                <div className="absolute bottom-10 left-10 w-48 h-48 border-4 border-black -rotate-6 rounded-full opacity-20"></div>

                <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-10 relative z-10">
                    <div className="inline-block border-2 border-black bg-white px-4 py-1 text-sm font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_black] rotate-2">
                        The Future of E-commerce
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none max-w-5xl">
                        Increase Your Sales with <span className="bg-pink-400 px-4">AI Try-On</span>
                    </h1>

                    <p className="text-xl md:text-2xl font-bold text-black border-l-8 border-black pl-6 max-w-3xl">
                        Let your customers visualize products instantly. Boost conversion rates by 40% and reduce returns with Dr Outfit's seamless VTO engine.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 pt-4">
                        <Link href="/dashboard" className="border-4 border-black bg-black text-white px-10 py-5 text-xl font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_#ff90e8] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#ff90e8] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all flex items-center gap-3">
                            Get Started for Free <ArrowRight />
                        </Link>
                        <Link href="#how-it-works" className="border-4 border-black bg-white text-black px-10 py-5 text-xl font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_black] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all">
                            See How it Works
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-black uppercase italic tracking-tight">Supercharge Your Store</h2>
                    <div className="h-2 w-24 bg-pink-400 mx-auto mt-4 border-2 border-black"></div>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {[
                        {
                            icon: <Zap className="h-10 w-10" />,
                            title: "Instant Results",
                            desc: "High-quality AI generation in seconds, not minutes. Keep your buyers engaged.",
                            color: "bg-blue-300"
                        },
                        {
                            icon: <Shield className="h-10 w-10" />,
                            title: "Privacy First",
                            desc: "User photos are processed securely and never shared. Trusted by global brands.",
                            color: "bg-green-300"
                        },
                        {
                            icon: <BarChart3 className="h-10 w-10" />,
                            title: "Sales Analytics",
                            desc: "Track every try-on and conversion. Data-driven insights to grow your business.",
                            color: "bg-purple-300"
                        }
                    ].map((f, i) => (
                        <div key={i} className={`border-4 border-black ${f.color} p-8 shadow-[8px_8px_0px_0px_black] group hover:-translate-y-2 transition-transform`}>
                            <div className="bg-white border-2 border-black w-16 h-16 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_black] group-hover:rotate-12 transition-transform">
                                {f.icon}
                            </div>
                            <h3 className="text-2xl font-black uppercase mb-4">{f.title}</h3>
                            <p className="font-bold text-black/80">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="bg-pink-100 py-24 px-6 border-y-4 border-black">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-5xl font-black uppercase italic tracking-tight leading-none">
                                3 Steps to <br />
                                Revolutionize <br />
                                <span className="text-pink-600 underline">Shopping</span>
                            </h2>

                            <div className="space-y-6">
                                {[
                                    { step: "01", title: "Upload Garment", desc: "Just drop your product image into the dashboard." },
                                    { step: "02", title: "Embed Widget", desc: "Copy one line of code to your product page." },
                                    { step: "03", title: "Scale Up", desc: "Watch your conversion rates skyrocket immediately." }
                                ].map((s, i) => (
                                    <div key={i} className="flex gap-6 items-start">
                                        <span className="text-4xl font-black text-white bg-black px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_#ff90e8]">{s.step}</span>
                                        <div>
                                            <h4 className="text-xl font-black uppercase">{s.title}</h4>
                                            <p className="font-bold text-gray-700">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            <div className="border-4 border-black bg-white p-4 shadow-[12px_12px_0px_0px_black] rotate-2">
                                <img
                                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                    alt="Dashboard Preview"
                                    className="w-full border-2 border-black"
                                />
                                <div className="absolute -bottom-10 -right-10 bg-yellow-400 border-2 border-black p-4 shadow-[4px_4px_0px_0px_black] font-black uppercase text-sm animate-bounce">
                                    Live Preview ✨
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-4xl mx-auto border-4 border-black bg-blue-400 p-16 shadow-[16px_16px_0px_0px_black] space-y-8 relative overflow-hidden">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-white border-4 border-black rounded-full rotate-45 opacity-20"></div>

                    <h2 className="text-5xl font-black uppercase italic tracking-tight relative z-10">
                        Ready to grow <br /> your brand?
                    </h2>
                    <p className="text-xl font-bold bg-white/50 backdrop-blur-sm p-4 border-2 border-black relative z-10">
                        Join 500+ e-commerce stores using Dr Outfit to provide immersive shopping experiences.
                    </p>
                    <div className="pt-4 relative z-10">
                        <Link href="/dashboard" className="inline-block border-4 border-black bg-white px-12 py-5 text-2xl font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_black] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all">
                            Launch Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black py-16 px-6 text-white border-t-4 border-black">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-10 w-auto invert brightness-0" />
                        <span className="text-3xl font-black uppercase italic tracking-tighter">Dr Outfit</span>
                    </div>
                    <div className="flex gap-10 font-bold uppercase text-gray-400">
                        <Link href="#" className="hover:text-white transition-colors underline decoration-pink-400 decoration-4">Terms</Link>
                        <Link href="#" className="hover:text-white transition-colors underline decoration-yellow-400 decoration-4">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors underline decoration-blue-400 decoration-4">Contact</Link>
                    </div>
                    <p className="font-bold text-gray-500">
                        © 2026 Dr Outfit. Built for the bold.
                    </p>
                </div>
            </footer>
        </div>
    );
}
