"use client"

import { useState } from "react"
import { Modal } from "./Modal"
import { Send, Mail, User, MessageSquare, Loader2, CheckCircle2 } from "lucide-react"

export default function ContactPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setStatus("sending")

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            })

            if (!response.ok) throw new Error("Failed to send")

            setStatus("success")

            // Auto close after success
            setTimeout(() => {
                setIsOpen(false)
                setStatus("idle")
                // Reset form
                setName("")
                setEmail("")
                setMessage("")
            }, 3000)
        } catch (err) {
            console.error(err)
            setStatus("error")
            setTimeout(() => setStatus("idle"), 3000)
        }
    }

    return (
        <>
            {/* Trigger Button/Link */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(true);
                }}
                className="hover:text-white transition-colors cursor-pointer text-left"
            >
                Contact Us
            </button>

            {/* Modal */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Contact Support">
                <div className="space-y-6">
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Have a question or need help? Send us a message and our team will get back to you within <strong className="text-white">24 hours</strong>.
                    </p>

                    {status === "success" ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                                <p className="text-gray-400 text-sm">We'll be in touch shortly.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-blue-500/10 blur opacity-0 group-focus-within:opacity-100 transition-opacity rounded-xl" />
                                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors z-10" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="relative w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all z-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-blue-500/10 blur opacity-0 group-focus-within:opacity-100 transition-opacity rounded-xl" />
                                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors z-10" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className="relative w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all z-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Message</label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-blue-500/10 blur opacity-0 group-focus-within:opacity-100 transition-opacity rounded-xl" />
                                    <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors z-10" />
                                    <textarea
                                        required
                                        rows={4}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="How can we help you today?"
                                        className="relative w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all resize-none z-10"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={status === "sending"}
                                    className={`relative w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest transition-all overflow-hidden ${status === "error"
                                            ? 'bg-red-500 text-white'
                                            : 'bg-white text-black hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 group'
                                        }`}
                                >
                                    {status !== "error" && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                                        {status === "sending" ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : status === "error" ? (
                                            "Error Sending. Try Again."
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Send Message
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>
        </>
    )
}
