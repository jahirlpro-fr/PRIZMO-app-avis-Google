import { useState, useEffect } from "react";

export default function MentionsLegales() {
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fafafa", color: "#0f0f0f", minHeight: "100vh" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .nav-link { color: #444; text-decoration: none; font-size: 15px; font-weight: 500; transition: color 0.2s; }
                .nav-link:hover { color: #7c3aed; }
                .btn-primary { background: linear-gradient(135deg, #7c3aed, #db2777); color: white; border: none; padding: 10px 20px; border-radius: 100px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; font-family: inherit; }
                .btn-secondary { background: white; color: #0f0f0f; border: 1.5px solid #e5e5e5; padding: 10px 20px; border-radius: 100px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; font-family: inherit; }
                .container { max-width: 1100px; margin: 0 auto; }
                .container-sm { max-width: 760px; margin: 0 auto; }
                h1 { font-family: 'DM Serif Display', serif; font-size: clamp(32px, 4vw, 52px); font-weight: 400; line-height: 1.15; }
                h2 { font-family: 'DM Serif Display', serif; font-size: 24px; font-weight: 400; margin: 40px 0 16px; color: #0f0f0f; }
                h3 { font-size: 16px; font-weight: 700; margin: 24px 0 8px; }
                p { color: #555; line-height: 1.8; font-size: 15px; margin-bottom: 12px; }
                a { color: #7c3aed; text-decoration: none; }
                a:hover { text-decoration: underline; }
                .section-divider { height: 1px; background: #efefef; margin: 8px 0; }
                .gradient-text { background: linear-gradient(135deg, #7c3aed, #db2777); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                @media (max-width: 768px) { .hide-mobile { display: none !important; } }
            `}</style>

            {/* NAV */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 24px",
                background: isScrolled ? "rgba(250,250,250,0.9)" : "rgba(250,250,250,0.9)",
                backdropFilter: "blur(12px)", borderBottom: "1px solid #efefef", transition: "all 0.3s",
            }}>
                <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>
                    <a href="/" style={{ textDecoration: "none" }}>
                        <img src="/LOGO.svg" alt="Prizmo" style={{ height: "36px" }} />
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                        <a href="/#tarifs" className="nav-link hide-mobile">Tarifs</a>
                        <a href="/pricing" className="nav-link hide-mobile">Plans</a>
                        <a href="/#faq" className="nav-link hide-mobile">FAQ</a>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <a href="/login" className="btn-secondary">Connexion</a>
                        <a href="/admin/establishment/new" className="btn-primary">Essai gratuit →</a>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section style={{ paddingTop: "120px", paddingBottom: "48px", paddingLeft: "24px", paddingRight: "24px", background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.08) 0%, transparent 70%), #fafafa" }}>
                <div className="container-sm">
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f3f0ff", color: "#7c3aed", padding: "6px 14px", borderRadius: "100px", fontSize: "13px", fontWeight: "600", marginBottom: "20px" }}>
                        📄 Légal
                    </div>
                    <h1>Mentions <span className="gradient-text">légales</span></h1>
                    <p style={{ marginTop: "16px", color: "#888", fontSize: "14px" }}>Dernière mise à jour : mars 2025</p>
                </div>
            </section>

            {/* CONTENU */}
            <section style={{ padding: "0 24px 96px" }}>
                <div className="container-sm">
                    <div style={{ background: "white", border: "1.5px solid #efefef", borderRadius: "24px", padding: "48px", marginBottom: "32px" }}>

                        <h2>1. Éditeur du site</h2>
                        <div className="section-divider" />
                        <p>Le site <strong>prizmo.pro</strong> est édité par :</p>
                        <p>
                            <strong>LVN Seller</strong><br />
                            Entrepreneur individuel (Auto-entrepreneur)<br />
                            SIRET : 984 747 725 00013<br />
                            Code NAF : 6201Z — Programmation informatique<br />
                            Adresse : 1 rue de l'Hostellerie, 95130 Franconville-la-Garenne, France<br />
                            E-mail : <a href="mailto:contact@prizmo.pro">contact@prizmo.pro</a>
                        </p>
                        <p style={{ marginTop: "8px" }}>
                            Prizmo est le nom commercial de la plateforme SaaS éditée par LVN Seller.
                        </p>

                        <h2>2. Directeur de la publication</h2>
                        <div className="section-divider" />
                        <p>Le directeur de la publication est le représentant légal de LVN Seller, joignable à l'adresse e-mail : <a href="mailto:contact@prizmo.pro">contact@prizmo.pro</a></p>

                        <h2>3. Hébergement</h2>
                        <div className="section-divider" />
                        <p>
                            Le site est hébergé par :<br />
                            <strong>Vercel Inc.</strong><br />
                            440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
                            Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
                        </p>
                        <p>
                            La base de données est hébergée par :<br />
                            <strong>Supabase Inc.</strong><br />
                            970 Toa Payoh North, Singapour<br />
                            Site web : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>
                        </p>

                        <h2>4. Propriété intellectuelle</h2>
                        <div className="section-divider" />
                        <p>L'ensemble des éléments constituant le site prizmo.pro (textes, graphismes, logiciels, photographies, images, sons, plans, noms, logos, marques, créations et œuvres protégeables diverses) est la propriété exclusive de LVN Seller.</p>
                        <p>Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de LVN Seller.</p>
                        <p>Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.</p>

                        <h2>5. Liens hypertextes</h2>
                        <div className="section-divider" />
                        <p>Le site prizmo.pro peut contenir des liens hypertextes vers d'autres sites présents sur le réseau Internet. Les liens vers d'autres sites ne sauraient engager la responsabilité de LVN Seller, notamment en ce qui concerne le contenu de ces sites.</p>

                        <h2>6. Limitation de responsabilité</h2>
                        <div className="section-divider" />
                        <p>LVN Seller s'efforce d'assurer au mieux de ses possibilités l'exactitude et la mise à jour des informations diffusées sur le site prizmo.pro. Toutefois, LVN Seller ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.</p>
                        <p>LVN Seller décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site, ainsi que pour tous dommages résultant d'une intrusion frauduleuse d'un tiers.</p>

                        <h2>7. Droit applicable</h2>
                        <div className="section-divider" />
                        <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>

                        <h2>8. Contact</h2>
                        <div className="section-divider" />
                        <p>Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à : <a href="mailto:contact@prizmo.pro">contact@prizmo.pro</a></p>
                    </div>

                    {/* Liens vers autres pages légales */}
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <a href="/legal/cgv" style={{ background: "white", border: "1.5px solid #efefef", borderRadius: "12px", padding: "16px 24px", textDecoration: "none", color: "#0f0f0f", fontSize: "14px", fontWeight: "600", transition: "border-color 0.2s" }}>
                            📋 Conditions Générales de Vente →
                        </a>
                        <a href="/legal/rgpd" style={{ background: "white", border: "1.5px solid #efefef", borderRadius: "12px", padding: "16px 24px", textDecoration: "none", color: "#0f0f0f", fontSize: "14px", fontWeight: "600", transition: "border-color 0.2s" }}>
                            🔒 Politique de confidentialité (RGPD) →
                        </a>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
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