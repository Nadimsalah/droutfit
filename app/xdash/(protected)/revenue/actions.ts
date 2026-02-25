"use server"

import { createClient } from "@supabase/supabase-js"

export type Period = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'all'

export async function getRevenueData(selectedPeriod: Period) {
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Calculate date range
    const now = new Date()
    let startDate = new Date()

    switch (selectedPeriod) {
        case 'today':
            startDate.setHours(0, 0, 0, 0)
            break
        case 'yesterday':
            startDate.setDate(now.getDate() - 1)
            startDate.setHours(0, 0, 0, 0)
            break
        case 'week':
            startDate.setDate(now.getDate() - 7)
            break
        case 'month':
            startDate.setDate(1) // Start of this month
            break
        case 'year':
            startDate.setMonth(0, 1) // Start of this year
            break
        case 'all':
            startDate = new Date(0) // Epoch
            break
    }

    // Fetch Transactions
    const { data, error } = await adminClient
        .from('transactions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching revenue:', error)
        return null
    }

    const transactions = data || []

    const userIds = [...new Set(transactions.map(t => t.user_id))].filter(Boolean)
    const { data: profiles } = await adminClient
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

    const profilesData = profiles || []

    const enrichedTransactions = transactions.map(t => ({
        ...t,
        user_name: profilesData.find(p => p.id === t.user_id)?.full_name || 'No Name'
    }))

    return enrichedTransactions
}
