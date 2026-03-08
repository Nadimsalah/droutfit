import { getDictionary } from "@/lib/get-dictionary";
import ConnectClient from "@/components/ConnectClient";
import type { Locale } from "@/lib/i18n-config";

export default async function ShopifyConnectPage(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <ConnectClient dict={dict} locale={locale} />;
}
