import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";
import ForgotPasswordClient from "@/components/ForgotPasswordClient";

export default async function Page(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <ForgotPasswordClient dict={dict} locale={locale} />;
}
