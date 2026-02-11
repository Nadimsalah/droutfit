
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

    const bgColor = type === "success" ? "bg-green-400" : "bg-red-400"

    return (
        <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className={`border-4 border-black ${bgColor} p-6 shadow-[8px_8px_0px_0px_black] flex items-center gap-4 min-w-[300px]`}>
                <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_black]">
                    <CheckCircle2 className="h-6 w-6 text-black" />
                </div>
                <div className="flex-1">
                    <p className="text-lg font-black uppercase italic tracking-tight text-black">
                        {message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="hover:scale-110 transition-transform p-1"
                >
                    <X className="h-5 w-5 text-black" />
                </button>
            </div>
        </div>
    )
}
