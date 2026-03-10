import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const FEATURES = [
    {
        icon: "🎡",
        title: "Roue de la Fortune",
        desc: "Vos clients tournent la roue après avoir laissé un avis Google. 100% gagnant, zéro frustration.",
    },
    {
        icon: "⭐",
        title: "Avis Google automatiques",
        desc: "Le parcours client est conçu pour rediriger vers votre fiche Google avant de jouer. Plus d'avis, mieux classé.",
    },
    {
        icon: "💳",
        title: "Carte fidélité digitale",
        desc: "Fini les cartes papier perdues. Vos clients accumulent des tampons sur leur téléphone, sans installation.",
    },
    {
        icon: "📊",
        title: "Analytics en temps réel",
        desc: "Suivez vos participants, avis générés et emails collectés. Prenez des décisions basées sur des données.",
    },
    {
        icon: "🖨️",
        title: "Affiches prêtes à imprimer",
        desc: "Générez vos affiches A4/A5 en un clic avec votre logo et vos couleurs. Placez, scannez, jouez.",
    },
    {
        icon: "🔒",
        title: "100% RGPD conforme",
        desc: "Consentement explicite, données hébergées en Europe. Vous restez propriétaire de votre base client.",
    },
];

const STEPS = [
    {
        num: "01",
        title: "Configurez en 5 minutes",
        desc: "Créez votre établissement, uploadez votre logo, choisissez vos couleurs et configurez vos lots. Aucune compétence technique requise.",
        emoji: "⚙️",
    },
    {
        num: "02",
        title: "Imprimez et posez votre affiche",
        desc: "Téléchargez votre affiche personnalisée. Placez-la sur vos tables, comptoir ou vitrine. Vos clients scannent le QR code.",
        emoji: "🖨️",
    },
    {
        num: "03",
        title: "Vos clients jouent & laissent un avis",
        desc: "Ils entrent leur email, cliquent sur Google Avis, puis tournent la roue. Vous récoltez des avis et des données client.",
        emoji: "🎡",
    },
    {
        num: "04",
        title: "Ils reviennent grâce à la fidélité",
        desc: "À chaque visite, un nouveau tampon. Quand la carte est complète, ils gagnent leur récompense. La boucle est bouclée.",
        emoji: "💳",
    },
];

const USE_CASES = [
    {
        emoji: "🍕",
        title: "Restaurants",
        desc: "Transformez chaque addition en opportunité. Récoltez des avis Google et fidélisez vos habitués avec la carte digitale.",
    },
    {
        emoji: "☕",
        title: "Cafés & Boulangeries",
        desc: "La carte fidélité remplace enfin les tampons papier. Vos clients adorent et reviennent plus souvent.",
    },
    {
        emoji: "🍸",
        title: "Bars & Cocktail bars",
        desc: "Créez de l'animation avec la roue de la fortune. Un verre offert, un dessert... vos clients partagent l'expérience.",
    },
    {
        emoji: "💇",
        title: "Salons & Spas",
        desc: "Fidélisez votre clientèle avec des récompenses sur mesure. Gérez votre base client depuis votre tableau de bord.",
    },
    {
        emoji: "🛍️",
        title: "Commerces de proximité",
        desc: "Tout commerce physique peut booster ses avis Google et sa fidélité client avec Prizmo en quelques minutes.",
    },
    {
        emoji: "🍣",
        title: "Restauration rapide",
        desc: "Volume élevé de clients = volume élevé d'avis. Prizmo est conçu pour absorber des centaines de joueurs par jour.",
    },
];

const FAQS = [
    {
        q: "Mes clients doivent-ils installer une application ?",
        a: "Non, absolument pas. Tout fonctionne dans le navigateur web de leur téléphone. Ils scannent le QR code et c'est parti. Zéro friction.",
    },
    {
        q: "Comment fonctionne la validation des tampons fidélité ?",
        a: "Le client présente sa carte sur son téléphone. Vous entrez un code secret à 6 chiffres dans le téléphone du client. Le tampon est validé instantanément.",
    },
    {
        q: "Puis-je personnaliser les lots de la roue ?",
        a: "Oui, entièrement. Vous choisissez les lots, leurs noms, leurs probabilités et leurs couleurs. Café offert, dessert, réduction... tout est possible.",
    },
    {
        q: "Est-ce que Prizmo génère vraiment plus d'avis Google ?",
        a: "Oui. Le parcours est conçu pour que le client clique sur votre lien Google Avis avant de tourner la roue. En moyenne nos clients voient +47% d'avis en 30 jours.",
    },
    {
        q: "Combien de temps pour démarrer ?",
        a: "Moins de 5 minutes. Vous créez votre compte, configurez votre établissement, et votre affiche est prête à imprimer. Pas de rendez-vous, pas d'installation.",
    },
    {
        q: "Puis-je tester gratuitement ?",
        a: "Oui ! L'essai gratuit de 14 jours vous donne accès à toutes les fonctionnalités PRO. Aucune carte bancaire requise pour démarrer.",
    },
];

