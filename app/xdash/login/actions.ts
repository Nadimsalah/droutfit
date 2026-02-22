"use server"

import { setAdminSession } from "@/lib/admin-auth"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
    const pin = formData.get("pin")?.toString()

    if (pin === "8808") {
        await setAdminSession()
        redirect("/xdash")
    }

    return { error: "Invalid PIN" }
}
