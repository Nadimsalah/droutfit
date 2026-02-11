"use client"

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">Settings</h2>
                <p className="text-lg font-bold text-gray-600 border-l-4 border-black pl-4 mt-2">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="grid gap-8">
                <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_black]">
                    <div className="p-6 border-b-2 border-black bg-pink-200">
                        <h3 className="text-xl font-black uppercase">Profile Information</h3>
                    </div>
                    <div className="p-6">
                        <p className="text-sm font-bold text-gray-600 mb-6">
                            Update your photo and personal details.
                        </p>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase">
                                    First name
                                </label>
                                <input
                                    type="text"
                                    placeholder="JOHN"
                                    className="flex h-12 w-full border-2 border-black bg-white px-3 py-1 text-sm font-bold shadow-[4px_4px_0px_0px_black] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_black] focus:outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase">
                                    Last name
                                </label>
                                <input
                                    type="text"
                                    placeholder="DOE"
                                    className="flex h-12 w-full border-2 border-black bg-white px-3 py-1 text-sm font-bold shadow-[4px_4px_0px_0px_black] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_black] focus:outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-black uppercase">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="john.doe@example.com"
                                    className="flex h-12 w-full border-2 border-black bg-white px-3 py-1 text-sm font-bold shadow-[4px_4px_0px_0px_black] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_black] focus:outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button className="flex items-center gap-2 border-2 border-black bg-black px-6 py-3 text-sm font-black text-white hover:bg-gray-800 shadow-[4px_4px_0px_0px_#ff90e8] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#ff90e8] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_black]">
                    <div className="p-6 border-b-2 border-black bg-blue-200">
                        <h3 className="text-xl font-black uppercase">Notifications</h3>
                    </div>
                    <div className="p-6">
                        <p className="text-sm font-bold text-gray-600 mb-6">
                            Configure how you receive notifications.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4 p-4 border-2 border-black bg-gray-50 shadow-[4px_4px_0px_0px_black] hover:bg-white transition-colors">
                                <input type="checkbox" id="email-notif" className="h-6 w-6 border-2 border-black text-black focus:ring-black rounded-none" checked readOnly />
                                <label htmlFor="email-notif" className="text-sm font-black uppercase cursor-pointer">
                                    Email Notifications
                                </label>
                            </div>
                            <div className="flex items-center space-x-4 p-4 border-2 border-black bg-gray-50 shadow-[4px_4px_0px_0px_black] hover:bg-white transition-colors">
                                <input type="checkbox" id="sms-notif" className="h-6 w-6 border-2 border-black text-black focus:ring-black rounded-none" />
                                <label htmlFor="sms-notif" className="text-sm font-black uppercase cursor-pointer">
                                    SMS Notifications
                                </label>
                            </div>
                            <div className="flex items-center space-x-4 p-4 border-2 border-black bg-gray-50 shadow-[4px_4px_0px_0px_black] hover:bg-white transition-colors">
                                <input type="checkbox" id="marketing-notif" className="h-6 w-6 border-2 border-black text-black focus:ring-black rounded-none" />
                                <label htmlFor="marketing-notif" className="text-sm font-black uppercase cursor-pointer">
                                    Marketing Emails
                                </label>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-4">
                            <button className="flex items-center gap-2 border-2 border-black bg-white px-6 py-3 text-sm font-black text-black hover:bg-red-200 shadow-[4px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase">
                                Cancel
                            </button>
                            <button className="flex items-center gap-2 border-2 border-black bg-yellow-400 px-6 py-3 text-sm font-black text-black hover:bg-yellow-300 shadow-[4px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase">
                                Save Preferences
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