const STATS = [
    { value: "+47%", label: "d'avis Google en 30 jours" },
    { value: "5 min", label: "pour démarrer" },
    { value: "3x", label: "plus de clients fidèles" },
    { value: "0", label: "application à installer" },
];

export default function LandingPage() {
    const router = useRouter();
const [openFaq, setOpenFaq] = useState<number | null>(null);
const [isAnnual, setIsAnnual] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [wheelAngle, setWheelAngle] = useState(0);
    const wheelRef = useRef < ReturnType < typeof setInterval > | null > (null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        wheelRef.current = setInterval(() => {
            setWheelAngle((prev) => (prev + 0.3) % 360);
        }, 16);
        return () => { if (wheelRef.current) clearInterval(wheelRef.current); };
    }, []);

    const segments = [
        { color: "#F2EBD9", label: "Café" },
        { color: "#E8D5B7", label: "Cookie" },
        { color: "#F2EBD9", label: "Boisson" },
        { color: "#E8D5B7", label: "Café" },
        { color: "#F2EBD9", label: "Cookie" },
        { color: "#E8D5B7", label: "Boisson" },
        { color: "#F2EBD9", label: "Café" },
        { color: "#E8D5B7", label: "Boisson" },
    ];

    return (
        <div style={{ fontFamily: "'DM Sans', 'Outfit', sans-serif", background: "#fafafa", color: "#0f0f0f" }}>

            {/* Google Fonts */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .nav-link {
          color: #444;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #7c3aed; }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #db2777);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 100px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
          display: inline-block;
          font-family: inherit;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124,58,237,0.35);
        }

        .btn-secondary {
          background: white;
          color: #0f0f0f;
          border: 1.5px solid #e5e5e5;
          padding: 13px 26px;
          border-radius: 100px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.2s;
          text-decoration: none;
          display: inline-block;
          font-family: inherit;
        }
        .btn-secondary:hover {
          border-color: #7c3aed;
          transform: translateY(-1px);
        }

        .section { padding: 96px 24px; }
        .section-sm { padding: 64px 24px; }
        .container { max-width: 1100px; margin: 0 auto; }
        .container-sm { max-width: 760px; margin: 0 auto; }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f3f0ff;
          color: #7c3aed;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          margin-bottom: 20px;
        }

        h1 { font-family: 'DM Serif Display', serif; font-size: clamp(42px, 6vw, 72px); line-height: 1.1; font-weight: 400; }
        h2 { font-family: 'DM Serif Display', serif; font-size: clamp(32px, 4vw, 52px); line-height: 1.15; font-weight: 400; }
        h3 { font-size: 18px; font-weight: 700; }

        .feature-card {
          background: white;
          border: 1.5px solid #efefef;
          border-radius: 20px;
          padding: 28px;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
          border-color: #d4b8ff;
        }

        .step-num {
          font-family: 'DM Serif Display', serif;
          font-size: 80px;
          color: #f0ebff;
          line-height: 1;
          font-weight: 400;
        }

        .pricing-card {
          background: white;
          border: 1.5px solid #efefef;
          border-radius: 24px;
          padding: 36px;
          transition: transform 0.2s;
        }
        .pricing-card:hover { transform: translateY(-4px); }
        .pricing-card.featured {
          background: linear-gradient(160deg, #7c3aed, #db2777);
          border-color: transparent;
          color: white;
          transform: scale(1.04);
        }
        .pricing-card.featured:hover { transform: scale(1.04) translateY(-4px); }

        .faq-item {
          border-bottom: 1px solid #efefef;
          padding: 20px 0;
          cursor: pointer;
        }
        .faq-item:last-child { border-bottom: none; }

        .testimonial {
          background: white;
          border: 1.5px solid #efefef;
          border-radius: 20px;
          padding: 28px;
        }

        .stat-card {
          text-align: center;
          padding: 32px 24px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .float { animation: float 4s ease-in-out infinite; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.7s ease 0.15s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.7s ease 0.3s forwards; opacity: 0; }

        .gradient-text {
          background: linear-gradient(135deg, #7c3aed, #db2777);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-bg {
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 40% at 80% 50%, rgba(219,39,119,0.08) 0%, transparent 60%),
                      #fafafa;
        }

        .divider {
          width: 48px;
          height: 3px;
          background: linear-gradient(90deg, #7c3aed, #db2777);
          border-radius: 2px;
          margin: 16px 0 24px;
        }

        .check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 11px;
        }
        .check-dark {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f3f0ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 11px;
          color: #7c3aed;
        }

        @media (max-width: 768px) {
          .section { padding: 64px 20px; }
          .hide-mobile { display: none !important; }
        }
      `}</style>

            {/* ── NAV ── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "0 24px",
                background: isScrolled ? "rgba(250,250,250,0.9)" : "transparent",
                backdropFilter: isScrolled ? "blur(12px)" : "none",
                borderBottom: isScrolled ? "1px solid #efefef" : "none",
                transition: "all 0.3s",
            }}>
                <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>
                    <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src="/LOGO.svg" alt="Prizmo" style={{ height: "36px" }} />
                    </a>
                    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                        <a href="#comment" className="nav-link hide-mobile">Comment ça marche</a>
                        <a href="#tarifs" className="nav-link hide-mobile">Tarifs</a>
                        <a href="#faq" className="nav-link hide-mobile">FAQ</a>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <a href="/login" className="btn-secondary" style={{ padding: "10px 20px", fontSize: "14px" }}>Connexion</a>
                        <a href="/admin/establishment/new" className="btn-primary" style={{ padding: "10px 20px", fontSize: "14px" }}>Essai gratuit →</a>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="hero-bg" style={{ paddingTop: "140px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px" }}>
                <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>

                    {/* Left */}
                    <div>
                        <div className="tag fade-up">🎡 Gamification pour restaurants</div>
                        <h1 className="fade-up-2">
                            Transformez vos clients en <span className="gradient-text">ambassadeurs</span>
                        </h1>
                        <p className="fade-up-3" style={{ fontSize: "18px", color: "#555", lineHeight: "1.7", marginTop: "20px", marginBottom: "36px" }}>
                            Prizmo gamifie l'expérience client dans votre restaurant. Roue de la fortune, avis Google automatiques, carte fidélité digitale — le tout sans application à installer.
                        </p>

                        <div className="fade-up-3" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "40px" }}>
                            <a href="/admin/establishment/new" className="btn-primary" style={{ fontSize: "16px", padding: "16px 32px" }}>
                                Essai gratuit 14 jours →
                            </a>
                            <a href="#comment" className="btn-secondary" style={{ fontSize: "16px", padding: "16px 32px" }}>
                                Voir la démo
                            </a>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#888", fontSize: "13px" }}>
                            <span style={{ color: "#22c55e" }}>✓</span> Aucune carte bancaire requise
                            <span style={{ margin: "0 8px", color: "#ddd" }}>·</span>
                            <span style={{ color: "#22c55e" }}>✓</span> Configuré en 5 minutes
                            <span style={{ margin: "0 8px", color: "#ddd" }}>·</span>
                            <span style={{ color: "#22c55e" }}>✓</span> Sans application
                        </div>
                    </div>

                    {/* Right — Roue animée */}
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <div className="float" style={{ position: "relative", width: "340px", height: "340px" }}>

                            {/* Glow */}
                            <div style={{
                                position: "absolute", inset: "-20px",
                                background: "radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)",
                                borderRadius: "50%",
                            }} />

                            {/* Roue SVG */}
                            <svg width="340" height="340" viewBox="0 0 340 340" style={{ transform: `rotate(${wheelAngle}deg)`, filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.12))" }}>
                                {segments.map((seg, i) => {
                                    const angle = 360 / segments.length;
                                    const startAngle = (angle * i - 90) * (Math.PI / 180);
                                    const endAngle = (angle * (i + 1) - 90) * (Math.PI / 180);
                                    const cx = 170, cy = 170, r = 160;
                                    const x1 = cx + r * Math.cos(startAngle);
                                    const y1 = cy + r * Math.sin(startAngle);
                                    const x2 = cx + r * Math.cos(endAngle);
                                    const y2 = cy + r * Math.sin(endAngle);
                                    const midAngle = (angle * i + angle / 2 - 90) * (Math.PI / 180);
                                    const tx = cx + r * 0.65 * Math.cos(midAngle);
                                    const ty = cy + r * 0.65 * Math.sin(midAngle);
                                    const textAngle = angle * i + angle / 2 - 90;
                                    return (
                                        <g key={i}>
                                            <path
                                                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                                                fill={seg.color}
                                                stroke="rgba(0,0,0,0.08)"
                                                strokeWidth="1"
                                            />
                                            <text
                                                x={tx} y={ty}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fill="rgba(0,0,0,0.6)"
                                                fontSize="13"
                                                fontWeight="600"
                                                fontFamily="DM Sans, sans-serif"
                                                transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                                            >
                                                {seg.label}
                                            </text>
                                        </g>
                                    );
                                })}
                                <circle cx="170" cy="170" r="28" fill="white" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
                                <text x="170" y="170" textAnchor="middle" dominantBaseline="middle" fontSize="16">🎁</text>
                            </svg>

                            {/* Pointeur */}
                            <div style={{ position: "absolute", top: "-8px", left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
                                <svg width="28" height="36" viewBox="0 0 28 36">
                                    <path d="M14 36L25.9 13H2.1L14 36Z" fill="#FACC15" stroke="white" strokeWidth="2" />
                                </svg>
                            </div>

                            {/* Badge flottant */}
                            <div style={{
                                position: "absolute", bottom: "10px", right: "-20px",
                                background: "white",
                                border: "1.5px solid #efefef",
                                borderRadius: "16px",
                                padding: "12px 16px",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                                fontSize: "13px",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}>
                                <span style={{ fontSize: "20px" }}>⭐</span>
                                <div>
                                    <div style={{ fontSize: "15px", fontWeight: "700" }}>+47% d'avis</div>
                                    <div style={{ color: "#888", fontWeight: "400", fontSize: "12px" }}>en 30 jours</div>
                                </div>
                            </div>

                            <div style={{
                                position: "absolute", top: "20px", left: "-30px",
                                background: "white",
                                border: "1.5px solid #efefef",
                                borderRadius: "16px",
                                padding: "12px 16px",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                                fontSize: "13px",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}>
                                <span style={{ fontSize: "20px" }}>💳</span>
                                <div>
                                    <div style={{ fontSize: "15px", fontWeight: "700" }}>Carte fidélité</div>
                                    <div style={{ color: "#888", fontWeight: "400", fontSize: "12px" }}>sans application</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS BAND ── */}
            <section style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)", padding: "0" }}>
                <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
                    {STATS.map((s, i) => (
                        <div key={i} className="stat-card" style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
                            <div style={{ fontSize: "36px", fontWeight: "800", color: "white", fontFamily: "'DM Serif Display', serif" }}>{s.value}</div>
                            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", marginTop: "4px" }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── POURQUOI PRIZMO ── */}
            <section className="section" id="features">
                <div className="container">
                    <div style={{ textAlign: "center", marginBottom: "64px" }}>
                        <div className="tag">✨ Fonctionnalités</div>
                        <h2>Tout ce dont vous avez besoin,<br />rien de superflu</h2>
                        <p style={{ color: "#666", fontSize: "17px", marginTop: "16px", maxWidth: "520px", margin: "16px auto 0" }}>
                            Prizmo réunit dans une seule plateforme tout ce qu'il faut pour engager vos clients et les fidéliser durablement.
                        </p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                        {FEATURES.map((f, i) => (
                            <div key={i} className="feature-card">
                                <div style={{ fontSize: "32px", marginBottom: "16px" }}>{f.icon}</div>
                                <h3 style={{ marginBottom: "10px" }}>{f.title}</h3>
                                <p style={{ color: "#666", fontSize: "15px", lineHeight: "1.65" }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIAL 1 ── */}
            <section style={{ background: "#f5f0ff", padding: "48px 24px" }}>
                <div className="container-sm" style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "20px", lineHeight: "1.7", color: "#333", fontStyle: "italic", marginBottom: "20px" }}>
                        "Depuis qu'on a mis Prizmo, on a eu 3x plus d'avis Google en un mois. Les clients adorent la roue et demandent à revenir pour avoir leur carte complète."
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #db2777)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700" }}>S</div>
                        <div style={{ textAlign: "left" }}>
                            <div style={{ fontWeight: "700", fontSize: "15px" }}>Sophie M.</div>
                            <div style={{ color: "#888", fontSize: "13px" }}>Gérante, Café Le Comptoir — Paris</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── COMMENT ÇA MARCHE ── */}
            <section className="section" id="comment">
                <div className="container">
                    <div style={{ textAlign: "center", marginBottom: "72px" }}>
                        <div className="tag">🗺️ Processus</div>
                        <h2>Démarrez en 4 étapes simples</h2>
                        <p style={{ color: "#666", fontSize: "17px", marginTop: "16px" }}>
                            De la création de compte à votre premier avis Google, comptez moins d'une heure.
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "40px" }}>
                        {STEPS.map((step, i) => (
                            <div key={i} style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                                <div style={{ flexShrink: 0 }}>
                                    <div className="step-num">{step.num}</div>
                                </div>
                                <div style={{ paddingTop: "8px" }}>
                                    <div style={{ fontSize: "28px", marginBottom: "10px" }}>{step.emoji}</div>
                                    <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>{step.title}</h3>
                                    <p style={{ color: "#666", lineHeight: "1.7", fontSize: "15px" }}>{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: "center", marginTop: "56px" }}>
                        <a href="/admin/establishment/new" className="btn-primary" style={{ fontSize: "16px", padding: "16px 36px" }}>
                            Démarrer maintenant →
                        </a>
                    </div>
                </div>
            </section>

            {/* ── USE CASES ── */}
            <section className="section" style={{ background: "#f9f9f9" }} id="usecases">
                <div className="container">
                    <div style={{ textAlign: "center", marginBottom: "64px" }}>
                        <div className="tag">🏪 Pour qui ?</div>
                        <h2>Conçu pour tous les commerces de proximité</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                        {USE_CASES.map((uc, i) => (
                            <div key={i} className="feature-card" style={{ background: "white" }}>
                                <div style={{ fontSize: "36px", marginBottom: "14px" }}>{uc.emoji}</div>
                                <h3 style={{ marginBottom: "8px" }}>{uc.title}</h3>
                                <p style={{ color: "#666", fontSize: "15px", lineHeight: "1.65" }}>{uc.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIAL 2 ── */}
            <section style={{ padding: "48px 24px" }}>
                <div className="container-sm" style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "20px", lineHeight: "1.7", color: "#333", fontStyle: "italic", marginBottom: "20px" }}>
                        "La carte fidélité digitale a complètement remplacé nos cartons papier. Les clients n'oublient plus leur carte et le suivi est automatique. Un gain de temps énorme."
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #db2777, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700" }}>K</div>
                        <div style={{ textAlign: "left" }}>
                            <div style={{ fontWeight: "700", fontSize: "15px" }}>Karim B.</div>
                            <div style={{ color: "#888", fontSize: "13px" }}>Gérant, Boulangerie Moderne — Lyon</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TARIFS ── */}
            <section className="section" style={{ background: "#f9f9f9" }} id="tarifs">
                <div className="container">
<div style={{ textAlign: "center", marginBottom: "64px" }}>
    <div className="tag">💰 Tarifs</div>
    <h2>Simple et transparent</h2>
    <p style={{ color: "#666", fontSize: "17px", marginTop: "16px", marginBottom: "32px" }}>
        Essai gratuit 14 jours, sans carte bancaire. Annulez à tout moment.
    </p>
    {/* Toggle mensuel / annuel */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "white", border: "1.5px solid #efefef",
            borderRadius: "100px", padding: "6px 8px",
        }}>
            <button
                onClick={() => setIsAnnual(false)}
                style={{
                    padding: "8px 20px", borderRadius: "100px", border: "none",
                    fontFamily: "inherit", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                    background: !isAnnual ? "linear-gradient(135deg, #7c3aed, #db2777)" : "transparent",
                    color: !isAnnual ? "white" : "#888",
                    transition: "all 0.2s",
                }}
            >
                Mensuel
            </button>
            <button
                onClick={() => setIsAnnual(true)}
                style={{
                    padding: "8px 20px", borderRadius: "100px", border: "none",
                    fontFamily: "inherit", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                    background: isAnnual ? "linear-gradient(135deg, #7c3aed, #db2777)" : "transparent",
                    color: isAnnual ? "white" : "#888",
                    transition: "all 0.2s",
                }}
            >
                Annuel
            </button>
        </div>
        {isAnnual && (
            <span style={{
                background: "#dcfce7", color: "#16a34a",
                padding: "4px 12px", borderRadius: "100px",
                fontSize: "12px", fontWeight: "700",
            }}>
                🎉 2 mois offerts
            </span>
        )}
        {!isAnnual && (
            <span style={{ fontSize: "13px", color: "#aaa" }}>
                Passer à l'annuel → économisez ~20%
            </span>
        )}
    </div>
</div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", alignItems: "start" }}>

                        {/* SOLO */}
                        <div className="pricing-card">
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>SOLO</div>
<div style={{ marginBottom: "24px" }}>
    <span style={{ fontSize: "48px", fontWeight: "800", fontFamily: "'DM Serif Display', serif" }}>
        {isAnnual ? "39€" : "49€"}
    </span>
    <span style={{ color: "#888", fontSize: "15px" }}>/mois</span>
    {isAnnual && (
        <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>facturé 468€/an</div>
    )}
</div>
                            <div className="divider" />
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                                {["1 établissement", "100 participants/mois", "Roue de la fortune", "Avis Google intégrés", "Analytics basiques", "Affiches imprimables"].map((item, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                                        <div className="check-dark">✓</div>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <a href="/admin/establishment/new" className="btn-secondary" style={{ width: "100%", textAlign: "center", display: "block" }}>
                                Démarrer l'essai →
                            </a>
                        </div>

                        {/* PRO */}
                        <div className="pricing-card featured">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                <div style={{ fontSize: "13px", fontWeight: "700", color: "rgba(255,255,255,0.8)", letterSpacing: "0.08em", textTransform: "uppercase" }}>PRO</div>
                                <div style={{ background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: "700" }}>⭐ Recommandé</div>
                            </div>
<div style={{ marginBottom: "24px" }}>
    <span style={{ fontSize: "48px", fontWeight: "800", fontFamily: "'DM Serif Display', serif" }}>
        {isAnnual ? "55€" : "69€"}
    </span>
    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px" }}>/mois</span>
    {isAnnual && (
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>facturé 660€/an</div>
    )}
</div>
                            <div style={{ width: "48px", height: "3px", background: "rgba(255,255,255,0.4)", borderRadius: "2px", margin: "0 0 24px" }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                                {["1 établissement", "Participants illimités", "Roue de la fortune", "Carte fidélité digitale", "Analytics complets", "Relance SMS clients", "2 chevalets inclus", "Support prioritaire"].map((item, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                                        <div className="check">✓</div>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <a href="/admin/establishment/new" style={{
                                background: "white",
                                color: "#7c3aed",
                                border: "none",
                                padding: "14px 28px",
                                borderRadius: "100px",
                                fontSize: "15px",
                                fontWeight: "700",
                                cursor: "pointer",
                                width: "100%",
                                textAlign: "center",
                                display: "block",
                                textDecoration: "none",
                                transition: "transform 0.2s",
                            }}>
                                Démarrer l'essai →
                            </a>
                        </div>

                        {/* BUSINESS */}
                        <div className="pricing-card">
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>BUSINESS</div>
                            <div style={{ marginBottom: "24px" }}>
                                <span style={{ fontSize: "36px", fontWeight: "800", fontFamily: "'DM Serif Display', serif" }}>Sur devis</span>
                            </div>
                            <div className="divider" />
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                                {["Multi-établissements", "Tarification dégressive", "Tout le plan PRO", "Branding personnalisé", "Tableau de bord centralisé", "Account manager dédié", "SLA garanti", "Onboarding accompagné"].map((item, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                                        <div className="check-dark">✓</div>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <a href="mailto:contact@prizmo.pro" className="btn-secondary" style={{ width: "100%", textAlign: "center", display: "block" }}>
                                Nous contacter →
                            </a>
                        </div>
                    </div>

<p style={{ textAlign: "center", color: "#888", fontSize: "13px", marginTop: "32px" }}>
    Tous les plans incluent un essai gratuit de 14 jours · Aucune carte bancaire requise · Annulation sans préavis
</p>

{/* ── TABLEAU COMPARATIF ── */}
<div style={{ marginTop: "72px" }}>
    <h3 style={{ textAlign: "center", fontFamily: "'DM Serif Display', serif", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: "400", marginBottom: "40px" }}>
        Comparez les plans
    </h3>
    <div style={{ background: "white", border: "1.5px solid #efefef", borderRadius: "24px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "14px", fontWeight: "700", color: "#333", background: "#fafafa", borderBottom: "1px solid #f0f0f0", width: "40%" }}>Fonctionnalité</th>
                    <th style={{ padding: "16px 24px", textAlign: "center", fontSize: "14px", fontWeight: "700", color: "#333", background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>SOLO</th>
                    <th style={{ padding: "16px 24px", textAlign: "center", fontSize: "14px", fontWeight: "700", color: "#7c3aed", background: "#f5f0ff", borderBottom: "1px solid #f0f0f0" }}>PRO ⭐</th>
                    <th style={{ padding: "16px 24px", textAlign: "center", fontSize: "14px", fontWeight: "700", color: "#333", background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>BUSINESS</th>
                </tr>
            </thead>
            <tbody>
                {[
                    ["Roue de la fortune", "✅", "✅", "✅"],
                    ["Avis Google intégrés", "✅", "✅", "✅"],
                    ["Affiches imprimables", "✅", "✅", "✅"],
                    ["Participants / mois", "100", "Illimités", "Illimités"],
                    ["Analytics", "3 KPIs", "Complets", "Complets"],
                    ["Carte fidélité digitale", "❌", "✅", "✅"],
                    ["Relance SMS", "❌", "✅", "✅"],
                    ["Multi-établissements", "❌", "❌", "✅"],
                    ["Branding personnalisé", "❌", "❌", "✅"],
                    ["Support", "Email", "Prioritaire", "Dédié"],
                ].map(([feature, solo, pro, business], i, arr) => (
                    <tr key={i}>
                        <td style={{ padding: "14px 24px", fontSize: "14px", color: "#555", borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none", fontWeight: "500" }}>{feature}</td>
                        <td style={{ padding: "14px 24px", fontSize: "14px", textAlign: "center", borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none" }}>{solo}</td>
                        <td style={{ padding: "14px 24px", fontSize: "14px", textAlign: "center", borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none", background: "#fdf9ff", fontWeight: pro !== "❌" ? "600" : "400", color: pro === "❌" ? "#ddd" : "#7c3aed" }}>{pro}</td>
                        <td style={{ padding: "14px 24px", fontSize: "14px", textAlign: "center", borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none" }}>{business}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</div>

{/* ── GARANTIE ── */}
<div style={{
    background: "white", border: "1.5px solid #efefef", borderRadius: "24px",
    padding: "48px 40px", textAlign: "center", marginTop: "48px",
}}>
    <div style={{ fontSize: "40px", marginBottom: "16px" }}>🛡️</div>
    <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px", fontWeight: "400", marginBottom: "12px" }}>
        Essai sans risque, 14 jours
    </h3>
    <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.7", maxWidth: "500px", margin: "0 auto 28px" }}>
        Testez Prizmo avec toutes les fonctionnalités PRO. Si ce n'est pas pour vous, supprimez votre compte en un clic. Aucune question posée.
    </p>
    <div style={{ display: "flex", justifyContent: "center", gap: "28px", flexWrap: "wrap" }}>
        {["Aucune carte bancaire", "Annulation en 1 clic", "Données effacées sur demande", "RGPD conforme"].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#555" }}>
                <span style={{ color: "#22c55e", fontWeight: "700" }}>✓</span>
                {item}
            </div>
        ))}
    </div>
</div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="section" id="faq">
                <div className="container-sm">
                    <div style={{ textAlign: "center", marginBottom: "56px" }}>
                        <div className="tag">❓ Questions fréquentes</div>
                        <h2>On répond à tout</h2>
                    </div>

                    <div style={{ background: "white", border: "1.5px solid #efefef", borderRadius: "24px", overflow: "hidden" }}>
                        {FAQS.map((faq, i) => (
                            <div key={i} className="faq-item" style={{ padding: "24px 28px", borderBottom: i < FAQS.length - 1 ? "1px solid #efefef" : "none" }}
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                                    <span style={{ fontWeight: "600", fontSize: "16px" }}>{faq.q}</span>
                                    <span style={{
                                        flexShrink: 0,
                                        width: "28px", height: "28px",
                                        borderRadius: "50%",
                                        background: openFaq === i ? "linear-gradient(135deg, #7c3aed, #db2777)" : "#f5f0ff",
                                        color: openFaq === i ? "white" : "#7c3aed",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "18px",
                                        transition: "all 0.2s",
                                    }}>
                                        {openFaq === i ? "−" : "+"}
                                    </span>
                                </div>
                                {openFaq === i && (
                                    <p style={{ marginTop: "14px", color: "#555", lineHeight: "1.7", fontSize: "15px" }}>{faq.a}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA FINAL ── */}
            <section style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea, #db2777)", padding: "96px 24px", textAlign: "center" }}>
                <div className="container-sm">
                    <div style={{ fontSize: "48px", marginBottom: "24px" }}>🎡</div>
                    <h2 style={{ color: "white", marginBottom: "20px" }}>
                        Prêt à transformer votre restaurant ?
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "18px", marginBottom: "40px", lineHeight: "1.7" }}>
                        Rejoignez les commerçants qui utilisent Prizmo pour booster leurs avis Google et fidéliser leurs clients. 14 jours gratuits, sans engagement.
                    </p>
                    <a href="/admin/establishment/new" style={{
                        background: "white",
                        color: "#7c3aed",
                        border: "none",
                        padding: "18px 40px",
                        borderRadius: "100px",
                        fontSize: "17px",
                        fontWeight: "700",
                        cursor: "pointer",
                        textDecoration: "none",
                        display: "inline-block",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                    }}>
                        Démarrer gratuitement →
                    </a>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginTop: "20px" }}>
                        ✓ Sans carte bancaire · ✓ 14 jours d'essai · ✓ Annulation libre
                    </p>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ background: "#0f0f0f", color: "#888", padding: "60px 24px 40px" }}>
                <div className="container">
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "48px" }}>
                        <div>
                            <img src="/LOGO.svg" alt="Prizmo" style={{ height: "32px", filter: "brightness(0) invert(1)", marginBottom: "16px" }} />
                            <p style={{ fontSize: "14px", lineHeight: "1.7", maxWidth: "280px" }}>
                                La plateforme de gamification et de fidélité pour restaurants, cafés et commerces de proximité.
                            </p>
                        </div>
                        <div>
                            <p style={{ color: "white", fontWeight: "600", marginBottom: "16px", fontSize: "14px" }}>Produit</p>
                            {["Fonctionnalités", "Tarifs", "FAQ"].map((l, i) => (
                                <a key={i} href="#" style={{ display: "block", color: "#888", textDecoration: "none", fontSize: "14px", marginBottom: "10px", transition: "color 0.2s" }}
                                    onMouseEnter={e => (e.target as HTMLElement).style.color = "white"}
                                    onMouseLeave={e => (e.target as HTMLElement).style.color = "#888"}>{l}</a>
                            ))}
                        </div>
                        <div>
                            <p style={{ color: "white", fontWeight: "600", marginBottom: "16px", fontSize: "14px" }}>Légal</p>
                            {["Mentions légales", "CGV", "Politique RGPD", "Cookies"].map((l, i) => (
                                <a key={i} href="#" style={{ display: "block", color: "#888", textDecoration: "none", fontSize: "14px", marginBottom: "10px" }}>{l}</a>
                            ))}
                        </div>
                        <div>
                            <p style={{ color: "white", fontWeight: "600", marginBottom: "16px", fontSize: "14px" }}>Contact</p>
                            <a href="mailto:contact@prizmo.pro" style={{ color: "#888", textDecoration: "none", fontSize: "14px" }}>contact@prizmo.pro</a>
                        </div>
                    </div>
                    <div style={{ borderTop: "1px solid #222", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: "13px" }}>© 2025 Prizmo. Tous droits réservés.</p>
                        <p style={{ fontSize: "13px" }}>Fait avec ❤️ en France 🇫🇷</p>
                    </div>
                </div>
            </footer>

        </div>
    );
}