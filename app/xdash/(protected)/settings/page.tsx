"use client"

import { useState, useEffect } from "react"
import { getPricing, PricingConfig, DEFAULT_PRICING } from "@/lib/pricing"
import { updateAllPricingAction } from "./actions"
import { Save, Loader2, DollarSign, RefreshCw, Cpu, Key, Image as ImageIcon, Upload } from "lucide-react"

export default function SettingsPage() {
    const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        setLoading(true)
        const pricing = await getPricing()
        setConfig(pricing)
        setLoading(false)
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)
        try {
            const res = await updateAllPricingAction(config)

            if (res.error) {
                setMessage({ type: 'error', text: `Failed: ${res.error}` })
            } else {
                setMessage({ type: 'success', text: 'Settings saved successfully!' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection error. Please try again.' })
        }
        setSaving(false)
    }

    const handleChange = (key: keyof PricingConfig, value: string) => {
        // Check if the key should be a number
        const numberFields: Array<keyof PricingConfig> = [
            'PACKAGE_1_AMOUNT', 'PACKAGE_1_PRICE',
            'PACKAGE_2_AMOUNT', 'PACKAGE_2_PRICE',
            'PACKAGE_3_AMOUNT', 'PACKAGE_3_PRICE',
            'PACKAGE_4_AMOUNT', 'PACKAGE_4_PRICE',
            'CUSTOM_CREDIT_PRICE', 'MINIMUM_CUSTOM_AMOUNT'
        ]

        if (numberFields.includes(key)) {
            const numValue = parseFloat(value)
            if (!isNaN(numValue)) {
                setConfig(prev => ({ ...prev, [key]: numValue }))
            } else if (value === '') {
                // @ts-ignore
                setConfig(prev => ({ ...prev, [key]: 0 }))
            }
        } else {
            // String fields
            setConfig(prev => ({ ...prev, [key]: value }))
        }
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
                    <h1 className="text-2xl font-bold text-white tracking-tight">Set pricing</h1>
                    <p className="text-gray-400 mt-1">Manage global pricing and configuration.</p>
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

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        Credit Pricing Packages
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Package 1 */}
                        <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Package 1 (Starter)</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400">Total Images</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={config.PACKAGE_1_AMOUNT ?? ''}
                                    onChange={(e) => handleChange('PACKAGE_1_AMOUNT', e.target.value)}
                                    className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-2 px-4 focus:outline-none focus:border-green-500 transition-all font-mono text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400">Price ($)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={config.PACKAGE_1_PRICE ?? ''}
                                        onChange={(e) => handleChange('PACKAGE_1_PRICE', e.target.value)}
                                        className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-2 pl-7 pr-4 focus:outline-none focus:border-green-500 transition-all font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Package 2 */}
                        <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Package 2 (Growth)</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400">Total Images</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={config.PACKAGE_2_AMOUNT ?? ''}
                                    onChange={(e) => handleChange('PACKAGE_2_AMOUNT', e.target.value)}
                                    className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-2 px-4 focus:outline-none focus:border-green-500 transition-all font-mono text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400">Price ($)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={config.PACKAGE_2_PRICE ?? ''}
                                        onChange={(e) => handleChange('PACKAGE_2_PRICE', e.target.value)}
                                        className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-2 pl-7 pr-4 focus:outline-none focus:border-green-500 transition-all font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Package 3 */}
                        <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Package 3 (Elite)</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400">Total Images</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={config.PACKAGE_3_AMOUNT ?? ''}
                                    onChange={(e) => handleChange('PACKAGE_3_AMOUNT', e.target.value)}
                                    className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-2 px-4 focus:outline-none focus:border-green-500 transition-all font-mono text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400">Price ($)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={config.PACKAGE_3_PRICE ?? ''}
                                        onChange={(e) => handleChange('PACKAGE_3_PRICE', e.target.value)}
                                        className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-2 pl-7 pr-4 focus:outline-none focus:border-green-500 transition-all font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="my-8 border-t border-gray-800" />

                    <div className="my-8 border-t border-gray-800" />

                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-purple-500" />
                            Landing Page Demo Image
                        </h2>

                        <div className="grid md:grid-cols-1 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-4 border border-gray-800 rounded-xl p-6 bg-white/[0.02]">
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        {/* Current Image Preview */}
                                        <div className="w-full md:w-32 aspect-[3/4] rounded-xl bg-[#1A1D24] border border-gray-800 overflow-hidden flex-shrink-0 relative group">
                                            {config.LANDING_DEMO_IMAGE ? (
                                                <img
                                                    src={config.LANDING_DEMO_IMAGE}
                                                    alt="Demo Image"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-gray-800" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Upload / URL Input */}
                                        <div className="flex-1 space-y-4 w-full">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Image URL</label>
                                                <input
                                                    type="text"
                                                    value={config.LANDING_DEMO_IMAGE || ''}
                                                    onChange={(e) => handleChange('LANDING_DEMO_IMAGE', e.target.value)}
                                                    placeholder="Enter Image URL"
                                                    className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-2 px-4 focus:outline-none focus:border-purple-500 transition-all font-mono text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="file"
                                                    id="demo-image-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            try {
                                                                const { uploadImage } = await import("@/lib/supabase")
                                                                setSaving(true)
                                                                const url = await uploadImage(file, 'public_assets')
                                                                handleChange('LANDING_DEMO_IMAGE', url)
                                                                setSaving(false)
                                                            } catch (err) {
                                                                setMessage({ type: 'error', text: 'Upload failed. Please try again.' })
                                                                setSaving(false)
                                                            }
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor="demo-image-upload"
                                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2"
                                                >
                                                    <Upload className="h-3.5 w-3.5" />
                                                    Upload New Image
                                                </label>
                                                <p className="text-[9px] text-gray-600 font-medium italic">
                                                    Recommended: 4:5 aspect ratio, high resolution.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="my-8 border-t border-gray-800" />

                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-blue-500" />
                            AI Engine (Google Gemini)
                        </h2>

                        <div className="grid md:grid-cols-1 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Key className="h-4 w-4" />
                                        Google (Gemini) API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={config.GEMINI_API_KEY || ''}
                                        onChange={(e) => handleChange('GEMINI_API_KEY', e.target.value)}
                                        placeholder="Enter Gemini API Key"
                                        className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all font-mono"
                                    />
                                    <p className="text-xs text-gray-500 italic">
                                        Google Gemini runs at lowest possible cost (~$0.0003 per generation).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="my-8 border-t border-gray-800" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                Custom Amount Base Price
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={config.CUSTOM_CREDIT_PRICE ?? ''}
                                    onChange={(e) => handleChange('CUSTOM_CREDIT_PRICE', e.target.value)}
                                    className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-3 pl-8 pr-4 focus:outline-none focus:border-green-500 transition-all font-mono"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Price per image when user selects a custom quantity not matching a package.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 text-blue-500" />
                                Minimum Custom Amount Order
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="1"
                                    value={config.MINIMUM_CUSTOM_AMOUNT ?? ''}
                                    onChange={(e) => handleChange('MINIMUM_CUSTOM_AMOUNT', e.target.value)}
                                    className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all font-mono"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Minimum number of images a user must order when selecting a custom amount.</p>
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
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
