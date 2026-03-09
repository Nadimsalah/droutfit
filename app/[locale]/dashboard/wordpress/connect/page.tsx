import { getDictionary } from "@/lib/get-dictionary";
import WPConnectClient from "@/components/WPConnectClient";
import type { Locale } from "@/lib/i18n-config";

export default async function WordPressConnectPage(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <WPConnectClient dict={dict} locale={locale} />;
}
