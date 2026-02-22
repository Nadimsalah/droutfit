import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
    try {
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #333; border-bottom: 2px solid #0070f3; padding-bottom: 10px;">New Contact Inquiry</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #0070f3;">
                    <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                </div>
                <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #888;">This message was sent via the Droutfit Contact Form.</p>
            </div>
        `;

        // Send to admin (you can change this to a specific support email)
        const result = await sendEmail({
            to: "nadimsalah81@gmail.com", // Assuming this is the admin email based on context or default
            subject: `Contact Support: ${name}`,
            html
        });

        if (!result.success) {
            throw new Error((result.error as any)?.message || "Failed to send email");
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Contact API Error:", error);
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
