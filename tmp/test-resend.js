
const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    console.log("Using API Key:", process.env.RESEND_API_KEY ? "Present (Starts with " + process.env.RESEND_API_KEY.substring(0, 7) + "...)" : "MISSING");

    try {
        console.log("Attempting to send test email from info@droutfit.com to salaheddinenadim@gmail.com...");
        const response = await resend.emails.send({
            from: 'DrOutfit <info@droutfit.com>',
            to: 'salaheddinenadim@gmail.com',
            subject: 'Diagnostic Test',
            html: '<p>This is a test to diagnose the Resend integration.</p>',
        });

        if (response.error) {
            console.error("Resend API Error:", JSON.stringify(response.error, null, 2));

            if (response.error.name === 'validation_error' && response.error.message.includes('verified')) {
                console.log("\n--- SUGGESTED FIX ---");
                console.log("The domain 'droutfit.com' is likely not verified in your Resend dashboard.");
                console.log("Try using 'onboarding@resend.dev' as the sender temporarily to verify the API key works.");
            }
        } else {
            console.log("Email sent successfully!", JSON.stringify(response.data, null, 2));
        }
    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

testEmail();
