import { sendPaymentEmail } from '../lib/resend';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testEmail() {
    const email = "salaheddinenadim@gmail.com";
    console.log(`Sending premium test email to ${email}...`);

    try {
        const result = await sendPaymentEmail(
            email,
            25, // added
            100, // new total
            "http://localhost:3000", // base url
            "TEST_TX_12345" // tx id
        );

        if (result.success) {
            console.log("✅ Test email sent successfully!");
        } else {
            console.error("❌ Failed to send test email:", result.error);
        }
    } catch (error) {
        console.error("💥 Error during test:", error);
    }
}

testEmail();
