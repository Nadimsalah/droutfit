import { supabase } from "@/lib/supabase"

export const DEFAULT_PRICING = {
    PACKAGE_1_AMOUNT: 100,
    PACKAGE_1_PRICE: 5,
    PACKAGE_2_AMOUNT: 1000,
    PACKAGE_2_PRICE: 30,
    PACKAGE_3_AMOUNT: 2000,
    PACKAGE_3_PRICE: 50,
    PACKAGE_4_AMOUNT: 5000,
    PACKAGE_4_PRICE: 150,
    CUSTOM_CREDIT_PRICE: 0.028
}

export type PricingConfig = typeof DEFAULT_PRICING

export async function getPricing(): Promise<PricingConfig> {
    const { data, error } = await supabase.from('system_settings').select('*')

    // Fallback to defaults if error or empty
    if (error || !data || data.length === 0) return DEFAULT_PRICING

    const pricing = { ...DEFAULT_PRICING }
    data.forEach((setting: any) => {
        if (Object.prototype.hasOwnProperty.call(pricing, setting.key)) {
            // @ts-ignore
            pricing[setting.key as keyof PricingConfig] = parseFloat(setting.value)
        }
    })
    return pricing
}

export async function updatePricing(key: keyof PricingConfig, value: number) {
    const { error } = await supabase.from('system_settings').upsert({
        key,
        value: value.toString(),
        updated_at: new Date().toISOString()
    })
    return { error }
}
