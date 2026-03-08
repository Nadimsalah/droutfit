"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    CheckCircle2, XCircle, Zap, ExternalLink, Loader2, Plus,
    AlertTriangle, ChevronRight, Activity, RefreshCw, Clock,
    Package, CheckCircle, Eye, EyeOff,
} from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n-config";

type View = "loading" | "login" | "not_connected" | "dashboard";

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

    // Login form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    function getShop(): string | null {
        if (typeof window === "undefined") return null;
        const fromUrl = new URLSearchParams(window.location.search).get("shop");
        if (fromUrl) { localStorage.setItem("droutfit_shopify_domain", fromUrl); return fromUrl; }
        return localStorage.getItem("droutfit_shopify_domain");
    }

    const loadData = async (authUser?: any) => {
        try {
            const { data: { user: u } } = await supabase.auth.getUser();
            const activeUser = authUser || u;
            if (!activeUser) { setView("login"); return; }
            setUser(activeUser);

            const { data: profileData } = await supabase
                .from("profiles")
                .select("id, credits, store_website, plan, email")
                .eq("id", activeUser.id)
                .single();
            setProfile(profileData);

            const [{ count: tryOns }, { count: products }] = await Promise.all([
                supabase.from("usage_logs").select("*", { count: "exact", head: true }).eq("user_id", activeUser.id).eq("status", 200),
                supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", activeUser.id),
            ]);
            setStats({ tryOns: tryOns || 0, products: products || 0 });

            setLoadingLogs(true);
            const { data: logsData } = await supabase
                .from("usage_logs")
                .select("id, status, created_at, latency")
                .eq("user_id", activeUser.id)
                .order("created_at", { ascending: false })
                .limit(8);
            setLogs(logsData || []);
            setLoadingLogs(false);

            const shop = getShop();
            const storeSet = profileData?.store_website;
            if (!storeSet && shop) {
                setView("not_connected");
            } else {
                setView("dashboard");
            }
        } catch (e) {
            console.error("Load error:", e);
            setView("login");
        }
    };

    useEffect(() => {
        const shop = getShop();
        if (shop) setShopDomain(shop);
        loadData();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError(null);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            await loadData(data.user);
        } catch (err: any) {
            setLoginError(err.message || "Login failed. Check your email and password.");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleConnectStore = async () => {
        if (!user) return;
        const shop = getShop();
        if (!shop) { setConnectError("Cannot detect your store domain. Please re-open the app from Shopify Admin."); return; }
        setConnectingStore(true);
        setConnectError(null);
        try {
            await supabase.from("profiles").update({ store_website: null }).eq("store_website", shop);
            const { error } = await supabase.from("profiles").update({ store_website: shop }).eq("id", user.id);
            if (error) throw error;
            await loadData(user);
        } catch (e: any) {
            setConnectError(e.message || "Failed to connect. Please try again.");
            setConnectingStore(false);
        }
    };

    const credits = profile?.credits ?? 0;
    const shopSearch = typeof window !== "undefined" ? window.location.search : "";

    const Shell = ({ children }: { children: React.ReactNode }) => (
        <div className="min-h-screen bg-[#f6f6f7] font-sans">
            <header className="bg-white border-b border-[#e1e3e5] px-5 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#5c6ac4] flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-semibold text-[#202223] text-sm">DrOutfit • AI Try-On</span>
                    {view === "dashboard" && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#e3f1df] text-[#008060] border border-[#a8d5a2] font-medium">Connected</span>
                    )}
                </div>
                {user && view === "dashboard" && (
                    <button onClick={() => loadData()} className="text-[#6d7175] hover:text-[#202223] transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                )}
            </header>
            {children}
        </div>
    );

    // ─── LOADING ────────────────────────────────────────────────
    if (view === "loading") return (
        <Shell>
            <div className="flex items-center justify-center min-h-[calc(100vh-57px)]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#5c6ac4] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#6d7175] text-sm">Loading…</p>
                </div>
            </div>
        </Shell>
    );

    // ─── LOGIN ──────────────────────────────────────────────────
    if (view === "login") return (
        <Shell>
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-6 py-12">
                <div className="bg-white rounded-2xl border border-[#e1e3e5] shadow-sm p-7 w-full max-w-sm">
                    <div className="w-12 h-12 rounded-2xl bg-[#5c6ac4] flex items-center justify-center mx-auto mb-5">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-[#202223] text-center mb-1">Sign into DrOutfit</h1>
                    <p className="text-[#6d7175] text-sm text-center mb-6">Connect your store to activate AI Virtual Try-On</p>

                    {loginError && (
                        <div className="flex items-start gap-2 bg-[#fff3f2] border border-[#feb8b2] text-[#d72c0d] text-sm px-3 py-2.5 rounded-lg mb-4">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{loginError}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-[#202223] mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full border border-[#c9cccf] rounded-lg px-3 py-2.5 text-sm text-[#202223] placeholder-[#8c9196] focus:outline-none focus:border-[#5c6ac4] focus:ring-1 focus:ring-[#5c6ac4] transition-colors bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#202223] mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full border border-[#c9cccf] rounded-lg px-3 py-2.5 pr-10 text-sm text-[#202223] placeholder-[#8c9196] focus:outline-none focus:border-[#5c6ac4] focus:ring-1 focus:ring-[#5c6ac4] transition-colors bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c9196] hover:text-[#202223] transition-colors"
                                >
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loginLoading}
                            className="w-full flex items-center justify-center gap-2 bg-[#5c6ac4] hover:bg-[#4959bd] disabled:opacity-60 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors mt-1"
                        >
                            {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {loginLoading ? "Signing in…" : "Sign In"}
                        </button>
                    </form>

                    <p className="text-[#8c9196] text-xs text-center mt-4">
                        No account?{" "}
                        <Link href={`https://droutfit.com/${locale}/signup`} target="_blank" className="text-[#5c6ac4] hover:underline">
                            Create one free →
                        </Link>
                    </p>
                </div>
            </div>
        </Shell>
    );

    // ─── NOT CONNECTED ──────────────────────────────────────────
    if (view === "not_connected") return (
        <Shell>
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-6 py-12">
                <div className="bg-white rounded-2xl border border-[#e1e3e5] shadow-sm p-7 w-full max-w-sm">
                    <div className="w-12 h-12 rounded-xl bg-[#fff3cd] border border-[#ffd79d] flex items-center justify-center mx-auto mb-5">
                        <XCircle className="w-6 h-6 text-[#916a00]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#202223] text-center mb-1">Link your store</h2>
                    <p className="text-[#6d7175] text-sm text-center mb-1">
                        Connect <strong className="text-[#202223]">{shopDomain || "your Shopify store"}</strong> to your DrOutfit account.
                    </p>
                    <p className="text-[#8c9196] text-xs text-center mb-5">Signed in as <strong>{profile?.email || user?.email}</strong></p>

                    {connectError && (
                        <div className="flex items-start gap-2 bg-[#fff3cd] border border-[#ffd79d] text-[#916a00] text-sm px-3 py-2.5 rounded-lg mb-4">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {connectError}
                        </div>
                    )}

                    <button
                        onClick={handleConnectStore}
                        disabled={connectingStore}
                        className="w-full flex items-center justify-center gap-2 bg-[#008060] hover:bg-[#006e52] disabled:opacity-60 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
                    >
                        {connectingStore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {connectingStore ? "Connecting…" : "Connect this store"}
                    </button>

                    <button
                        onClick={() => { setUser(null); setProfile(null); setView("login"); supabase.auth.signOut(); }}
                        className="w-full text-xs text-[#8c9196] hover:text-[#5c6ac4] py-2 mt-2 transition-colors"
                    >
                        Sign in with a different account
                    </button>
                </div>
            </div>
        </Shell>
    );

    // ─── DASHBOARD ──────────────────────────────────────────────
    return (
        <Shell>
            <div className="max-w-2xl mx-auto p-5 space-y-4">

                {/* Store banner */}
                <div className="bg-[#e3f1df] border border-[#a8d5a2] rounded-xl px-4 py-3 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#008060] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[#003321] font-medium text-sm">Store connected</p>
                        <p className="text-[#00693e] text-xs truncate">{profile?.store_website}</p>
                    </div>
                    <Link
                        href={`https://droutfit.com/${locale}/dashboard${shopSearch}`}
                        target="_blank"
                        className="flex items-center gap-1 text-xs text-[#008060] hover:text-[#003321] transition-colors font-medium flex-shrink-0"
                    >
                        Platform
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className={`rounded-xl border p-4 ${credits === 0 ? "bg-[#fff3f2] border-[#feb8b2]" : credits < 10 ? "bg-[#fff3cd] border-[#ffd79d]" : "bg-[#e3f1df] border-[#a8d5a2]"}`}>
                        <p className="text-[11px] text-[#6d7175] uppercase tracking-wide mb-1.5">Credits</p>
                        <p className={`text-3xl font-bold ${credits === 0 ? "text-[#d72c0d]" : credits < 10 ? "text-[#916a00]" : "text-[#008060]"}`}>{credits}</p>
                        <p className="text-[10px] text-[#6d7175] mt-1">remaining</p>
                    </div>
                    <div className="rounded-xl border border-[#e1e3e5] bg-white p-4">
                        <p className="text-[11px] text-[#6d7175] uppercase tracking-wide mb-1.5">Try-Ons</p>
                        <p className="text-3xl font-bold text-[#202223]">{stats?.tryOns ?? "—"}</p>
                        <p className="text-[10px] text-[#6d7175] mt-1">total</p>
                    </div>
                    <div className="rounded-xl border border-[#e1e3e5] bg-white p-4">
                        <p className="text-[11px] text-[#6d7175] uppercase tracking-wide mb-1.5">Products</p>
                        <p className="text-3xl font-bold text-[#202223]">{stats?.products ?? "—"}</p>
                        <p className="text-[10px] text-[#6d7175] mt-1">with widget</p>
                    </div>
                </div>

                {/* Low credits */}
                {credits < 10 && (
                    <div className="bg-[#fff3cd] border border-[#ffd79d] rounded-xl px-4 py-3 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-[#916a00] flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-[#4a2c00] text-sm font-medium">{credits === 0 ? "Out of credits — widget paused" : `Only ${credits} credits left`}</p>
                            <p className="text-[#916a00] text-xs">Top up to keep AI Try-On active</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <Link href={`https://droutfit.com/${locale}/dashboard/billing`} target="_blank"
                        className="flex items-center justify-center gap-2 bg-[#5c6ac4] hover:bg-[#4959bd] text-white px-4 py-3 rounded-xl font-medium text-sm transition-colors">
                        <Zap className="w-4 h-4" />Top up
                    </Link>
                    <Link href={`https://droutfit.com/${locale}/dashboard/products`} target="_blank"
                        className="flex items-center justify-center gap-2 bg-white hover:bg-[#f6f6f7] border border-[#e1e3e5] text-[#202223] px-4 py-3 rounded-xl font-medium text-sm transition-colors">
                        <Package className="w-4 h-4" />Products<ExternalLink className="w-3 h-3 opacity-40" />
                    </Link>
                </div>

                {/* Recent logs */}
                <div className="bg-white rounded-xl border border-[#e1e3e5] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#e1e3e5]">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#5c6ac4]" />
                            <span className="text-sm font-semibold text-[#202223]">Recent Requests</span>
                        </div>
                        <Link href={`https://droutfit.com/${locale}/dashboard/logs`} target="_blank"
                            className="flex items-center gap-0.5 text-xs text-[#5c6ac4] hover:text-[#4959bd] font-medium">
                            View all<ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {loadingLogs ? (
                        <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 text-[#8c9196] animate-spin" /></div>
                    ) : logs.length === 0 ? (
                        <div className="py-8 text-center">
                            <Clock className="w-6 h-6 text-[#c9cccf] mx-auto mb-2" />
                            <p className="text-[#6d7175] text-sm">No requests yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#f6f6f7]">
                            {logs.map((log, i) => {
                                const ok = log.status === 200;
                                return (
                                    <div key={log.id || i} className="flex items-center gap-3 px-4 py-2.5">
                                        {ok ? <CheckCircle className="w-4 h-4 text-[#008060] flex-shrink-0" /> : <XCircle className="w-4 h-4 text-[#d72c0d] flex-shrink-0" />}
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

                <p className="text-center text-xs text-[#8c9196] pb-2">{user?.email}</p>
            </div>
        </Shell>
    );
}

function formatTimeAgo(date: Date): string {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}
