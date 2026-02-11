
import { supabase } from './supabase';

export interface Product {
    id: string;
    image: string;
    usage: number;
    storeUrl?: string; // Map from store_url
    name?: string;
}

export const defaultProducts: Product[] = [
    {
        id: "PROD-001",
        name: "Premium Denim Jacket",
        image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        usage: 1240,
        storeUrl: "https://example.com/products/denim-jacket"
    },
    {
        id: "PROD-002",
        name: "Classic Cotton Tee",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        usage: 850,
        storeUrl: "https://example.com/products/cotton-tee"
    },
    {
        id: "PROD-003",
        name: "Slim Fit Chinos",
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        usage: 320,
        storeUrl: "https://example.com/products/slim-chinos"
    },
    {
        id: "PROD-004",
        name: "Floral Summer Dress",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        usage: 2150,
        storeUrl: "https://example.com/products/floral-dress"
    },
    {
        id: "PROD-005",
        name: "Leather Biker Jacket",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        usage: 940,
        storeUrl: "https://example.com/products/leather-jacket"
    }
];

export async function getProducts(): Promise<Product[]> {
    const { data: dbProducts, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('CRITICAL: Supabase Fetch Error. Check if "products" table exists and RLS allows reading.', error);
        return [];
    }

    // Map database fields to Product interface
    const mappedProducts: Product[] = (dbProducts || []).map(p => ({
        id: p.id,
        name: p.name,
        image: p.image,
        usage: p.usage || 0,
        storeUrl: p.store_url
    }));

    return mappedProducts;
}

export async function saveProduct(image: string, storeUrl?: string): Promise<Product> {
    const { data, error } = await supabase
        .from('products')
        .insert([
            {
                image,
                store_url: storeUrl,
                name: "Custom Upload",
                usage: 0
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('CRITICAL: Supabase Insert Error. Check if "products" table exists and RLS allows inserting.', error);
        throw new Error(`Database Error: ${error.message}. Ensure "products" table exists and RLS is disabled or configured for inserts.`);
    }

    return {
        id: data.id,
        name: data.name,
        image: data.image,
        usage: data.usage || 0,
        storeUrl: data.store_url
    };
}

export async function getProductById(id: string): Promise<Product | undefined> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
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
        storeUrl: data.store_url
    };
}

export async function deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('CRITICAL: Supabase Delete Error. Check if RLS allows deleting.', error);
        throw new Error(`Database Error: ${error.message}`);
    }
}
