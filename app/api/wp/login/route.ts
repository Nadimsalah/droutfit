import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Authenticate user using Supabase auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !authData.user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
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
