import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Globe, X, Check } from "lucide-react";

interface DashboardLanguageSelectorProps {
    dict: any;
    locale: string;
}

export default function DashboardLanguageSelector({ dict, locale }: DashboardLanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const languages = [
        { code: "en", name: "English", country: "US", flag: "🇺🇸" },
        { code: "fr", name: "Français", country: "FR", flag: "🇫🇷" },
        { code: "ar", name: "العربية", country: "SA", flag: "🇸🇦" },
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
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 group"
            >
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {currentLang.flag}
                </div>
                <div className="flex flex-col text-left flex-1 min-w-0">
                    <span className="text-white text-[11px] font-black uppercase tracking-widest leading-none mb-1">{dict?.common?.selectLanguage || "Language"}</span>
                    <span className="text-gray-500 text-[9px] font-bold uppercase tracking-tighter truncate opacity-60">
                        {currentLang.name} • {currentLang.country}
                    </span>
                </div>
                <Globe className="h-3.5 w-3.5 text-gray-600 group-hover:text-blue-500 transition-colors mr-1" />
            </button>

            {/* Clean minimalist Popup */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-[280px] bg-[#0E1219] border border-white/10 rounded-[2rem] shadow-none overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-2 space-y-1">
                            {languages.map((lang) => {
                                const isActive = locale === lang.code;
                                return (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-[1.25rem] transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-white/5 text-white"
                                                : "hover:bg-white/[0.03] text-gray-400 hover:text-white"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center text-xl transition-all duration-500",
                                                isActive ? "bg-white/10" : "bg-white/[0.02]"
                                            )}>
                                                {lang.flag}
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-xs font-bold tracking-tight">{lang.name}</span>
                                                <span className="text-[9px] uppercase tracking-widest font-bold opacity-30">{lang.country}</span>
                                            </div>
                                        </div>

                                        {isActive ? (
                                            <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center mr-1">
                                                <Check className="h-2.5 w-2.5 text-white" />
                                            </div>
                                        ) : (
                                            <div className="h-2 w-2 rounded-full border border-white/10 mr-2 group-hover:border-white/20 transition-colors" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
