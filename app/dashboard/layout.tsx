"use client"

import { Sidebar } from "@/components/Sidebar"
import { useState } from "react"
import { Menu } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen bg-[#0B0E14] font-sans overflow-hidden text-white">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex flex-1 flex-col overflow-hidden w-full relative">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0B0E14]/50 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Dr Outfit" className="h-8 w-auto object-contain" />
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                {/* Background decorative blur */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

                <main className="flex-1 overflow-y-auto p-4 md:p-10 relative z-10">
                    {children}
                </main>
            </div>
        </div>
    )
}
