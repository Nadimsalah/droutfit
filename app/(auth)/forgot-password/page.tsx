"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, ArrowLeft, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react"
import { requestResetAction, verifyResetOTPAction, resetPasswordAction } from "./actions"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [otp, setOtp] = useState(["", "", "", ""])
    const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const res = await requestResetAction(email)
        setIsLoading(false)

        if (res.error) {
            setError(res.error)
        } else {
            setStep(2)
        }
    }

    const handleOtpChange = (value: string, index: number) => {
        if (isNaN(Number(value))) return

        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)

        if (value && index < 3) {
            otpRefs[index + 1].current?.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs[index - 1].current?.focus()
        }
    }

    const handleVerifyOTP = async () => {
        const code = otp.join("")
        if (code.length !== 4) return

        setIsLoading(true)
        setError(null)
        const res = await verifyResetOTPAction(email, code)
        setIsLoading(false)

        if (res.error) {
            setError(res.error)
        } else {
            setStep(3)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append("email", email)
        formData.append("password", password)

        const res = await resetPasswordAction(formData, otp.join(""))
        setIsLoading(false)

        if (res.error) {
            setError(res.error)
        } else {
            setStep(3) // Reuse step 3 UI for success or show success state
            router.push("/login?reset=success")
        }
    }

    useEffect(() => {
        if (step === 2 && otp.join("").length === 4) {
            handleVerifyOTP()
        }
    }, [otp])

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-[440px] relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="https://dvbuiiaymvynzwecefup.supabase.co/storage/v1/object/public/listing-images/logo-black.png"
                        alt="DrOutfit"
                        className="h-10 w-auto mb-6 invert brightness-0"
                    />
                    <h1 className="text-3xl font-extrabold text-white tracking-tight text-center">
                        {step === 1 ? "Forgot Password" : step === 2 ? "Verify Email" : "New Password"}
                    </h1>
                    <p className="text-gray-400 mt-2 text-center text-sm max-w-[300px]">
                        {step === 1 ? "Enter your email to receive a 4-digit verification code" :
                            step === 2 ? `We sent a code to ${email}` :
                                "Choose a secure new password for your account"}
                    </p>
                </div>

                <div className="bg-[#0f0f10] border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleRequestOTP} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors group-focus-within/input:text-blue-500" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Code"}
                            </button>
                        </form>
                    ) : step === 2 ? (
                        <div className="space-y-8 py-2">
                            <div className="flex justify-between gap-3 px-2">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={otpRefs[i]}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target.value, i)}
                                        onKeyDown={(e) => handleKeyDown(e, i)}
                                        autoFocus={i === 0}
                                        className="w-14 h-16 bg-black/40 border-2 border-white/10 rounded-2xl text-center text-2xl font-bold text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                                    />
                                ))}
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleVerifyOTP}
                                    disabled={isLoading || otp.join("").length !== 4}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                        <>Verify & Continue <ShieldCheck className="h-5 w-5" /></>
                                    )}
                                </button>

                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full text-sm text-gray-500 hover:text-white transition-colors py-2 font-medium"
                                >
                                    Change email address
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">New Password</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors group-focus-within/input:text-blue-500" />
                                    <input
                                        type="password"
                                        required
                                        min={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>Update Password <CheckCircle2 className="h-5 w-5" /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all duration-300 font-medium group/back"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover/back:-translate-x-1" />
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
