import { getDictionary } from "@/lib/get-dictionary";
import DashboardAddProductClient from "@/components/DashboardAddProductClient";
import type { Locale } from "@/lib/i18n-config";

export default async function AddProductPage(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <DashboardAddProductClient dict={dict} locale={locale} />;
}
