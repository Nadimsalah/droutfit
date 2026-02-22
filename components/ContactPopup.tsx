"use client"

import { useState } from "react"
import { Modal } from "./Modal"
import { Send, Mail, User, MessageSquare, Loader2, CheckCircle2 } from "lucide-react"

export default function ContactPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setStatus("sending")

        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500))

        setStatus("success")

        // Auto close after success
        setTimeout(() => {
            setIsOpen(false)
            setStatus("idle")
        }, 3000)
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
                    <p className="text-gray-400 text-sm">
                        Have a question or need help? Send us a message and our team will get back to you within 24 hours.
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
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="john@example.com"
                                        className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="How can we help you today?"
                                        className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === "sending"}
                                className="w-full mt-4 bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === "sending" ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </Modal>
        </>
    )
}
