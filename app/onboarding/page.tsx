"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Building, Globe, Loader2, Save, User as UserIcon } from "lucide-react"

export default function OnboardingPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        storeName: "",
        website: ""
    })
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error("No user found")

            // Generate domain from store name
            const domain = formData.storeName.toLowerCase().replace(/[^a-z0-9]/g, "")

            // Update profile
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    store_name: formData.storeName,
                    store_website: formData.website,
                    store_domain: domain,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error

            router.push("/dashboard")
        } catch (error) {
            console.error("Error saving onboarding data:", error)
            alert("Failed to save information. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-lg relative z-10">
                <div className="text-center mb-10">
                    <img src="/logo.png" alt="Droutfit" className="h-16 w-auto mx-auto object-contain mb-6" />
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        {step === 1 ? "Tell us about yourself" : "Setup your store"}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {step === 1 ? "Let's get to know you better." : "Configure your store details for integration."}
                    </p>
                </div>

                <div className="bg-[#13171F] border border-gray-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
                    <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSubmit} className="space-y-6">

                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">First Name</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="firstName"
                                            required
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full bg-[#0B0E14] border border-gray-800 text-white text-sm font-medium pl-12 pr-4 py-3.5 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                            placeholder="John"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Last Name</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="lastName"
                                            required
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full bg-[#0B0E14] border border-gray-800 text-white text-sm font-medium pl-12 pr-4 py-3.5 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] mt-4"
                                >
                                    Next Step
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Store Name</label>
                                    <div className="relative group">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="storeName"
                                            required
                                            value={formData.storeName}
                                            onChange={handleChange}
                                            className="w-full bg-[#0B0E14] border border-gray-800 text-white text-sm font-medium pl-12 pr-4 py-3.5 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600"
                                            placeholder="My Awesome Store"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Store Website</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            type="url"
                                            name="website"
                                            required
                                            value={formData.website}
                                            onChange={handleChange}
                                            className="w-full bg-[#0B0E14] border border-gray-800 text-white text-sm font-medium pl-12 pr-4 py-3.5 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-1/3 bg-[#0B0E14] hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl border border-gray-800 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Setup"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="mt-8 flex justify-center gap-2">
                        <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 1 ? 'bg-blue-500' : 'bg-gray-800'}`} />
                        <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 2 ? 'bg-purple-500' : 'bg-gray-800'}`} />
                    </div>
                </div>
            </div>
        </div>
    )
}
