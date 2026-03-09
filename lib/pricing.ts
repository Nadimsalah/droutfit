import { supabase } from "@/lib/supabase"

export const DEFAULT_PRICING = {
    PACKAGE_1_AMOUNT: 500,
    PACKAGE_1_PRICE: 26.19,
    PACKAGE_2_AMOUNT: 1500,
    PACKAGE_2_PRICE: 62.29,
    PACKAGE_3_AMOUNT: 3500,
    PACKAGE_3_PRICE: 113.89,
    PACKAGE_4_AMOUNT: 5000,
    PACKAGE_4_PRICE: 150,
    CUSTOM_CREDIT_PRICE: 0.028,
    MINIMUM_CUSTOM_AMOUNT: 50000,
    // AI Provider Settings
    GEMINI_API_KEY: '',
    LANDING_DEMO_IMAGE: '/alaska-jacket.webp'
}

export type PricingConfig = typeof DEFAULT_PRICING

export async function getPricing(): Promise<PricingConfig> {
    const { data, error } = await supabase.from('system_settings').select('*')

    // Fallback to defaults if error or empty
    if (error || !data || data.length === 0) return DEFAULT_PRICING

    const config = { ...DEFAULT_PRICING }
    data.forEach((setting: any) => {
        if (Object.prototype.hasOwnProperty.call(config, setting.key)) {
            const defaultValue = DEFAULT_PRICING[setting.key as keyof PricingConfig]
            if (typeof defaultValue === 'number') {
                // @ts-ignore
                config[setting.key as keyof PricingConfig] = parseFloat(setting.value)
            } else {
                // @ts-ignore
                config[setting.key as keyof PricingConfig] = setting.value
            }
        }
    })
    return config
}

export async function updatePricing(key: keyof PricingConfig, value: number | string) {
    const { error } = await supabase.from('system_settings').upsert({
        key,
        value: value.toString(),
        updated_at: new Date().toISOString()
    })
    return { error }
}
