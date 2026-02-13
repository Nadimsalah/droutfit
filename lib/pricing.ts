import { supabase } from "@/lib/supabase"

export const DEFAULT_PRICING = {
    SUBSCRIPTION_FEE: 5.00,
    CREDIT_PRICE_TIER_1: 0.04,
    CREDIT_PRICE_TIER_2: 0.03,
    CREDIT_PRICE_TIER_3: 0.02
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
