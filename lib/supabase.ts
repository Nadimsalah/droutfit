
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadImage(file: File, bucket: string = 'tryimages'): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
            try {
                const response = await fetch('/api/upload-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        base64Image: reader.result,
                        bucketName: bucket
                    })
                })

                const data = await response.json()
                if (!response.ok) throw new Error(data.error || 'Upload failed')

                resolve(data.url)
            } catch (err) {
                console.error("Upload routing failed:", err)
                reject(err)
            }
        }
        reader.onerror = error => reject(error)
    })
}
