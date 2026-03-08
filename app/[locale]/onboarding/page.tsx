import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";
import OnboardingClient from "@/components/OnboardingClient";

export default async function Page(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <OnboardingClient dict={dict} locale={locale} />;
}
