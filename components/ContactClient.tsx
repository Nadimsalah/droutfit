"use client"

import { useState, useEffect, Suspense } from "react"
import Navbar from "@/components/Navbar"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Send, Mail, User, MessageSquare, Globe, Building2, Loader2, CheckCircle2, Phone } from "lucide-react"
import LanguageSwitcher from "@/components/LanguageSwitcher";

function ContactContent({ dict, locale }: { dict: any, locale: string }) {
    const searchParams = useSearchParams()
    const [type, setType] = useState<"support" | "sales">("support")
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")

    useEffect(() => {
        const queryType = searchParams.get("type")
        if (queryType === "sales") {
            setType("sales")
        }
    }, [searchParams])

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        storeUrl: "",
        volume: 80000,
        message: ""
    })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setStatus("sending")

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: `${type === "sales" ? dict.contactPage.form.inquirySales : dict.contactPage.form.inquirySupport}\n
${type === "sales" ? `${dict.contactPage.form.companyLabel}: ${formData.company}\n${dict.contactPage.form.storeUrlLabel}: ${formData.storeUrl}\n${dict.contactPage.form.volumeLabel}: ${formData.volume}\n` : ""}
${dict.contactPage.form.messageLabel}: ${formData.message}`
                })
            })

            if (!response.ok) throw new Error("Failed to send")

            setStatus("success")
        } catch (err) {
            console.error(err)
            setStatus("error")
            setTimeout(() => setStatus("idle"), 3000)
        }
    }

    return (
        <div className="min-h-screen bg-[#050608] text-white font-sans" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <Navbar dict={dict} locale={locale} />

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter"
                    >
                        {dict.contactPage.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 italic">{dict.contactPage.titleAccent}</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 text-lg max-w-2xl mx-auto font-medium"
                    >
                        {dict.contactPage.description}
                    </motion.p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 bg-[#0D1117] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50" />

                    {/* Left Side: Info & Toggle */}
                    <div className="lg:w-1/3 p-8 md:p-12 bg-white/[0.01] border-r border-white/5 space-y-12">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">{dict.contactPage.department}</h3>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setType("support")}
                                    className={`p-4 rounded-2xl flex items-center gap-4 transition-all border-2 focus:outline-none ${type === "support" ? "border-blue-500 text-white bg-transparent" : "border-transparent text-gray-500 hover:text-white bg-transparent hover:bg-white/5"}`}
                                >
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${type === "support" ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400"}`}>
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm uppercase tracking-wider">{dict.contactPage.support}</p>
                                        <p className="text-[11px] opacity-60">{dict.contactPage.supportDesc}</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setType("sales")}
                                    className={`p-4 rounded-2xl flex items-center gap-4 transition-all border-2 focus:outline-none ${type === "sales" ? "border-purple-500 text-white bg-transparent" : "border-transparent text-gray-500 hover:text-white bg-transparent hover:bg-white/5"}`}
                                >
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${type === "sales" ? "bg-purple-600 text-white" : "bg-white/5 text-gray-400"}`}>
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm uppercase tracking-wider">{dict.contactPage.sales}</p>
                                        <p className="text-[11px] opacity-60">{dict.contactPage.salesDesc}</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8 pt-8 border-t border-white/5">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <Mail className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{dict.contactPage.emailUs}</p>
                                    <p className="font-bold text-white">support@droutfit.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <Phone className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{dict.contactPage.directLine}</p>
                                    <p className="font-bold text-white">+1 (415) 800-4753</p>
                                    <p className="text-[10px] text-gray-500 mt-1 italic">{dict.contactPage.hours}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="lg:w-2/3 p-8 md:p-12">
                        {status === "success" ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                                <div className="h-24 w-24 bg-green-500/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">{dict.contactPage.form.successTitle}</h3>
                                    <p className="text-gray-400 font-medium">{dict.contactPage.form.successDesc}</p>
                                </div>
                                <button
                                    onClick={() => setStatus("idle")}
                                    className="px-8 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                    {dict.contactPage.form.sendAnother}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{dict.contactPage.form.name}</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-4 h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                                                placeholder={dict.contactPage.form.placeholderName}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{dict.contactPage.form.email}</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-4 h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                                                placeholder={dict.contactPage.form.placeholderEmail}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {type === "sales" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{dict.contactPage.form.company}</label>
                                                <div className="relative group">
                                                    <Building2 className="absolute left-4 top-4 h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                                    <input
                                                        type="text"
                                                        required={type === "sales"}
                                                        value={formData.company}
                                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-medium"
                                                        placeholder={dict.contactPage.form.placeholderCompany}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{dict.contactPage.form.storeUrl}</label>
                                                <div className="relative group">
                                                    <Globe className="absolute left-4 top-4 h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                                    <input
                                                        type="url"
                                                        required={type === "sales"}
                                                        value={formData.storeUrl}
                                                        onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })}
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-medium"
                                                        placeholder={dict.contactPage.form.placeholderStore}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{dict.contactPage.form.message}</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-5 text-white text-sm focus:outline-none focus:border-blue-500 transition-all resize-none font-medium"
                                        placeholder={type === "sales" ? dict.contactPage.form.placeholderMessageSales : dict.contactPage.form.placeholderMessageSupport}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === "sending"}
                                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 group shadow-xl active:scale-95 disabled:opacity-50 ${type === "sales" ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20" : "bg-white text-black hover:bg-blue-600 hover:text-white"}`}
                                >
                                    {status === "sending" ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            {dict.contactPage.form.sending}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            {type === "sales" ? dict.contactPage.form.submitSales : dict.contactPage.form.submitSupport}
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
            <footer className="border-t border-white/10 bg-[#050608] py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-widest text-gray-600">
                    <p>© {new Date().getFullYear()} Droutfit. {dict.common.allRightsReserved}</p>
                    <LanguageSwitcher dict={dict} />
                </div>
            </footer>
        </div>
    )
}

export default function ContactClient({ dict, locale }: { dict: any, locale: string }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050608] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        }>
            <ContactContent dict={dict} locale={locale} />
        </Suspense>
    )
}
