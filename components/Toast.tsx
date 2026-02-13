
"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, X } from "lucide-react"

interface ToastProps {
    message: string
    isVisible: boolean
    onClose: () => void
    type?: "success" | "error"
}

export default function Toast({ message, isVisible, onClose, type = "success" }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose()
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [isVisible, onClose])

    if (!isVisible) return null

    const iconColor = type === "success" ? "text-green-500" : "text-red-500"
    const borderColor = type === "success" ? "border-green-500/20" : "border-red-500/20"

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className={`bg-[#13171F] border ${borderColor} rounded-xl p-4 shadow-2xl flex items-center gap-4 min-w-[320px] ring-1 ring-white/5`}>
                <div className={`p-2 rounded-full ${type === "success" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    <CheckCircle2 className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                        {message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
