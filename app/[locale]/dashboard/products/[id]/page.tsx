import { getDictionary } from "@/lib/get-dictionary";
import DashboardProductDetailsClient from "@/components/DashboardProductDetailsClient";
import type { Locale } from "@/lib/i18n-config";

export default async function ProductDetailsPage(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const { id, locale } = params as { id: string; locale: Locale };
    const dict = await getDictionary(locale);

    return <DashboardProductDetailsClient dict={dict} locale={locale} />;
}
