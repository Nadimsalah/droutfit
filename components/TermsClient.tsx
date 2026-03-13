"use client";

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function TermsClient({ dict, locale }: { dict: any, locale: string }) {
    const lastUpdated = new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="min-h-screen bg-[#0a0d14] text-gray-300 font-sans selection:bg-blue-500/30" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <Suspense fallback={<div className="h-20 bg-[#0B0E14]" />}>
                <Navbar dict={dict} locale={locale} />
            </Suspense>

            <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
                <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className={`h-4 w-4 transition-transform ${locale === 'ar' ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                    {dict.termsPage.backHome}
                </Link>

                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">{dict.termsPage.title}</h1>
                <p className="text-gray-400 mb-12">{dict.termsPage.lastUpdated}: {lastUpdated}</p>

                <div className="prose prose-invert prose-blue max-w-none space-y-12">
                    <section>
                        <p className="text-lg leading-relaxed text-gray-300">
                            {dict.termsPage.intro}
                        </p>
                    </section>

                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <section key={num} className="border-l-2 border-purple-500/20 pl-6 hover:border-purple-500/50 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                {dict.termsPage.sections[`s${num}`]}
                            </h2>
                            <p className="leading-relaxed text-gray-400">
                                {dict.termsPage.sections[`s${num}_content`]}
                            </p>
                        </section>
                    ))}
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-white/10 bg-[#050608] py-12 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-widest text-gray-600">
                    <p>© {new Date().getFullYear()} Droutfit. {dict.common.allRightsReserved}</p>
                    <div className="flex items-center gap-2 text-blue-500/60">
                        <ShieldCheck className="h-4 w-4" />
                        <span>{dict.footer.moneyBack}</span>
                    </div>
                    <LanguageSwitcher dict={dict} />
                </div>
            </footer>
        </div>
    );
}
