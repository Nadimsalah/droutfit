"use client"

import { useState, useEffect } from "react"
import { getPricing, PricingConfig, DEFAULT_PRICING } from "@/lib/pricing"
import { updateAllPricingAction } from "./actions"
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

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        Credit Pricing Packages
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Package 1 */}
                        <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Package 1</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400">Total Images</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={config.PACKAGE_1_AMOUNT}
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
                                        value={config.PACKAGE_1_PRICE}
                                        onChange={(e) => handleChange('PACKAGE_1_PRICE', e.target.value)}
                                        className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-2 pl-7 pr-4 focus:outline-none focus:border-green-500 transition-all font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Package 2 */}
                        <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Package 2</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400">Total Images</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={config.PACKAGE_2_AMOUNT}
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
                                        value={config.PACKAGE_2_PRICE}
                                        onChange={(e) => handleChange('PACKAGE_2_PRICE', e.target.value)}
                                        className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-2 pl-7 pr-4 focus:outline-none focus:border-green-500 transition-all font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Package 3 */}
                        <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Package 3</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400">Total Images</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={config.PACKAGE_3_AMOUNT}
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
                                        value={config.PACKAGE_3_PRICE}
                                        onChange={(e) => handleChange('PACKAGE_3_PRICE', e.target.value)}
                                        className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-2 pl-7 pr-4 focus:outline-none focus:border-green-500 transition-all font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Package 4 */}
                        <div className="space-y-4 p-4 border border-gray-800 rounded-xl bg-white/5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Package 4</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400">Total Images</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={config.PACKAGE_4_AMOUNT}
                                    onChange={(e) => handleChange('PACKAGE_4_AMOUNT', e.target.value)}
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
                                        value={config.PACKAGE_4_PRICE}
                                        onChange={(e) => handleChange('PACKAGE_4_PRICE', e.target.value)}
                                        className="w-full bg-[#1A1D24] border border-gray-800 text-white rounded-xl py-2 pl-7 pr-4 focus:outline-none focus:border-green-500 transition-all font-mono text-sm"
                                    />
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
                                    value={config.CUSTOM_CREDIT_PRICE}
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
                                    value={config.MINIMUM_CUSTOM_AMOUNT}
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
