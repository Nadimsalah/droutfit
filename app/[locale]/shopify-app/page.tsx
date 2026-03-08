import type { Locale } from "@/lib/i18n-config";
import ShopifyAppDashboard from "@/components/ShopifyAppDashboard";

export default async function ShopifyAppPage(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    return <ShopifyAppDashboard locale={locale} />;
}
