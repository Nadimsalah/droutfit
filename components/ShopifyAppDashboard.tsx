"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    CheckCircle2,
    XCircle,
    Zap,
    LogIn,
    ExternalLink,
    Loader2,
    Plus,
    AlertTriangle,
    CheckCircle,
    ChevronRight,
    Activity,
    RefreshCw,
    Clock,
    Package,
} from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n-config";

type View = "loading" | "not_logged_in" | "not_connected" | "dashboard";

export default function ShopifyAppDashboard({ locale }: { locale: Locale }) {
    const [view, setView] = useState<View>("loading");
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [shopDomain, setShopDomain] = useState<string | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState<{ tryOns: number; products: number } | null>(null);
    const [connectingStore, setConnectingStore] = useState(false);
    const [connectError, setConnectError] = useState<string | null>(null);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Detect Shopify shop param on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const shop = params.get("shop");
            if (shop) setShopDomain(shop);
        }
    }, []);

    const loadData = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) { setView("not_logged_in"); return; }
            setUser(authUser);

            const { data: profileData } = await supabase
                .from("profiles")
                .select("id, credits, store_website, plan, email")
                .eq("id", authUser.id)
                .single();
            setProfile(profileData);

            // Stats
            const [{ count: tryOns }, { count: products }] = await Promise.all([
                supabase.from("usage_logs").select("*", { count: "exact", head: true }).eq("user_id", authUser.id).eq("status", 200),
                supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", authUser.id),
            ]);
            setStats({ tryOns: tryOns || 0, products: products || 0 });

            // Recent logs
            setLoadingLogs(true);
            const { data: logsData } = await supabase
                .from("usage_logs")
                .select("id, status, created_at, latency")
                .eq("user_id", authUser.id)
                .order("created_at", { ascending: false })
                .limit(8);
            setLogs(logsData || []);
            setLoadingLogs(false);

            // Decide view
            const shop = shopDomain || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("shop") : null);
            const storeSet = profileData?.store_website;
            const isLinked = storeSet && shop && (storeSet === shop || storeSet.includes(shop) || shop.includes(storeSet));
            setView(isLinked ? "dashboard" : "not_connected");
        } catch (e) {
            console.error("Load error:", e);
            setView("not_logged_in");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleConnectStore = async () => {
        if (!user) return;
        const shop = shopDomain || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("shop") : null);
        if (!shop) { setConnectError("Could not detect your store domain. Please re-open the app from Shopify."); return; }
        setConnectingStore(true);
        setConnectError(null);
        try {
            await supabase.from("profiles").update({ store_website: null }).eq("store_website", shop);
            const { error } = await supabase.from("profiles").update({ store_website: shop }).eq("id", user.id);
            if (error) throw error;
            await loadData(); // reload → switches to dashboard view
        } catch (e: any) {
            setConnectError(e.message || "Failed to connect. Please try again.");
        } finally {
            setConnectingStore(false);
        }
    };

    const credits = profile?.credits ?? 0;
    const creditVariant = credits === 0 ? "red" : credits < 10 ? "yellow" : "green";
    const creditColors = {
        red: "text-red-400 bg-red-400/10 border-red-400/20",
        yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
        green: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    }[creditVariant];

    const searchParam = typeof window !== "undefined" ? window.location.search : "";

    // ── LOADING ─────────────────────────────────────────────────────────────────
    if (view === "loading") {
        return (
            <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    // ── WRAPPER ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col">
            {/* Header */}
            <header className="border-b border-white/8 bg-[#111]/80 backdrop-blur px-5 py-3.5 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-md shadow-violet-500/30">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-white text-sm tracking-wide">DrOutfit</span>
                    {view === "dashboard" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">Connected</span>
                    )}
                </div>
                {view === "dashboard" && (
                    <Link
                        href={`https://droutfit.com/${locale}/dashboard${searchParam}`}
                        target="_blank"
                        className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-white transition-colors"
                    >
                        Open Full Platform
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                )}
            </header>

            {/* ── NOT LOGGED IN ────────────────────────────────────── */}
            {view === "not_logged_in" && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center mb-6 shadow-xl shadow-violet-500/25">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Welcome to DrOutfit</h1>
                    <p className="text-gray-400 text-sm mb-8 max-w-xs leading-relaxed">
                        Log into your DrOutfit account to connect your Shopify store and manage your AI Try-On widget.
                    </p>
                    <Link
                        href={`https://droutfit.com/${locale}/login`}
                        target="_blank"
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 mb-3"
                    >
                        <LogIn className="w-4 h-4" />
                        Sign into DrOutfit
                        <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </Link>
                    <p className="text-gray-600 text-xs">
                        No account?{" "}
                        <Link href={`https://droutfit.com/${locale}/signup`} target="_blank" className="text-violet-400 hover:underline">
                            Create one free
                        </Link>
                    </p>
                    <button onClick={loadData} className="mt-8 text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1.5 transition-colors">
                        <RefreshCw className="w-3 h-3" />
                        I already signed in — refresh
                    </button>
                </div>
            )}

            {/* ── NOT CONNECTED ─────────────────────────────────────── */}
            {view === "not_connected" && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                        <XCircle className="w-7 h-7 text-amber-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Connect Your Store</h2>
                    <p className="text-gray-400 text-sm max-w-xs mb-2 leading-relaxed">
                        Link <strong className="text-white">{shopDomain || "your Shopify store"}</strong> to your DrOutfit account to activate the AI Try-On widget.
                    </p>
                    <p className="text-gray-600 text-xs mb-8">
                        Logged in as <span className="text-gray-400">{profile?.email || user?.email}</span>
                    </p>

                    {connectError && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4 max-w-sm">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            {connectError}
                        </div>
                    )}

                    <button
                        onClick={handleConnectStore}
                        disabled={connectingStore}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 mb-3"
                    >
                        {connectingStore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {connectingStore ? "Connecting…" : "Connect This Store"}
                    </button>
                    <p className="text-gray-600 text-xs">This will link your store to your DrOutfit account</p>
                    <p className="text-gray-700 text-xs mt-6">
                        Wrong account?{" "}
                        <Link href={`https://droutfit.com/${locale}/login`} target="_blank" className="text-violet-400 hover:underline">
                            Sign in with another account
                            <ExternalLink className="inline w-2.5 h-2.5 ml-0.5 opacity-70" />
                        </Link>
                    </p>
                </div>
            )}

            {/* ── DASHBOARD ─────────────────────────────────────────── */}
            {view === "dashboard" && (
                <div className="flex-1 p-5 space-y-4 max-w-2xl w-full mx-auto">

                    {/* Store banner */}
                    <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-4 py-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-emerald-300 font-medium text-sm">Store Connected</p>
                            <p className="text-emerald-600 text-xs truncate">{profile?.store_website}</p>
                        </div>
                        <button onClick={loadData} className="text-gray-600 hover:text-gray-300 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Credits + Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className={`rounded-2xl border ${creditColors} p-4 flex flex-col`}>
                            <span className="text-[11px] uppercase tracking-wide opacity-60 mb-1.5">Credits Left</span>
                            <span className="text-3xl font-black">{credits}</span>
                            <span className="text-[11px] opacity-50 mt-1">try-ons</span>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/4 p-4 flex flex-col">
                            <span className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Total Try-Ons</span>
                            <span className="text-3xl font-black text-white">{stats?.tryOns ?? "—"}</span>
                            <span className="text-[11px] text-gray-600 mt-1">all time</span>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/4 p-4 flex flex-col">
                            <span className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Products</span>
                            <span className="text-3xl font-black text-white">{stats?.products ?? "—"}</span>
                            <span className="text-[11px] text-gray-600 mt-1">with widget</span>
                        </div>
                    </div>

                    {/* Low credits warning */}
                    {credits < 10 && (
                        <div className="flex items-center gap-3 bg-yellow-500/8 border border-yellow-500/20 rounded-2xl px-4 py-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-yellow-300 text-sm font-medium">
                                    {credits === 0 ? "No credits — widget disabled!" : `Only ${credits} credits left`}
                                </p>
                                <p className="text-yellow-700 text-xs">Top up to keep Try-On running</p>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href={`https://droutfit.com/${locale}/dashboard/billing`}
                            target="_blank"
                            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/20"
                        >
                            <Zap className="w-4 h-4" />
                            Top Up Credits
                        </Link>
                        <Link
                            href={`https://droutfit.com/${locale}/dashboard/products`}
                            target="_blank"
                            className="flex items-center justify-center gap-2 border border-white/12 hover:bg-white/5 text-white px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all"
                        >
                            <Package className="w-4 h-4" />
                            Products
                            <ExternalLink className="w-3 h-3 opacity-40" />
                        </Link>
                    </div>

                    {/* Recent Request Logs */}
                    <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-violet-400" />
                                <span className="text-sm font-semibold text-white">Recent Requests</span>
                            </div>
                            <Link
                                href={`https://droutfit.com/${locale}/dashboard/logs`}
                                target="_blank"
                                className="text-xs text-gray-500 hover:text-violet-400 transition-colors flex items-center gap-1"
                            >
                                All logs
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {loadingLogs ? (
                            <div className="py-8 flex justify-center">
                                <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="py-8 text-center">
                                <Clock className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                                <p className="text-gray-600 text-sm">No requests yet</p>
                                <p className="text-gray-700 text-xs">Try-Ons will appear here once your widget is active</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {logs.map((log, i) => {
                                    const isSuccess = log.status === 200;
                                    const date = new Date(log.created_at);
                                    const timeAgo = formatTimeAgo(date);
                                    return (
                                        <div key={log.id || i} className="flex items-center gap-3 px-4 py-2.5">
                                            {isSuccess ? (
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-medium ${isSuccess ? "text-emerald-400" : "text-red-400"}`}>
                                                        {log.status}
                                                    </span>
                                                    {log.latency && (
                                                        <span className="text-gray-600 text-[10px]">{log.latency}</span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-gray-600">{timeAgo}</span>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSuccess ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                                                {isSuccess ? "Success" : "Failed"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[11px] text-gray-700 pb-2">
                        <span>{user?.email}</span>
                        <Link
                            href={`https://droutfit.com/${locale}/dashboard`}
                            target="_blank"
                            className="hover:text-gray-400 transition-colors flex items-center gap-1"
                        >
                            Full Dashboard
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

function formatTimeAgo(date: Date): string {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}
