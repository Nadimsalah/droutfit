
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadImage(file: File, bucket: string = 'tryimages'): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file)

    if (uploadError) {
        console.error('Upload Error:', uploadError)
        throw new Error(uploadError.message)
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return data.publicUrl
}
