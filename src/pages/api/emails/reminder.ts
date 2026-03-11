import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Sécurisation : seul un appel avec le bon secret peut déclencher cet endpoint
    const secret = req.headers["x-cron-secret"];
    if (secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: "Non autorisé" });
    }

    if (req.method !== "POST" && req.method !== "GET") return res.status(405).end();

    try {
        const now = new Date();
        const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const in4Days = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

        // Trouver les marchands dont l'essai expire dans exactement 3 jours
        const { data: profiles, error } = await supabase
            .from("profiles")
            .select("id, email, trial_ends_at, establishment_id")
            .eq("plan", "trial")
            .eq("plan_status", "active")
            .gte("trial_ends_at", in3Days.toISOString())
            .lte("trial_ends_at", in4Days.toISOString());

        if (error) throw error;
        if (!profiles || profiles.length === 0) {
            return res.status(200).json({ sent: 0, message: "Aucun marchand à relancer" });
        }

        let sent = 0;
        for (const profile of profiles) {
            const trialDate = new Date(profile.trial_ends_at).toLocaleDateString("fr-FR", {
                day: "numeric", month: "long", year: "numeric"
            });

            // Récupérer le nom de l'établissement
            let establishmentName = "";
            if (profile.establishment_id) {
                const { data: est } = await supabase
                    .from("establishments")
                    .select("name")
                    .eq("id", profile.establishment_id)
                    .single();
                establishmentName = est?.name || "";
            }

            await resend.emails.send({
                from: "Prizmo <contact@prizmo.pro>",
                to: profile.email,
                subject: "⏳ Plus que 3 jours — Choisissez votre plan Prizmo",
                html: `
          <!DOCTYPE html>
          <html lang="fr">
          <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
          <body style="margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 20px;">
              <tr><td align="center">
                <table width="100%" style="max-width:580px;background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:36px 40px;text-align:center;">
                      <div style="font-size:48px;margin-bottom:12px;">⏳</div>
                      <h1 style="color:white;margin:0;font-size:24px;font-weight:800;">Votre essai se termine dans 3 jours</h1>
                      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Le ${trialDate} — Ne perdez pas votre accès</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 24px;">
                        Bonjour 👋,<br><br>
                        ${establishmentName ? `Votre essai gratuit pour <strong>${establishmentName}</strong>` : "Votre essai gratuit Prizmo"} se termine le <strong>${trialDate}</strong>.<br><br>
                        Pour continuer à recevoir des avis Google et fidéliser vos clients, choisissez le plan qui correspond à votre établissement.
                      </p>

                      <!-- Plans -->
                      <div style="display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap;">

                        <!-- SOLO -->
                        <div style="flex:1;min-width:200px;border:2px solid #efefef;border-radius:16px;padding:20px;">
                          <p style="color:#888;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">SOLO</p>
                          <p style="font-size:28px;font-weight:800;margin:0 0 4px;font-family:Georgia,serif;">49€<span style="font-size:14px;font-weight:400;color:#888;">/mois</span></p>
                          <p style="color:#666;font-size:13px;margin:0 0 14px;">Roue + Analytics · 100 participants/mois</p>
                          <a href="https://prizmo.pro/pricing" style="color:#7c3aed;font-size:13px;font-weight:600;text-decoration:none;">Choisir SOLO →</a>
                        </div>

                        <!-- PRO -->
                        <div style="flex:1;min-width:200px;border:2px solid #7c3aed;border-radius:16px;padding:20px;position:relative;background:#faf5ff;">
                          <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#7c3aed,#db2777);color:white;font-size:11px;font-weight:700;padding:4px 12px;border-radius:100px;white-space:nowrap;">⭐ Recommandé</div>
                          <p style="color:#7c3aed;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">PRO</p>
                          <p style="font-size:28px;font-weight:800;margin:0 0 4px;font-family:Georgia,serif;">69€<span style="font-size:14px;font-weight:400;color:#888;">/mois</span></p>
                          <p style="color:#666;font-size:13px;margin:0 0 14px;">Tout SOLO + Fidélité + Illimité</p>
                          <a href="https://prizmo.pro/pricing" style="color:#7c3aed;font-size:13px;font-weight:700;text-decoration:none;">Choisir PRO →</a>
                        </div>

                      </div>

                      <!-- Reassurance -->
                      <div style="background:#f9f5ff;border-radius:14px;padding:18px 20px;margin-bottom:28px;">
                        <p style="color:#7c3aed;font-size:13px;font-weight:700;margin:0 0 8px;">🔒 Sans engagement</p>
                        <p style="color:#555;font-size:13px;line-height:1.6;margin:0;">Annulez à tout moment, sans frais. Vos données sont conservées.</p>
                      </div>

                      <!-- CTA -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="https://prizmo.pro/pricing"
                               style="background:linear-gradient(135deg,#7c3aed,#db2777);color:white;padding:16px 36px;border-radius:100px;font-size:15px;font-weight:700;text-decoration:none;display:inline-block;">
                              Voir les plans →
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color:#aaa;font-size:13px;text-align:center;margin:20px 0 0;">
                        Des questions ? <a href="mailto:contact@prizmo.pro" style="color:#7c3aed;">Contactez-nous</a> — On répond sous 24h.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #efefef;">
                      <p style="color:#aaa;font-size:12px;margin:0;">Prizmo · prizmo.pro · <a href="https://prizmo.pro/legal/rgpd" style="color:#aaa;">Confidentialité</a></p>
                    </td>
                  </tr>

                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `,
            });

            sent++;
        }

        return res.status(200).json({ sent, message: `${sent} email(s) de relance envoyé(s)` });
    } catch (error) {
        console.error("Reminder email error:", error);
        return res.status(500).json({ error: "Erreur lors de l'envoi des relances" });
    }
}