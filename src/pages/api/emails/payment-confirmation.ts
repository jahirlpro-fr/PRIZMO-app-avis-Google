import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { email, plan, billing, amount } = req.body;
    if (!email) return res.status(400).json({ error: "Email requis" });

    const planLabel = plan === "pro" ? "PRO" : "SOLO";
    const billingLabel = billing === "yearly" ? "annuel" : "mensuel";
    const amountLabel = billing === "yearly"
        ? (plan === "pro" ? "690€" : "490€")
        : (plan === "pro" ? "69€" : "49€");

    try {
        await resend.emails.send({
            from: "Prizmo <contact@prizmo.pro>",
            to: email,
            subject: `✅ Confirmation de paiement — Plan ${planLabel}`,
            html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#db2777);padding:40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">✅</div>
            <h1 style="color:white;margin:0;font-size:26px;font-weight:800;">Paiement confirmé !</h1>
            <p style="color:rgba(255,255,255,0.85);margin:10px 0 0;font-size:15px;">Merci pour votre confiance</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px;">
            <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 28px;">
              Bonjour 👋,<br><br>
              Votre abonnement <strong>Prizmo ${planLabel}</strong> est maintenant actif. Voici le récapitulatif de votre paiement.
            </p>

            <!-- Récap paiement -->
            <div style="background:#f9f5ff;border:2px solid #e9d5ff;border-radius:16px;padding:24px;margin-bottom:28px;">
              <p style="margin:0 0 12px;font-weight:800;color:#7c3aed;font-size:15px;">📋 Récapitulatif</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#555;font-size:14px;padding:6px 0;">Plan</td>
                  <td style="color:#0f0f0f;font-weight:700;font-size:14px;text-align:right;">Prizmo ${planLabel}</td>
                </tr>
                <tr>
                  <td style="color:#555;font-size:14px;padding:6px 0;">Facturation</td>
                  <td style="color:#0f0f0f;font-weight:700;font-size:14px;text-align:right;">${billingLabel.charAt(0).toUpperCase() + billingLabel.slice(1)}</td>
                </tr>
                <tr>
                  <td style="color:#555;font-size:14px;padding:6px 0;border-top:1px solid #e9d5ff;padding-top:12px;margin-top:8px;">Montant</td>
                  <td style="color:#7c3aed;font-weight:800;font-size:18px;text-align:right;border-top:1px solid #e9d5ff;">${amountLabel}</td>
                </tr>
              </table>
            </div>

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
              Une question ? Écrivez-nous à <a href="mailto:contact@prizmo.pro" style="color:#7c3aed;">contact@prizmo.pro</a>
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #efefef;">
            <p style="color:#aaa;font-size:12px;margin:0;">Prizmo · prizmo.pro · <a href="https://prizmo.pro/legal/cgv" style="color:#aaa;">CGV</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Payment confirmation email error:", error);
        return res.status(500).json({ error: "Erreur envoi email" });
    }
}