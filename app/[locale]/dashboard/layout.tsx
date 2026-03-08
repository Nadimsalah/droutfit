import { getDictionary } from "@/lib/get-dictionary";
import DashboardLayoutClient from "@/components/DashboardLayoutClient";
import type { Locale } from "@/lib/i18n-config";

export default async function DashboardLayout(props: {
    children: React.ReactNode;
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return (
        <DashboardLayoutClient dict={dict} locale={locale}>
            {props.children}
        </DashboardLayoutClient>
    );
}
