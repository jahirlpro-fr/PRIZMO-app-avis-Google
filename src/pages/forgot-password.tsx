import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";
import Head from "next/head";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email) { setError("Veuillez entrer votre email."); return; }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setSent(true);
        } catch (err: any) {
            setError("Une erreur est survenue. Vérifiez votre email et réessayez.");
        } finally {
            setLoading(false);
        }
    };

    return (
    <>
            <Head><title>Réinitialisation du mot de passe — Prizmo</title></Head>
            <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #0f0f0f 0%, #1a1040 50%, #0f0f0f 100%)",
            padding: "24px", fontFamily: "'DM Sans', sans-serif",
        }}>
            <div style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "24px", padding: "40px", width: "100%", maxWidth: "400px",
                backdropFilter: "blur(12px)",
            }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔐</div>
                    <h1 style={{ color: "white", fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
                        Mot de passe oublié ?
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", lineHeight: "1.6" }}>
                        Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>
                </div>

                {sent ? (
                    <div style={{
                        background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                        borderRadius: "12px", padding: "20px", textAlign: "center",
                    }}>
                        <div style={{ fontSize: "32px", marginBottom: "12px" }}>📬</div>
                        <p style={{ color: "#86efac", fontSize: "15px", fontWeight: "600", marginBottom: "8px" }}>
                            Email envoyé !
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", lineHeight: "1.6" }}>
                            Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                                Adresse email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                style={{
                                    width: "100%", padding: "12px 16px", borderRadius: "12px",
                                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                    color: "white", fontSize: "15px", outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                                borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
                                color: "#fca5a5", fontSize: "13px",
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%", padding: "14px", borderRadius: "100px",
                                background: "linear-gradient(135deg, #7c3aed, #db2777)",
                                color: "white", border: "none", fontSize: "15px", fontWeight: "700",
                                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                                transition: "opacity 0.2s",
                            }}
                        >
                            {loading ? "Envoi en cours..." : "Envoyer le lien →"}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <Link href="/login" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
                        ← Retour à la connexion
                    </Link>
                </div>
            </div>
            </div>
        </>
    );
}