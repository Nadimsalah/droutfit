import { getDictionary } from "@/lib/get-dictionary";
import DashboardOverviewClient from "@/components/DashboardOverviewClient";
import type { Locale } from "@/lib/i18n-config";

export default async function OverviewPage(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <DashboardOverviewClient dict={dict} locale={locale} />;
}
