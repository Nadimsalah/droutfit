
"use client"

import { useEffect, useState } from "react"

interface NeoProgressBarProps {
    progress: number
    message?: string
}

export default function NeoProgressBar({ progress, message }: NeoProgressBarProps) {
    return (
        <div className="w-full max-w-sm space-y-4">
            <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-black uppercase italic tracking-wider text-black">
                    {message || "Processing..."}
                </span>
                <span className="text-xl font-black text-black">
                    {Math.round(progress)}%
                </span>
            </div>

            <div className="h-10 w-full border-4 border-black bg-white shadow-[6px_6px_0px_0px_black] overflow-hidden relative">
                <div
                    className="h-full bg-yellow-400 border-r-4 border-black transition-all duration-300 ease-out flex items-center justify-end pr-2 overflow-hidden"
                    style={{ width: `${progress}%` }}
                >
                    {/* Retro diagonal stripes overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '20px 20px' }}>
                    </div>
                </div>
            </div>

            <div className="flex justify-between px-1">
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`h-2 w-2 border-2 border-black ${i < (progress / 20) ? 'bg-pink-400' : 'bg-gray-200'}`}></div>
                    ))}
                </div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Dr Outfit VTO Engine v1.0</p>
            </div>
        </div>
    )
}
