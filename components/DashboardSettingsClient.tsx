"use client"

import { useState, useEffect } from "react"
import { User, Store, Globe, Link as LinkIcon, Save, Mail, Building, Loader2, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Toast from "@/components/Toast"

export default function DashboardSettingsClient({ dict, locale }: { dict: any, locale: string }) {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [toastType, setToastType] = useState<"success" | "error">("success")

    const [user, setUser] = useState({
        id: "",
        firstName: "",
        lastName: "",
        email: ""
    })

    const [store, setStore] = useState({
        name: "",
        website: "",
        domain: "",
        ipLimit: 5
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser()

                if (authUser) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', authUser.id)
                        .single()

                    if (profile) {
                        setUser({
                            id: authUser.id,
                            firstName: profile.first_name || "",
                            lastName: profile.last_name || "",
                            email: authUser.email || ""
                        })
                        setStore({
                            name: profile.store_name || "",
                            website: profile.store_website || "",
                            domain: profile.store_domain || "",
                            ipLimit: profile.ip_limit || 5
                        })
                    } else {
                        setUser(prev => ({ ...prev, id: authUser.id, email: authUser.email || "" }))
                    }
                }
            } catch (error: any) {
                if (error.name === 'AbortError' || error.message?.toLowerCase().includes('abort')) {
                    // Ignore
                } else {
                    console.error("Error fetching settings data:", error);
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const showNotification = (message: string, type: "success" | "error") => {
        setToastMessage(message)
        setToastType(type)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
    }

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value })
    }

    const handleStoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        if (name === "name") {
            const domain = value.toLowerCase().replace(/[^a-z0-9]/g, "")
            setStore({ ...store, name: value, domain })
        } else if (name === "ipLimit") {
            setStore({ ...store, ipLimit: parseInt(value) || 0 })
        } else {
            setStore({ ...store, [name]: value })
        }
    }

    const saveUser = async () => {
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            showNotification(dict.settingsPage.userUpdatedSuccess, "success")
        } catch (error) {
            console.error("Error saving user:", error)
            showNotification(dict.settingsPage.userUpdatedError, "error")
        } finally {
            setIsSaving(false)
        }
    }

    const saveStore = async () => {
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    store_name: store.name,
                    store_website: store.website,
                    store_domain: store.domain,
                    ip_limit: store.ipLimit,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            showNotification(dict.settingsPage.storeUpdatedSuccess, "success")
        } catch (error: any) {
            console.error("Error saving store:", error)
            showNotification(`${dict.settingsPage.storeUpdatedError}: ${error.message || dict.common.unknownError}`, "error")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-12 relative" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <Toast
                message={toastMessage}
                isVisible={showToast}
                type={toastType}
                onClose={() => setShowToast(false)}
            />

            <div className="text-start">
                <h1 className="text-3xl font-bold text-white tracking-tight">{dict.settingsPage.title}</h1>
                <p className="text-gray-400 text-sm font-medium mt-1">
                    {dict.settingsPage.description}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 text-start">
                {/* User Information */}
                <div className="bg-[#13171F] p-6 rounded-2xl border border-gray-800 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">{dict.settingsPage.userInformation}</h3>
                            <p className="text-gray-500 text-xs mt-0.5">{dict.settingsPage.managePersonalDetails}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">{dict.settingsPage.firstName}</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={user.firstName}
                                    onChange={handleUserChange}
                                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 text-start"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">{dict.settingsPage.lastName}</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={user.lastName}
                                    onChange={handleUserChange}
                                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 text-start"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">{dict.settingsPage.emailAddress}</label>
                            <div className="relative">
                                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    disabled
                                    className="w-full bg-[#0B0E14]/50 border border-gray-800 rounded-lg ps-10 pe-4 py-2.5 text-gray-400 text-sm font-medium cursor-not-allowed text-start"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={saveUser}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {dict.settingsPage.saveChanges}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Store Information */}
                <div className="bg-[#13171F] p-6 rounded-2xl border border-gray-800 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <Store className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">{dict.settingsPage.storeSettings}</h3>
                            <p className="text-gray-500 text-xs mt-0.5">{dict.settingsPage.configureIntegration}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">{dict.settingsPage.storeName}</label>
                            <div className="relative">
                                <Building className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input
                                    type="text"
                                    name="name"
                                    value={store.name}
                                    onChange={handleStoreChange}
                                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-lg ps-10 pe-4 py-2.5 text-white text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600 text-start"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">{dict.settingsPage.yourWebsite}</label>
                            <div className="relative">
                                <Globe className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input
                                    type="url"
                                    name="website"
                                    value={store.website}
                                    onChange={handleStoreChange}
                                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-lg ps-10 pe-4 py-2.5 text-white text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600 text-start"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">{dict.settingsPage.dailyLimit}</label>
                            <div className="relative">
                                <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">#</span>
                                <input
                                    type="number"
                                    name="ipLimit"
                                    value={store.ipLimit || ''}
                                    onChange={handleStoreChange}
                                    min="1"
                                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-lg ps-10 pe-4 py-2.5 text-white text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600 text-start"
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                {dict.settingsPage.limitNote}
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">{dict.settingsPage.widgetUrl}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <LinkIcon className="h-4 w-4 text-purple-500" />
                                </div>
                                <div className="w-full bg-[#0B0E14] border border-gray-800 rounded-lg ps-10 pe-4 py-3 text-gray-400 text-sm font-mono flex items-center overflow-x-auto text-start">
                                    <span className="text-gray-600">www.</span>
                                    <span className="text-white font-bold">{store.domain || "your-store"}</span>
                                    <span className="text-gray-600">.droutfit.com</span>
                                </div>
                                <div className="absolute inset-0 border border-purple-500/20 rounded-lg pointer-events-none group-hover:border-purple-500/50 transition-colors"></div>
                            </div>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                {dict.settingsPage.urlAutoGenerated}
                            </p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={saveStore}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {dict.settingsPage.saveStoreInfo}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
