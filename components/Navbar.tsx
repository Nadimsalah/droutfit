"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, User, LayoutDashboard, Plus, CreditCard, LogOut, ChevronDown, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Navbar({ dict, locale }: { dict: any, locale: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEmbedded, setIsEmbedded] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [shop, setShop] = useState<string | null>(null);
    const [isStoreLinked, setIsStoreLinked] = useState(false);

    useEffect(() => {
        // ... same useEffect logic ...
        const urlParams = new URL(window.location.href).searchParams;
        const embedded = typeof window !== 'undefined' && (window.self !== window.top || urlParams.get('embedded') === '1');
        setIsEmbedded(embedded);

        let s = searchParams.get('shop') || urlParams.get('shop');
        if (!s && typeof window !== 'undefined') {
            s = sessionStorage.getItem('shopify_shop');
        }

        const isShopifyReferrer = typeof document !== 'undefined' && document.referrer.includes('myshopify.com');

        if (s) {
            setShop(s);
            sessionStorage.setItem('shopify_shop', s);
        } else if (embedded || isShopifyReferrer) {
            setShop("your-store");
        }

        if (s && (window as any).shopify) {
            try {
                (window as any).shopify.config.set({
                    apiKey: '74303bbd83d05928ebbc1ebf980450a3',
                    shopOrigin: s,
                });
            } catch (e) {
                console.error("App Bridge config failed:", e);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('store_website')
                        .eq('id', session.user.id)
                        .single();
                    setIsStoreLinked(!!profile?.store_website);
                }
            } catch (err: any) {
                if (err.name === 'AbortError' || err.message?.includes('abort')) {
                    // Ignore auth aborts during navigation
                } else {
                    console.error("Navbar session check error:", err);
                }
            }
        };
        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('store_website')
                    .eq('id', session.user.id)
                    .single();
                setIsStoreLinked(!!profile?.store_website);
            } else {
                setIsStoreLinked(false);
            }
        });

        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        setIsProfileOpen(false);
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    return (
        <>
            {(shop || isEmbedded) && (
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-700 text-white z-[110] py-2 px-6 flex items-center justify-between shadow-lg h-10">
                    <p className="text-[10px] md:text-sm font-bold flex items-center gap-2">
                        <ShoppingBag className="h-3 w-3 md:h-4 md:w-4" />
                        {isStoreLinked ? dict.navbar.storeConnected : dict.navbar.linkStorePrompt}
                    </p>
                    {!isStoreLinked && (
                        <Link href={`/${locale}/dashboard/shopify/connect?shop=${shop || 'your-store'}`} className="bg-white text-blue-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-black hover:bg-gray-100 transition-all uppercase tracking-tight">
                            {dict.common.connectStore}
                        </Link>
                    )}
                </div>
            )}
            <nav className={`fixed ${(shop || isEmbedded) ? 'top-10' : 'top-0'} left-0 right-0 z-[100] transition-all duration-300 ${scrolled || isOpen ? 'bg-[#0B0E14] border-b border-white/10 shadow-2xl' : 'bg-[#0B0E14]/80 backdrop-blur-xl border-b border-white/5'}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between pointer-events-auto">
                    <Link href={`/${locale}`} className="flex items-center gap-2 group relative z-50">
                        <img src="/logo.png" alt="Droutfit" className="h-10 w-auto object-contain" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { name: dict.navbar.features, id: 'features' },
                            { name: dict.navbar.howItWorks, id: 'how-it-works' },
                            { name: dict.navbar.pricing, id: 'pricing' },
                            { name: dict.navbar.shopify, id: 'shopify' },
                            { name: dict.navbar.wordpress, id: 'wordpress' },
                            { name: dict.navbar.apiDocs, id: 'api-docs', href: `/${locale}/docs` }
                        ].map((item) => (
                            <Link
                                key={item.id}
                                href={item.href || `/${locale}#${item.id}`}
                                className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
                            >
                                {item.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {(shop || isEmbedded) && !isStoreLinked && (
                            <Link
                                href={`/${locale}/dashboard/shopify/connect?shop=${shop || 'your-store'}`}
                                className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600/30 transition-all flex items-center gap-2 group animate-pulse"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                {dict.navbar.connectShopify}
                            </Link>
                        )}
                        {!user ? (
                            <>
                                <Link href={`/${locale}/login`} className="text-sm font-medium text-white hover:text-purple-400 transition-colors">
                                    {dict.common.signIn}
                                </Link>
                                <Link href={`/${locale}/dashboard`} className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-all flex items-center gap-2 group hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    {dict.common.getStarted}
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </>
                        ) : (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-all group"
                                >
                                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden">
                                        {user.email?.substring(0, 2) || <User className="h-4 w-4" />}
                                    </div>
                                    <span className="text-sm font-bold text-white max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Profile Dropdown */}
                                {isProfileOpen && (
                                    <div className={cn(
                                        "absolute mt-3 w-56 bg-[#13171F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]",
                                        locale === 'ar' ? "left-0" : "right-0"
                                    )}>
                                        <div className="p-2 space-y-1">
                                            <Link
                                                href={`/${locale}/dashboard`}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <LayoutDashboard className="h-4 w-4 text-blue-400" />
                                                {dict.common.dashboard}
                                            </Link>
                                            <Link
                                                href={`/${locale}/dashboard/products/add`}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <Plus className="h-4 w-4 text-green-400" />
                                                {dict.dashboard.addProduct}
                                            </Link>
                                            <Link
                                                href={`/${locale}/dashboard/billing`}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <CreditCard className="h-4 w-4 text-purple-400" />
                                                {dict.dashboard.billing}
                                            </Link>
                                            <div className="h-px bg-white/5 my-1 mx-2" />
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                {dict.common.signOut}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden relative z-50 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-40 bg-[#0B0E14] md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex flex-col items-center justify-center h-full space-y-8 p-6 relative z-10">
                    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                        {[
                            { name: dict.navbar.features, id: 'features' },
                            { name: dict.navbar.howItWorks, id: 'how-it-works' },
                            { name: dict.navbar.pricing, id: 'pricing' },
                            { name: dict.navbar.shopify, id: 'shopify' },
                            { name: dict.navbar.wordpress, id: 'wordpress' },
                            { name: dict.navbar.apiDocs, id: 'api-docs', href: `/${locale}/docs` }
                        ].map((item, i) => (
                            <Link
                                key={item.id}
                                href={item.href || `/${locale}#${item.id}`}
                                onClick={() => setIsOpen(false)}
                                className="text-2xl font-bold text-gray-300 hover:text-white transition-colors w-full text-center py-2 border-b border-white/5 hover:border-white/20"
                                style={{ transitionDelay: `${i * 50}ms` }}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 w-full max-w-sm pt-8">
                        {(shop || isEmbedded) && !isStoreLinked && (
                            <Link
                                href={`/${locale}/dashboard/shopify/connect?shop=${shop || 'your-store'}`}
                                className="w-full py-4 rounded-xl bg-blue-600 text-white text-center font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-2 animate-pulse"
                                onClick={() => setIsOpen(false)}
                            >
                                <ShoppingBag className="h-5 w-5" />
                                {dict.navbar.connectShopify}
                            </Link>
                        )}
                        {!user ? (
                            <>
                                <Link
                                    href={`/${locale}/login`}
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 rounded-xl border border-white/10 text-center font-bold text-white hover:bg-white/5 transition-colors"
                                >
                                    {dict.common.signIn}
                                </Link>
                                <Link
                                    href={`/${locale}/dashboard`}
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 rounded-xl bg-white text-black text-center font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                >
                                    {dict.common.getStarted}
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={`/${locale}/dashboard`}
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 rounded-xl border border-white/10 text-center font-bold text-white flex items-center justify-center gap-3"
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    {dict.common.dashboard}
                                </Link>
                                <Link
                                    href={`/${locale}/dashboard/products/add`}
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 rounded-xl border border-white/10 text-center font-bold text-white flex items-center justify-center gap-3"
                                >
                                    <Plus className="h-5 w-5" />
                                    {dict.dashboard.addProduct}
                                </Link>
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setIsOpen(false);
                                    }}
                                    className="w-full py-4 rounded-xl bg-red-500/10 text-red-400 text-center font-bold flex items-center justify-center gap-3"
                                >
                                    <LogOut className="h-5 w-5" />
                                    {dict.common.signOut}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
