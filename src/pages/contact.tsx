import { useState, useEffect } from "react";

const MOTIFS = [
    { value: "", label: "Sélectionnez un motif…" },
    { value: "demo", label: "🎯 Demande de démo" },
    { value: "support", label: "🛠️ Support technique" },
    { value: "facturation", label: "💳 Facturation / Abonnement" },
    { value: "partenariat", label: "🤝 Partenariat" },
    { value: "autre", label: "💬 Autre" },
];

const MOTIF_LABELS: Record<string, string> = {
    demo: "Demande de démo",
    support: "Support technique",
    facturation: "Facturation / Abonnement",
    partenariat: "Partenariat",
    autre: "Autre",
};

export default function ContactPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", motif: "", message: "" });
    const [errors, setErrors] = useState < Record < string, string>> ({});
    const [status, setStatus] = useState < "idle" | "sending" | "success" | "error" > ("idle");

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = "Votre nom est requis";
        if (!form.email.trim()) {
            newErrors.email = "Votre email est requis";
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
            newErrors.email = "Format d'email invalide";
        }
        if (!form.motif) newErrors.motif = "Veuillez sélectionner un motif";
        if (!form.message.trim()) newErrors.message = "Votre message est requis";
        else if (form.message.trim().length < 20) newErrors.message = "Message trop court (min. 20 caractères)";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setStatus("sending");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
            setStatus("success");
            setForm({ name: "", email: "", motif: "", message: "" });
        } catch {
            setStatus("error");
        }
    };

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fafafa", color: "#0f0f0f", minHeight: "100vh" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-link { color: #444; text-decoration: none; font-size: 15px; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: #7c3aed; }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #db2777); color: white; border: none; padding: 10px 20px; border-radius: 100px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; font-family: inherit; transition: transform 0.2s, box-shadow 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.35); }
        .btn-secondary { background: white; color: #0f0f0f; border: 1.5px solid #e5e5e5; padding: 10px 20px; border-radius: 100px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; font-family: inherit; }
        .container { max-width: 1100px; margin: 0 auto; }
        .container-sm { max-width: 760px; margin: 0 auto; }
        h1 { font-family: 'DM Serif Display', serif; font-size: clamp(32px, 4vw, 52px); font-weight: 400; line-height: 1.15; }
        h2 { font-family: 'DM Serif Display', serif; font-size: clamp(24px, 3vw, 36px); font-weight: 400; }
        .gradient-text { background: linear-gradient(135deg, #7c3aed, #db2777); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .tag { display: inline-flex; align-items: center; gap: 6px; background: #f3f0ff; color: #7c3aed; padding: 6px 14px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }

        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 14px; font-weight: 600; color: #333; }
        .form-input {
          width: 100%; padding: 14px 16px; border-radius: 14px;
          border: 1.5px solid #e5e5e5; font-family: inherit;
          font-size: 15px; color: #0f0f0f; background: white;
          transition: border-color 0.2s, box-shadow 0.2s; outline: none;
        }
        .form-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        .form-input.error { border-color: #ef4444; }
        .form-input.error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
        .error-msg { font-size: 12px; color: #ef4444; font-weight: 500; }
        textarea.form-input { resize: vertical; min-height: 140px; }
        select.form-input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; padding-right: 40px; cursor: pointer; }

        .submit-btn {
          width: 100%; padding: 16px; border-radius: 100px;
          background: linear-gradient(135deg, #7c3aed, #db2777);
          color: white; border: none; font-family: inherit;
          font-size: 16px; font-weight: 700; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.35); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .info-card { background: white; border: 1.5px solid #efefef; border-radius: 20px; padding: 24px; display: flex; gap: 16px; align-items: flex-start; }
        .info-icon { width: 44px; height: 44px; border-radius: 12px; background: #f3f0ff; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }

        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

            {/* ── NAV ── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 24px",
                background: "rgba(250,250,250,0.9)", backdropFilter: "blur(12px)",
                borderBottom: "1px solid #efefef", transition: "all 0.3s",
            }}>
                <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>
                    <a href="/" style={{ textDecoration: "none" }}>
                        <img src="/LOGO.svg" alt="Prizmo" style={{ height: "36px" }} />
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                        <a href="/#features" className="nav-link hide-mobile">Fonctionnalités</a>
                        <a href="/pricing" className="nav-link hide-mobile">Tarifs</a>
                        <a href="/#faq" className="nav-link hide-mobile">FAQ</a>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <a href="/login" className="btn-secondary">Connexion</a>
                        <a href="/admin/establishment/new" className="btn-primary">Essai gratuit →</a>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section style={{
                paddingTop: "120px", paddingBottom: "64px", paddingLeft: "24px", paddingRight: "24px",
                background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.08) 0%, transparent 70%), #fafafa",
                textAlign: "center",
            }}>
                <div className="container-sm">
                    <div className="tag">📬 Contact</div>
                    <h1>Une question ?<br /><span className="gradient-text">On vous répond.</span></h1>
                    <p style={{ color: "#666", fontSize: "17px", lineHeight: "1.7", marginTop: "20px" }}>
                        Notre équipe répond en général sous <strong>24h ouvrées</strong>.<br />
                        Pour les urgences, précisez-le dans votre message.
                    </p>
                </div>
            </section>

            {/* ── CONTENU ── */}
            <section style={{ padding: "0 24px 96px" }}>
                <div className="container">
                    <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "48px", alignItems: "start" }}>

                        {/* ── FORMULAIRE ── */}
                        <div style={{ background: "white", border: "1.5px solid #efefef", borderRadius: "24px", padding: "48px" }}>

                            {status === "success" ? (
                                <div style={{ textAlign: "center", padding: "40px 0" }}>
                                    <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎉</div>
                                    <h2 style={{ marginBottom: "16px" }}>Message envoyé !</h2>
                                    <p style={{ color: "#666", lineHeight: "1.7", marginBottom: "32px" }}>
                                        Merci pour votre message. Nous vous répondons sous <strong>24h ouvrées</strong>.<br />
                                        Un email de confirmation vous a été envoyé.
                                    </p>
                                    <button
                                        onClick={() => setStatus("idle")}
                                        className="btn-primary"
                                        style={{ padding: "14px 32px", fontSize: "15px" }}
                                    >
                                        Envoyer un autre message
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    <div>
                                        <h2 style={{ marginBottom: "8px" }}>Envoyez-nous un message</h2>
                                        <p style={{ color: "#888", fontSize: "14px" }}>Tous les champs marqués * sont obligatoires.</p>
                                    </div>

                                    {/* Nom + Email */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                        <div className="form-group">
                                            <label className="form-label">Nom complet *</label>
                                            <input
                                                type="text"
                                                placeholder="Jean Dupont"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                className={`form-input${errors.name ? " error" : ""}`}
                                            />
                                            {errors.name && <span className="error-msg">{errors.name}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email *</label>
                                            <input
                                                type="email"
                                                placeholder="vous@email.com"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                className={`form-input${errors.email ? " error" : ""}`}
                                            />
                                            {errors.email && <span className="error-msg">{errors.email}</span>}
                                        </div>
                                    </div>

                                    {/* Motif */}
                                    <div className="form-group">
                                        <label className="form-label">Motif de contact *</label>
                                        <select
                                            value={form.motif}
                                            onChange={e => setForm({ ...form, motif: e.target.value })}
                                            className={`form-input${errors.motif ? " error" : ""}`}
                                        >
                                            {MOTIFS.map(m => (
                                                <option key={m.value} value={m.value} disabled={m.value === ""}>{m.label}</option>
                                            ))}
                                        </select>
                                        {errors.motif && <span className="error-msg">{errors.motif}</span>}
                                    </div>

                                    {/* Message */}
                                    <div className="form-group">
                                        <label className="form-label">Message *</label>
                                        <textarea
                                            placeholder="Décrivez votre demande en détail…"
                                            value={form.message}
                                            onChange={e => setForm({ ...form, message: e.target.value })}
                                            className={`form-input${errors.message ? " error" : ""}`}
                                        />
                                        {errors.message && <span className="error-msg">{errors.message}</span>}
                                        <span style={{ fontSize: "12px", color: "#aaa", textAlign: "right" }}>
                                            {form.message.length} caractères
                                        </span>
                                    </div>

                                    {/* Erreur envoi */}
                                    {status === "error" && (
                                        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "12px", padding: "14px 16px" }}>
                                            <p style={{ color: "#dc2626", fontSize: "14px", margin: 0 }}>
                                                ❌ Une erreur est survenue. Veuillez réessayer ou écrire directement à <a href="mailto:contact@prizmo.pro" style={{ color: "#dc2626" }}>contact@prizmo.pro</a>
                                            </p>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={status === "sending"}
                                        className="submit-btn"
                                    >
                                        {status === "sending" ? "⏳ Envoi en cours…" : "Envoyer le message →"}
                                    </button>

                                    <p style={{ fontSize: "12px", color: "#aaa", textAlign: "center" }}>
                                        🔒 Vos données sont traitées conformément à notre{" "}
                                        <a href="/legal/rgpd" style={{ color: "#7c3aed" }}>politique de confidentialité</a>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── SIDEBAR INFOS ── */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                            {/* Temps de réponse */}
                            <div className="info-card">
                                <div className="info-icon">⚡</div>
                                <div>
                                    <p style={{ fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>Réponse rapide</p>
                                    <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                                        Nous répondons sous <strong>24h ouvrées</strong>. Pour les demandes urgentes, mentionnez-le dans votre message.
                                    </p>
                                </div>
                            </div>

                            {/* Email direct */}
                            <div className="info-card">
                                <div className="info-icon">📧</div>
                                <div>
                                    <p style={{ fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>Email direct</p>
                                    <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                                        Vous pouvez aussi nous écrire directement à{" "}
                                        <a href="mailto:contact@prizmo.pro" style={{ color: "#7c3aed", fontWeight: "600" }}>contact@prizmo.pro</a>
                                    </p>
                                </div>
                            </div>

                            {/* Démo */}
                            <div className="info-card" style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)", border: "none" }}>
                                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🎡</div>
                                <div>
                                    <p style={{ fontWeight: "700", fontSize: "15px", marginBottom: "4px", color: "white" }}>Essai gratuit</p>
                                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 12px" }}>
                                        Pas besoin d'attendre — testez Prizmo gratuitement pendant 14 jours, sans carte bancaire.
                                    </p>
                                    <a href="/admin/establishment/new" style={{
                                        background: "white", color: "#7c3aed", padding: "10px 20px",
                                        borderRadius: "100px", fontSize: "13px", fontWeight: "700",
                                        textDecoration: "none", display: "inline-block",
                                    }}>
                                        Démarrer gratuitement →
                                    </a>
                                </div>
                            </div>

                            {/* FAQ */}
                            <div className="info-card">
                                <div className="info-icon">❓</div>
                                <div>
                                    <p style={{ fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>Consultez la FAQ</p>
                                    <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.6", margin: "0 0 10px" }}>
                                        Votre question a peut-être déjà une réponse dans notre FAQ.
                                    </p>
                                    <a href="/#faq" style={{ color: "#7c3aed", fontWeight: "600", fontSize: "14px", textDecoration: "none" }}>
                                        Voir la FAQ →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ background: "#0f0f0f", color: "#888", padding: "40px 24px" }}>
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                    <img src="/LOGO.svg" alt="Prizmo" style={{ height: "28px", filter: "brightness(0) invert(1)", opacity: 0.6 }} />
                    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                        <a href="/legal/mentions" style={{ color: "#888", textDecoration: "none", fontSize: "13px" }}>Mentions légales</a>
                        <a href="/legal/cgv" style={{ color: "#888", textDecoration: "none", fontSize: "13px" }}>CGV</a>
                        <a href="/legal/rgpd" style={{ color: "#888", textDecoration: "none", fontSize: "13px" }}>RGPD</a>
                    </div>
                    <p style={{ fontSize: "13px" }}>© 2025 Prizmo — LVN Seller</p>
                </div>
            </footer>
        </div>
    );
}