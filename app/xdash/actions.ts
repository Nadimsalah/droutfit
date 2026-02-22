"use server"

import { clearAdminSession } from "@/lib/admin-auth"
import { redirect } from "next/navigation"

export async function logoutAction() {
    await clearAdminSession()
    redirect("/xdash/login")
}
