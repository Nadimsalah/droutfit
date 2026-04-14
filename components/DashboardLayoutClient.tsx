"use client"

import { Sidebar } from "@/components/Sidebar"
import { useState, useEffect, Suspense } from "react"
import { Menu, ArrowLeft, ExternalLink, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DashboardLayoutClient({
    children,
    dict,
    locale
}: {
    children: React.ReactNode
    dict: any
    locale: string
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isEmbedded, setIsEmbedded] = useState(false)
    const [shopifyReturnUrl, setShopifyReturnUrl] = useState<string | null>(null)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('embedded') === '1') {
                setIsEmbedded(true);
            }
            const shopDomain = localStorage.getItem('droutfit_shopify_domain');
            if (shopDomain) {
                setShopifyReturnUrl(`https://${shopDomain}/admin/apps`);
            }
        }

        const checkAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (!session || error) {
                    router.push(`/${locale}/login`)
                } else {
                    setUserEmail(session.user.email ?? null)
                }
            } catch (err: any) {
                if (err.name === 'AbortError' || err.message?.includes('abort')) {
                    console.log("Auth session check aborted (normal)");
                } else {
                    console.error("Auth check error:", err);
                }
            }
        }
        checkAuth()
    }, [router, locale])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push(`/${locale}/login`)
    }

    return (
        <div className="flex h-screen bg-[#0B0E14] font-sans overflow-hidden text-white" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {!isEmbedded && (
                <Suspense fallback={<div className="w-72 bg-[#0F1116] border-r border-gray-800/50 hidden md:block" />}>
                    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} dict={dict} locale={locale} />
                </Suspense>
            )}
            <div className="flex flex-1 flex-col overflow-hidden w-full relative">

                {/* ── Embedded top bar (Shopify Admin iframe) ── */}
                {isEmbedded && (
                    <div className="flex items-center justify-between gap-3 bg-[#0F1116] border-b border-white/10 px-4 py-2.5 z-30 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Dr Outfit" className="h-7 w-auto object-contain" />
                            {userEmail && (
                                <span className="text-gray-500 text-xs hidden sm:block truncate max-w-[200px]">
                                    {userEmail}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-lg transition-all"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </button>
                    </div>
                )}

                {/* Return to Shopify Banner */}
                {shopifyReturnUrl && (
                    <div className="flex items-center justify-between gap-3 bg-[#5c6ac4]/15 border-b border-[#5c6ac4]/30 px-4 md:px-6 py-2 z-30 flex-shrink-0">
                        <div className="flex items-center gap-2 text-sm text-[#b1bbf5]">
                            <ArrowLeft className="w-4 h-4" />
                            <span>You came from your Shopify store</span>
                        </div>
                        <Link
                            href={shopifyReturnUrl}
                            target="_top"
                            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#5c6ac4] hover:bg-[#4959bd] px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                        >
                            Return to Shopify
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                )}

                {/* Mobile top bar (non-embedded only) */}
                {!isEmbedded && (
                    <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0B0E14]/50 backdrop-blur-xl z-20 sticky top-0">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Dr Outfit" className="h-8 w-auto object-contain" />
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                )}

                {/* Background blur decorations */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

                <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-6 md:pt-4 relative z-10">
                    {children}
                </main>
            </div>
        </div>
    )
}
