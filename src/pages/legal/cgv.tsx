import { useState, useEffect } from "react";

export default function CGV() {
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
                ul { color: #555; line-height: 1.8; font-size: 15px; margin-bottom: 12px; padding-left: 20px; }
                li { margin-bottom: 6px; }
                a { color: #7c3aed; text-decoration: none; }
                a:hover { text-decoration: underline; }
                .section-divider { height: 1px; background: #efefef; margin: 8px 0; }
                .gradient-text { background: linear-gradient(135deg, #7c3aed, #db2777); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
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
                        📋 Légal
                    </div>
                    <h1>Conditions Générales <span className="gradient-text">de Vente</span></h1>
                    <p style={{ marginTop: "16px", color: "#888", fontSize: "14px" }}>Dernière mise à jour : mars 2025</p>
                </div>
            </section>

            {/* CONTENU */}
            <section style={{ padding: "0 24px 96px" }}>
                <div className="container-sm">
                    <div style={{ background: "white", border: "1.5px solid #efefef", borderRadius: "24px", padding: "48px", marginBottom: "32px" }}>

                        <h2>Préambule</h2>
                        <div className="section-divider" />
                        <p>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre <strong>LVN Seller</strong> (SIRET : 984 747 725 00013), ci-après dénommé « l'Éditeur », et toute personne physique ou morale souscrivant à la plateforme <strong>Prizmo</strong> accessible sur prizmo.pro, ci-après dénommée « le Client ».</p>
                        <p>Toute souscription au service implique l'acceptation pleine et entière des présentes CGV.</p>

                        <h2>1. Description du service</h2>
                        <div className="section-divider" />
                        <p>Prizmo est une plateforme SaaS (Software as a Service) de gamification et de fidélisation destinée aux commerçants de proximité (restaurants, cafés, bars, boulangeries, etc.). Elle permet notamment :</p>
                        <ul>
                            <li>La création et la gestion d'une roue de la fortune accessible par QR code</li>
                            <li>La collecte d'avis Google via un système de redirection post-jeu</li>
                            <li>La gestion d'une carte fidélité digitale</li>
                            <li>La consultation d'indicateurs de performance (analytics)</li>
                            <li>La génération d'affiches imprimables (A4/A5)</li>
                        </ul>

                        <h2>2. Plans tarifaires</h2>
                        <div className="section-divider" />
                        <h3>2.1 Plans disponibles</h3>
                        <ul>
                            <li><strong>SOLO — 49€ HT/mois</strong> (ou 41€ HT/mois en annuel, facturé 490€/an) : 1 établissement, 100 participants/mois, tunnel avis Google, analytics basic</li>
                            <li><strong>PRO — 69€ HT/mois</strong> (ou 58€ HT/mois en annuel, facturé 690€/an) : 1 établissement, participants illimités, tunnel Instagram, programme de fidélité, analytics avancés</li>
                            <li><strong>BUSINESS — sur devis</strong> : multi-établissements, tarification dégressive</li>
                        </ul>
                        <p>Les prix sont indiqués hors taxes. En tant qu'auto-entrepreneur sous le régime de la franchise en base de TVA (article 293 B du CGI), l'Éditeur ne facture pas de TVA. La mention « TVA non applicable, article 293 B du CGI » figure sur les factures.</p>

                        <h3>2.2 Essai gratuit</h3>
                        <p>Tout nouveau Client bénéficie d'une période d'essai gratuite de <strong>14 jours</strong> avec accès complet au plan PRO. Aucune information de paiement n'est requise pour démarrer l'essai. À l'issue de cette période, le Client choisit librement son plan ou met fin à son utilisation du service.</p>

                        <h2>3. Commande et souscription</h2>
                        <div className="section-divider" />
                        <p>La souscription s'effectue en ligne sur prizmo.pro. Le Client crée un compte, renseigne les informations nécessaires et choisit son plan. La confirmation de souscription est envoyée par e-mail à l'adresse fournie lors de l'inscription.</p>
                        <p>Le contrat est conclu pour une durée d'un mois (facturation mensuelle) ou d'un an (facturation annuelle), renouvelable tacitement.</p>

                        <h2>4. Paiement</h2>
                        <div className="section-divider" />
                        <p>Le paiement est effectué par carte bancaire via la plateforme sécurisée <strong>Stripe</strong>. Les coordonnées bancaires du Client ne sont pas stockées par l'Éditeur.</p>
                        <p>En cas d'échec de paiement, l'Éditeur se réserve le droit de suspendre l'accès au service après notification au Client. En cas de non-régularisation dans un délai de 7 jours, le compte peut être résilié.</p>

                        <h2>5. Résiliation</h2>
                        <div className="section-divider" />
                        <p>Le Client peut résilier son abonnement à tout moment depuis son espace personnel. La résiliation prend effet à la fin de la période en cours (mensuelle ou annuelle). Aucun remboursement prorata temporis n'est effectué, sauf en cas de faute de l'Éditeur.</p>
                        <p>L'Éditeur se réserve le droit de résilier le compte d'un Client en cas de violation des présentes CGV, sans remboursement.</p>

                        <h2>6. Obligations du Client</h2>
                        <div className="section-divider" />
                        <p>Le Client s'engage à :</p>
                        <ul>
                            <li>Utiliser le service conformément à sa destination et à la législation en vigueur</li>
                            <li>Ne pas utiliser le service à des fins frauduleuses ou illicites</li>
                            <li>Maintenir la confidentialité de ses identifiants de connexion</li>
                            <li>Informer l'Éditeur de tout accès non autorisé à son compte</li>
                            <li>Respecter les droits des tiers, notamment en matière de données personnelles</li>
                        </ul>

                        <h2>7. Disponibilité du service</h2>
                        <div className="section-divider" />
                        <p>L'Éditeur s'engage à mettre tout en œuvre pour assurer la disponibilité du service 24h/24 et 7j/7. Toutefois, des interruptions pour maintenance, mises à jour ou incidents techniques peuvent survenir. L'Éditeur informera les Clients dans la mesure du possible des maintenances programmées.</p>
                        <p>L'Éditeur ne saurait être tenu responsable des interruptions indépendantes de sa volonté (pannes d'hébergeur, force majeure, etc.).</p>

                        <h2>8. Limitation de responsabilité</h2>
                        <div className="section-divider" />
                        <p>La responsabilité de l'Éditeur ne saurait être engagée pour les dommages indirects subis par le Client, notamment la perte de chiffre d'affaires, de clientèle ou de données, résultant de l'utilisation ou de l'impossibilité d'utiliser le service.</p>
                        <p>En tout état de cause, la responsabilité de l'Éditeur est limitée au montant des sommes effectivement versées par le Client au cours des 12 derniers mois.</p>

                        <h2>9. Propriété intellectuelle</h2>
                        <div className="section-divider" />
                        <p>Le Client conserve la propriété de ses données (logos, contenus, informations clients). Il accorde à l'Éditeur une licence d'utilisation limitée, non exclusive, pour les besoins de la fourniture du service.</p>
                        <p>La plateforme Prizmo, ses algorithmes, son code source et son interface restent la propriété exclusive de LVN Seller.</p>

                        <h2>10. Données personnelles</h2>
                        <div className="section-divider" />
                        <p>Le traitement des données personnelles est décrit dans la <a href="/legal/rgpd">Politique de confidentialité</a>. En souscrivant au service, le Client accepte cette politique.</p>

                        <h2>11. Modification des CGV</h2>
                        <div className="section-divider" />
                        <p>L'Éditeur se réserve le droit de modifier les présentes CGV à tout moment. Le Client sera informé par e-mail de toute modification substantielle au moins 30 jours avant son entrée en vigueur. La poursuite de l'utilisation du service après cette date vaut acceptation des nouvelles CGV.</p>

                        <h2>12. Droit applicable et juridiction</h2>
                        <div className="section-divider" />
                        <p>Les présentes CGV sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux compétents du ressort du siège social de l'Éditeur seront seuls compétents.</p>
                        <p>Le Client peut également recourir à la médiation via la plateforme européenne de règlement en ligne des litiges : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a></p>

                        <h2>13. Contact</h2>
                        <div className="section-divider" />
                        <p>Pour toute question relative aux présentes CGV : <a href="mailto:contact@prizmo.pro">contact@prizmo.pro</a></p>
                    </div>

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <a href="/legal/mentions" style={{ background: "white", border: "1.5px solid #efefef", borderRadius: "12px", padding: "16px 24px", textDecoration: "none", color: "#0f0f0f", fontSize: "14px", fontWeight: "600" }}>
                            📄 Mentions légales →
                        </a>
                        <a href="/legal/rgpd" style={{ background: "white", border: "1.5px solid #efefef", borderRadius: "12px", padding: "16px 24px", textDecoration: "none", color: "#0f0f0f", fontSize: "14px", fontWeight: "600" }}>
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