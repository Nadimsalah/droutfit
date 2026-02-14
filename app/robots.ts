import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/dashboard/private/', // Example of protected route
        },
        sitemap: 'https://droutfit.com/sitemap.xml',
    }
}
