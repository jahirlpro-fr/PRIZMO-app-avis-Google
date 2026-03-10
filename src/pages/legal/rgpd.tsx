import { useState, useEffect } from "react";

export default function RGPD() {
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
                .btn-primary { background: linear-gradient(135deg, #7c3aed, #db2877); color: white; border: none; padding: 10px 20px; border-radius: 100px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; font-family: inherit; }
                .btn-secondary { background: white; color: #0f0f0f; border: 1.5px solid #e5e5e5; padding: 10px 20px; border-radius: 100px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; font-family: inherit; }
                .container { max-width: 1100px; margin: 0 auto; }
                .container-sm { max-width: 760px; margin: 0 auto; }
                h1 { font-family: 'DM Serif Display', serif; font-size: clamp(32px, 4vw, 52px); font-weight: 400; line-height: 1.15; }
                h2 { font-family: 'DM Serif Display', serif; font-size: 24px; font-weight: 400; margin: 40px 0 16px; color: #0f0f0f; }
                h3 { font-size: 16px; font-weight: 700; margin: 24px 0 8px; }
                p { color: #555; line-height: 1.8; font-size: 15px; margin-bottom: 12px; }
                ul { color: #555; line-height: 1.8; font-size: 15px; margin-bottom: 12px; padding-left: 20px; }
                li { margin-bottom: 6px; }
                a { color: #7c3aed; text-decoration: none; }
                a:hover { text-decoration: underline; }
                .section-divider { height: 1px; background: #efefef; margin: 8px 0; }
                .gradient-text { background: linear-gradient(135deg, #7c3aed, #db2877); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                .highlight-box { background: #f9f5ff; border: 1.5px solid #e9d8fd; border-radius: 16px; padding: 20px 24px; margin: 16px 0; }
                @media (max-width: 768px) { .hide-mobile { display: none !important; } }
            `}</style>

            {/* NAV */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 24px",
                background: "rgba(250,250,250,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #efefef",
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
                        🔒 Légal
                    </div>
                    <h1>Politique de <span className="gradient-text">confidentialité</span></h1>
                    <p style={{ marginTop: "16px", color: "#888", fontSize: "14px" }}>Dernière mise à jour : mars 2025 — Conforme au Règlement Général sur la Protection des Données (RGPD)</p>
                </div>
            </section>

            {/* CONTENU */}
            <section style={{ padding: "0 24px 96px" }}>
                <div className="container-sm">
                    <div style={{ background: "white", border: "1.5px solid #efefef", borderRadius: "24px", padding: "48px", marginBottom: "32px" }}>

                        {/* Résumé simple */}
                        <div className="highlight-box">
                            <p style={{ fontWeight: "600", color: "#7c3aed", marginBottom: "8px" }}>🛡️ En bref</p>
                            <p style={{ marginBottom: "4px" }}>Prizmo collecte uniquement les données strictement nécessaires au fonctionnement du service. Nous ne vendons jamais vos données ni celles de vos clients. Vous pouvez demander la suppression de vos données à tout moment.</p>
                        </div>

                        <h2>1. Responsable du traitement</h2>
                        <div className="section-divider" />
                        <p>
                            <strong>LVN Seller</strong><br />
                            1 rue de l'Hostellerie, 95130 Franconville-la-Garenne, France<br />
                            SIRET : 984 747 725 00013<br />
                            Contact DPO : <a href="mailto:contact@prizmo.pro">contact@prizmo.pro</a>
                        </p>

                        <h2>2. Données collectées</h2>
                        <div className="section-divider" />

                        <h3>2.1 Données des commerçants (Clients Prizmo)</h3>
                        <ul>
                            <li>Nom, prénom, adresse e-mail (création de compte)</li>
                            <li>Informations sur l'établissement (nom, adresse, logo)</li>
                            <li>Informations de paiement (gérées par Stripe — non stockées par Prizmo)</li>
                            <li>Données d'utilisation de la plateforme (connexions, actions)</li>
                        </ul>

                        <h3>2.2 Données des clients finaux (participants aux jeux)</h3>
                        <ul>
                            <li>Adresse e-mail (optionnelle, collectée avec consentement explicite)</li>
                            <li>Numéro de téléphone (optionnel, pour la carte fidélité)</li>
                            <li>Participation au jeu (date, lot obtenu)</li>
                            <li>Informations de carte fidélité (nombre de tampons, récompenses)</li>
                        </ul>
                        <p>Les données des clients finaux sont collectées <strong>pour le compte du commerçant</strong>, qui en est le responsable de traitement secondaire. Prizmo agit en qualité de sous-traitant pour ces données.</p>

                        <h3>2.3 Données de navigation</h3>
                        <ul>
                            <li>Adresse IP, type de navigateur, pages visitées</li>
                            <li>Cookies techniques nécessaires au fonctionnement du service</li>
                        </ul>

                        <h2>3. Finalités du traitement</h2>
                        <div className="section-divider" />
                        <ul>
                            <li><strong>Fourniture du service</strong> : gestion des comptes, des jeux, des cartes fidélité</li>
                            <li><strong>Facturation</strong> : traitement des paiements, émission des factures</li>
                            <li><strong>Support client</strong> : réponse aux demandes, résolution des incidents</li>
                            <li><strong>Amélioration du service</strong> : analyse des usages (données agrégées et anonymisées)</li>
                            <li><strong>Communication</strong> : envoi d'e-mails transactionnels et, avec consentement, d'informations produit</li>
                        </ul>

                        <h2>4. Base légale des traitements</h2>
                        <div className="section-divider" />
                        <ul>
                            <li><strong>Exécution du contrat</strong> : pour les données nécessaires à la fourniture du service souscrit</li>
                            <li><strong>Consentement</strong> : pour la collecte des e-mails des clients finaux et les communications marketing</li>
                            <li><strong>Intérêt légitime</strong> : pour la sécurité du service et la prévention des fraudes</li>
                            <li><strong>Obligation légale</strong> : pour la conservation des données de facturation (10 ans)</li>
                        </ul>

                        <h2>5. Durée de conservation</h2>
                        <div className="section-divider" />
                        <ul>
                            <li><strong>Données de compte commerçant</strong> : durée du contrat + 3 ans</li>
                            <li><strong>Données clients finaux</strong> : 3 ans après le dernier contact actif</li>
                            <li><strong>Données de facturation</strong> : 10 ans (obligation comptable)</li>
                            <li><strong>Données de navigation</strong> : 13 mois maximum</li>
                        </ul>
                        <p>En cas de demande de suppression du compte, les données sont effacées dans un délai de <strong>30 jours</strong>, à l'exception des données soumises à obligation légale de conservation.</p>

                        <h2>6. Sous-traitants et transferts</h2>
                        <div className="section-divider" />
                        <p>Prizmo fait appel aux sous-traitants suivants, tous conformes au RGPD :</p>
                        <ul>
                            <li><strong>Supabase</strong> (base de données) — hébergement en Europe disponible</li>
                            <li><strong>Vercel</strong> (hébergement application) — États-Unis, couvert par les clauses contractuelles types UE</li>
                            <li><strong>Stripe</strong> (paiement) — certifié PCI-DSS, conforme RGPD</li>
                        </ul>
                        <p>Aucune donnée n'est vendue ou cédée à des tiers à des fins commerciales.</p>

                        <h2>7. Vos droits</h2>
                        <div className="section-divider" />
                        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                        <ul>
                            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles</li>
                            <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
                            <li><strong>Droit à l'effacement</strong> : supprimer vos données (« droit à l'oubli »)</li>
                            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
                            <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements</li>
                            <li><strong>Droit à la limitation</strong> : restreindre temporairement un traitement</li>
                            <li><strong>Droit de retirer votre consentement</strong> : à tout moment, sans effet rétroactif</li>
                        </ul>

                        <div className="highlight-box">
                            <p style={{ fontWeight: "600", color: "#7c3aed", marginBottom: "8px" }}>📬 Exercer vos droits</p>
                            <p style={{ marginBottom: "0" }}>Envoyez votre demande à <a href="mailto:contact@prizmo.pro">contact@prizmo.pro</a> en précisant votre identité. Nous répondrons dans un délai de <strong>30 jours</strong>.</p>
                        </div>

                        <p style={{ marginTop: "16px" }}>Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la <strong>CNIL</strong> : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a></p>

                        <h2>8. Cookies</h2>
                        <div className="section-divider" />
                        <p>Prizmo utilise uniquement des cookies <strong>strictement nécessaires</strong> au fonctionnement du service (session, authentification, préférences). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
                        <p>Vous pouvez configurer votre navigateur pour refuser les cookies, ce qui peut affecter certaines fonctionnalités du service.</p>

                        <h2>9. Sécurité des données</h2>
                        <div className="section-divider" />
                        <p>Prizmo met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
                        <ul>
                            <li>Chiffrement des données en transit (HTTPS/TLS)</li>
                            <li>Chiffrement des données au repos (base de données Supabase)</li>
                            <li>Authentification sécurisée avec gestion des rôles</li>
                            <li>Accès aux données limité aux personnes autorisées</li>
                            <li>Sauvegardes régulières</li>
                        </ul>

                        <h2>10. Données des mineurs</h2>
                        <div className="section-divider" />
                        <p>Le service Prizmo est destiné aux professionnels et aux personnes majeures. Nous ne collectons pas sciemment de données concernant des mineurs de moins de 16 ans. Si vous êtes parent ou tuteur et constatez qu'un mineur a fourni des données, contactez-nous pour suppression immédiate.</p>

                        <h2>11. Modifications</h2>
                        <div className="section-divider" />
                        <p>Nous nous réservons le droit de modifier la présente politique à tout moment. Toute modification substantielle sera notifiée par e-mail aux Clients actifs au moins 15 jours avant son entrée en vigueur.</p>

                        <h2>12. Contact</h2>
                        <div className="section-divider" />
                        <p>Pour toute question relative à la protection de vos données : <a href="mailto:contact@prizmo.pro">contact@prizmo.pro</a></p>
                    </div>

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <a href="/legal/mentions" style={{ background: "white", border: "1.5px solid #efefef", borderRadius: "12px", padding: "16px 24px", textDecoration: "none", color: "#0f0f0f", fontSize: "14px", fontWeight: "600" }}>
                            📄 Mentions légales →
                        </a>
                        <a href="/legal/cgv" style={{ background: "white", border: "1.5px solid #efefef", borderRadius: "12px", padding: "16px 24px", textDecoration: "none", color: "#0f0f0f", fontSize: "14px", fontWeight: "600" }}>
                            📋 CGV →
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