"use client";

import { useEffect, useState } from "react";
import {
    Puzzle,
    Download,
    ExternalLink,
    CheckCircle2,
    Code,
    BookOpen,
    ArrowRight,
    Loader2,
    Copy,
    Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function IntegrationsClient({ dict, locale }: { dict: any, locale: string }) {
    const [pluginUrl, setPluginUrl] = useState<string>('https://mega.nz/file/J35jkIba#lW90_cAOTcDMbNWa_mCk2C-ZWoazwgAU7qipStL4PDc');
    const [merchantId, setMerchantId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setMerchantId(user.id);
            }

            const { data: settings } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'WP_PLUGIN_ZIP_URL')
                .single();

            if (settings?.value) {
                setPluginUrl(settings.value);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(merchantId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className={`space-y-1 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        {dict.integrationsPage?.title || 'Integrations'}
                    </h1>
                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                </div>
                <p className="text-gray-400 text-sm font-medium">
                    {dict.integrationsPage?.subtitle}
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* WordPress / WooCommerce Integration */}
                <div className="bg-[#13171F] border border-gray-800/40 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />

                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Wordpress_Blue_logo.png" className="h-8 w-8 object-contain" alt="WordPress" />
                            </div>
                            <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
                                <h2 className="text-2xl font-bold text-white">{dict.integrationsPage?.wpTitle}</h2>
                                <p className="text-blue-400 text-[10px] font-bold tracking-widest uppercase">{dict.integrationsPage?.wpVersion}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className={`p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                            <div className="flex items-center gap-2 text-white font-bold">
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                {dict.integrationsPage?.quickGuide}
                            </div>
                            <ul className="space-y-3">
                                {[
                                    dict.integrationsPage?.step1,
                                    dict.integrationsPage?.step2,
                                    dict.integrationsPage?.step3,
                                    dict.integrationsPage?.step4
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-gray-400 leading-relaxed">
                                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold border border-blue-500/30">
                                            {i + 1}
                                        </span>
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link
                                href={pluginUrl}
                                target="_blank"
                                className="flex items-center justify-center gap-3 py-4 px-6 bg-white text-black rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5"
                            >
                                <Download className="h-5 w-5" />
                                {dict.integrationsPage?.downloadPlugin}
                            </Link>
                            <div className="flex flex-col justify-center px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{dict.integrationsPage?.merchantIdLabel}</span>
                                <div className="flex items-center justify-between gap-2 overflow-hidden">
                                    <span className="text-white font-mono text-[10px] truncate bg-black/40 px-2 py-1 rounded border border-white/5">{merchantId}</span>
                                    <button
                                        onClick={copyToClipboard}
                                        className="text-white/40 hover:text-white transition-colors flex-shrink-0"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shopify Integration */}
                <div className="bg-[#13171F] border border-gray-800/40 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#95BF47]/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-[#95BF47]/10 transition-colors" />

                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-[#95BF47]/10 flex items-center justify-center border border-[#95BF47]/20 shadow-inner">
                                <img src="https://cdn.worldvectorlogo.com/logos/shopify.svg" className="h-8 w-8 object-contain" alt="Shopify" />
                            </div>
                            <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
                                <h2 className="text-2xl font-bold text-white">{dict.integrationsPage?.shopifyTitle}</h2>
                                <p className="text-[#95BF47] text-[10px] font-bold tracking-widest uppercase">{dict.integrationsPage?.shopifyStatus}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 h-full flex flex-col">
                        <div className={`p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4 flex-1 flex flex-col justify-between ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                {dict.integrationsPage?.shopifyDesc}
                            </p>
                            <div className="flex items-center gap-4 py-3 px-4 bg-[#95BF47]/5 rounded-xl border border-[#95BF47]/10 w-fit">
                                <CheckCircle2 className="h-4 w-4 text-[#95BF47]" />
                                <span className="text-[10px] text-[#95BF47] font-bold">{dict.integrationsPage?.shopifyFeature}</span>
                            </div>
                        </div>

                        <Link
                            href={`/${locale}/dashboard/shopify/connect`}
                            className="flex items-center justify-center gap-3 py-4 px-6 bg-[#95BF47] hover:bg-[#a6d15b] text-white rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#95BF47]/10 group mt-auto"
                        >
                            {dict.integrationsPage?.connectShopify}
                            <ArrowRight className={`h-5 w-5 group-hover:${locale === 'ar' ? '-translate-x-1' : 'translate-x-1'} transition-transform`} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Documentation Link Card */}
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-2xl flex-shrink-0">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
                        <h3 className="text-xl font-bold text-white">{dict.integrationsPage?.docsTitle}</h3>
                        <p className="text-gray-400 text-sm">{dict.integrationsPage?.docsDesc}</p>
                    </div>
                </div>
                <Link
                    href={`/${locale}/dashboard/docs`}
                    className="flex items-center gap-2 text-white font-black hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px] whitespace-nowrap"
                >
                    {dict.integrationsPage?.viewDocs}
                    <ExternalLink className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
