"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Loader2, Mail, Lock, User, Check, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

import { signupAction, requestOTPAction } from "./actions"

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [error, setError] = useState("")
    const [step, setStep] = useState<1 | 2>(1)
    const [otp, setOtp] = useState(["", "", "", ""])
    const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

    const router = useRouter()

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) router.push("/dashboard")
        }
        checkSession()
    }, [router])

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const result = await requestOTPAction(email)
            if (result.error) throw new Error(result.error)
            setStep(2)
        } catch (err: any) {
            setError(err.message || "Failed to send verification code")
        } finally {
            setIsLoading(false)
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1)
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Move to next ref
        if (value !== "" && index < 3) {
            otpRefs[index + 1].current?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            otpRefs[index - 1].current?.focus()
        }
    }

    const handleSignup = async (e?: React.FormEvent) => {
        e?.preventDefault()
        const otpCode = otp.join("")
        if (otpCode.length < 4) {
            setError("Please enter the 4-digit code")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const formData = new FormData()
            formData.append("email", email)
            formData.append("password", password)
            formData.append("fullName", fullName)

            const result = await signupAction(formData, otpCode)

            if (result.error) throw new Error(result.error)

            // Auto Sign-in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) throw signInError
            router.push("/onboarding")

        } catch (err: any) {
            setError(err.message || "Signup failed")
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
                        <img src="/logo-black.png" alt="Droutfit" className="h-16 w-auto mx-auto object-contain" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        {step === 1 ? "Create Account" : "Verify Email"}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {step === 1 ? "Start your free trial without credit card." : `We sent a 4-digit code to ${email}`}
                    </p>
                </div>

                <div className="bg-[#13171F] border border-gray-800 p-8 rounded-3xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    {step === 1 ? (
                        <form onSubmit={handleRequestOTP} className="space-y-6">
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
                                        className="w-full bg-[#0B0E14] border border-gray-800 text-white text-sm font-medium pl-12 pr-4 py-3.5 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
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
                                        className="w-full bg-[#0B0E14] border border-gray-800 text-white text-sm font-medium pl-12 pr-4 py-3.5 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
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
                                        className="w-full bg-[#0B0E14] border border-gray-800 text-white text-sm font-medium pl-12 pr-4 py-3.5 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                        placeholder="Create a password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Get Verification Code
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-8 py-2">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-between gap-3 px-2">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={otpRefs[i]}
                                        type="text"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        className="w-full aspect-square bg-[#0B0E14] border border-gray-800 rounded-2xl text-center text-3xl font-black text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        maxLength={1}
                                        inputMode="numeric"
                                    />
                                ))}
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleSignup()}
                                    disabled={isLoading || otp.some(d => d === "")}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Verify & Create Account
                                            <ShieldCheck className="h-4 w-4" />
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full text-gray-500 hover:text-white text-sm font-bold py-2 transition-colors flex items-center justify-center gap-2"
                                >
                                    Change email address
                                </button>
                            </div>

                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-3 items-start translate-y-2">
                                <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                    Enter the code sent to your inbox. This helps us maintain a secure and bot-free ecosystem.
                                </p>
                            </div>
                        </div>
                    )}

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
