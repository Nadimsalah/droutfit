"use server"

import { requireAdmin } from "@/lib/admin-auth"
import AdminSidebar from "./components/AdminSidebar"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await requireAdmin()

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#05070a] text-white font-sans overflow-hidden">
            {/* Sidebar & Mobile Header */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[#05070a]">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
