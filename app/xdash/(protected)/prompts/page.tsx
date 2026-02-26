"use client"

import { useState, useEffect } from "react"
import { updatePromptAction } from "./actions"
import { Save, Loader2, MessageSquare, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function PromptsPage() {
    const [geminiPrompt, setGeminiPrompt] = useState("")
    const [nanoBananaPrompt, setNanoBananaPrompt] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        setLoading(true)
        try {
            const { data } = await supabase.from('system_settings').select('key, value').in('key', ['GEMINI_PROMPT', 'NANOBANANA_PROMPT'])

            if (data) {
                const gp = data.find(d => d.key === 'GEMINI_PROMPT')
                const np = data.find(d => d.key === 'NANOBANANA_PROMPT')

                if (gp) setGeminiPrompt(gp.value)
                else setGeminiPrompt("Analyze these images for virtual try-on suitability. Return 'READY'.")

                if (np) setNanoBananaPrompt(np.value)
                else setNanoBananaPrompt("high quality fashion photography, realistic lighting")
            } else {
                setGeminiPrompt("Analyze these images for virtual try-on suitability. Return 'READY'.")
                setNanoBananaPrompt("high quality fashion photography, realistic lighting")
            }
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)
        try {
            const res1 = await updatePromptAction('GEMINI_PROMPT', geminiPrompt)
            const res2 = await updatePromptAction('NANOBANANA_PROMPT', nanoBananaPrompt)

            if (res1.error || res2.error) {
                setMessage({ type: 'error', text: `Failed: ${res1.error || res2.error}` })
            } else {
                setMessage({ type: 'success', text: 'Prompts saved successfully!' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection error. Please try again.' })
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Prompt Manager</h1>
                    <p className="text-gray-400 mt-1">Manage instructions sent to Gemini and NanoBanana.</p>
                </div>
                <button
                    onClick={loadSettings}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="Refresh Settings"
                >
                    <RefreshCw className="h-5 w-5" />
                </button>
            </div>

            <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-8 space-y-8">

                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        AI Generation Prompts
                    </h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400">Gemini Demo Prompt</label>
                            <textarea
                                rows={4}
                                value={geminiPrompt}
                                onChange={(e) => setGeminiPrompt(e.target.value)}
                                className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all font-mono text-sm resize-y"
                                placeholder="Analyze these images for virtual try-on suitability. Return 'READY'."
                            />
                            <p className="text-xs text-gray-500">This instruction is sent to Gemini 1.5 Flash during the Virtual Try-On Demo pipeline.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400">NanoBanana Virtual Try-On Prompt</label>
                            <textarea
                                rows={4}
                                value={nanoBananaPrompt}
                                onChange={(e) => setNanoBananaPrompt(e.target.value)}
                                className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all font-mono text-sm resize-y"
                                placeholder="high quality fashion photography, realistic lighting"
                            />
                            <p className="text-xs text-gray-500">This prompt acts as the style instructions when NanoBanana generates the final Try-On image.</p>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-sm font-bold flex items-center justify-center ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {message.text}
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Save Prompts
                    </button>
                </div>
            </div>
        </div>
    )
}
