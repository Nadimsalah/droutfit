"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface DashboardLanguageSelectorProps {
    dict: any;
    locale: string;
}

export default function DashboardLanguageSelector({ dict, locale }: DashboardLanguageSelectorProps) {
    const pathname = usePathname();
    const router = useRouter();

    const languages = [
        { code: "en", name: "English", country: "United States", flag: "🇺🇸" },
        { code: "fr", name: "Français", country: "France", flag: "🇫🇷" },
        { code: "ar", name: "العربية", country: "Saudi Arabia", flag: "🇸🇦" },
    ];

    const handleLanguageChange = (langCode: string) => {
        if (langCode === locale) return;

        // Redirect to the same path but with the new locale
        const segments = pathname.split('/');
        segments[1] = langCode;
        const newPath = segments.join('/');

        router.push(newPath);
    };

    return (
        <div className="space-y-6 mt-4">
            <div className="px-4">
                <h3 className="text-white text-sm font-black tracking-tight">{dict?.common?.selectLanguage || "Select Language"}</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{dict?.common?.globalExperience || "Global Experience"}</p>
            </div>

            <div className="space-y-2 px-2">
                {languages.map((lang) => {
                    const isActive = locale === lang.code;
                    return (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 border text-start group",
                                isActive
                                    ? "bg-white/10 border-white/20 text-white shadow-lg"
                                    : "bg-white/[0.02] border-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/5"
                            )}
                        >
                            <div className="h-10 w-10 md:h-8 md:w-8 rounded-lg bg-black/20 flex items-center justify-center text-xl md:text-lg shadow-inner group-hover:scale-110 transition-transform duration-500">
                                {lang.flag}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold tracking-tight">{lang.name}</span>
                                <span className={cn(
                                    "text-[9px] uppercase tracking-widest font-bold opacity-60",
                                    isActive ? "text-white" : "text-gray-500"
                                )}>
                                    {lang.country}
                                </span>
                            </div>
                            {isActive && (
                                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="px-4 pt-4 border-t border-white/5 text-center">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] leading-relaxed">
                    {dict?.common?.poweredBy || "Powered by Droutfit Vision AI"}
                </p>
            </div>
        </div>
    );
}
