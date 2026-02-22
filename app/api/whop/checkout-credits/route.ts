import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getPricing } from '@/lib/pricing'
import { headers } from 'next/headers'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const credits = body.credits
        const user_id = body.user_id

        if (!credits || credits < 100) {
            return NextResponse.json({ error: 'Minimum 100 credits required.' }, { status: 400 })
        }

        if (!user_id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Calculate Cost
        const pricing = await getPricing()
        let creditsCost = 0;

        if (credits === pricing.PACKAGE_1_AMOUNT) {
            creditsCost = pricing.PACKAGE_1_PRICE;
        } else if (credits === pricing.PACKAGE_2_AMOUNT) {
            creditsCost = pricing.PACKAGE_2_PRICE;
        } else if (credits === pricing.PACKAGE_3_AMOUNT) {
            creditsCost = pricing.PACKAGE_3_PRICE;
        } else if (credits === pricing.PACKAGE_4_AMOUNT) {
            creditsCost = pricing.PACKAGE_4_PRICE;
        } else {
            creditsCost = credits * pricing.CUSTOM_CREDIT_PRICE;
        }
        const processingFee = (creditsCost * 0.027) + 0.30;
        const totalCost = creditsCost + processingFee;

        // Create Whop Checkout Session
        const whopResponse = await fetch('https://api.whop.com/v2/checkout_sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                company_id: 'biz_ucd3wWisC8E7rV',
                price: {
                    product_id: 'prod_X0nfaP0JKcDtQ',
                    plan_type: 'one_time',
                    currency: 'usd',
                    initial_price: totalCost
                },
                // Pass metadata to Whop so we know what they bought when the webhook hits
                metadata: {
                    user_id: user_id,
                    credits: credits
                },
                redirect_url: `${(request.headers.get('origin') || '').replace('http://localhost', 'https://localhost')}/api/whop/process?user_id=${user_id}&credits=${credits}&tx_id=${crypto.randomUUID()}`
            })
        })

        const data = await whopResponse.json()

        if (data.error) {
            console.error("Whop API Error:", data.error)
            return NextResponse.json({ error: data.error.message }, { status: 400 })
        }

        return NextResponse.json({ url: data.purchase_url })

    } catch (error: any) {
        console.error("Checkout route error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
