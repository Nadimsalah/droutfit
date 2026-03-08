import { getDictionary } from "@/lib/get-dictionary";
import StatisticsClient from "@/components/StatisticsClient";
import type { Locale } from "@/lib/i18n-config";

export default async function StatisticsPage(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <StatisticsClient dict={dict} />;
}
