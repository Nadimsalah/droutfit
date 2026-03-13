import { getDictionary } from "@/lib/get-dictionary"
import DocsClient from "@/components/DocsClient"
import type { Locale } from "@/lib/i18n-config"
import type { Metadata } from 'next'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await props.params;
    const dict = await getDictionary(locale as Locale)
    return {
        title: `${dict.docsPage.title} ${dict.docsPage.titleAccent} | DrOutfit`,
        description: dict.docsPage.subtitle,
    }
}

export default async function DocsPage(props: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await props.params;
    const dict = await getDictionary(locale)
    return <DocsClient dict={dict} locale={locale} />
}
