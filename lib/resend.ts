import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
    to,
    subject,
    html,
}: {
    to: string | string[];
    subject: string;
    html: string;
}) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'DrOutfit <info@droutfit.com>',
            to,
            subject,
            html,
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Unexpected Email Error:', error);
        return { success: false, error };
    }
};

export const sendOTP = async (email: string, code: string) => {
    const html = `
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

    return sendEmail({
        to: email,
        subject: `${code} is your verification code`,
        html,
    });
};
export const sendResetOTP = async (email: string, code: string) => {
    const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 40px auto; padding: 48px 32px; background-color: #ffffff; border: 1px solid #eef2f6; border-radius: 24px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.03);">
            <div style="margin-bottom: 32px;">
                <img src="https://dvbuiiaymvynzwecefup.supabase.co/storage/v1/object/public/listing-images/logo-black.png" alt="DrOutfit" style="height: 38px; width: auto;" />
            </div>
            
            <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px;">Reset your password</h1>
            <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin-bottom: 32px;">Please use the following code to reset your account password. This code will expire in 10 minutes.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; display: inline-block; margin-bottom: 32px; min-width: 200px;">
                <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #f43f5e; font-family: 'JetBrains Mono', 'Courier New', monospace; padding-left: 12px;">${code}</span>
            </div>
            
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
                If you did not request a password reset, please ignore this email or contact support.
            </p>
            
            <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
                <p style="color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Powered by DrOutfit AI Intelligence</p>
            </div>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: `${code} is your password reset code`,
        html,
    });
};

export const sendPaymentEmail = async (email: string, credits: number, newTotal: number, baseUrl: string, txId?: string) => {
    const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 40px auto; padding: 48px 32px; background-color: #ffffff; border: 1px solid #eef2f6; border-radius: 24px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.03);">
            <div style="margin-bottom: 32px;">
                <img src="https://dvbuiiaymvynzwecefup.supabase.co/storage/v1/object/public/listing-images/logo-black.png" alt="DrOutfit" style="height: 38px; width: auto;" />
            </div>
            
            <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px;">Top-up Successful! ⚡</h1>
            <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin-bottom: 32px;">Your payment was processed successfully and your account has been credited.</p>
            
            <div style="display: flex; gap: 12px; margin-bottom: 32px; justify-content: center;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; flex: 1; min-width: 140px;">
                    <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Added</span>
                    <span style="font-size: 24px; font-weight: 900; color: #2563eb;">+${credits}</span>
                </div>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; flex: 1; min-width: 140px;">
                    <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">New Balance</span>
                    <span style="font-size: 24px; font-weight: 900; color: #0f172a;">${newTotal}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 32px;">
                <a href="${baseUrl}/dashboard" 
                   style="background-color: #0f172a; color: white; padding: 16px 32px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block;">
                   Go to Dashboard
                </a>
            </div>
            
            ${txId ? `<p style="color: #94a3b8; font-size: 11px; margin-top: 24px;">Transaction Reference: ${txId}</p>` : ''}
            
            <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
                <p style="color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Powered by DrOutfit AI Intelligence</p>
            </div>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: `Success! ${credits} credits added to your account`,
        html,
    });
};
