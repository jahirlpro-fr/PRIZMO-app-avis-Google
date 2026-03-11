import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function PricingPage() {
    const router = useRouter();
    const [isAnnual, setIsAnnual] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, []);

    const handleSubscribe = async (plan: "solo" | "pro") => {
        if (!user) {
            router.push(`/login?redirect=/pricing`);
            return;
        }

        setLoading(plan);
        try {
            const res = await fetch("/api/stripe/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan,
                    billing: isAnnual ? "yearly" : "monthly",
                    userId: user.id,
                    email: user.email,
                }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(null);
        }
    };

    const features = [
        { label: "Roue de la fortune", solo: true, pro: true },
        { label: "Tunnel avis Google", solo: true, pro: true },
        { label: "Collecte emails + tél", solo: true, pro: true },
        { label: "Affiches imprimables", solo: true, pro: true },
        { label: "Participants / mois", solo: "100 max", pro: "Illimités" },
        { label: "Tunnel avis Instagram", solo: false, pro: true },
        { label: "Programme de fidélité", solo: false, pro: true },
        { label: "Analytics", solo: "Basic", pro: "Avancés" },
        { label: "Chevalet physique", solo: false, pro: "2 inclus" },
        { label: "Support", solo: "Email", pro: "Prioritaire" },
    ];

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fafafa", minHeight: "100vh" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
            `}</style>

            {/* NAV */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                background: "rgba(250,250,250,0.9)", backdropFilter: "blur(12px)",
                borderBottom: "1px solid #efefef", padding: "0 24px",
            }}>
                <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>
                    <a href="/" style={{ textDecoration: "none" }}>
                        <img src="/LOGO.svg" alt="Prizmo" style={{ height: "36px" }} />
                    </a>
                    <a href="/login" style={{
                        background: "linear-gradient(135deg, #7c3aed, #db2777)",
                        color: "white", padding: "10px 24px", borderRadius: "100px",
                        textDecoration: "none", fontWeight: "700", fontSize: "14px",
                    }}>
                        Connexion
                    </a>
                </div>
            </nav>

            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "120px 24px 80px" }}>

                {/* HEADER */}
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "48px", fontWeight: "400", marginBottom: "16px", color: "#0f0f0f" }}>
                        Choisissez votre plan
                    </h1>
                    <p style={{ color: "#888", fontSize: "18px", marginBottom: "32px" }}>
                        Commencez avec 21 jours d'essai gratuit — aucune carte bancaire requise.
                    </p>

                    {/* SWITCH MENSUEL / ANNUEL */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", background: "white", border: "1.5px solid #efefef", borderRadius: "100px", padding: "6px 8px" }}>
                        <button
                            onClick={() => setIsAnnual(false)}
                            style={{
                                padding: "8px 20px", borderRadius: "100px", border: "none", cursor: "pointer",
                                background: !isAnnual ? "linear-gradient(135deg, #7c3aed, #db2777)" : "transparent",
                                color: !isAnnual ? "white" : "#888", fontWeight: "700", fontSize: "14px",
                                transition: "all 0.2s",
                            }}
                        >
                            Mensuel
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            style={{
                                padding: "8px 20px", borderRadius: "100px", border: "none", cursor: "pointer",
                                background: isAnnual ? "linear-gradient(135deg, #7c3aed, #db2777)" : "transparent",
                                color: isAnnual ? "white" : "#888", fontWeight: "700", fontSize: "14px",
                                transition: "all 0.2s",
                                display: "flex", alignItems: "center", gap: "8px",
                            }}
                        >
                            Annuel
                            <span style={{
                                background: "#dcfce7", color: "#16a34a",
                                fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "100px",
                            }}>
                                -20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* CARDS */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "48px" }}>

                    {/* SOLO */}
                    <div style={{
                        background: "white", border: "1.5px solid #efefef",
                        borderRadius: "24px", padding: "36px 32px",
                    }}>
                        <p style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: "12px" }}>SOLO</p>
                        <div style={{ marginBottom: "8px" }}>
                            <span style={{ fontSize: "48px", fontWeight: "900", color: "#0f0f0f" }}>
                                {isAnnual ? "41€" : "49€"}
                            </span>
                            <span style={{ color: "#aaa", fontSize: "16px" }}>/mois</span>
                        </div>
                        {isAnnual && (
                            <p style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>Facturé 490€/an</p>
                        )}
                        <p style={{ color: "#888", fontSize: "14px", marginBottom: "28px" }}>
                            Idéal pour démarrer et tester Prizmo.
                        </p>
                        <button
                            onClick={() => handleSubscribe("solo")}
                            disabled={loading === "solo"}
                            style={{
                                width: "100%", padding: "14px", borderRadius: "14px", border: "2px solid #e5e7eb",
                                background: "white", color: "#0f0f0f", fontWeight: "700", fontSize: "15px",
                                cursor: "pointer", marginBottom: "28px", transition: "all 0.2s",
                            }}
                        >
                            {loading === "solo" ? "Chargement..." : "Choisir SOLO \u2192"}
                        </button>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {features.map((f, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                                    {f.solo === false ? (
                                        <X style={{ width: "16px", height: "16px", color: "#ddd", flexShrink: 0 }} />
                                    ) : (
                                        <Check style={{ width: "16px", height: "16px", color: "#7c3aed", flexShrink: 0 }} />
                                    )}
                                    <span style={{ color: f.solo === false ? "#ccc" : "#555" }}>
                                        {f.label}{typeof f.solo === "string" ? ` — ${f.solo}` : ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PRO */}
                    <div style={{
                        background: "linear-gradient(160deg, #f5f0ff 0%, #fdf4ff 100%)",
                        border: "2px solid #7c3aed", borderRadius: "24px", padding: "36px 32px",
                        position: "relative",
                    }}>
                        <div style={{
                            position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
                            background: "linear-gradient(135deg, #7c3aed, #db2777)", color: "white",
                            fontSize: "12px", fontWeight: "800", padding: "4px 16px", borderRadius: "100px",
                            whiteSpace: "nowrap",
                        }}>
                            ⭐ Recommandé
                        </div>
                        <p style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "0.1em", color: "#7c3aed", textTransform: "uppercase", marginBottom: "12px" }}>PRO</p>
                        <div style={{ marginBottom: "8px" }}>
                            <span style={{ fontSize: "48px", fontWeight: "900", color: "#0f0f0f" }}>
                                {isAnnual ? "58€" : "69€"}
                            </span>
                            <span style={{ color: "#aaa", fontSize: "16px" }}>/mois</span>
                        </div>
                        {isAnnual && (
                            <p style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>Facturé 690€/an</p>
                        )}
                        <p style={{ color: "#7c3aed", fontSize: "14px", fontWeight: "600", marginBottom: "28px" }}>
                            Tout ce qu'il faut pour fidéliser.
                        </p>
                        <button
                            onClick={() => handleSubscribe("pro")}
                            disabled={loading === "pro"}
                            style={{
                                width: "100%", padding: "14px", borderRadius: "14px", border: "none",
                                background: "linear-gradient(135deg, #7c3aed, #db2777)",
                                color: "white", fontWeight: "700", fontSize: "15px",
                                cursor: "pointer", marginBottom: "28px", transition: "all 0.2s",
                                boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
                            }}
                        >
                            {loading === "pro" ? "Chargement..." : "Choisir PRO \u2192"}
                        </button>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {features.map((f, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                                    <Check style={{ width: "16px", height: "16px", color: "#7c3aed", flexShrink: 0 }} />
                                    <span style={{ color: "#555", fontWeight: f.pro !== true ? "600" : "400" }}>
                                        {f.label}{typeof f.pro === "string" ? ` — ${f.pro}` : ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BUSINESS */}
                <div style={{
                    background: "white", border: "1.5px solid #efefef", borderRadius: "24px",
                    padding: "32px", display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: "24px", flexWrap: "wrap",
                }}>
                    <div>
                        <p style={{ fontSize: "12px", fontWeight: "800", letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: "8px" }}>BUSINESS</p>
                        <h3 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "6px" }}>Multi-établissements & White label</h3>
                        <p style={{ color: "#888", fontSize: "14px" }}>Tarification dégressive à partir de 5 établissements. Support téléphonique dédié.</p>
                    </div>
                    
                        href="mailto:contact@prizmo.pro?subject=Demande BUSINESS"
                        style={{
                            background: "#0f0f0f", color: "white", padding: "14px 28px",
                            borderRadius: "14px", textDecoration: "none", fontWeight: "700",
                            fontSize: "14px", whiteSpace: "nowrap",
                        }}
                    >
                    Nous contacter &#x2192;
                    </a>
                </div>

                {/* REASSURANCE */}
                <div style={{ textAlign: "center", marginTop: "48px", display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
                    {["🔒 Sans engagement", "💳 Paiement sécurisé Stripe", "❌ Annulation à tout moment", "🎁 21 jours d'essai gratuit"].map((item, i) => (
                        <span key={i} style={{ color: "#888", fontSize: "14px", fontWeight: "500" }}>{item}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}