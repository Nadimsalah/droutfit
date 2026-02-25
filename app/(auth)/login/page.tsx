"use client"

import Link from "next/link"
import { useState } from "react"
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single()

                if (!profile) {
                    // This is an "old user" who doesn't have a profile record yet
                    // Create one automatically so they don't get stuck in onboarding
                    const { error: createError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: user.id,
                                credits: 5,
                                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                                first_name: user.user_metadata?.full_name?.split(' ')[0] || "",
                                last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "",
                                store_name: "My Store",
                                store_domain: "store-" + Math.random().toString(36).substring(7),
                                updated_at: new Date().toISOString()
                            }
                        ])

                    if (createError) {
                        console.error("Auto-profile creation failed Details:", createError)
                        console.error("Error Message:", createError.message)
                        router.push("/onboarding")
                    } else {
                        router.push("/dashboard")
                    }
                } else {
                    router.push("/dashboard")
                }
            }
        } catch (err: any) {
            setError(err.message || "Failed to sign in")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform">
                        <img src="/logo.png" alt="Droutfit" className="h-16 w-auto mx-auto object-contain" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-gray-400 text-sm">Sign in to your dashboard to manage your store.</p>
                </div>

                <div className="bg-[#13171F] border border-gray-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-gray-800 text-white text-sm font-medium pl-12 pr-4 py-3.5 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                                <Link href="/forgot-password" className="text-xs font-bold text-blue-500 hover:text-blue-400">Forgot password?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-gray-800 text-white text-sm font-medium pl-12 pr-4 py-3.5 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-blue-500 hover:text-blue-400 font-bold">
                                Create one for free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
