"use client"

import { Bell, Search } from "lucide-react"

export function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b-2 border-black bg-white px-6">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-black font-bold" />
                    <input
                        type="search"
                        placeholder="Search..."
                        className="h-10 w-64 border-2 border-black bg-white pl-10 pr-4 text-sm font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-500"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 border-2 border-black bg-white shadow-[4px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]">
                    <Bell className="h-5 w-5 text-black" />
                    <span className="absolute top-0 right-0 h-3 w-3 border-2 border-black bg-red-500" />
                </button>
                <div className="h-10 w-10 border-2 border-black bg-yellow-400 flex items-center justify-center text-sm font-bold text-black shadow-[4px_4px_0px_0px_black]">
                    JD
                </div>
            </div>
        </header>
    )
}
