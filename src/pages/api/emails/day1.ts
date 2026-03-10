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
            subject: "💡 Conseil du jour — Maximisez Prizmo dès maintenant",
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
                  <td style="background:#0f0f0f;padding:36px 40px;text-align:center;">
                    <div style="font-size:40px;margin-bottom:10px;">💡</div>
                    <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">Votre premier jour avec Prizmo</h1>
                    <p style="color:rgba(255,255,255,0.6);margin:8px 0 0;font-size:14px;">Voici comment obtenir vos premiers résultats rapidement</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 28px;">
                      Bonjour 👋,<br><br>
                      ${establishmentName ? `Comment se passe votre première journée avec <strong>${establishmentName}</strong> sur Prizmo ?` : "Comment se passe votre première journée sur Prizmo ?"}<br><br>
                      Voici <strong>3 actions concrètes</strong> à faire aujourd'hui pour obtenir vos premiers avis Google dès cette semaine.
                    </p>

                    <!-- Actions -->
                    ${[
                    {
                        num: "01",
                        emoji: "🖨️",
                        title: "Imprimez votre affiche maintenant",
                        desc: "Pas demain, maintenant. Placez-la sur votre comptoir et vos tables. C'est la seule action qui compte vraiment pour démarrer.",
                        cta: null,
                    },
                    {
                        num: "02",
                        emoji: "📱",
                        title: "Testez le parcours vous-même",
                        desc: "Scannez votre QR code avec votre téléphone. Assurez-vous que le lien Google Avis fonctionne et que la roue tourne bien.",
                        cta: null,
                    },
                    {
                        num: "03",
                        emoji: "👥",
                        title: "Parlez-en à votre équipe",
                        desc: "Briefez vos employés en 30 secondes : \"Quand un client repart satisfait, montrez-lui l'affiche et dites-lui qu'il peut tourner la roue après un avis.\"",
                        cta: null,
                    },
                ].map(action => `
                      <div style="display:flex;gap:16px;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #f0f0f0;">
                        <div style="flex-shrink:0;width:36px;height:36px;background:linear-gradient(135deg,#7c3aed,#db2777);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:800;text-align:center;line-height:36px;">
                          ${action.num}
                        </div>
                        <div>
                          <p style="color:#1a1a1a;font-size:15px;font-weight:700;margin:0 0 6px;">${action.emoji} ${action.title}</p>
                          <p style="color:#666;font-size:14px;line-height:1.65;margin:0;">${action.desc}</p>
                        </div>
                      </div>
                    `).join("")}

                    <!-- Tip du jour -->
                    <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:28px;">
                      <p style="color:#15803d;font-size:13px;font-weight:700;margin:0 0 4px;">💬 Le conseil Prizmo</p>
                      <p style="color:#166534;font-size:13px;line-height:1.6;margin:0;">
                        Les commerçants qui obtiennent le plus d'avis sont ceux qui <strong>mentionnent la roue à voix haute</strong> au moment du règlement. Un simple "On a un petit jeu, scannez ce QR code !" suffit.
                      </p>
                    </div>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://prizmo.pro/admin"
                             style="background:linear-gradient(135deg,#7c3aed,#db2777);color:white;padding:16px 36px;border-radius:100px;font-size:15px;font-weight:700;text-decoration:none;display:inline-block;">
                            Voir mon dashboard →
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

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Day1 email error:", error);
        return res.status(500).json({ error: "Erreur envoi email" });
    }
}