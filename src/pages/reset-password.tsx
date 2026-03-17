import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/router";
import Link from "next/link";

export default function ResetPassword() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Supabase injecte automatiquement la session depuis l'URL
        supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                setReady(true);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!password || !confirm) { setError("Veuillez remplir tous les champs."); return; }
        if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
        if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: any) {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
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
                    <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔑</div>
                    <h1 style={{ color: "white", fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
                        Nouveau mot de passe
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", lineHeight: "1.6" }}>
                        Choisissez un nouveau mot de passe sécurisé.
                    </p>
                </div>

                {success ? (
                    <div style={{
                        background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                        borderRadius: "12px", padding: "20px", textAlign: "center",
                    }}>
                        <div style={{ fontSize: "32px", marginBottom: "12px" }}>✅</div>
                        <p style={{ color: "#86efac", fontSize: "15px", fontWeight: "600", marginBottom: "8px" }}>
                            Mot de passe mis à jour !
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                            Redirection vers la connexion dans 3 secondes...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                                Nouveau mot de passe
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: "100%", padding: "12px 16px", borderRadius: "12px",
                                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                    color: "white", fontSize: "15px", outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                                Confirmer le mot de passe
                            </label>
                            <input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="••••••••"
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
                            }}
                        >
                            {loading ? "Mise à jour..." : "Enregistrer le mot de passe →"}
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
    );
}