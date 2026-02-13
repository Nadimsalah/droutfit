"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { loginAction } from "./actions"
import { Shield, Lock, AlertCircle, Loader2 } from "lucide-react"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
        >
            {pending ? <Loader2 className="animate-spin h-5 w-5" /> : "Access Dashboard"}
        </button>
    )
}

export default function AdminLoginPage() {
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        const res = await loginAction(formData)
        if (res?.error) {
            setError(res.error)
        }
    }

    return (
        <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-[#0f1115] border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                            <Shield className="h-6 w-6 text-blue-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin</h1>
                        <p className="text-gray-500 text-sm mt-1">Restricted Access Area</p>
                    </div>

                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Security PIN</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                                <input
                                    name="pin"
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={4}
                                    className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-lg tracking-widest placeholder-gray-600"
                                    placeholder="••••"
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <SubmitButton />
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Secure Environment 8808</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
