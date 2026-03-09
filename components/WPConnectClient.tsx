"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Globe, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n-config";

function WPConnectContent({ dict, locale }: { dict: any; locale: Locale }) {
    const searchParams = useSearchParams();
    const site = searchParams.get("site"); // e.g., https://my-wp-store.com
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [linking, setLinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            if (session?.user && site) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('store_website')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.store_website === site) {
                    setSuccess(true);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, [site]);

    const handleConnect = async () => {
        if (!user || (!site && !searchParams.get('embed'))) return;
        setLinking(true);
        setError(null);

        try {
            // 1. Link to current profile (if site is provided, else just return the ID)
            if (site) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        store_website: site,
                        store_name: new URL(site).hostname
                    })
                    .eq('id', user.id);

                if (updateError) throw updateError;
            }

            // 2. Communicate back to the WordPress Iframe Parent
            if (typeof window !== 'undefined' && window.parent !== window) {
                // We are inside an iframe (WordPress)
                window.parent.postMessage({
                    type: 'droutfit_connected',
                    merchantId: user.id
                }, '*'); // In production, replace '*' with the actual WP domain if possible, but '*' works for all clients
            } else if (site) {
                // Fallback for direct browser access (non-iframe)
                const redirectUrl = new URL('/wp-admin/options-general.php', site);
                redirectUrl.searchParams.set('page', 'droutfit-pro');
                redirectUrl.searchParams.set('connected', 'true');
                redirectUrl.searchParams.set('merchant_id', user.id);

                window.location.href = redirectUrl.toString();
            }

            setSuccess(true);
        } catch (err: any) {
            console.error("WP Linking error:", err);
            setError(err.message || "Failed to link site. Please try again.");
        } finally {
            setLinking(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                <p className="mt-4 text-gray-400">Loading your profile...</p>
            </div>
        );
    }

    if (!site) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 rounded-3xl bg-[#131720] border border-white/5 text-center">
                <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold mb-4">Invalid Request</h1>
                <p className="text-gray-400 mb-8">
                    This page is meant to be accessed from your WordPress Admin panel.
                </p>
                <Link href="/" className="inline-block px-8 py-3 bg-white text-black rounded-full font-bold">
                    Go Back Home
                </Link>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 rounded-3xl bg-[#131720] border border-white/5 text-center">
                <Globe className="h-16 w-16 text-blue-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold mb-4">Connect WordPress</h1>
                <p className="text-gray-400 mb-8">
                    Log in to your DrOutfit account to link your WordPress site.
                </p>
                <div className="flex flex-col gap-4">
                    <Link href={`/login?redirect=/dashboard/wordpress/connect?site=${site}`} className="w-full py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all">
                        Log In
                    </Link>
                    <Link href={`/signup?redirect=/dashboard/wordpress/connect?site=${site}`} className="w-full py-4 bg-white/5 border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                        Create Account
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-20 p-10 rounded-[2.5rem] bg-[#131720] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 mb-8 uppercase tracking-widest">
                    Link WordPress Site
                </div>

                <h1 className="text-4xl font-black mb-6">Connect DrOutfit</h1>
                <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                    You're logged in as <span className="text-white font-bold">{user.email}</span>. Click below to link your DrOutfit account with <b>{site}</b>.
                </p>

                {error && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3 justify-center">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                <button
                    onClick={handleConnect}
                    disabled={linking}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full font-black text-xl transition-all shadow-xl shadow-blue-500/20 hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {linking ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Connecting Site...
                        </>
                    ) : (
                        <>
                            <Globe className="h-6 w-6" />
                            Confirm Connection
                        </>
                    )}
                </button>

                <p className="mt-8 text-sm text-gray-500 text-center">
                    You will be redirected back to your WordPress dashboard after confirmation.
                </p>
            </div>
        </div>
    );
}

export default function WPConnectClient({ dict, locale }: { dict: any; locale: Locale }) {
    return (
        <div className="min-h-screen bg-[#0a0d14] text-white font-sans selection:bg-blue-500/30 pb-20">
            <Suspense fallback={<div className="h-20 bg-[#0B0E14]" />}>
                <Navbar dict={dict} locale={locale} />
            </Suspense>
            <div className="pt-20 px-6">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                        <p className="mt-4 text-gray-400">Loading connection page...</p>
                    </div>
                }>
                    <WPConnectContent dict={dict} locale={locale} />
                </Suspense>
            </div>
        </div>
    );
}
