"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TopUpModal } from "@/components/TopUpModal";
import {
    CheckCircle2,
    XCircle,
    Zap,
    Package,
    TrendingUp,
    ExternalLink,
    RefreshCw,
    LogIn,
    Plus,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n-config";

export default function ShopifyAppDashboard({ locale }: { locale: Locale }) {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [connectingStore, setConnectingStore] = useState(false);
    const [connectSuccess, setConnectSuccess] = useState(false);
    const [shopDomain, setShopDomain] = useState<string | null>(null);
    const [stats, setStats] = useState<{ totalTryOns: number; products: number } | null>(null);

    const isConnected = profile?.store_website && shopDomain &&
        (profile.store_website === shopDomain ||
            profile.store_website.includes(shopDomain) ||
            shopDomain.includes(profile.store_website));

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const shop = params.get("shop");
            if (shop) setShopDomain(shop);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                setUser(authUser);

                if (authUser) {
                    const { data: profileData } = await supabase
                        .from("profiles")
                        .select("id, credits, store_website, plan")
                        .eq("id", authUser.id)
                        .single();
                    setProfile(profileData);

                    // Fetch usage stats
                    const { count: tryOnCount } = await supabase
                        .from("usage_logs")
                        .select("*", { count: "exact", head: true })
                        .eq("user_id", authUser.id)
                        .eq("status", 200);

                    const { count: productCount } = await supabase
                        .from("products")
                        .select("*", { count: "exact", head: true })
                        .eq("user_id", authUser.id);

                    setStats({
                        totalTryOns: tryOnCount || 0,
                        products: productCount || 0,
                    });
                }
            } catch (e) {
                console.error("Shopify App Load Error:", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [connectSuccess]);

    const handleConnectStore = async () => {
        if (!user || !shopDomain) return;
        setConnectingStore(true);
        try {
            // Remove shop from any other profile
            await supabase
                .from("profiles")
                .update({ store_website: null })
                .eq("store_website", shopDomain);

            // Link to current profile
            const { error } = await supabase
                .from("profiles")
                .update({ store_website: shopDomain })
                .eq("id", user.id);

            if (error) throw error;
            setConnectSuccess(prev => !prev); // trigger re-load
        } catch (e: any) {
            console.error("Connect error:", e);
        } finally {
            setConnectingStore(false);
        }
    };

    const credits = profile?.credits ?? 0;
    const creditColor = credits === 0 ? "text-red-400" : credits < 10 ? "text-yellow-400" : "text-emerald-400";

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                    <p className="text-gray-400 text-sm">Loading your dashboard…</p>
                </div>
            </div>
        );
    }

    // ── NOT LOGGED IN ─────────────────────────────────────────────
    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                    <Zap className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome to DrOutfit</h1>
                <p className="text-gray-400 mb-8 max-w-sm">
                    Log into your DrOutfit account to connect your Shopify store and manage your AI Try-On widget.
                </p>
                <Link
                    href={`/${locale}/login`}
                    target="_blank"
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/20"
                >
                    <LogIn className="w-4 h-4" />
                    Sign into DrOutfit
                    <ExternalLink className="w-4 h-4 opacity-60" />
                </Link>
                <p className="text-gray-600 text-sm mt-4">
                    No account?{" "}
                    <Link href={`/${locale}/signup`} target="_blank" className="text-violet-400 hover:underline">
                        Create one free
                    </Link>
                </p>
            </div>
        );
    }

    // ── LOGGED IN ──────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-[#111] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-md shadow-violet-500/30">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold leading-none">DrOutfit</h1>
                        <p className="text-gray-500 text-xs">AI Virtual Try-On</p>
                    </div>
                </div>
                <Link
                    href={`/${locale}/dashboard`}
                    target="_blank"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20"
                >
                    Full Dashboard
                    <ExternalLink className="w-3 h-3" />
                </Link>
            </header>

            <div className="max-w-2xl mx-auto p-6 space-y-5">

                {/* Store Connection Card */}
                <div className={`rounded-2xl border p-5 ${isConnected ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {isConnected ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                            ) : (
                                <XCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="font-semibold text-white">
                                        {isConnected ? "Store Connected" : "Store Not Connected"}
                                    </h2>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isConnected ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                                        {isConnected ? "Active" : "Pending"}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mt-0.5">
                                    {isConnected
                                        ? profile.store_website
                                        : shopDomain
                                            ? `Link ${shopDomain} to your account`
                                            : "No store domain detected"}
                                </p>
                            </div>
                        </div>
                        {!isConnected && shopDomain && (
                            <button
                                onClick={handleConnectStore}
                                disabled={connectingStore}
                                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl font-medium transition-all flex-shrink-0 shadow-lg shadow-violet-500/20"
                            >
                                {connectingStore ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                                Connect Store
                            </button>
                        )}
                        {isConnected && (
                            <button
                                onClick={handleConnectStore}
                                disabled={connectingStore}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Re-link
                            </button>
                        )}
                    </div>
                </div>

                {/* Credits & Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Credits */}
                    <div className="col-span-1 rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col">
                        <span className="text-gray-400 text-xs mb-2">Credits</span>
                        <span className={`text-3xl font-bold ${creditColor}`}>{credits}</span>
                        <span className="text-gray-600 text-xs mt-1">try-ons remaining</span>
                    </div>

                    {/* Try-Ons */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col">
                        <span className="text-gray-400 text-xs mb-2">Total Try-Ons</span>
                        <span className="text-3xl font-bold text-white">{stats?.totalTryOns ?? "—"}</span>
                        <span className="text-gray-600 text-xs mt-1">all time</span>
                    </div>

                    {/* Products */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col">
                        <span className="text-gray-400 text-xs mb-2">Products</span>
                        <span className="text-3xl font-bold text-white">{stats?.products ?? "—"}</span>
                        <span className="text-gray-600 text-xs mt-1">with widget</span>
                    </div>
                </div>

                {/* Low Credits Warning */}
                {credits < 10 && (
                    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-yellow-300 font-medium text-sm">
                                {credits === 0 ? "Out of credits! Widget is disabled." : `Only ${credits} credits left.`}
                            </p>
                            <p className="text-yellow-600 text-xs">Top up to keep the Try-On widget running on your store.</p>
                        </div>
                        <button
                            onClick={() => setIsTopUpOpen(true)}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-3 py-2 rounded-lg transition-all flex-shrink-0"
                        >
                            Top Up
                        </button>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setIsTopUpOpen(true)}
                        className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-3.5 rounded-2xl font-semibold transition-all shadow-lg shadow-violet-500/20"
                    >
                        <Zap className="w-4 h-4" />
                        Top Up Credits
                    </button>
                    <Link
                        href={`/${locale}/dashboard/products`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 border border-white/15 hover:bg-white/5 text-white px-5 py-3.5 rounded-2xl font-semibold transition-all"
                    >
                        <Package className="w-4 h-4" />
                        Manage Products
                        <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                </div>

                {/* How to add Try-On button */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-violet-400" />
                        <h3 className="font-semibold text-white text-sm">Add Try-On to Product Pages</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        The AI Try-On button is added automatically to product pages via our Shopify widget script.
                        To configure which products have the button, manage them from the products page.
                    </p>
                    <div className="flex gap-2">
                        <Link
                            href={`/${locale}/dashboard/products`}
                            target="_blank"
                            className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Products
                        </Link>
                        <span className="text-gray-700">·</span>
                        <Link
                            href={`/${locale}/dashboard/docs`}
                            target="_blank"
                            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors"
                        >
                            View Docs
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* Account Footer */}
                <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                    <span>{user.email}</span>
                    <span className="capitalize px-2 py-0.5 rounded-full border border-white/10 text-gray-500">
                        {profile?.plan || "Free"} plan
                    </span>
                </div>
            </div>

            {/* Top Up Modal */}
            <TopUpModal
                isOpen={isTopUpOpen}
                onClose={() => setIsTopUpOpen(false)}
                locale={locale}
                dict={null}
            />
        </div>
    );
}
