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

            if (session?.user && shop) {
                // Check if already linked
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('store_website')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.store_website === shop) {
                    setSuccess(true);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, [shop]);

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

            // Open Shopify Admin in new tab before setting success state
            if (typeof window !== 'undefined') {
                window.open(`https://${shop}/admin`, '_blank');
            }

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
            <div className="max-w-2xl mx-auto mt-10 p-1 rounded-[3rem] bg-gradient-to-b from-blue-500/20 to-purple-600/20">
                <div className="bg-[#0B0E14] rounded-[2.8rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="h-24 w-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center p-0.5 mb-8 shadow-2xl shadow-green-500/20 rotate-3 group hover:rotate-6 transition-transform">
                            <div className="bg-[#0B0E14] h-full w-full rounded-[1.4rem] flex items-center justify-center">
                                <CheckCircle2 className="h-12 w-12 text-green-400" />
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight italic uppercase">Store Connected!</h1>
                        <p className="text-lg text-gray-400 mb-12 max-w-lg leading-relaxed">
                            Your Shopify store <span className="text-white font-bold">{shop}</span> is now linked to your DrOutfit account. You're ready to start using AI Try-On!
                        </p>

                        <div className="w-full text-left mb-12 relative">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-8 flex items-center gap-3">
                                <span className="h-0.5 w-8 bg-blue-500/50" />
                                Next Steps to Publish
                            </h3>

                            <div className="grid gap-4">
                                {[
                                    { step: "1", title: "Theme Editor", desc: "Open your **Shopify Theme Editor**.", href: `https://${shop}/admin/themes/current/editor` },
                                    { step: "2", title: "Product Template", desc: "Go to your **Default Product** template." },
                                    { step: "3", title: "Install Component", desc: 'Add the **"Virtual Try-On Button"** block.' }
                                ].map((step, i) => {
                                    const Card = step.href ? 'a' : 'div';
                                    return (
                                        <Card
                                            key={i}
                                            href={step.href}
                                            target={step.href ? "_blank" : undefined}
                                            className="group flex items-center gap-6 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer"
                                        >
                                            <div className="h-12 w-12 rounded-2xl bg-white/[0.05] flex flex-col items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                                                <span className="text-xs font-black text-gray-500 group-hover:text-blue-400">{step.step}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-xs font-black uppercase tracking-widest text-white">{step.title}</h4>
                                                    {step.href && (
                                                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">Open Editor</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: step.desc.replace(/\*\*(.*?)\*\*/g, '<b class="text-gray-200">$1</b>') }} />
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <Link
                                href="/dashboard"
                                className="px-12 py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-gray-200 transition-all shadow-xl hover:shadow-white/10 active:scale-95 flex items-center justify-center gap-4"
                            >
                                Back to Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <a
                                href={`https://${shop}`}
                                target="_blank"
                                className="px-12 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-4"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                View Store
                            </a>
                        </div>
                    </div>
                </div>
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
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                        <p className="mt-4 text-gray-400">Loading connection page...</p>
                    </div>
                }>
                    <ConnectContent />
                </Suspense>
            </div>
        </div>
    );
}
