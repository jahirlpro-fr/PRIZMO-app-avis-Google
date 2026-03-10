import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const MOTIF_LABELS: Record<string, string> = {
    demo: "Demande de démo",
    support: "Support technique",
    facturation: "Facturation / Abonnement",
    partenariat: "Partenariat",
    autre: "Autre",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { name, email, motif, message } = req.body;

    // Validation basique
    if (!name || !email || !motif || !message) {
        return res.status(400).json({ error: "Champs manquants" });
    }

    const motifLabel = MOTIF_LABELS[motif] || motif;

    try {
        // ── EMAIL 1 : notification à Jahir ──
        await resend.emails.send({
            from: "Prizmo Contact <contact@prizmo.pro>",
            to: "jahirlpro@gmail.com",
            subject: `[Prizmo] ${motifLabel} — ${name}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'DM Sans',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:20px;overflow:hidden;max-width:600px;width:100%;">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#db2777);padding:32px 40px;text-align:center;">
                    <p style="color:white;font-size:28px;font-weight:800;margin:0;">📬 Nouveau message</p>
                    <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:8px 0 0;">Via prizmo.pro/contact</p>
                  </td>
                </tr>

                <!-- Motif badge -->
                <tr>
                  <td style="padding:32px 40px 0;text-align:center;">
                    <span style="background:#f3f0ff;color:#7c3aed;padding:8px 20px;border-radius:100px;font-size:14px;font-weight:700;">
                      ${motifLabel}
                    </span>
                  </td>
                </tr>

                <!-- Infos expéditeur -->
                <tr>
                  <td style="padding:24px 40px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:14px;overflow:hidden;">
                      <tr>
                        <td style="padding:16px 20px;border-bottom:1px solid #efefef;">
                          <span style="color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Nom</span><br>
                          <span style="color:#0f0f0f;font-size:15px;font-weight:600;">${name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 20px;">
                          <span style="color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Email</span><br>
                          <a href="mailto:${email}" style="color:#7c3aed;font-size:15px;font-weight:600;text-decoration:none;">${email}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td style="padding:24px 40px 0;">
                    <p style="color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 12px;">Message</p>
                    <div style="background:#f9f9f9;border-left:4px solid #7c3aed;border-radius:0 14px 14px 0;padding:20px 24px;">
                      <p style="color:#333;font-size:15px;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
                    </div>
                  </td>
                </tr>

                <!-- CTA Répondre -->
                <tr>
                  <td style="padding:32px 40px;text-align:center;">
                    <a href="mailto:${email}?subject=Re: ${motifLabel} — Prizmo" 
                       style="background:linear-gradient(135deg,#7c3aed,#db2777);color:white;padding:14px 32px;border-radius:100px;font-size:15px;font-weight:700;text-decoration:none;display:inline-block;">
                      Répondre à ${name} →
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #efefef;">
                    <p style="color:#aaa;font-size:12px;margin:0;">Prizmo · prizmo.pro · LVN Seller</p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
        });

        // ── EMAIL 2 : confirmation à l'expéditeur ──
        await resend.emails.send({
            from: "Prizmo <contact@prizmo.pro>",
            to: email,
            subject: `✅ Votre message a bien été reçu — Prizmo`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'DM Sans',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:20px;overflow:hidden;max-width:600px;width:100%;">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#db2777);padding:40px;text-align:center;">
                    <p style="color:white;font-size:48px;margin:0;">✅</p>
                    <p style="color:white;font-size:24px;font-weight:800;margin:12px 0 0;">Message bien reçu !</p>
                  </td>
                </tr>

                <!-- Corps -->
                <tr>
                  <td style="padding:40px;">
                    <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 16px;">
                      Bonjour <strong>${name}</strong>,
                    </p>
                    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 16px;">
                      Nous avons bien reçu votre message concernant <strong>${motifLabel}</strong>. Notre équipe vous répondra sous <strong>24h ouvrées</strong>.
                    </p>
                    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 32px;">
                      En attendant, n'hésitez pas à consulter notre FAQ ou à tester Prizmo gratuitement pendant 14 jours.
                    </p>

                    <!-- Récap message -->
                    <div style="background:#f9f9f9;border-left:4px solid #7c3aed;border-radius:0 14px 14px 0;padding:20px 24px;margin-bottom:32px;">
                      <p style="color:#888;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">Votre message</p>
                      <p style="color:#333;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
                    </div>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://prizmo.pro/admin/establishment/new"
                             style="background:linear-gradient(135deg,#7c3aed,#db2777);color:white;padding:14px 32px;border-radius:100px;font-size:15px;font-weight:700;text-decoration:none;display:inline-block;">
                            Démarrer l'essai gratuit →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #efefef;">
                    <p style="color:#aaa;font-size:12px;margin:0 0 8px;">Prizmo · prizmo.pro</p>
                    <p style="color:#aaa;font-size:11px;margin:0;">
                      Vous recevez cet email car vous avez contacté Prizmo via prizmo.pro/contact.<br>
                      <a href="https://prizmo.pro/legal/rgpd" style="color:#aaa;">Politique de confidentialité</a>
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
        console.error("Resend error:", error);
        return res.status(500).json({ error: "Erreur envoi email" });
    }
}