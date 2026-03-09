import { redirect } from "next/navigation";
import { Locale } from "@/lib/i18n-config";

export default async function WordPressPage(props: {
    params: Promise<any>;
}) {
    const params = await props.params;
    const locale = params.locale as Locale;

    redirect(`/${locale}/dashboard/integrations`);
}
