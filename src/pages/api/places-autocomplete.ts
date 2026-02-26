import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const { input } = req.query;
    if (!input || typeof input !== "string") return res.status(400).json({ error: "Input requis" });

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Clé API manquante" });

    try {
        const response = await fetch(
            `https://places.googleapis.com/v1/places:autocomplete`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                },
                body: JSON.stringify({
                    input,
                    languageCode: "fr",
                    includedPrimaryTypes: ["restaurant", "food", "bar", "cafe", "establishment"],
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Google API error:", errorText);
            return res.status(response.status).json({ error: "Erreur Google API", details: errorText });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error: any) {
        console.error("Fetch error:", error);
        return res.status(500).json({ error: error.message });
    }
}