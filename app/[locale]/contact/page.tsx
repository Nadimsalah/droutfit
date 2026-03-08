import { getDictionary } from "@/lib/get-dictionary";
import ContactClient from "@/components/ContactClient";
import type { Locale } from "@/lib/i18n-config";

export default async function Page(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const dict = await getDictionary(locale);

    return <ContactClient dict={dict} locale={locale} />;
}
