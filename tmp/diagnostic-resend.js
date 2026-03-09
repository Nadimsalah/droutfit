
const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function diagnostic() {
    const target = 'salaheddinenadim@gmail.com';

    console.log("--- Resend Deep Diagnostic ---");

    // Test 1: onboarding@resend.dev (Almost guaranteed to work if key is valid)
    try {
        console.log("\n[Test 1] Sending from onboarding@resend.dev...");
        const res1 = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: target,
            subject: 'Test 1: Resend Default Sender',
            html: '<p>This email uses the Resend default sandbox sender.</p>'
        });
        console.log("Result:", res1.error ? "FAILED: " + res1.error.message : "SUCCESS: " + res1.data.id);
    } catch (e) { console.error("Test 1 Crash:", e.message); }

    // Test 2: info@droutfit.com with VERY simple content (No HTML templates)
    try {
        console.log("\n[Test 2] Sending from info@droutfit.com (Simple Text)...");
        const res2 = await resend.emails.send({
            from: 'DrOutfit <info@droutfit.com>',
            to: target,
            subject: 'Test 2: Simple Text from Custom Domain',
            text: 'This is just a plain text email to test deliverability without templates.'
        });
        console.log("Result:", res2.error ? "FAILED: " + res2.error.message : "SUCCESS: " + res2.data.id);
    } catch (e) { console.error("Test 2 Crash:", e.message); }

    // Test 3: info@droutfit.com with the REAL OTP template
    try {
        console.log("\n[Test 3] Sending from info@droutfit.com (Full OTP Template)...");
        const code = "1234";
        const html = `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="font-size: 20px;">Verify your identity</h1>
                <p>Your code is: <strong style="font-size: 24px; color: #2563eb;">${code}</strong></p>
                <p style="font-size: 12px; color: #666;">If you didn't request this, ignore it.</p>
            </div>
        `;
        const res3 = await resend.emails.send({
            from: 'DrOutfit <info@droutfit.com>',
            to: target,
            subject: `${code} is your code`,
            html
        });
        console.log("Result:", res3.error ? "FAILED: " + res3.error.message : "SUCCESS: " + res3.data.id);
    } catch (e) { console.error("Test 3 Crash:", e.message); }
}

diagnostic();
