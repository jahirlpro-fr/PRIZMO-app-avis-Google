import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { email, establishmentName, trialEndsAt } = req.body;
    if (!email) return res.status(400).json({ error: "Email requis" });

    const trialDate = trialEndsAt
        ? new Date(trialEndsAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : "dans 14 jours";

    try {
        // 1. Email de bienvenue au marchand
        await resend.emails.send({
            from: "Prizmo <contact@prizmo.pro>",
            to: email,
            subject: "🎉 Bienvenue sur Prizmo — Votre essai gratuit commence !",
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
                  <td style="background:linear-gradient(135deg,#7c3aed,#db2777);padding:40px;text-align:center;">
                    <div style="font-size:48px;margin-bottom:12px;">🎡</div>
                    <h1 style="color:white;margin:0;font-size:26px;font-weight:800;">Bienvenue sur Prizmo !</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:10px 0 0;font-size:15px;">Votre essai gratuit de 14 jours commence maintenant</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 24px;">
                      Bonjour 👋,<br><br>
                      ${establishmentName ? `Votre établissement <strong>${establishmentName}</strong> est prêt.` : "Votre compte est prêt."} Vous avez accès à toutes les fonctionnalités PRO jusqu'au <strong>${trialDate}</strong>.
                    </p>

                    <!-- Checklist -->
                    <div style="background:#f9f5ff;border-radius:16px;padding:24px;margin-bottom:28px;">
                      <p style="color:#7c3aed;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 16px;">Pour démarrer rapidement</p>
                      ${[
                    ["🖨️", "Téléchargez votre affiche personnalisée", "Depuis l'onglet Affiche de votre dashboard"],
                    ["📍", "Placez-la sur vos tables et comptoir", "Vos clients scannent le QR code pour jouer"],
                    ["⭐", "Vérifiez votre lien Google Avis", "Le parcours redirige automatiquement vos clients"],
                    ["💳", "Activez la carte fidélité", "Disponible dans l'onglet Fidélité (plan PRO)"],
                ].map(([emoji, title, desc]) => `
                        <div style="display:flex;gap:14px;margin-bottom:14px;align-items:flex-start;">
                          <div style="font-size:22px;flex-shrink:0;">${emoji}</div>
                          <div>
                            <p style="color:#1a1a1a;font-size:14px;font-weight:600;margin:0 0 2px;">${title}</p>
                            <p style="color:#888;font-size:13px;margin:0;">${desc}</p>
                          </div>
                        </div>
                      `).join("")}
                    </div>

                    <!-- Expiry reminder -->
                    <div style="background:#fff7ed;border-left:4px solid #f59e0b;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:28px;">
                      <p style="color:#92400e;font-size:13px;font-weight:700;margin:0 0 4px;">⏳ Essai gratuit jusqu'au ${trialDate}</p>
                      <p style="color:#b45309;font-size:13px;margin:0;">Aucune carte bancaire requise pour l'instant. Choisissez votre plan avant la fin de l'essai.</p>
                    </div>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://prizmo.pro/admin"
                             style="background:linear-gradient(135deg,#7c3aed,#db2777);color:white;padding:16px 36px;border-radius:100px;font-size:15px;font-weight:700;text-decoration:none;display:inline-block;">
                            Accéder à mon dashboard →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#aaa;font-size:13px;text-align:center;margin:24px 0 0;">
                      Des questions ? Répondez à cet email ou écrivez-nous à <a href="mailto:contact@prizmo.pro" style="color:#7c3aed;">contact@prizmo.pro</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #efefef;">
                    <p style="color:#aaa;font-size:12px;margin:0 0 6px;">Prizmo · prizmo.pro</p>
                    <p style="color:#aaa;font-size:11px;margin:0;">
                      <a href="https://prizmo.pro/legal/rgpd" style="color:#aaa;">Politique de confidentialité</a> ·
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

        // 2. Notification interne
        await resend.emails.send({
            from: "Prizmo <contact@prizmo.pro>",
            to: "jahirlpro@gmail.com",
            subject: `🎉 Nouveau marchand — ${establishmentName || email}`,
            html: `
        <div style="font-family:sans-serif;padding:24px;max-width:480px;">
          <h2 style="color:#7c3aed;">Nouveau marchand inscrit 🚀</h2>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Établissement :</strong> ${establishmentName || "Non renseigné"}</p>
          <p><strong>Fin d'essai :</strong> ${trialDate}</p>
          <a href="https://prizmo.pro/admin/crm" style="background:#7c3aed;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:12px;">Voir dans le CRM →</a>
        </div>
      `,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Welcome email error:", error);
        return res.status(500).json({ error: "Erreur envoi email" });
    }
}