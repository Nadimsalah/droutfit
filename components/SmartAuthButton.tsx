"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface SmartAuthButtonProps {
    className?: string
    children: React.ReactNode
}

export function SmartAuthButton({ className, children }: SmartAuthButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleClick = async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                router.push('/dashboard')
            } else {
                router.push('/signup')
            }
        } catch (error) {
            console.error("Auth check failed:", error)
            router.push('/signup') // Fallback
        } finally {
            // faster UX: don't unset loading if we are navigating away (optional, but cleaner to leave it spinning)
            // But if navigation fails or is slow, we might want to reset? 
            // Let's reset only on error or if we stay. 
            // Actually router.push is void, doesn't promise completion.
            // For safety, let's keep it spinning or redirect.
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={cn(className, isLoading && "opacity-80 cursor-wait")}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Checking...
                </>
            ) : (
                children
            )}
        </button>
    )
}
