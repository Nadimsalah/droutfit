import { NextResponse } from "next/server"
import { checkAdminSession } from "@/lib/admin-auth"

export async function middleware(request: Request) {
    // This is just a helper, the main security is done via layout.tsx
    // However, for strictly protecting API routes or if layout doesn't catch everything
    // we can implement middleware here if using Next.js Middleware.

    // For now, simpler route protection in /xdash/layout.tsx is robust enough 
    // for this "hidden" dashboard scope.
    return NextResponse.next()
}
