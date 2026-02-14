"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Search, MoreHorizontal, Shield, Trash2, Ban, Pencil } from "lucide-react"
import { deleteUserAction, updateUserAction } from "./actions"
import { EditUserModal } from "../components/EditUserModal"

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [editingUser, setEditingUser] = useState<any>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleUpdate = async (userId: string, data: { credits: number, is_subscribed: boolean }) => {
        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, ...data } : u))

        const result = await updateUserAction(userId, data)

        if (result.error) {
            alert("Failed to update: " + result.error)
            fetchUsers()
        }
    }

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return

        try {
            // Delete from profiles (FK should handle auth.users if configured, but usually we can't delete auth.users from client)
            // Ideally we need a server action or admin API to delete from auth.users.
            // For now, we'll try to delete from profiles directly via RLS.
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId)

            if (error) throw error

            setUsers(users.filter(u => u.id !== userId))
        } catch (err: any) {
            console.error("Delete failed:", err)
            alert("Failed to delete user: " + err.message)
        }
    }

    const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) throw error
            if (data) setUsers(data)
        } catch (err: any) {
            console.error('Error fetching users:', err)
            setError(err.message || 'Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user =>
        (user.email?.toLowerCase().includes(search.toLowerCase())) ||
        (user.first_name?.toLowerCase().includes(search.toLowerCase())) ||
        (user.last_name?.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <EditUserModal
                isOpen={!!editingUser}
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSave={handleUpdate}
            />

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">User Management</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-[#0B0E14] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
                    />
                </div>
            </div>

            <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Credits</th>
                                <th className="px-6 py-4">Subscription</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {error ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-red-500 bg-red-500/5">
                                        <div className="font-bold">Error loading users</div>
                                        <div className="text-sm mt-1 opacity-80">{error}</div>
                                    </td>
                                </tr>
                            ) : loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold border border-blue-500/30">
                                                    {user.email?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{user.first_name} {user.last_name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-white">
                                            {user.credits?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_subscribed ? (
                                                <span className="text-purple-400 font-bold text-xs flex items-center gap-1">
                                                    <Shield className="h-3 w-3" /> PRO
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-xs">Free</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingUser(user)}
                                                    className="p-2 hover:bg-blue-500/10 rounded-lg text-gray-500 hover:text-blue-500 transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
