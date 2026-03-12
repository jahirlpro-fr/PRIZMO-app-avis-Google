import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { email, establishmentName } = req.body;
    if (!email) return res.status(400).json({ error: "Email requis" });

    try {
        await resend.emails.send({
            from: "Prizmo <contact@prizmo.pro>",
            to: email,
            subject: "⭐ Astuce J+3 — Comment exploser vos avis Google avec Prizmo",
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
                    <div style="font-size:40px;margin-bottom:10px;">⭐</div>
                    <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">Le secret des avis Google</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">3 jours avec Prizmo — voici comment aller plus loin</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 28px;">
                      Bonjour 👋,<br><br>
                      ${establishmentName ? `<strong>${establishmentName}</strong> est sur Prizmo depuis 3 jours.` : "Vous êtes sur Prizmo depuis 3 jours."} C'est le bon moment pour partager <strong>le vrai secret</strong> des commerçants qui génèrent des dizaines d'avis par semaine.
                    </p>

                    <!-- Secret -->
                    <div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:16px;padding:24px 28px;margin-bottom:28px;">
                      <p style="color:#92400e;font-size:14px;font-weight:700;margin:0 0 8px;">🔑 Le secret n°1</p>
                      <p style="color:#78350f;font-size:15px;line-height:1.7;margin:0;">
                        Les avis Google arrivent <strong>uniquement si votre équipe en parle activement</strong>. L'affiche seule ne suffit pas. Le déclencheur, c'est la phrase dite à voix haute au bon moment.
                      </p>
                    </div>

                    <!-- 3 Tips -->
                    ${[
                    {
                        num: "01",
                        emoji: "🗣️",
                        title: "La phrase magique au comptoir",
                        desc: "\"Avant de partir, vous pouvez tourner notre roue de la fortune et tenter de gagner un cadeau — il suffit de laisser un avis Google d'abord !\" Simple, naturel, efficace.",
                    },
                    {
                        num: "02",
                        emoji: "⏰",
                        title: "Le bon moment : l'addition",
                        desc: "Le client est satisfait, il paye. C'est LE moment idéal. Pas en début de repas, pas quand il est pressé — à l'addition, quand l'expérience est fraîche.",
                    },
                    {
                        num: "03",
                        emoji: "📍",
                        title: "Placez l'affiche au niveau des yeux",
                        desc: "Sur le comptoir de caisse, collée sur le terminal de paiement, ou sur la table. Le QR code doit être visible sans chercher. Si le client doit demander où scanner, c'est trop tard.",
                    },
                ].map(tip => `
                      <div style="display:flex;gap:16px;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #f0f0f0;">
                        <div style="flex-shrink:0;width:36px;height:36px;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:10px;color:white;font-size:12px;font-weight:800;text-align:center;line-height:36px;">
                          ${tip.num}
                        </div>
                        <div>
                          <p style="color:#1a1a1a;font-size:15px;font-weight:700;margin:0 0 6px;">${tip.emoji} ${tip.title}</p>
                          <p style="color:#666;font-size:14px;line-height:1.65;margin:0;">${tip.desc}</p>
                        </div>
                      </div>
                    `).join("")}

                    <!-- Stat -->
                    <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:28px;">
                      <p style="color:#15803d;font-size:13px;font-weight:700;margin:0 0 4px;">📊 Chiffre Prizmo</p>
                      <p style="color:#166534;font-size:13px;line-height:1.6;margin:0;">
                        Les commerçants qui briefent leur équipe sur la phrase magique génèrent en moyenne <strong>3x plus d'avis</strong> que ceux qui misent uniquement sur l'affiche.
                      </p>
                    </div>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://prizmo.pro/admin"
                             style="background:linear-gradient(135deg,#f59e0b,#ef4444);color:white;padding:16px 36px;border-radius:100px;font-size:15px;font-weight:700;text-decoration:none;display:inline-block;">
                            Voir mes statistiques →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#aaa;font-size:13px;text-align:center;margin:24px 0 0;">
                      Une question ? Répondez directement à cet email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
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

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Day3 email error:", error);
        return res.status(500).json({ error: "Erreur envoi email" });
    }
}