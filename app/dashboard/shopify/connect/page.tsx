"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { ShoppingBag, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

function ConnectContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const shop = searchParams.get("shop");
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [linking, setLinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };
        checkUser();
    }, []);

    const handleConnect = async () => {
        if (!user || !shop) return;
        setLinking(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ store_website: shop })
                .eq('id', user.id);

            if (updateError) throw updateError;
            setSuccess(true);
        } catch (err: any) {
            console.error("Linking error:", err);
            setError(err.message || "Failed to link store. Please try again.");
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

    if (!shop) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 rounded-3xl bg-[#131720] border border-white/5 text-center">
                <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold mb-4">Shopify Shop Not Found</h1>
                <p className="text-gray-400 mb-8">
                    This page is meant to be accessed through your Shopify Admin.
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
                <ShoppingBag className="h-16 w-16 text-blue-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold mb-4">Connect {shop}</h1>
                <p className="text-gray-400 mb-8">
                    Log in to your DrOutfit account to link your Shopify store.
                </p>
                <div className="flex flex-col gap-4">
                    <Link href={`/login?redirect=/dashboard/shopify/connect?shop=${shop}`} className="w-full py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all">
                        Log In
                    </Link>
                    <Link href={`/signup?redirect=/dashboard/shopify/connect?shop=${shop}`} className="w-full py-4 bg-white/5 border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                        Create Account
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 rounded-3xl bg-[#131720] border border-white/5 text-center">
                <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Store Connected!</h1>
                <p className="text-gray-400 mb-8">
                    Your Shopify store <b>{shop}</b> is now linked to your DrOutfit account. You can now use your credits in your store.
                </p>
                <Link href="/" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all">
                    Finish Setup
                    <ArrowRight className="h-5 w-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-20 p-10 rounded-[2.5rem] bg-[#131720] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 mb-8 uppercase tracking-widest">
                    Link Accounts
                </div>

                <h1 className="text-4xl font-black mb-6">Almost there!</h1>
                <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                    You're logged in as <span className="text-white font-bold">{user.email}</span>. Click below to link your DrOutfit account with <b>{shop}</b>.
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
                            Linking Store...
                        </>
                    ) : (
                        <>
                            <ShoppingBag className="h-6 w-6" />
                            Connect to Shopify Store
                        </>
                    )}
                </button>

                <p className="mt-8 text-sm text-gray-500">
                    Not your store? Please access this page from your Shopify Partner dashboard.
                </p>
            </div>
        </div>
    );
}

export default function ConnectPage() {
    return (
        <div className="min-h-screen bg-[#0a0d14] text-white font-sans selection:bg-blue-500/30 pb-20">
            <Suspense fallback={<div className="h-20 bg-[#0B0E14]" />}>
                <Navbar />
            </Suspense>
            <div className="pt-20 px-6">
                <ConnectContent />
            </div>
        </div>
    );
}
