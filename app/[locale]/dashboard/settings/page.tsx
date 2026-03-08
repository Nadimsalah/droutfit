import { getDictionary } from "@/lib/get-dictionary";
import DashboardSettingsClient from "@/components/DashboardSettingsClient";
import type { Locale } from "@/lib/i18n-config";

export default async function SettingsPage(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <DashboardSettingsClient dict={dict} locale={locale} />;
}
