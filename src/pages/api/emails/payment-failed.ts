import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requis" });

    try {
        await resend.emails.send({
            from: "Prizmo <contact@prizmo.pro>",
            to: email,
            subject: "⚠️ Problème de paiement — Action requise",
            html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <tr>
          <td style="background:#0f0f0f;padding:40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
            <h1 style="color:white;margin:0;font-size:26px;font-weight:800;">Problème de paiement</h1>
            <p style="color:rgba(255,255,255,0.6);margin:10px 0 0;font-size:15px;">Votre accès Prizmo est temporairement suspendu</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px;">
            <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 28px;">
              Bonjour 👋,<br><br>
              Nous n'avons pas pu débiter votre carte bancaire pour renouveler votre abonnement Prizmo.<br><br>
              Votre compte est temporairement suspendu. <strong>Mettez à jour votre moyen de paiement</strong> pour rétablir votre accès immédiatement.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center">
                  <a href="https://prizmo.pro/admin"
                     style="background:linear-gradient(135deg,#7c3aed,#db2777);color:white;padding:16px 36px;border-radius:100px;font-size:15px;font-weight:700;text-decoration:none;display:inline-block;">
                    Mettre à jour ma carte →
                  </a>
                </td>
              </tr>
            </table>

            <div style="background:#fff8f0;border:2px solid #fed7aa;border-radius:16px;padding:20px;">
              <p style="margin:0;color:#92400e;font-size:14px;line-height:1.6;">
                💡 <strong>Que se passe-t-il ?</strong><br>
                Votre carte a peut-être expiré ou atteint sa limite. Connectez-vous à votre espace client pour mettre à jour vos informations bancaires. Vos données sont conservées.
              </p>
            </div>

            <p style="color:#aaa;font-size:13px;text-align:center;margin:24px 0 0;">
              Besoin d'aide ? <a href="mailto:contact@prizmo.pro" style="color:#7c3aed;">contact@prizmo.pro</a>
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #efefef;">
            <p style="color:#aaa;font-size:12px;margin:0;">Prizmo · prizmo.pro</p>
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
        console.error("Payment failed email error:", error);
        return res.status(500).json({ error: "Erreur envoi email" });
    }
}