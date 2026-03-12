import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const cronSecret = req.headers["x-cron-secret"];
    if (cronSecret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: "Non autorisé" });
    }

    try {
        // Cherche les marchands inscrits il y a exactement 7 jours
        const now = new Date();
        const from = new Date(now);
        from.setDate(from.getDate() - 7);
        from.setHours(0, 0, 0, 0);
        const to = new Date(from);
        to.setHours(23, 59, 59, 999);

        const { data: profiles, error } = await supabase
            .from("profiles")
            .select("email, establishments(name)")
            .gte("created_at", from.toISOString())
            .lte("created_at", to.toISOString())
            .eq("role", "merchant");

        if (error) throw error;

        let sent = 0;
        for (const profile of profiles || []) {
            const establishmentName = (profile.establishments as any)?.[0]?.name || "";

            await resend.emails.send({
                from: "Prizmo <contact@prizmo.pro>",
                to: profile.email,
                subject: "🚀 1 semaine avec Prizmo — Comment ça se passe ?",
                html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 20px;">
            <tr><td align="center">
              <table width="100%" style="max-width:580px;background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#db2777);padding:36px 40px;text-align:center;">
                    <div style="font-size:40px;margin-bottom:10px;">🚀</div>
                    <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">1 semaine avec Prizmo !</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">On fait le point ensemble</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:40px;">
                    <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 28px;">
                      Bonjour 👋,<br><br>
                      ${establishmentName ? `<strong>${establishmentName}</strong> est` : "Vous êtes"} sur Prizmo depuis une semaine. C'est le bon moment pour faire le point — et s'assurer que tout fonctionne parfaitement pour vous.
                    </p>

                    <div style="background:#f8f4ff;border-radius:16px;padding:24px 28px;margin-bottom:28px;">
                      <p style="color:#7c3aed;font-size:14px;font-weight:700;margin:0 0 16px;">🎯 Check-in rapide</p>
                      ${[
                        "✅ Votre affiche est-elle bien visible dans l'établissement ?",
                        "✅ Avez-vous testé le parcours complet depuis votre téléphone ?",
                        "✅ Votre équipe connaît-elle la phrase magique ?",
                        "✅ Avez-vous reçu vos premiers avis Google ?",
                    ].map(q => `<p style="color:#4c1d95;font-size:14px;line-height:1.6;margin:0 0 10px;">${q}</p>`).join("")}
                      <p style="color:#6d28d9;font-size:13px;margin:16px 0 0;font-style:italic;">
                        Si une réponse est "non", répondez à cet email — on vous aide à débloquer ça.
                      </p>
                    </div>

                    <div style="display:flex;gap:16px;margin-bottom:28px;padding:20px;background:#f9f9f9;border-radius:16px;">
                      <div style="font-size:32px;flex-shrink:0;">💡</div>
                      <div>
                        <p style="color:#1a1a1a;font-size:15px;font-weight:700;margin:0 0 6px;">Astuce de la semaine</p>
                        <p style="color:#555;font-size:14px;line-height:1.65;margin:0;">
                          Activez le <strong>programme de fidélité</strong> si ce n'est pas encore fait. Les clients qui ont une carte fidélité reviennent <strong>2x plus souvent</strong>. Ça se configure en 2 minutes depuis votre dashboard.
                        </p>
                      </div>
                    </div>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom:12px;">
                          <a href="https://prizmo.pro/admin" style="background:linear-gradient(135deg,#7c3aed,#db2777);color:white;padding:16px 36px;border-radius:100px;font-size:15px;font-weight:700;text-decoration:none;display:inline-block;">
                            Voir mon dashboard →
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <a href="mailto:contact@prizmo.pro" style="color:#7c3aed;font-size:14px;font-weight:600;text-decoration:none;">
                            📬 Poser une question à l'équipe
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#aaa;font-size:13px;text-align:center;margin:24px 0 0;">On est là pour vous aider à réussir. Répondez à cet email à tout moment.</p>
                  </td>
                </tr>

                <tr>
                  <td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #efefef;">
                    <p style="color:#aaa;font-size:12px;margin:0 0 6px;">Prizmo · prizmo.pro</p>
                    <p style="color:#aaa;font-size:11px;margin:0;">
                      <a href="https://prizmo.pro/legal/rgpd" style="color:#aaa;">Confidentialité</a> ·
                      <a href="https://prizmo.pro/legal/cgv" style="color:#aaa;">CGV</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
                `,
            });

            await new Promise(resolve => setTimeout(resolve, 600));
            sent++;
        }

        return res.status(200).json({ success: true, sent });
    } catch (error) {
        console.error("Day7 cron error:", error);
        return res.status(500).json({ error: "Erreur cron day7" });
    }
}