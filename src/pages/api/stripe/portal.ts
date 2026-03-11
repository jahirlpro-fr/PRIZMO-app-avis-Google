import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId requis" });

    const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single();

    if (!profile?.stripe_customer_id) {
        return res.status(400).json({ error: "Aucun abonnement actif" });
    }

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
        });
        return res.status(200).json({ url: session.url });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}