import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Locale detection
    const pathname = request.nextUrl.pathname
    const pathnameIsMissingLocale = ['en', 'fr', 'ar'].every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    // Paths that should not be localized
    const isPublicStaticOrApi =
        pathname.startsWith('/api') ||
        pathname.startsWith('/widget') ||
        pathname.startsWith('/xdash') ||
        pathname === '/icon.png' ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml';

    // Redirect if there is no locale and it's not a special path
    if (!isPublicStaticOrApi && pathnameIsMissingLocale) {
        // Simple logic for now: default to English
        const locale = 'en'
        const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}${request.nextUrl.search}`, request.url)
        const redirectResponse = NextResponse.redirect(newUrl)

        // IMPORTANT: Attach iframe CSP header to the redirect itself!
        // Otherwise, browsers will block the 307 redirect inside the Shopify iframe and abort the signal.
        redirectResponse.headers.set(
            "Content-Security-Policy",
            "frame-ancestors 'self' https://admin.shopify.com https://*.myshopify.com https://*.shopify.com"
        )
        return redirectResponse
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // This will refresh the session if it's expired
    await supabase.auth.getUser()

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
