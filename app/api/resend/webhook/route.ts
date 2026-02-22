import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
    const payload = await req.json();
    const signature = req.headers.get('svix-signature'); // Resend uses Svix for webhooks

    console.log('Resend Webhook received:', JSON.stringify(payload, null, 2));

    // Here you can handle different event types:
    // email.sent, email.delivered, email.delivery_delayed, email.complained, email.bounced, email.opened

    const eventType = payload.type;

    if (eventType === 'email.bounced') {
        console.error('Email bounced to:', payload.data.to);
    } else if (eventType === 'email.delivered') {
        console.log('Email delivered successfully to:', payload.data.to);
    }

    return NextResponse.json({ received: true });
}
