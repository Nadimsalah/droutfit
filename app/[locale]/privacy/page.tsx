import { getDictionary } from "@/lib/get-dictionary";
import PrivacyClient from "@/components/PrivacyClient";
import type { Locale } from "@/lib/i18n-config";

export default async function Page(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <PrivacyClient dict={dict} locale={locale} />;
}
