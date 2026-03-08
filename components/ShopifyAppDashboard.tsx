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
    ChevronRight,
    Activity,
    RefreshCw,
    Clock,
    Package,
    CheckCircle,
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

    function getShop(): string | null {
        if (typeof window === "undefined") return null;
        return new URLSearchParams(window.location.search).get("shop");
    }

    const loadData = async () => {
        setView("loading");
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

            const shop = getShop();

            const [{ count: tryOns }, { count: products }] = await Promise.all([
                supabase.from("usage_logs").select("*", { count: "exact", head: true }).eq("user_id", authUser.id).eq("status", 200),
                supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", authUser.id),
            ]);
            setStats({ tryOns: tryOns || 0, products: products || 0 });

            setLoadingLogs(true);
            const { data: logsData } = await supabase
                .from("usage_logs")
                .select("id, status, created_at, latency")
                .eq("user_id", authUser.id)
                .order("created_at", { ascending: false })
                .limit(8);
            setLogs(logsData || []);
            setLoadingLogs(false);

            const storeSet = profileData?.store_website;
            const isLinked = storeSet && shop && (storeSet === shop || storeSet.includes(shop) || shop.includes(storeSet));
            setView(isLinked || (!shop && storeSet) ? "dashboard" : shop ? "not_connected" : "dashboard");
        } catch (e) {
            console.error("Load error:", e);
            setView("not_logged_in");
        }
    };

    // Auto-detect auth changes (when user logs in from new tab)
    useEffect(() => {
        const shop = getShop();
        if (shop) setShopDomain(shop);
        loadData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session) {
                loadData();
            } else if (event === "SIGNED_OUT") {
                setView("not_logged_in");
                setUser(null);
                setProfile(null);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleConnectStore = async () => {
        if (!user) return;
        const shop = getShop();
        if (!shop) { setConnectError("Could not detect your store domain. Please re-open the app from Shopify."); return; }
        setConnectingStore(true);
        setConnectError(null);
        try {
            await supabase.from("profiles").update({ store_website: null }).eq("store_website", shop);
            const { error } = await supabase.from("profiles").update({ store_website: shop }).eq("id", user.id);
            if (error) throw error;
            await loadData();
        } catch (e: any) {
            setConnectError(e.message || "Failed to connect. Please try again.");
            setConnectingStore(false);
        }
    };

    const credits = profile?.credits ?? 0;

    // ─── LOADING ───────────────────────────────────────────────────────────────
    if (view === "loading") return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5c6ac4] flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="w-5 h-5 border-2 border-[#5c6ac4] border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    );

    const shopSearch = typeof window !== "undefined" ? window.location.search : "";

    // ─── SHARED WRAPPER ────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f6f6f7] font-sans">
            {/* Shopify-style top bar */}
            <header className="bg-white border-b border-[#e1e3e5] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#5c6ac4] flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-semibold text-[#202223] text-sm">DrOutfit · AI Try-On</span>
                </div>
                {view === "dashboard" && (
                    <Link
                        href={`https://droutfit.com/${locale}/dashboard${shopSearch}`}
                        target="_blank"
                        className="flex items-center gap-1 text-xs text-[#5c6ac4] hover:text-[#4959bd] transition-colors font-medium"
                    >
                        Open platform
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                )}
            </header>

            {/* ── NOT LOGGED IN ──────────────────────────────────── */}
            {view === "not_logged_in" && (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-6 text-center">
                    <div className="bg-white rounded-2xl border border-[#e1e3e5] shadow-sm p-8 max-w-sm w-full">
                        <div className="w-14 h-14 rounded-2xl bg-[#5c6ac4] flex items-center justify-center mx-auto mb-5">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-[#202223] mb-2">Connect DrOutfit</h1>
                        <p className="text-[#6d7175] text-sm mb-6 leading-relaxed">
                            Sign into your DrOutfit account to activate the AI Virtual Try-On widget on your store.
                        </p>
                        <Link
                            href={`https://droutfit.com/${locale}/login`}
                            target="_blank"
                            className="flex items-center justify-center gap-2 w-full bg-[#5c6ac4] hover:bg-[#4959bd] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors mb-3"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign into DrOutfit
                            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </Link>
                        <button
                            onClick={loadData}
                            className="flex items-center justify-center gap-1.5 w-full text-sm text-[#6d7175] hover:text-[#202223] py-2 transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            I already signed in — refresh
                        </button>
                        <p className="text-[#8c9196] text-xs mt-3">
                            No account?{" "}
                            <Link href={`https://droutfit.com/${locale}/signup`} target="_blank" className="text-[#5c6ac4] hover:underline">
                                Create one free
                            </Link>
                        </p>
                    </div>
                </div>
            )}

            {/* ── NOT CONNECTED ──────────────────────────────────── */}
            {view === "not_connected" && (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-6 text-center">
                    <div className="bg-white rounded-2xl border border-[#e1e3e5] shadow-sm p-8 max-w-sm w-full">
                        <div className="w-14 h-14 rounded-xl bg-[#fff3cd] border border-[#ffd79d] flex items-center justify-center mx-auto mb-5">
                            <XCircle className="w-7 h-7 text-[#916a00]" />
                        </div>
                        <h2 className="text-lg font-bold text-[#202223] mb-1">Link your Shopify store</h2>
                        <p className="text-[#6d7175] text-sm mb-1">
                            Connect <strong className="text-[#202223]">{shopDomain || "your store"}</strong> to your DrOutfit account.
                        </p>
                        <p className="text-[#8c9196] text-xs mb-6">Signed in as {profile?.email || user?.email}</p>

                        {connectError && (
                            <div className="flex items-start gap-2 bg-[#fff3cd] border border-[#ffd79d] text-[#916a00] text-sm px-3 py-2.5 rounded-lg mb-4 text-left">
                                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                {connectError}
                            </div>
                        )}

                        <button
                            onClick={handleConnectStore}
                            disabled={connectingStore}
                            className="flex items-center justify-center gap-2 w-full bg-[#008060] hover:bg-[#006e52] disabled:opacity-60 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors mb-3"
                        >
                            {connectingStore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {connectingStore ? "Connecting…" : "Connect this store"}
                        </button>

                        <Link
                            href={`https://droutfit.com/${locale}/login`}
                            target="_blank"
                            className="text-xs text-[#8c9196] hover:text-[#5c6ac4] transition-colors"
                        >
                            Sign in with a different account
                        </Link>
                    </div>
                </div>
            )}

            {/* ── DASHBOARD ──────────────────────────────────────── */}
            {view === "dashboard" && (
                <div className="max-w-2xl mx-auto p-5 space-y-4">

                    {/* Connected store banner */}
                    <div className="bg-[#e3f1df] border border-[#a8d5a2] rounded-xl px-4 py-3 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#008060] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[#003321] font-medium text-sm">Store connected</p>
                            <p className="text-[#00693e] text-xs truncate">{profile?.store_website}</p>
                        </div>
                        <button onClick={loadData} className="text-[#00693e] hover:text-[#003321] transition-colors" title="Refresh">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            {
                                label: "Credits left",
                                value: credits,
                                color: credits === 0 ? "text-[#d72c0d]" : credits < 10 ? "text-[#916a00]" : "text-[#008060]",
                                bg: credits === 0 ? "bg-[#fff3f2] border-[#feb8b2]" : credits < 10 ? "bg-[#fff3cd] border-[#ffd79d]" : "bg-[#e3f1df] border-[#a8d5a2]",
                            },
                            { label: "Total try-ons", value: stats?.tryOns ?? "—", color: "text-[#202223]", bg: "bg-white border-[#e1e3e5]" },
                            { label: "Products", value: stats?.products ?? "—", color: "text-[#202223]", bg: "bg-white border-[#e1e3e5]" },
                        ].map(({ label, value, color, bg }) => (
                            <div key={label} className={`rounded-xl border ${bg} p-4`}>
                                <p className="text-[11px] text-[#6d7175] uppercase tracking-wide mb-1.5">{label}</p>
                                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Low credits warning */}
                    {credits < 10 && (
                        <div className="bg-[#fff3cd] border border-[#ffd79d] rounded-xl px-4 py-3 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-[#916a00] flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-[#4a2c00] text-sm font-medium">
                                    {credits === 0 ? "Out of credits — widget is paused" : `Only ${credits} credits remaining`}
                                </p>
                                <p className="text-[#916a00] text-xs">Top up to keep the AI Try-On active</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href={`https://droutfit.com/${locale}/dashboard/billing`}
                            target="_blank"
                            className="flex items-center justify-center gap-2 bg-[#5c6ac4] hover:bg-[#4959bd] text-white px-4 py-3 rounded-xl font-medium text-sm transition-colors"
                        >
                            <Zap className="w-4 h-4" />
                            Top up credits
                        </Link>
                        <Link
                            href={`https://droutfit.com/${locale}/dashboard/products`}
                            target="_blank"
                            className="flex items-center justify-center gap-2 bg-white hover:bg-[#f6f6f7] border border-[#e1e3e5] text-[#202223] px-4 py-3 rounded-xl font-medium text-sm transition-colors"
                        >
                            <Package className="w-4 h-4" />
                            View products
                            <ExternalLink className="w-3 h-3 opacity-40" />
                        </Link>
                    </div>

                    {/* Request log */}
                    <div className="bg-white rounded-xl border border-[#e1e3e5] overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e1e3e5]">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[#5c6ac4]" />
                                <span className="text-sm font-semibold text-[#202223]">Recent Requests</span>
                            </div>
                            <Link
                                href={`https://droutfit.com/${locale}/dashboard/logs`}
                                target="_blank"
                                className="flex items-center gap-0.5 text-xs text-[#5c6ac4] hover:text-[#4959bd] transition-colors font-medium"
                            >
                                View all
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {loadingLogs ? (
                            <div className="py-8 flex justify-center">
                                <Loader2 className="w-5 h-5 text-[#8c9196] animate-spin" />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="py-8 text-center">
                                <Clock className="w-6 h-6 text-[#c9cccf] mx-auto mb-2" />
                                <p className="text-[#6d7175] text-sm">No requests yet</p>
                                <p className="text-[#8c9196] text-xs mt-0.5">Try-ons will appear here once your widget gets traffic</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#f6f6f7]">
                                {logs.map((log, i) => {
                                    const ok = log.status === 200;
                                    return (
                                        <div key={log.id || i} className="flex items-center gap-3 px-4 py-2.5">
                                            {ok
                                                ? <CheckCircle className="w-4 h-4 text-[#008060] flex-shrink-0" />
                                                : <XCircle className="w-4 h-4 text-[#d72c0d] flex-shrink-0" />
                                            }
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] text-[#202223] font-medium">{ok ? "Try-On generated" : "Request failed"}</p>
                                                <p className="text-xs text-[#8c9196]">{formatTimeAgo(new Date(log.created_at))}{log.latency ? ` · ${log.latency}` : ""}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ok ? "bg-[#e3f1df] text-[#008060]" : "bg-[#fff3f2] text-[#d72c0d]"}`}>
                                                {ok ? "Success" : "Failed"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-[#8c9196] pb-2">{user?.email}</p>
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
