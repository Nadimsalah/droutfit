import { createClient } from "@supabase/supabase-js"
import { Users, ImageIcon } from "lucide-react"
import UsersTable from "./UsersTable"

export const dynamic = 'force-dynamic'

async function getUsers() {
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const [profilesRes, authRes, txRes] = await Promise.all([
        adminClient.from('profiles').select('*').order('created_at', { ascending: false }),
        adminClient.auth.admin.listUsers(),
        adminClient.from('transactions').select('user_id, amount').eq('status', 'succeeded')
    ])

    const authUsers = authRes.data?.users || []
    const transactions = txRes.data || []

    const users = profilesRes.data?.map(profile => {
        const authUser = authUsers.find(u => u.id === profile.id)
        const userTxs = transactions.filter(t => t.user_id === profile.id)
        const totalSpent = userTxs.reduce((sum, t) => sum + (t.amount || 0), 0)

        return {
            ...profile,
            email: authUser?.email || null,
            totalSpent,
            txCount: userTxs.length
        }
    }) || []

    return users
}

export default async function UsersPage() {
    const users = await getUsers()

    const totalImages = users.reduce((s, u) => s + (u.credits || 0), 0)

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
                    <p className="text-gray-400 mt-1">{users.length} registered users</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</span>
                    </div>
                    <p className="text-3xl font-black text-white">{users.length}</p>
                </div>
                <div className="bg-[#0B0E14] border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <ImageIcon className="h-5 w-5 text-green-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Image Inventory</span>
                    </div>
                    <p className="text-3xl font-black text-white">{totalImages.toLocaleString('de-DE')}</p>
                </div>
            </div>

            {/* Searchable + filterable table */}
            <UsersTable users={users} />
        </div>
    )
}
