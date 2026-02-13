
"use client"

import { Bell, Search, Menu } from "lucide-react"

interface HeaderProps {
    onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-800/50 bg-[#0F1116] px-4 md:px-6">
            <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="hidden sm:block relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 font-bold" />
                    <input
                        type="search"
                        placeholder="Search anything..."
                        className="h-10 w-48 lg:w-64 border border-gray-800/50 bg-white/5 pl-10 pr-4 text-sm font-medium text-white outline-none rounded-xl focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                    />
                </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
                <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 border-2 border-[#0F1116] bg-blue-500 rounded-full" />
                </button>
                <div className="h-9 w-9 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/10 ring-1 ring-white/20">
                    JD
                </div>
            </div>
        </header>
    )
}
