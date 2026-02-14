"use client"

import { useState } from "react"
import { X, Loader2, Save } from "lucide-react"

interface EditUserModalProps {
    user: any
    isOpen: boolean
    onClose: () => void
    onSave: (userId: string, data: { credits: number, is_subscribed: boolean }) => Promise<void>
}

export function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
    const [credits, setCredits] = useState(user?.credits || 0)
    const [isSubscribed, setIsSubscribed] = useState(user?.is_subscribed || false)
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await onSave(user.id, { credits: Number(credits), is_subscribed: isSubscribed })
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#13171F] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
                    <h3 className="text-lg font-bold text-white">Edit User</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">User</label>
                            <div className="p-3 bg-[#0B0E14] border border-gray-800 rounded-xl text-sm text-gray-300">
                                {user.email}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Credits</label>
                            <input
                                type="number"
                                value={credits}
                                onChange={(e) => setCredits(e.target.value)}
                                className="w-full bg-[#0B0E14] border border-gray-800 text-white p-3 rounded-xl focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-[#0B0E14] border border-gray-800 rounded-xl">
                            <span className="text-sm font-medium text-white">Pro Subscription</span>
                            <div
                                onClick={() => setIsSubscribed(!isSubscribed)}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${isSubscribed ? 'bg-blue-500' : 'bg-gray-700'}`}
                            >
                                <div className={`h-4 w-4 bg-white rounded-full transition-transform ${isSubscribed ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
