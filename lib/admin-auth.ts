"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function setAdminSession() {
    const cookieStore = await cookies()
    cookieStore.set("admin_session", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
    })
}

export async function clearAdminSession() {
    const cookieStore = await cookies()
    cookieStore.delete("admin_session")
}

export async function checkAdminSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")
    return session?.value === "true"
}

export async function requireAdmin() {
    const isAdmin = await checkAdminSession()
    if (!isAdmin) {
        redirect("/xdash/login")
    }
}
