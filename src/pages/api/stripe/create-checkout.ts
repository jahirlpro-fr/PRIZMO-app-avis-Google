import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PRICE_IDS: Record<string, string> = {
    solo_monthly: "price_1T9nVcQJJlym8HyjOyRRyCGg",
    solo_yearly: "price_1T9nWyQJJlym8HyjPFZnSnNt",
    pro_monthly: "price_1T9nXaQJJlym8HyjHxtZlBhn",
    pro_yearly: "price_1T9nYTQJJlym8HyjxdUoFUYW",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { plan, billing, userId, email } = req.body;
    if (!plan || !billing || !userId || !email) {
        return res.status(400).json({ error: "Paramètres manquants" });
    }

    const priceKey = `${plan}_${billing}`;
    const priceId = PRICE_IDS[priceKey];
    if (!priceId) {
        return res.status(400).json({ error: "Plan invalide" });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            customer_email: email,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
            metadata: { userId, plan, billing },
            locale: "fr",
        });

        return res.status(200).json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe checkout error:", error);
        return res.status(500).json({ error: error.message });
    }
}