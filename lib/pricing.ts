import { supabase } from "@/lib/supabase"

export const DEFAULT_PRICING = {
    FREE_AMOUNT: 100,
    PACKAGE_1_AMOUNT: 3000,
    PACKAGE_1_PRICE: 60,
    PACKAGE_2_AMOUNT: 10000,
    PACKAGE_2_PRICE: 160,
    PACKAGE_3_AMOUNT: 30000,
    PACKAGE_3_PRICE: 460,
    PACKAGE_4_AMOUNT: 50000,
    PACKAGE_4_PRICE: 750,
    CUSTOM_CREDIT_PRICE: 0.015,
    MINIMUM_CUSTOM_AMOUNT: 50000,
    // AI Provider Settings
    GEMINI_API_KEY: '',
    LANDING_DEMO_IMAGE: '/alaska-jacket.webp',
    WP_PLUGIN_ZIP_URL: '/plugins/droutfit-try-on.zip'
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
