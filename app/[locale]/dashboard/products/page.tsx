import { getDictionary } from "@/lib/get-dictionary";
import DashboardProductsClient from "@/components/DashboardProductsClient";
import type { Locale } from "@/lib/i18n-config";

export default async function ProductsPage(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <DashboardProductsClient dict={dict} locale={locale} />;
}
