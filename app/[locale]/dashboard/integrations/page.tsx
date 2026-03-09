import { getDictionary } from "@/lib/get-dictionary";
import IntegrationsClient from "@/components/IntegrationsClient";
import type { Locale } from "@/lib/i18n-config";

export default async function IntegrationsPage(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <IntegrationsClient dict={dict} locale={locale} />;
}
