"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Package,
    BarChart3,
    CreditCard,
    Settings,
    LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Statistics", href: "/dashboard/statistics", icon: BarChart3 },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col border-r-2 border-black bg-white text-black">
            <div className="flex h-16 items-center px-6 border-b-2 border-black bg-yellow-400">
                <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-2 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 border-2 border-transparent px-3 py-2 text-sm font-bold transition-all",
                                    isActive
                                        ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,144,232,1)] translate-x-1 translate-y-1"
                                        : "text-black hover:bg-pink-300 hover:border-black hover:shadow-[2px_2px_0px_0px_black]"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t-2 border-black p-4 bg-pink-200">
                <button className="flex w-full items-center gap-3 border-2 border-black bg-white px-3 py-2 text-sm font-bold shadow-[4px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
