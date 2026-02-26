import { supabase } from "@/lib/supabase"

export async function getSystemSetting(key: string, defaultValue: string = ""): Promise<string> {
    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', key)
            .single()

        if (error || !data) return defaultValue
        return data.value || defaultValue
    } catch {
        return defaultValue
    }
}

export async function updateSystemSetting(key: string, value: string) {
    try {
        const { error } = await supabase.from('system_settings').upsert({
            key,
            value,
            updated_at: new Date().toISOString()
        })
        return { success: !error, error }
    } catch (error: any) {
        return { success: false, error }
    }
}
