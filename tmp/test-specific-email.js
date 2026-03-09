
const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testTargetEmail() {
    const target = 'nadim.s.eddine@gmail.com';
    console.log("--- Testing Delivery to:", target, "---");

    try {
        const response = await resend.emails.send({
            from: 'DrOutfit <info@droutfit.com>',
            to: target,
            subject: 'Account Verification',
            html: '<p>Your verification code is: <strong>5555</strong></p>',
        });

        if (response.error) {
            console.error("Resend API Error:", JSON.stringify(response.error, null, 2));
        } else {
            console.log("SUCCESS! Email sent to", target, response.data);
        }
    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

testTargetEmail();
