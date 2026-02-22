"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Loader2, Mail, Lock, User, Check, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

import { signupAction } from "./actions"

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false) // Kept for fallback, though we mostly redirect
    const router = useRouter()

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) router.push("/dashboard")
        }
        checkSession()
    }, [router])

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // 1. Create verified user via Server Action (Admin API)
            const formData = new FormData()
            formData.append("email", email)
            formData.append("password", password)
            formData.append("fullName", fullName)

            const result = await signupAction(formData)

            if (result.error) {
                throw new Error(result.error)
            }

            // 2. Sign in immediately since email is confirmed (if using service role)
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) {
                if (signInError.message.toLowerCase().includes("email not confirmed")) {
                    setSuccess(true)
                    return
                }
                throw signInError
            }

            // 3. Redirect to onboarding
            router.push("/onboarding")

        } catch (err: any) {
            let msg = err.message || "Failed to create account"
            if (msg.toLowerCase().includes("rate limit")) {
                msg += " Try using a different email or an alias (e.g. name+1@gmail.com)."
            } else if (msg.toLowerCase().includes("user already registered")) {
                msg = "An account with this email already exists."
            }
            setError(msg)
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center p-4">
                <div className="bg-[#13171F] border border-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                    <div className="bg-green-500/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                        <Check className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        We've sent a verification link to <span className="text-white font-bold">{email}</span>. Please click the link to verify your account.
                    </p>
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 bg-[#0B0E14] border border-gray-800 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        )
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
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create Account</h1>
                    <p className="text-gray-400 text-sm">Start your free trial without credit card.</p>
                </div>

                <div className="bg-[#13171F] border border-gray-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
                    <form onSubmit={handleSignup} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-gray-800 text-white text-sm font-medium pl-12 pr-4 py-3.5 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

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
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-gray-800 text-white text-sm font-medium pl-12 pr-4 py-3.5 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                    placeholder="Create a password"
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
                                    Create Account
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-500 hover:text-blue-400 font-bold">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
