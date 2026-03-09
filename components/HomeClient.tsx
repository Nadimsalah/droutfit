"use client";

import { Suspense, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getPricing } from "@/lib/pricing";
import InteractiveTryOnSection from "@/components/InteractiveTryOnSection";
import PricingSection from "@/components/PricingSection";
import { ArrowRight, Zap, Shield, BarChart3, CheckCircle2, Play, Smartphone, ShoppingBag } from "lucide-react";
import Link from "next/link";
import SwipeableDemo from "@/components/SwipeableDemo";
import { useSearchParams } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

function HeroActions({ dict, locale }: { dict: any, locale: string }) {
    const searchParams = useSearchParams();
    const [isShopify, setIsShopify] = useState(false);
    const [shop, setShop] = useState("");

    useEffect(() => {
        const urlParams = new URL(window.location.href).searchParams;
        const shopParam = searchParams.get('shop') || urlParams.get('shop');
        const embedded = window.self !== window.top ||
            urlParams.get('embedded') === '1' ||
            (typeof window !== 'undefined' && window.name.includes('app-bridge'));
        const hasReferrer = typeof document !== 'undefined' && document.referrer.includes('myshopify.com');

        if (shopParam || embedded || hasReferrer) {
            setIsShopify(true);
            setShop(shopParam || "your-store");
        }
    }, [searchParams]);

    if (isShopify) {
        return (
            <div className="flex flex-col gap-6 items-center w-full max-w-lg mx-auto">
                <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    {dict.homepage.hero.shopifyIntegrated}
                </div>
                <Link
                    href={`/${locale}/dashboard/shopify/connect?shop=${shop}`}
                    className="w-full px-8 py-6 bg-blue-600 text-white rounded-full font-black text-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-4 group shadow-[0_0_50px_rgba(37,99,235,0.4)] animate-bounce"
                >
                    <ShoppingBag className="h-8 w-8" />
                    {dict.navbar.connectShopify}
                    <ArrowRight className={cn("h-6 w-6 transition-transform", locale === 'ar' ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1")} />
                </Link>
                <p className="text-blue-400 font-bold animate-pulse">
                    {dict.homepage.hero.shopifyStep1}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center items-center">
            <Link href={`/${locale}/dashboard`} className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all flex items-center justify-center gap-2 group shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                {dict.common.getStarted}
                <ArrowRight className={cn("h-5 w-5 transition-transform", locale === 'ar' ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1")} />
            </Link>
        </div>
    );
}

export default function HomeClient({ dict, locale }: { dict: any, locale: string }) {
    const [demoImage, setDemoImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getPricing();
            if (settings.LANDING_DEMO_IMAGE) {
                setDemoImage(settings.LANDING_DEMO_IMAGE);
            }
        };
        fetchSettings();
    }, []);
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "DrOutfit AI Virtual Try-On",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "description": dict.homepage.hero.description,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1240"
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0d14] text-white font-sans selection:bg-blue-500/30" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Suspense fallback={<div className="h-20 bg-[#0B0E14]" />}>
                <Navbar dict={dict} locale={locale} />
            </Suspense>

            {/* Clear & Direct Hero Section */}
            <section className="relative pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center text-center">
                <div className={cn(
                    "absolute top-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 -translate-y-1/2",
                    locale === 'ar' ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
                )} />
                <div className={cn(
                    "absolute bottom-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -z-10 translate-y-1/2",
                    locale === 'ar' ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
                )} />

                <div className="max-w-4xl mx-auto relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        {dict.homepage.hero.badge}
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                        {dict.homepage.hero.p1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                            {dict.homepage.hero.p2}
                        </span> <br />
                        {dict.homepage.hero.p3}
                    </h1>

                    <p className="text-xl text-gray-400 mx-auto max-w-2xl leading-relaxed">
                        {dict.homepage.hero.description}
                    </p>

                    <Suspense fallback={<div className="h-10 w-full" />}>
                        <HeroActions dict={dict} locale={locale} />
                    </Suspense>
                </div>

                {/* Video Demo Frame */}
                <div className="max-w-5xl w-full mx-auto relative z-10 mt-20 px-4">
                    <div className="relative w-full aspect-video rounded-3xl md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-[#0B0E14] group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none z-10"></div>
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent z-10 opacity-50"></div>

                        <iframe
                            className="w-full h-full relative z-0"
                            src="https://www.youtube.com/embed/rp6U-FWZLIE?autoplay=0&controls=1&rel=0&modestbranding=1"
                            title="Virtual Try-On Platform Demo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </section>

            <SwipeableDemo dict={dict} />

            {/* Features SEO Section */}
            <section id="features" className="py-24 px-6 max-w-7xl mx-auto flex flex-col items-center relative z-10">
                <header className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 mb-6 uppercase tracking-widest">
                        {dict.homepage.features.badge}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white">
                        {dict.homepage.features.title1} <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            {dict.homepage.features.title2}
                        </span>
                    </h2>
                    <p className="text-gray-400 mx-auto max-w-2xl text-lg leading-relaxed">
                        {dict.homepage.features.description}
                    </p>
                </header>

                <div className="grid md:grid-cols-3 gap-8 w-full mb-16">
                    {[
                        {
                            icon: <Zap className="h-6 w-6 text-yellow-400" />,
                            title: dict.homepage.hero.instantProcessing,
                            desc: dict.homepage.hero.instantDesc,
                            gradient: "from-yellow-400/20 to-orange-500/20"
                        },
                        {
                            icon: <Shield className="h-6 w-6 text-blue-400" />,
                            title: dict.homepage.hero.privacyFirst,
                            desc: dict.homepage.hero.privacyDesc,
                            gradient: "from-blue-400/20 to-cyan-500/20"
                        },
                        {
                            icon: <BarChart3 className="h-6 w-6 text-purple-400" />,
                            title: dict.homepage.hero.engagementBoost,
                            desc: dict.homepage.hero.engagementDesc,
                            gradient: "from-purple-400/20 to-pink-500/20"
                        }
                    ].map((f, i) => (
                        <article key={i} className="p-8 rounded-3xl bg-[#131720] border border-white/5 hover:border-white/10 hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden shadow-xl text-start">
                            <div className={cn(
                                "absolute top-0 w-32 h-32 bg-gradient-to-br blur-[60px] rounded-full opacity-10 group-hover:opacity-100 transition-opacity duration-500",
                                f.gradient,
                                locale === 'ar' ? "left-0" : "right-0"
                            )} />
                            <div className="h-14 w-14 rounded-2xl bg-[#1A1F2B] border border-white/5 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-inner">
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 relative z-10 text-white">{f.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-sm relative z-10">{f.desc}</p>
                        </article>
                    ))}
                </div>

                <div className="text-center w-full flex flex-col items-center justify-center">
                    <p className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">{dict.homepage.features.subtitle}</p>
                    <button className="px-10 py-5 bg-white text-black rounded-full font-black text-lg transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] flex items-center justify-center gap-3 hover:scale-105 hover:bg-gray-100">
                        <Play className="h-5 w-5 fill-current" />
                        {dict.footer.demo}
                    </button>
                </div>
            </section>

            <InteractiveTryOnSection dict={dict} locale={locale} demoImage={demoImage} />

            {/* Integrations Section */}
            <section id="shopify" className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                            Integrate with Your <span className="text-blue-400">Fav Platform</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Choose your store platform and get started in minutes. DrOutfit works seamlessly with the world's leading e-commerce engines.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Shopify Card */}
                        <div className="bg-gradient-to-br from-[#131720] to-[#0B0E14] border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group shadow-2xl hover:border-blue-500/30 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/10 transition-colors" />

                            <div className="space-y-6">
                                <div className="inline-flex items-center bg-white/5 border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-md">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Shopify_Logo.png"
                                        alt="Shopify"
                                        className="h-10 w-auto object-contain"
                                        style={{ filter: "invert(1) hue-rotate(180deg) brightness(2)" }}
                                    />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-white">Shopify Merchant?</h3>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    Connect DrOutfit to your store in just a few clicks. It's easy, fast, and built to scale with your brand.
                                </p>
                            </div>

                            <Link
                                href={`/${locale}/dashboard`}
                                className="mt-10 inline-flex items-center justify-center gap-3 px-8 py-5 bg-white text-black rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl shadow-white/5 group"
                            >
                                Start Shopify Integration
                                <ArrowRight className={cn("h-5 w-5 transition-transform group-hover:translate-x-1", locale === 'ar' && "rotate-180")} />
                            </Link>
                        </div>

                        {/* WordPress Card */}
                        <div className="bg-gradient-to-br from-[#131720] to-[#0B0E14] border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group shadow-2xl hover:border-blue-500/30 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />

                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-md">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/9/93/Wordpress_Blue_logo.png"
                                        alt="WordPress"
                                        className="h-8 w-auto object-contain"
                                    />
                                    <span className="text-xl font-black text-white">WordPress</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-white">WooCommerce Ready</h3>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    Using WordPress? Download our dedicated, ultra-stable plugin for WooCommerce and go live instantly.
                                </p>
                            </div>

                            <a
                                href="/plugins/dr-ai-v8-4-1-signup.zip"
                                className="mt-10 inline-flex items-center justify-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-full font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 group"
                                download
                            >
                                <Smartphone className="h-5 w-5" />
                                Download Plugin
                            </a>
                        </div>
                    </div>

                    {/* Centered Signup Button */}
                    <div className="flex flex-col items-center pt-8">
                        <Link
                            href={`/${locale}/signup`}
                            className="px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full font-black text-xl transition-all shadow-2xl shadow-blue-500/20 hover:scale-105 flex items-center gap-3 group"
                        >
                            Sign up Free
                            <ArrowRight className={cn("h-5 w-5 transition-transform", locale === 'ar' ? "rotate-180" : "group-hover:translate-x-1")} />
                        </Link>
                        <p className="mt-4 text-gray-500 text-sm font-black uppercase tracking-widest">
                            No credit card required
                        </p>
                    </div>
                </div>
            </section>
            <PricingSection dict={dict} locale={locale} />


            <div className="bg-[#050608] pb-12 flex flex-col items-center justify-center gap-12 px-6">
                <div className="max-w-4xl mx-auto w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="text-center space-y-6">
                    <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        {dict.footer.readyToRevolutionize}
                    </h3>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
                        {dict.footer.joinNextGen}
                    </p>
                </div>

                <Link
                    href={`/${locale}/dashboard`}
                    className="group px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full font-black text-xl transition-all shadow-xl shadow-blue-500/20 hover:scale-105 flex items-center gap-3"
                >
                    {dict.footer.startFree}
                    <ArrowRight className={cn("h-5 w-5 transition-transform", locale === 'ar' ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1")} />
                </Link>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#050608] pt-20 pb-10 px-6">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-12 mb-16">
                    <div className="space-y-6 max-w-sm">
                        <Link href={`/${locale}`} className="flex items-center gap-2 group">
                            <img src="/logo.png" alt="Droutfit" className="h-10 w-auto object-contain" />
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            {dict.homepage.seo.enterpriseDesc}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 w-full lg:w-auto">
                        <nav aria-label="Product Navigation">
                            <h4 className="font-bold text-white mb-6">{dict.footer.product}</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><Link href={`/${locale}#features`} className="hover:text-white transition-colors">{dict.footer.features}</Link></li>
                                <li><Link href={`/${locale}#demo`} className="hover:text-white transition-colors">{dict.footer.demo}</Link></li>
                            </ul>
                        </nav>
                        <nav aria-label="Portal Navigation">
                            <h4 className="font-bold text-white mb-6">{dict.footer.portal}</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><Link href={`/${locale}/dashboard`} className="hover:text-white transition-colors">{dict.common.dashboard}</Link></li>
                                <li><Link href={`/${locale}/login`} className="hover:text-white transition-colors">{dict.common.signIn}</Link></li>
                                <li><Link href={`/${locale}/signup`} className="hover:text-white transition-colors">{dict.footer.createAccount}</Link></li>
                            </ul>
                        </nav>
                        <nav aria-label="Legal Navigation">
                            <h4 className="font-bold text-white mb-6">{dict.footer.legal}</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">{dict.footer.privacy}</Link></li>
                                <li><Link href={`/${locale}/terms`} className="hover:text-white transition-colors">{dict.footer.terms}</Link></li>
                                <li><Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{dict.footer.contact}</Link></li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-gray-600 text-[10px] font-black uppercase tracking-widest gap-6">
                    <p>© {new Date().getFullYear()} Droutfit. {dict.common.allRightsReserved}</p>
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                        <div className="flex items-center gap-4 text-gray-400">
                            {dict.footer.securedBy}
                        </div>
                        <LanguageSwitcher dict={dict} />
                    </div>
                </div>
            </footer>
        </div>
    );
}
