"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Settings, LogOut, Menu, X, MessageSquare, ListTree } from "lucide-react"
import { useState } from "react"
import { logoutAction } from "../../actions"

export default function AdminSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const isActive = (path: string) => pathname === path

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-[#0B0E14] border-b border-gray-800">
                <img src="/logo.png" alt="Droutfit" className="h-8 w-auto object-contain brightness-0 invert" />
                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white">
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Sidebar Container - Hidden on mobile unless open, always visible on md+ */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[#0B0E14] border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="p-6 border-b border-gray-800/50 hidden md:block">
                    <img src="/logo.png" alt="Droutfit" className="h-10 w-auto object-contain brightness-0 invert" />
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link
                        href="/xdash"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/xdash')
                            ? 'bg-white/5 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <LayoutDashboard className={`h-5 w-5 ${isActive('/xdash') ? 'text-blue-500' : 'text-gray-500'}`} />
                        Overview
                    </Link>
                    <Link
                        href="/xdash/users"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/xdash/users')
                            ? 'bg-white/5 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Users className={`h-5 w-5 ${isActive('/xdash/users') ? 'text-blue-500' : 'text-gray-500'}`} />
                        Users Management
                    </Link>
                    <Link
                        href="/xdash/revenue"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/xdash/revenue')
                            ? 'bg-white/5 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <div className="h-5 w-5 flex items-center justify-center">
                            <span className="text-green-500 font-bold">$</span>
                        </div>
                        Revenue Analytics
                    </Link>
                    <Link
                        href="/xdash/settings"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/xdash/settings')
                            ? 'bg-white/5 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Settings className={`h-5 w-5 ${isActive('/xdash/settings') ? 'text-blue-500' : 'text-gray-500'}`} />
                        Set pricing
                    </Link>
                    <Link
                        href="/xdash/prompts"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/xdash/prompts')
                            ? 'bg-white/5 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <MessageSquare className={`h-5 w-5 ${isActive('/xdash/prompts') ? 'text-blue-500' : 'text-gray-500'}`} />
                        Prompt Manager
                    </Link>
                    <Link
                        href="/xdash/logs"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive('/xdash/logs')
                            ? 'bg-white/5 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <ListTree className={`h-5 w-5 ${isActive('/xdash/logs') ? 'text-blue-500' : 'text-gray-500'}`} />
                        API Logs
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-800/50">
                    <form action={logoutAction}>
                        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-400 font-medium hover:bg-red-500/10 transition-colors">
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
