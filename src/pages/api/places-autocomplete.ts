import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const { input } = req.query;
    if (!input || typeof input !== "string") return res.status(400).json({ error: "Input requis" });

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=establishment&language=fr&key=${apiKey}`
        );
        const data = await response.json();
        return res.status(200).json(data);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}