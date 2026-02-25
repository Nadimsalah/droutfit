"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
    LayoutDashboard,
    Activity,
    Zap,
    Key,
    ScrollText,
    CreditCard,

    FileText,
    MessageSquare,
    Send,
    Settings,
    Globe,
    LogOut,
    X,
    ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const mainNavigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/dashboard/products", icon: Zap },
    { name: "Logs", href: "/dashboard/logs", icon: ScrollText },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
]

const footerNavigation = [
    { name: "Get Support On Whatsapp", href: "https://wa.me/212707777721", icon: MessageSquare },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface SidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [profile, setProfile] = useState<{ fullName: string; email: string } | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('first_name, last_name')
                    .eq('id', user.id)
                    .single()

                setProfile({
                    fullName: data ? `${data.first_name || ''} ${data.last_name || ''}`.trim() || user.email?.split('@')[0] || 'User' : user.email?.split('@')[0] || 'User',
                    email: user.email || ''
                })
            }
        }
        fetchProfile()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            <div className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-full md:w-72 flex-col bg-[#0F1116] border-r border-gray-800/50 transition-all duration-300 ease-in-out md:relative",
                isOpen ? "translate-x-0" : "-translate-x-full",
                "md:translate-x-0"
            )}>
                {/* User Section */}
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <img src="/logo.png" alt="Dr Outfit" className="h-8 w-auto object-contain" />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/20 flex items-center justify-center text-white text-xs font-bold ring-2 ring-black">
                            {profile ? getInitials(profile.fullName) : '--'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-white text-sm font-bold truncate">{profile?.fullName || 'Loading...'}</span>
                            <span className="text-gray-500 text-[10px] truncate">{profile?.email || '...'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                    <nav className="space-y-1">
                        {mainNavigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group",
                                        isActive
                                            ? "bg-white text-black shadow-lg shadow-white/10"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className={cn("h-4 w-4", isActive ? "text-black" : "text-gray-500 group-hover:text-white")} />
                                    <span className="flex-1">{item.name}</span>
                                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="my-6 border-t border-gray-800/50" />

                    <nav className="space-y-1">
                        {footerNavigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-lg group"
                            >
                                <item.icon className="h-4 w-4 text-gray-500 group-hover:text-white" />
                                <span className="flex-1">{item.name}</span>
                            </Link>
                        ))}

                        <div className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-lg group cursor-pointer">
                            <div className="flex items-center gap-3 text-gray-400 group-hover:text-white">
                                <Globe className="h-4 w-4 text-gray-500 group-hover:text-white" />
                                <span>English</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-600" />
                        </div>
                    </nav>
                </div>

                <div className="p-4 mt-auto">
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all group"
                    >
                        <LogOut className="h-4 w-4 text-gray-500 group-hover:text-red-500" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    )
}
