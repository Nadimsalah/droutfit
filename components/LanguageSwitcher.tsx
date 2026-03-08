"use client";

import { useState, useEffect } from "react";
import { Globe, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher({ dict }: { dict?: any }) {
    const languages = [
        { code: "en", name: "English", country: "United States", flag: "🇺🇸" },
        { code: "fr", name: "Français", country: "France", flag: "🇫🇷" },
        { code: "ar", name: "العربية", country: "Saudi Arabia", flag: "🇸🇦" },
    ];

    const pathname = usePathname();
    const router = useRouter();

    // Determine current language from pathname
    const currentLocale = pathname.split('/')[1] || 'en';
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(
        languages.find(l => l.code === currentLocale) || languages[0]
    );

    // Update selected language when pathname changes
    useEffect(() => {
        const lang = languages.find(l => l.code === currentLocale);
        if (lang) setSelected(lang);
    }, [pathname, currentLocale]);

    // Prevent scroll when popup is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    const handleLanguageChange = (lang: typeof languages[0]) => {
        setSelected(lang);
        setIsOpen(false);

        // Redirect to the same path but with the new locale
        const segments = pathname.split('/');
        segments[1] = lang.code;
        const newPath = segments.join('/');

        router.push(newPath);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em] shadow-lg group hover:scale-105 active:scale-95"
            >
                <div className="relative">
                    <Globe className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-700" />
                    <span className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
                </div>
                <span>{selected.name}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                        {/* Overlay to close */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-[#0D1117] border border-white/10 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]" dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">{dict?.common?.selectLanguage || "Select Language"}</h2>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{dict?.common?.globalExperience || "Global Experience"}</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all group"
                                >
                                    <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>

                            {/* Options List */}
                            <div className="p-6 space-y-3">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang)}
                                        className={`w-full group relative flex items-center justify-between p-5 rounded-[28px] transition-all duration-300 ${selected.code === lang.code
                                            ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30"
                                            : "bg-white/[0.02] hover:bg-white/[0.05] text-gray-400 hover:text-white border border-transparent hover:border-white/5"
                                            }`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-black/20 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                                                {lang.flag}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-lg font-black tracking-tight">{lang.name}</p>
                                                <p className={`text-[10px] uppercase tracking-widest font-bold opacity-60 ${selected.code === lang.code ? "text-white" : "text-gray-500"}`}>
                                                    {lang.country}
                                                </p>
                                            </div>
                                        </div>
                                        {selected.code === lang.code && (
                                            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Footer / Status */}
                            <div className="p-6 bg-white/[0.01] border-t border-white/5 text-center">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                                    {dict?.common?.poweredBy || "Powered by Droutfit Vision AI"}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
