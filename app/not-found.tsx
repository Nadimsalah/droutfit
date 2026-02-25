"use client"

import Link from "next/link"
import { MoveLeft, Home, Sparkles } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#040608] flex items-center justify-center p-6 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-indigo-600/5 blur-[80px] rounded-full pointer-events-none animate-pulse" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
                {/* 404 Large Text */}
                <h1 className="text-[12rem] md:text-[18rem] font-black text-white/[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none tracking-tighter">
                    404
                </h1>

                {/* Animated Logo Container */}
                <div className="relative mb-12 group">
                    <div className="absolute -inset-4 bg-blue-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative animate-float transition-transform duration-500 hover:scale-110">
                        <img
                            src="/logo.png"
                            alt="Droutfit"
                            className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        />
                        {/* Glow animation */}
                        <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full animate-pulse pointer-events-none" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        LOST IN THE <span className="text-blue-500 italic">OUTFIT?</span>
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed">
                        The page you are looking for has been moved or doesn't exist in our current collection.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/30 active:scale-95"
                    >
                        <Home className="h-4 w-4" />
                        RETURN HOME
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black text-sm transition-all backdrop-blur-md active:scale-95"
                    >
                        <MoveLeft className="h-4 w-4" />
                        GO BACK
                    </button>
                </div>

                {/* Footer status */}
                <div className="mt-16 flex items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                        SYSTEMS NOMINAL
                    </div>
                    <span className="h-1 w-1 bg-gray-800 rounded-full" />
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        AI GENERATOR READY
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}
