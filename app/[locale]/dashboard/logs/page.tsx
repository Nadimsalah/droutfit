import { getDictionary } from "@/lib/get-dictionary";
import DashboardLogsClient from "@/components/DashboardLogsClient";
import type { Locale } from "@/lib/i18n-config";

export default async function LogsPage(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <DashboardLogsClient dict={dict} locale={locale} />;
}
