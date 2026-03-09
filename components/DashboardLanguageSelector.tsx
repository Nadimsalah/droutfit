import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Languages, Globe, X, Check } from "lucide-react";

interface DashboardLanguageSelectorProps {
    dict: any;
    locale: string;
}

export default function DashboardLanguageSelector({ dict, locale }: DashboardLanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const languages = [
        { code: "en", name: "English", country: "United States", flag: "🇺🇸" },
        { code: "fr", name: "Français", country: "France", flag: "🇫🇷" },
        { code: "ar", name: "العربية", country: "Saudi Arabia", flag: "🇸🇦" },
    ];

    const currentLang = languages.find(l => l.code === locale) || languages[0];

    const handleLanguageChange = (langCode: string) => {
        if (langCode === locale) {
            setIsOpen(false);
            return;
        }

        const segments = pathname.split('/');
        segments[1] = langCode;
        const newPath = segments.join('/');

        router.push(newPath);
        setIsOpen(false);
    };

    return (
        <div className="px-4">
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 group shadow-lg"
            >
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform duration-500 ring-1 ring-blue-500/20">
                    {currentLang.flag}
                </div>
                <div className="flex flex-col text-left flex-1 min-w-0">
                    <span className="text-white text-xs font-black uppercase tracking-widest">{dict?.common?.selectLanguage || "Language"}</span>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter truncate">
                        {currentLang.name} • {currentLang.country}
                    </span>
                </div>
                <Globe className="h-4 w-4 text-gray-600 group-hover:text-blue-500 transition-colors mr-1" />
            </button>

            {/* Premium Popup Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-sm bg-[#0B0F17] border border-white/10 rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-white text-lg font-black tracking-tight">{dict?.common?.selectLanguage || "Select Language"}</h3>
                                <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">{dict?.common?.globalExperience || "Global Experience"}</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="p-3 space-y-1">
                            {languages.map((lang) => {
                                const isActive = locale === lang.code;
                                return (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                            isActive
                                                ? "bg-blue-600/10 border border-blue-500/20 text-white"
                                                : "hover:bg-white/5 border border-transparent text-gray-400 hover:text-white"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-2xl transition-all duration-500 group-hover:scale-110",
                                            isActive ? "bg-blue-600/20 ring-2 ring-blue-500/30" : "bg-white/5"
                                        )}>
                                            {lang.flag}
                                        </div>
                                        <div className="flex flex-col text-left flex-1">
                                            <span className="text-sm font-black tracking-tight">{lang.name}</span>
                                            <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">{lang.country}</span>
                                        </div>
                                        {isActive && (
                                            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                                <Check className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] leading-relaxed">
                                {dict?.common?.poweredBy || "Powered by Droutfit Vision AI"}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
