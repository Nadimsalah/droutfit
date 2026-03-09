import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

        // 1. Authenticate user using Supabase auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !authData.user) {
            console.error("WP Login Auth Error:", authError?.message || "User not found");
            return NextResponse.json({ error: authError?.message || "Invalid credentials" }, { status: 401 });
        }

        const userId = authData.user.id;

        // 2. Fetch user's profile to get current credits and store data
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Return the necessary data to the WordPress plugin
        return NextResponse.json({
            success: true,
            user: {
                id: userId,
                email: email,
                credits: profile.credits || 0,
                // Passing back the JWT token as the 'token'. 
                // The WP plugin can store this token and use it to hit other authenticated endpoints later if needed.
                token: authData.session.access_token
            }
        });

    } catch (err: any) {
        console.error("WP Login API Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
