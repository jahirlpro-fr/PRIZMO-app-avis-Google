import { SEO } from "@/components/SEO";
import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: "🎡",
      title: "Roue de la Fortune",
      desc: "Vos clients scannent, jouent, gagnent. Une expérience mémorable qui donne envie de revenir.",
      color: "#7c3aed",
    },
    {
      icon: "⭐",
      title: "Boost d'avis Google",
      desc: "Transformez chaque repas en avis positif. Montez dans les résultats Google Maps automatiquement.",
      color: "#ec4899",
    },
    {
      icon: "💳",
      title: "Carte de Fidélité Digitale",
      desc: "Fini les cartons perdus. Une carte digitale élégante, tampons automatiques, récompense personnalisée.",
      color: "#7c3aed",
    },
    {
      icon: "📊",
      title: "Analytics en temps réel",
      desc: "Qui joue ? Quand ? Quels lots partent le plus ? Pilotez votre restaurant avec de vraies données.",
      color: "#ec4899",
    },
    {
      icon: "🖨️",
      title: "Affiches en 1 clic",
      desc: "Générez vos affiches QR code en A4 ou A5, prêtes à imprimer. Pas besoin de graphiste.",
      color: "#7c3aed",
    },
    {
      icon: "🔒",
      title: "Sécurisé & RGPD",
      desc: "Données hébergées en Europe. Consentement client intégré. Votre conformité est gérée.",
      color: "#ec4899",
    },
  ];

  const plans = [
    {
      name: "SOLO",
      price: "49",
      period: "/mois",
      desc: "Pour démarrer et tester",
      highlight: false,
      features: [
        "100 participants/mois",
        "Roue de la fortune",
        "Collecte d'avis Google",
        "Génération d'affiches",
        "Analytics essentiels",
        "Support email",
      ],
      cta: "Commencer",
      ctaHref: "/register",
    },
    {
      name: "PRO",
      price: "69",
      period: "/mois",
      desc: "Le plus populaire",
      highlight: true,
      features: [
        "Participants illimités",
        "Tout le plan SOLO",
        "Carte de fidélité digitale",
        "Analytics avancés",
        "Distribution des lots",
        "Support prioritaire",
      ],
      cta: "Essai gratuit 14 jours",
      ctaHref: "/register",
    },
    {
      name: "BUSINESS",
      price: "Sur devis",
      period: "",
      desc: "Multi-établissements",
      highlight: false,
      features: [
        "Tout le plan PRO",
        "Multi-établissements",
        "Branding blanc",
        "Onboarding dédié",
        "Account manager",
        "SLA garanti",
      ],
      cta: "Nous contacter",
      ctaHref: "mailto:contact@prizmo.pro",
    },
  ];

  const faqs = [
    {
      q: "Est-ce difficile à installer dans mon restaurant ?",
      a: "Non, c'est fait en 5 minutes. Vous créez votre compte, configurez votre roue, imprimez l'affiche QR code et c'est prêt. Aucune compétence technique requise.",
    },
    {
      q: "Mes clients doivent-ils télécharger une application ?",
      a: "Absolument pas. Tout fonctionne directement dans le navigateur de leur téléphone. Scan du QR code → jeu → gain. C'est aussi simple que ça.",
    },
    {
      q: "Comment fonctionne l'essai gratuit ?",
      a: "14 jours avec accès complet au plan PRO, sans carte bancaire. À la fin de l'essai, vous choisissez votre formule ou vous arrêtez — sans engagement.",
    },
    {
      q: "Puis-je personnaliser les lots de la roue ?",
      a: "Oui complètement. Vous définissez vos propres lots (café offert, dessert, réduction…), leurs couleurs, et leurs probabilités de gain. La roue est entièrement à vos couleurs.",
    },
    {
      q: "Mes données clients sont-elles sécurisées ?",
      a: "Oui. Les données sont hébergées en Europe, le consentement RGPD est intégré dans le parcours client, et vous restez propriétaire de toutes vos données.",
    },
  ];

  return (
    <>
      <SEO
        title="Prizmo — Fidélisez vos clients avec la gamification"
        description="Roue de la fortune, carte de fidélité digitale, boost d'avis Google. La plateforme tout-en-un pour les restaurants qui veulent fidéliser et acquérir des clients."
      />

      <div className="min-h-screen bg-white" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>

        {/* ── NAV ── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "0 24px",
          height: "64px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <img src="/LOGO.svg" alt="Prizmo" style={{ height: "36px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <a href="#pricing" style={{ color: "#555", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Tarifs</a>
            <a href="#faq" style={{ color: "#555", textDecoration: "none", fontSize: "14px", fontWeight: "600", marginRight: "8px" }}>FAQ</a>
            <Link href="/login" style={{
              padding: "8px 18px", borderRadius: "99px",
              border: "2px solid #7c3aed", color: "#7c3aed",
              textDecoration: "none", fontSize: "14px", fontWeight: "700",
            }}>Connexion</Link>
            <Link href="/register" style={{
              padding: "8px 20px", borderRadius: "99px",
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              color: "white", textDecoration: "none",
              fontSize: "14px", fontWeight: "700",
              boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
            }}>Essai gratuit</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{
          background: "linear-gradient(160deg, #faf5ff 0%, #fff0f7 50%, #ffffff 100%)",
          padding: "80px 24px 100px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-100px", right: "-100px",
            width: "500px", height: "500px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-80px", left: "-80px",
            width: "400px", height: "400px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ maxWidth: "780px", margin: "0 auto", position: "relative" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)",
              borderRadius: "99px", padding: "6px 16px", marginBottom: "28px",
              fontSize: "13px", fontWeight: "700", color: "#7c3aed",
            }}>
              🎡 La gamification pour les restaurateurs
            </div>

            <h1 style={{
              fontSize: "clamp(2.4rem, 6vw, 4rem)",
              fontWeight: "900",
              lineHeight: "1.1",
              marginBottom: "24px",
              color: "#0f0a1e",
              letterSpacing: "-1px",
            }}>
              Transformez chaque repas<br />
              <span style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                en client fidèle
              </span>
            </h1>

            <p style={{
              fontSize: "1.2rem", color: "#555", lineHeight: "1.7",
              marginBottom: "40px", maxWidth: "560px", margin: "0 auto 40px",
            }}>
              Prizmo gamifie votre relation client avec une roue de la fortune, une carte de fidélité digitale et un boost automatique de vos avis Google.
            </p>

            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" style={{
                padding: "16px 36px", borderRadius: "99px",
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                color: "white", textDecoration: "none",
                fontSize: "17px", fontWeight: "800",
                boxShadow: "0 8px 30px rgba(124,58,237,0.4)",
              }}>
                Commencer gratuitement — 14 jours 🚀
              </Link>
              <a href="#features" style={{
                padding: "16px 32px", borderRadius: "99px",
                border: "2px solid #e5e7eb", color: "#333",
                textDecoration: "none", fontSize: "17px", fontWeight: "700",
                background: "white",
              }}>
                Voir comment ça marche
              </a>
            </div>

            <p style={{ marginTop: "20px", fontSize: "13px", color: "#999", fontWeight: "600" }}>
              ✓ Sans carte bancaire &nbsp;·&nbsp; ✓ Sans engagement &nbsp;·&nbsp; ✓ Prêt en 5 minutes
            </p>
          </div>

          {/* Roue déco animée */}
          <div style={{ marginTop: "60px", display: "flex", justifyContent: "center" }}>
            <div style={{
              width: "200px", height: "200px", borderRadius: "50%",
              background: "conic-gradient(#e74c3c 0deg 60deg, #8e44ad 60deg 120deg, #95a5a6 120deg 180deg, #f39c12 180deg 240deg, #27ae60 240deg 300deg, #3498db 300deg 360deg)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              position: "relative",
              animation: "spinSlow 20s linear infinite",
            }}>
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "60px", height: "60px", borderRadius: "50%",
                background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: "900", color: "#333", letterSpacing: "1px",
              }}>SPIN</div>
            </div>
          </div>

          <style>{`
            @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
        </section>

        {/* ── STATS ── */}
        <section style={{
          background: "linear-gradient(135deg, #7c3aed, #ec4899)",
          padding: "48px 24px",
        }}>
          <div style={{
            maxWidth: "900px", margin: "0 auto",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "32px", textAlign: "center",
          }}>
            {[
              { num: "+47%", label: "d'avis Google en moyenne" },
              { num: "5 min", label: "pour démarrer" },
              { num: "3x", label: "plus de clients fidèles" },
              { num: "100%", label: "sans application mobile" },
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: "2.4rem", fontWeight: "900", color: "white", lineHeight: 1 }}>{stat.num}</div>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", marginTop: "6px", fontWeight: "600" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" style={{ padding: "100px 24px", background: "#fafafa" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "900", color: "#0f0a1e", marginBottom: "16px" }}>
                Tout ce dont votre restaurant a besoin
              </h2>
              <p style={{ fontSize: "1.1rem", color: "#666", maxWidth: "500px", margin: "0 auto" }}>
                Une plateforme complète. Pas besoin de 5 outils différents.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
            }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  background: "white", borderRadius: "20px", padding: "32px",
                  border: "1px solid #eee", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}>
                  <div style={{
                    width: "56px", height: "56px", borderRadius: "16px",
                    background: `${f.color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "28px", marginBottom: "20px",
                  }}>{f.icon}</div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f0a1e", marginBottom: "10px" }}>{f.title}</h3>
                  <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: "1.6" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: "100px 24px", background: "white" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "900", color: "#0f0a1e", marginBottom: "16px" }}>
              Comment ça marche ?
            </h2>
            <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: "64px" }}>
              3 étapes pour transformer votre salle en machine à fidélité.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "40px" }}>
              {[
                { step: "01", icon: "📱", title: "Le client scanne", desc: "Il scanne le QR code sur la table ou au comptoir depuis son téléphone." },
                { step: "02", icon: "⭐", title: "Il joue & gagne", desc: "Il laisse un avis Google, tourne la roue et remporte son lot instantanément." },
                { step: "03", icon: "💳", title: "Il revient", desc: "Sa carte fidélité se tamponne automatiquement. Il reviendra pour décrocher sa récompense." },
              ].map((step, i) => (
                <div key={i}>
                  <div style={{
                    fontSize: "3.5rem", fontWeight: "900",
                    color: "#ede9fe", marginBottom: "8px", lineHeight: 1,
                  }}>{step.step}</div>
                  <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>{step.icon}</div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f0a1e", marginBottom: "10px" }}>{step.title}</h3>
                  <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: "1.6" }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" style={{ padding: "100px 24px", background: "#faf5ff" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "900", color: "#0f0a1e", marginBottom: "16px" }}>
                Des tarifs simples et transparents
              </h2>
              <p style={{ fontSize: "1.1rem", color: "#666" }}>
                14 jours gratuits sur tous les plans. Sans carte bancaire.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              alignItems: "center",
            }}>
              {plans.map((plan, i) => (
                <div key={i} style={{
                  background: plan.highlight ? "linear-gradient(160deg, #7c3aed, #ec4899)" : "white",
                  borderRadius: "24px",
                  padding: plan.highlight ? "40px 32px" : "32px",
                  border: plan.highlight ? "none" : "2px solid #eee",
                  boxShadow: plan.highlight ? "0 20px 60px rgba(124,58,237,0.35)" : "0 2px 12px rgba(0,0,0,0.04)",
                  transform: plan.highlight ? "scale(1.04)" : "none",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {plan.highlight && (
                    <div style={{
                      position: "absolute", top: "16px", right: "16px",
                      background: "rgba(255,255,255,0.2)", borderRadius: "99px",
                      padding: "4px 12px", fontSize: "11px", fontWeight: "800",
                      color: "white", letterSpacing: "1px",
                    }}>⭐ POPULAIRE</div>
                  )}

                  <div style={{ marginBottom: "24px" }}>
                    <div style={{
                      fontSize: "13px", fontWeight: "800", letterSpacing: "2px",
                      color: plan.highlight ? "rgba(255,255,255,0.7)" : "#999",
                      marginBottom: "8px", textTransform: "uppercase" as const,
                    }}>{plan.name}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      {plan.period ? (
                        <>
                          <span style={{ fontSize: "2.8rem", fontWeight: "900", color: plan.highlight ? "white" : "#0f0a1e" }}>
                            {plan.price}€
                          </span>
                          <span style={{ fontSize: "14px", color: plan.highlight ? "rgba(255,255,255,0.7)" : "#999", fontWeight: "600" }}>
                            {plan.period}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: "1.8rem", fontWeight: "900", color: "#0f0a1e" }}>{plan.price}</span>
                      )}
                    </div>
                    <div style={{ fontSize: "14px", color: plan.highlight ? "rgba(255,255,255,0.7)" : "#888", marginTop: "4px" }}>
                      {plan.desc}
                    </div>
                  </div>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column" as const, gap: "10px" }}>
                    {plan.features.map((feat, j) => (
                      <li key={j} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: plan.highlight ? "rgba(255,255,255,0.9)" : "#444", fontWeight: "600" }}>
                        <span style={{ color: plan.highlight ? "#a5f3fc" : "#7c3aed", fontSize: "16px" }}>✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.ctaHref} style={{
                    display: "block", textAlign: "center" as const,
                    padding: "14px", borderRadius: "99px",
                    background: plan.highlight ? "white" : "linear-gradient(135deg, #7c3aed, #ec4899)",
                    color: plan.highlight ? "#7c3aed" : "white",
                    textDecoration: "none", fontWeight: "800", fontSize: "15px",
                    boxShadow: plan.highlight ? "0 4px 14px rgba(0,0,0,0.1)" : "0 4px 14px rgba(124,58,237,0.3)",
                  }}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" style={{ padding: "100px 24px", background: "white" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "900", color: "#0f0a1e", marginBottom: "16px" }}>
                Questions fréquentes
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column" as const, gap: "12px" }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{
                  border: "2px solid",
                  borderColor: openFaq === i ? "#7c3aed" : "#eee",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%", padding: "20px 24px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "none", border: "none", cursor: "pointer",
                      textAlign: "left" as const, fontWeight: "700", fontSize: "1rem", color: "#0f0a1e",
                    }}
                  >
                    {faq.q}
                    <span style={{
                      fontSize: "20px", color: "#7c3aed", flexShrink: 0, marginLeft: "16px",
                      transform: openFaq === i ? "rotate(45deg)" : "none",
                      transition: "transform 0.2s", display: "inline-block",
                    }}>+</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: "0 24px 20px", color: "#666", fontSize: "0.95rem", lineHeight: "1.7" }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{
          background: "linear-gradient(160deg, #7c3aed, #ec4899)",
          padding: "100px 24px",
          textAlign: "center",
        }}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: "900", color: "white", marginBottom: "20px", lineHeight: 1.2 }}>
              Prêt à fidéliser vos clients ?
            </h2>
            <p style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.8)", marginBottom: "40px", lineHeight: 1.7 }}>
              Rejoignez les restaurateurs qui utilisent Prizmo pour transformer leurs clients en ambassadeurs. 14 jours gratuits, sans carte bancaire.
            </p>
            <Link href="/register" style={{
              display: "inline-block",
              padding: "18px 48px", borderRadius: "99px",
              background: "white", color: "#7c3aed",
              textDecoration: "none", fontSize: "18px", fontWeight: "900",
              boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            }}>
              Démarrer mon essai gratuit 🎡
            </Link>
            <p style={{ marginTop: "20px", color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: "600" }}>
              ✓ 14 jours gratuits &nbsp;·&nbsp; ✓ Sans engagement &nbsp;·&nbsp; ✓ Résultats dès le 1er jour
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          background: "#0f0a1e", color: "rgba(255,255,255,0.5)",
          padding: "40px 24px", textAlign: "center", fontSize: "13px",
        }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexWrap: "wrap" as const, justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
            <img src="/LOGO.svg" alt="Prizmo" style={{ height: "28px", opacity: 0.8 }} />
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" as const }}>
              <a href="/mentions-legales" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Mentions légales</a>
              <a href="/politique-confidentialite" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Confidentialité</a>
              <a href="mailto:contact@prizmo.pro" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Contact</a>
            </div>
            <div>© 2025 Prizmo. Tous droits réservés.</div>
          </div>
        </footer>

      </div>
    </>
  );
}