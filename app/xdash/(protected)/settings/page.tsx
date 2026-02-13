"use client"

import { useState, useEffect } from "react"
import { getPricing, updatePricing, PricingConfig, DEFAULT_PRICING } from "@/lib/pricing"
import { Save, Loader2, DollarSign, RefreshCw } from "lucide-react"

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
            // Update all keys concurrently
            await Promise.all(
                Object.keys(config).map(key =>
                    updatePricing(key as keyof PricingConfig, config[key as keyof PricingConfig])
                )
            )
            setMessage({ type: 'success', text: 'Settings saved successfully!' })
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save settings.' })
        }
        setSaving(false)
    }

    const handleChange = (key: keyof PricingConfig, value: string) => {
        const numValue = parseFloat(value)
        if (!isNaN(numValue)) {
            setConfig(prev => ({ ...prev, [key]: numValue }))
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
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
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
                {/* Subscription Settings */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-blue-500" />
                        Subscription Pricing
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Acess Fee</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={config.SUBSCRIPTION_FEE}
                                    onChange={(e) => handleChange('SUBSCRIPTION_FEE', e.target.value)}
                                    className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-3 pl-8 pr-4 focus:outline-none focus:border-blue-500 transition-all font-mono"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Base monthly fee for all merchants.</p>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-800" />

                {/* Credit Pricing Tiers */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        Credit Pricing Tiers
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tier 1 (Base)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={config.CREDIT_PRICE_TIER_1}
                                    onChange={(e) => handleChange('CREDIT_PRICE_TIER_1', e.target.value)}
                                    className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-3 pl-8 pr-4 focus:outline-none focus:border-green-500 transition-all font-mono"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Price per image for &lt;500.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tier 2 (500+)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={config.CREDIT_PRICE_TIER_2}
                                    onChange={(e) => handleChange('CREDIT_PRICE_TIER_2', e.target.value)}
                                    className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-3 pl-8 pr-4 focus:outline-none focus:border-green-500 transition-all font-mono"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Price per image for 500-1000.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tier 3 (1000+)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={config.CREDIT_PRICE_TIER_3}
                                    onChange={(e) => handleChange('CREDIT_PRICE_TIER_3', e.target.value)}
                                    className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-3 pl-8 pr-4 focus:outline-none focus:border-green-500 transition-all font-mono"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Price per image for 1000+.</p>
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
