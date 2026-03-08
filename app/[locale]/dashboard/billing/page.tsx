import { getDictionary } from "@/lib/get-dictionary";
import DashboardBillingClient from "@/components/DashboardBillingClient";
import type { Locale } from "@/lib/i18n-config";

export default async function BillingPage(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <DashboardBillingClient dict={dict} locale={locale} />;
}
