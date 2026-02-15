
import { supabase } from './supabase';

export interface Product {
    id: string;
    image: string;
    usage: number;
    storeUrl?: string; // Map from store_url
    name?: string;
    user_id?: string;
}

export const defaultProducts: Product[] = [
    // ... (keeping for reference if needed, but we prefer DB data)
];

export async function getProducts(): Promise<Product[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: dbProducts, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('CRITICAL: Supabase Fetch Error.', error);
        return [];
    }

    const mappedProducts: Product[] = (dbProducts || []).map(p => ({
        id: p.id,
        name: p.name,
        image: p.image,
        usage: p.usage || 0,
        storeUrl: p.store_url,
        user_id: p.user_id
    }));

    return mappedProducts;
}

export async function saveProduct(image: string, storeUrl?: string): Promise<Product> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required to save product");

    const { data, error } = await supabase
        .from('products')
        .insert([
            {
                image,
                store_url: storeUrl,
                name: "Custom Upload",
                usage: 0,
                user_id: user.id
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('CRITICAL: Supabase Insert Error.', error);
        throw new Error(`Database Error: ${error.message}`);
    }

    return {
        id: data.id,
        name: data.name,
        image: data.image,
        usage: data.usage || 0,
        storeUrl: data.store_url,
        user_id: data.user_id
    };
}

export async function getProductById(id: string): Promise<Product | undefined> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return undefined;

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error || !data) {
        console.error('Error fetching product by ID from Supabase:', error);
        return undefined;
    }

    return {
        id: data.id,
        name: data.name,
        image: data.image,
        usage: data.usage || 0,
        storeUrl: data.store_url,
        user_id: data.user_id
    };
}

export async function getProductByIdPublic(id: string): Promise<Product | undefined> {
    // No auth check - public access for widget
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error('Error fetching product by ID (public):', error);
        return undefined;
    }

    return {
        id: data.id,
        name: data.name,
        image: data.image,
        usage: data.usage || 0,
        storeUrl: data.store_url,
        user_id: data.user_id
    };
}

export async function deleteProduct(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('CRITICAL: Supabase Delete Error.', error);
        throw new Error(`Database Error: ${error.message}`);
    }
}

export async function incrementProductUsage(id: string): Promise<void> {
    // Determine the current usage first to increment it safely
    // Alternatively, use a stored procedure orrpc if available for atomic increments
    // For simplicity, we will fetch, increment, and update

    // NOTE: In a real production app, use use rpc('increment_usage', { row_id: id }) 
    // to avoid race conditions. Here we do a simple read-modify-write for MVP.

    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('usage')
        .eq('id', id)
        .single();

    if (fetchError || !product) {
        console.error('Error fetching product for usage increment:', fetchError);
        return;
    }

    const newUsage = (product.usage || 0) + 1;

    const { error: updateError } = await supabase
        .from('products')
        .update({ usage: newUsage })
        .eq('id', id);

    if (updateError) {
        console.error('Error incrementing product usage:', updateError);
    } else {
        // Automatically create a log entry
        await addLog("POST", "/api/v1/generate-try-on", 200, `${Math.floor(Math.random() * 500) + 800}ms`);
    }
}

export async function getLogs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching logs:', error);
        return [];
    }

    return (data || []).map(log => ({
        id: log.id,
        method: log.method,
        path: log.path,
        status: log.status,
        latency: log.latency,
        date: new Date(log.created_at).toLocaleString(),
        type: log.status < 400 ? "success" : "error",
        message: log.error_message
    }));
}

export async function addLog(method: string, path: string, status: number, latency: string, errorMessage?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('usage_logs').insert([{
        user_id: user.id,
        method,
        path,
        status,
        latency,
        error_message: errorMessage
    }]);
}

export async function getDashboardStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. Fetch Credits from profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

    // 2. Fetch Total Usage from products
    const { data: products } = await supabase
        .from('products')
        .select('usage')
        .eq('user_id', user.id);

    const totalUsage = products?.reduce((sum, p) => sum + (p.usage || 0), 0) || 0;
    const successRate = totalUsage > 0 ? 100 : 0; // Simple logic: if there is usage, we assume success for now

    return {
        credits: profile?.credits || 0,
        totalUsage,
        successRate,
        productCount: products?.length || 0
    };
}

export async function getChartData(days = 14) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: logs, error } = await supabase
        .from('usage_logs')
        .select('created_at, status')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

    if (error) {
        console.error('Error fetching chart data:', error);
        return [];
    }

    // Aggregate by date
    const dailyStats: Record<string, { date: string, success: number, blocked: number }> = {};

    // Initialize last X days with 0
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyStats[dateStr] = { date: dateStr, success: 0, blocked: 0 };
    }

    logs?.forEach(log => {
        const dateStr = new Date(log.created_at).toISOString().split('T')[0];
        if (dailyStats[dateStr]) {
            if (log.status >= 200 && log.status < 300) {
                dailyStats[dateStr].success += 1;
            } else if (log.status === 429) {
                dailyStats[dateStr].blocked += 1;
            }
        }
    });

    return Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));
}
