
const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

const generateOTPHTML = (code) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 40px auto; padding: 48px 32px; background-color: #ffffff; border: 1px solid #eef2f6; border-radius: 24px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.03);">
        <div style="margin-bottom: 32px;">
            <img src="https://dvbuiiaymvynzwecefup.supabase.co/storage/v1/object/public/listing-images/logo-black.png" alt="DrOutfit" style="height: 38px; width: auto;" />
        </div>
        
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px;">Verify your identity</h1>
        <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin-bottom: 32px;">Please use the following 4-digit code to complete your registration. This code will expire in 10 minutes.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; display: inline-block; margin-bottom: 32px; min-width: 200px;">
            <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #2563eb; font-family: 'JetBrains Mono', 'Courier New', monospace; padding-left: 12px;">${code}</span>
        </div>
        
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
            If you did not request this code, please ignore this email or contact support if you have concerns.
        </p>
        
        <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Powered by DrOutfit AI Intelligence</p>
        </div>
    </div>
`;

async function testFullTemplate() {
    const target = 'nadim.s.eddine@gmail.com';
    const code = '1234';

    console.log("--- Testing Full OTP Template Delivery to:", target, "---");

    try {
        const response = await resend.emails.send({
            from: 'DrOutfit <info@droutfit.com>',
            to: target,
            subject: `${code} is your verification code`,
            html: generateOTPHTML(code),
        });

        if (response.error) {
            console.error("Resend API Error:", JSON.stringify(response.error, null, 2));
        } else {
            console.log("SUCCESS! Full Template Email sent to", target, response.data);
        }
    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

testFullTemplate();
