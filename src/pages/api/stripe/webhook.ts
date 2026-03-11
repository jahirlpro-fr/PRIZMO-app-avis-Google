import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = { api: { bodyParser: false } };

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });
}

const PLAN_MAP: Record<string, string> = {
    "price_1T9nVcQJJlym8HyjOyRRyCGg": "solo",
    "price_1T9nWyQJJlym8HyjPFZnSnNt": "solo",
    "price_1T9nXaQJJlym8HyjHxtZlBhn": "pro",
    "price_1T9nYTQJJlym8HyjxdUoFUYW": "pro",
};

const BILLING_MAP: Record<string, string> = {
    "price_1T9nVcQJJlym8HyjOyRRyCGg": "monthly",
    "price_1T9nWyQJJlym8HyjPFZnSnNt": "yearly",
    "price_1T9nXaQJJlym8HyjHxtZlBhn": "monthly",
    "price_1T9nYTQJJlym8HyjxdUoFUYW": "yearly",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const sig = req.headers["stripe-signature"] as string;
    const rawBody = await getRawBody(req);

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("Webhook signature error:", err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const plan = session.metadata?.plan;
                const billing = session.metadata?.billing;
                if (!userId || !plan) break;

                const sub = await stripe.subscriptions.retrieve(session.subscription as string);
                const priceId = sub.items.data[0].price.id;
                const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

                await supabase.from("profiles").update({
                    plan,
                    plan_status: "active",
                    billing_cycle: billing,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    current_period_ends_at: periodEnd,
                    trial_ends_at: null,
                }).eq("id", userId);
                break;
            }

            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription;
                const priceId = sub.items.data[0].price.id;
                const plan = PLAN_MAP[priceId];
                const billing = BILLING_MAP[priceId];
                const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

                await supabase.from("profiles").update({
                    plan,
                    plan_status: sub.status === "active" ? "active" : "suspended",
                    billing_cycle: billing,
                    current_period_ends_at: periodEnd,
                }).eq("stripe_subscription_id", sub.id);
                break;
            }

            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription;
                await supabase.from("profiles").update({
                    plan_status: "cancelled",
                }).eq("stripe_subscription_id", sub.id);
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                await supabase.from("profiles").update({
                    plan_status: "suspended",
                }).eq("stripe_customer_id", invoice.customer as string);
                break;
            }
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error("Webhook handler error:", error);
        return res.status(500).json({ error: error.message });
    }
}