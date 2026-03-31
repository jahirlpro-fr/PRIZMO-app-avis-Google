import { useState } from "react";
import { EmailForm } from "@/components/game/EmailForm";
import { ReviewStep } from "@/components/game/ReviewStep";
import { SocialStep } from "@/components/game/InstagramStep";
import { WheelOfFortune } from "@/components/game/WheelOfFortune";
import { PrizeResult } from "@/components/game/PrizeResult";

// ─── Types ───────────────────────────────────────────────────────────────────
type Scenario = "wheel" | "loyalty";
type WheelStep = 0 | 1 | 2 | 3 | 4 | 5;
type LoyaltyStep = 0 | 1 | 2 | 3 | 4;

// ─── Config démo Bimbambao ────────────────────────────────────────────────────
const DEMO_NAME = "Bimbambao";
const DEMO_PRIMARY = "#7c3aed";
const DEMO_SECONDARY = "#f3f0ff";
const DEMO_GOOGLE_URL = "https://www.google.com/search?sca_esv=8d67f07cd29c129e&cs=1&q=Petit+Bao+Avis&tbm=lcl#lkt=LocalPoiReviews&lrd=0x47e66faa7ca728a7:0xbbd73bca2072db70,3,,,,";

const DEMO_SEGMENTS = [
    { id: "1", title: "Café offert", color: "#7c3aed", type: "prize" as const, probability: 20, order: 0, establishmentId: "demo" },
    { id: "2", title: "Cookie", color: "#9d5ff0", type: "prize" as const, probability: 20, order: 1, establishmentId: "demo" },
    { id: "3", title: "Boisson offerte", color: "#db2877", type: "prize" as const, probability: 20, order: 2, establishmentId: "demo" },
    { id: "4", title: "Café offert", color: "#7c3aed", type: "prize" as const, probability: 20, order: 3, establishmentId: "demo" },
    { id: "5", title: "Cookie", color: "#9d5ff0", type: "prize" as const, probability: 10, order: 4, establishmentId: "demo" },
    { id: "6", title: "Boisson offerte", color: "#db2877", type: "prize" as const, probability: 10, order: 5, establishmentId: "demo" },
];

const DEMO_NETWORKS = [
    { name: "instagram" as const, url: "https://instagram.com/bimbambao", enabled: true },
    { name: "tiktok" as const, url: "https://tiktok.com/@bimbambao", enabled: true },
];

// ─── Encadré caption gris uniforme ───────────────────────────────────────────
function Caption({ text }: { text: string }) {
    return (
        <div style={{
            position: "absolute", bottom: "18px", left: "18px",
            background: "rgba(20,20,20,0.75)", backdropFilter: "blur(10px)",
            color: "white", fontSize: "12px", fontWeight: "600",
            padding: "8px 14px", borderRadius: "8px",
            maxWidth: "75%", lineHeight: "1.45",
            border: "1px solid rgba(255,255,255,0.1)",
        }}>
            {text}
        </div>
    );
}

// ─── Wrapper faux téléphone avec scale pour éviter le scroll ─────────────────
// Les vrais composants utilisent min-h-screen → on les scale pour qu'ils tiennent
function MobileWrapper({ children }: { children: React.ReactNode }) {
    // On affiche dans une boîte de 390×680px, les composants full-screen
    // sont scalés à 0.52 pour tenir sans scroll dans le faux tel
    const PHONE_W = 340;
    const PHONE_H = 660;
    const CONTENT_W = 390;  // largeur cible du composant
    const SCALE = PHONE_W / CONTENT_W;

    return (
        <div style={{
            width: `${PHONE_W}px`,
            margin: "0 auto",
            borderRadius: "36px",
            border: "8px solid #1a1a1a",
            boxShadow: "0 0 0 2px #2a2a2a, 0 32px 80px rgba(0,0,0,0.55)",
            overflow: "hidden",
            position: "relative",
            background: "#f8f5ff",
        }}>
            {/* Notch */}
            <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: "80px", height: "24px", background: "#1a1a1a",
                borderRadius: "0 0 16px 16px", zIndex: 20,
            }} />
            {/* Conteneur scalé */}
            <div style={{
                width: `${CONTENT_W}px`,
                height: `${PHONE_H / SCALE}px`,
                transform: `scale(${SCALE})`,
                transformOrigin: "top left",
                overflow: "hidden",
            }}>
                {children}
            </div>
        </div>
    );
}

// ─── Carte fidélité simulée ───────────────────────────────────────────────────
function LoyaltyCardVisual({ stamps = 0 }: { stamps?: number }) {
    const total = 8;
    return (
        <div style={{
            background: "#e3d6c0", borderRadius: "16px",
            padding: "18px", margin: "0 16px 16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#8b7355", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: "10px" }}>
                Bimbambao — Carte Fidélité
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "10px" }}>
                {Array.from({ length: total }).map((_, i) => (
                    <div key={i} style={{
                        aspectRatio: "1", borderRadius: "50%",
                        border: `2px solid ${i < stamps ? "#7c3aed" : "rgba(139,115,85,0.3)"}`,
                        background: i < stamps ? "linear-gradient(135deg, #7c3aed, #db2877)" : "rgba(255,255,255,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", color: "white", transition: "all 0.4s",
                    }}>
                        {i < stamps ? "✓" : ""}
                    </div>
                ))}
            </div>
            <div style={{ fontSize: "10px", color: "#8b7355", textAlign: "center" as const }}>8 repas = 1 repas offert 🎁</div>
        </div>
    );
}

// ─── Steps Roue ──────────────────────────────────────────────────────────────
function WheelStepContent({ step, onNext }: { step: WheelStep; onNext: () => void }) {
    const [prize, setPrize] = useState("");
    const [spun, setSpun] = useState(false);

    // Step 0 — Split image
    if (step === 0) {
        return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "460px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.07)", position: "relative" }}>
                <div style={{ position: "relative", overflow: "hidden" }}>
                    <img src="/1A.png" alt="Client scannant" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <Caption text="Le client scanne le QR code pour jouer" />
                </div>
                <div style={{ position: "relative", overflow: "hidden", borderLeft: "2px solid rgba(255,255,255,0.12)" }}>
                    <img src="/1B.png" alt="Chevalet jeu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <Caption text="Image du chevalet en place" />
                </div>
            </div>
        );
    }

    // Steps 1-4 — Vrais composants dans faux téléphone scalé
    if (step === 1) {
        return (
            <MobileWrapper>
                <EmailForm
                    onSubmit={() => onNext()}
                    establishmentName={DEMO_NAME}
                    primaryColor={DEMO_PRIMARY}
                    secondaryColor={DEMO_SECONDARY}
                />
            </MobileWrapper>
        );
    }

    if (step === 2) {
        return (
            <MobileWrapper>
                <ReviewStep
                    googleMapsUrl={DEMO_GOOGLE_URL}
                    establishmentName={DEMO_NAME}
                    onReviewConfirmed={onNext}
                    hasInstagram={true}
                    hasNetworks={true}
                    secondaryColor={DEMO_SECONDARY}
                />
            </MobileWrapper>
        );
    }

    if (step === 3) {
        return (
            <MobileWrapper>
                <SocialStep
                    establishmentName={DEMO_NAME}
                    networks={DEMO_NETWORKS}
                    onDone={onNext}
                    onSkip={onNext}
                    secondaryColor={DEMO_SECONDARY}
                />
            </MobileWrapper>
        );
    }

    if (step === 4) {
        return (
            <MobileWrapper>
                {!spun ? (
                    <WheelOfFortune
                        segments={DEMO_SEGMENTS}
                        onSpinComplete={(p) => { setPrize(p); setSpun(true); }}
                        wheelNumber={1}
                        establishmentName={DEMO_NAME}
                        secondaryColor={DEMO_SECONDARY}
                    />
                ) : (
                    <PrizeResult
                        prize={prize}
                        isWinner={true}
                        wheelNumber={1}
                        establishmentName={DEMO_NAME}
                        hasInstagramWheel={false}
                        onFinish={onNext}
                        establishmentSlug="bimbambao"
                        loyaltyActive={false}
                    />
                )}
            </MobileWrapper>
        );
    }

    // Step 5 — Image finale
    if (step === 5) {
        return (
            <div style={{ height: "460px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.07)", position: "relative" }}>
                <img src="/2.png" alt="Cliente montrant son gain" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 55%)" }} />
                <Caption text="Le client repart avec son gain — tout le monde est content !" />
            </div>
        );
    }

    return null;
}

// ─── Steps Fidélité (5 étapes) ────────────────────────────────────────────────
function LoyaltyStepContent({ step, onNext }: { step: LoyaltyStep; onNext: () => void }) {

    // Step 0 — Split image scan + chevalet fidélité
    if (step === 0) {
        return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "460px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.07)", position: "relative" }}>
                <div style={{ position: "relative", overflow: "hidden" }}>
                    <img src="/3A.png" alt="Client scannant fidélité" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <Caption text="Le client scanne le QR code de la carte fidélité" />
                </div>
                <div style={{ position: "relative", overflow: "hidden", borderLeft: "2px solid rgba(255,255,255,0.12)" }}>
                    <img src="/3B.png" alt="Chevalet fidélité" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <Caption text="Image du chevalet en place" />
                </div>
            </div>
        );
    }

    // Step 1 — Page inscription fidélité (rendu réel)
    if (step === 1) {
        return (
            <MobileWrapper>
                <div style={{ minHeight: "100vh", background: DEMO_SECONDARY, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px 40px" }}>
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                        <div style={{
                            width: "64px", height: "64px", borderRadius: "50%",
                            background: `linear-gradient(135deg, ${DEMO_PRIMARY}, #db2877)`,
                            margin: "0 auto 14px",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px",
                        }}>💳</div>
                        <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0f0f0f", margin: "0 0 4px" }}>Créer ma carte</h2>
                        <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Chez <strong>{DEMO_NAME}</strong></p>
                    </div>
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: "600", color: "#555", display: "block", marginBottom: "6px" }}>Email *</label>
                            <input type="email" placeholder="votre@email.com" style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: `1.5px solid ${DEMO_PRIMARY}40`, background: "white", fontSize: "14px", boxSizing: "border-box" as const }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: "600", color: "#555", display: "block", marginBottom: "6px" }}>Téléphone *</label>
                            <input type="tel" placeholder="06 00 00 00 00" style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: `1.5px solid ${DEMO_PRIMARY}40`, background: "white", fontSize: "14px", boxSizing: "border-box" as const }} />
                        </div>
                        <button onClick={onNext} style={{ width: "100%", padding: "14px", borderRadius: "14px", background: `linear-gradient(135deg, ${DEMO_PRIMARY}, #db2877)`, color: "white", fontWeight: "700", fontSize: "15px", border: "none", cursor: "pointer", marginTop: "4px" }}>
                            Créer ma carte 🎉
                        </button>
                    </div>
                </div>
            </MobileWrapper>
        );
    }

    // Step 2 — Ma carte (rendu réel avec 0 tampon)
    if (step === 2) {
        return (
            <MobileWrapper>
                <div style={{ background: `linear-gradient(160deg, ${DEMO_SECONDARY} 0%, #ffffff 60%)`, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px 40px" }}>
                    {/* Fan de cartes simulé */}
                    <div style={{ position: "relative", width: "280px", height: "200px", marginBottom: "32px" }}>
                        {/* Verso incliné */}
                        <div style={{ width: "260px", height: "170px", background: "#e3d6c0", borderRadius: "14px", boxShadow: "0 8px 20px rgba(0,0,0,0.15)", position: "absolute", zIndex: 1, transform: "rotate(8deg) translateX(18px) translateY(8px)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", padding: "12px", gap: "6px" }}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid rgba(80,80,80,0.3)", background: "rgba(255,255,255,0.3)" }} />
                            ))}
                        </div>
                        {/* Recto devant */}
                        <div style={{ width: "260px", height: "170px", background: "#e3d6c0", borderRadius: "14px", boxShadow: "0 12px 28px rgba(0,0,0,0.18)", position: "absolute", zIndex: 2, transform: "rotate(-3deg) translateX(-8px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                            <div style={{ fontSize: "28px", marginBottom: "8px" }}>🥟</div>
                            <div style={{ fontWeight: "800", fontSize: "14px", color: "#5a3e2b" }}>Bimbambao</div>
                            <div style={{ fontSize: "10px", color: "#8b7355", marginTop: "4px" }}>Carte Fidélité</div>
                        </div>
                    </div>

                    <div style={{ textAlign: "center", marginBottom: "24px", maxWidth: "280px" }}>
                        <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#1a1a2e", margin: "0 0 8px" }}>Fidélité récompensée 🎁</h1>
                        <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6", margin: 0 }}>
                            Cumulez vos visites et débloquez <strong style={{ color: DEMO_PRIMARY }}>1 repas offert</strong> après 8 repas.
                        </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "280px" }}>
                        <button onClick={onNext} style={{ width: "100%", padding: "16px", borderRadius: "16px", background: `linear-gradient(135deg, ${DEMO_PRIMARY}, #db2877)`, color: "white", fontWeight: "700", fontSize: "15px", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
                            💳 Je veux ma carte fidélité !
                        </button>
                        <button style={{ width: "100%", padding: "16px", borderRadius: "16px", border: `2px solid ${DEMO_PRIMARY}`, background: "transparent", color: DEMO_PRIMARY, fontWeight: "700", fontSize: "15px", cursor: "default" }}>
                            J'en ai déjà une !
                        </button>
                    </div>
                    <p style={{ textAlign: "center", fontSize: "11px", color: "#ccc", marginTop: "24px" }}>Propulsé par Prizmo 🎡</p>
                </div>
            </MobileWrapper>
        );
    }

    // Step 3 — Validation par le commerçant (image)
    if (step === 3) {
        return (
            <div style={{ height: "460px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.07)", position: "relative" }}>
                <img src="/5.png" alt="Commerçant validant" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 55%)" }} />
                <Caption text="Le client montre son téléphone au commerçant pour valider sa participation" />
            </div>
        );
    }

    // Step 4 — Carte tamponnée (image) — ex step 5, maintenant étape finale
    if (step === 4) {
        return (
            <div style={{ height: "460px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.07)", position: "relative" }}>
                <img src="/4.png" alt="Carte tamponnée" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 55%)" }} />
                <Caption text="Tampon validé — le client repart fidélisé, il reviendra !" />
            </div>
        );
    }

    return null;
}

// ─── Labels ───────────────────────────────────────────────────────────────────
const WHEEL_LABELS = ["Scan QR", "Inscription", "Avis Google", "Réseaux", "La roue", "Le gain"];
const LOYALTY_LABELS = ["Scan QR", "Inscription", "Ma carte", "Validation", "Tamponné"];

// ─── Composant principal ──────────────────────────────────────────────────────
export function InteractiveDemo() {
    const [scenario, setScenario] = useState < Scenario > ("wheel");
    const [wheelStep, setWheelStep] = useState < WheelStep > (0);
    const [loyaltyStep, setLoyaltyStep] = useState < LoyaltyStep > (0);

    const step = scenario === "wheel" ? wheelStep : loyaltyStep;
    const totalSteps = scenario === "wheel" ? 6 : 5;
    const labels = scenario === "wheel" ? WHEEL_LABELS : LOYALTY_LABELS;
    const maxStep = scenario === "wheel" ? 5 : 4;

    const goNext = () => {
        if (scenario === "wheel" && wheelStep < 5) setWheelStep((s) => (s + 1) as WheelStep);
        if (scenario === "loyalty" && loyaltyStep < 4) setLoyaltyStep((s) => (s + 1) as LoyaltyStep);
    };

    const goPrev = () => {
        if (scenario === "wheel" && wheelStep > 0) setWheelStep((s) => (s - 1) as WheelStep);
        if (scenario === "loyalty" && loyaltyStep > 0) setLoyaltyStep((s) => (s - 1) as LoyaltyStep);
    };

    const resetScenario = (s: Scenario) => {
        setScenario(s);
        setWheelStep(0);
        setLoyaltyStep(0);
    };

    // Steps avec vrais composants → bouton "Passer" discret
    const isRealComponentStep =
        (scenario === "wheel" && (step === 1 || step === 2 || step === 3 || step === 4)) ||
        (scenario === "loyalty" && (step === 1 || step === 2));

    return (
        <section id="demo" style={{
            background: "linear-gradient(180deg, #0a0614 0%, #14082a 50%, #0a0614 100%)",
            padding: "80px 24px 100px",
            position: "relative", overflow: "hidden",
        }}>
            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

            {/* Glow */}
            <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: "700px", height: "500px", background: "radial-gradient(ellipse, rgba(124,58,237,0.16) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(124,58,237,0.18)", border: "1px solid rgba(124,58,237,0.32)", color: "#c4b5fd", padding: "6px 16px", borderRadius: "100px", fontSize: "12px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: "20px" }}>
                        ▶ Démo interactive
                    </div>
                    <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 4vw, 48px)", color: "white", fontWeight: "400", lineHeight: "1.15", margin: "0 0 16px" }}>
                        Vivez l'expérience{" "}
                        <span style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Prizmo</span>
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", margin: 0 }}>
                        Choisissez un scénario et jouez le rôle du client
                    </p>
                </div>

                {/* Sélecteur scénario */}
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "40px" }}>
                    {[{ key: "wheel" as Scenario, icon: "🎡", label: "Roue de la fortune" }, { key: "loyalty" as Scenario, icon: "💳", label: "Carte fidélité" }].map((s) => (
                        <button key={s.key} onClick={() => resetScenario(s.key)} style={{ padding: "12px 24px", borderRadius: "100px", fontWeight: "700", fontSize: "14px", cursor: "pointer", border: scenario === s.key ? "2px solid #7c3aed" : "2px solid rgba(255,255,255,0.08)", background: scenario === s.key ? "linear-gradient(135deg, #7c3aed, #db2877)" : "rgba(255,255,255,0.03)", color: "white", transition: "all 0.25s" }}>
                            {s.icon} {s.label}
                        </button>
                    ))}
                </div>

                {/* Stepper */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px", gap: 0 }}>
                    {labels.map((label, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, background: i < step ? "linear-gradient(135deg, #7c3aed, #db2877)" : i === step ? "white" : "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: i === step ? "#7c3aed" : i < step ? "white" : "rgba(255,255,255,0.2)", boxShadow: i === step ? "0 0 0 3px rgba(124,58,237,0.3)" : "none", transition: "all 0.3s" }}>
                                    {i < step ? "✓" : i + 1}
                                </div>
                                <div style={{ fontSize: "10px", fontWeight: "600", color: i === step ? "white" : "rgba(255,255,255,0.22)", whiteSpace: "nowrap", transition: "color 0.3s" }}>{label}</div>
                            </div>
                            {i < labels.length - 1 && (
                                <div style={{ width: "36px", height: "2px", flexShrink: 0, background: i < step ? "linear-gradient(90deg, #7c3aed, #db2877)" : "rgba(255,255,255,0.07)", margin: "0 3px", marginBottom: "22px", transition: "all 0.3s" }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Contenu step */}
                <div key={`${scenario}-${step}`} style={{ animation: "fadeUp 0.35s ease forwards" }}>
                    {scenario === "wheel"
                        ? <WheelStepContent step={wheelStep} onNext={goNext} />
                        : <LoyaltyStepContent step={loyaltyStep} onNext={goNext} />
                    }
                </div>

                {/* Navigation */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "28px" }}>
                    <button onClick={goPrev} disabled={step === 0} style={{ padding: "10px 20px", borderRadius: "100px", border: "1.5px solid rgba(255,255,255,0.1)", background: "transparent", color: step === 0 ? "rgba(255,255,255,0.12)" : "white", fontSize: "13px", fontWeight: "600", cursor: step === 0 ? "default" : "pointer", transition: "all 0.2s" }}>
                        ← Précédent
                    </button>

                    <div style={{ display: "flex", gap: "6px" }}>
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} style={{ width: i === step ? "20px" : "6px", height: "6px", borderRadius: "100px", background: i === step ? "linear-gradient(90deg, #7c3aed, #db2877)" : "rgba(255,255,255,0.12)", transition: "all 0.3s" }} />
                        ))}
                    </div>

                    {step < maxStep ? (
                        <button onClick={goNext} style={{ padding: "10px 20px", borderRadius: "100px", background: isRealComponentStep ? "transparent" : "linear-gradient(135deg, #7c3aed, #db2877)", border: isRealComponentStep ? "1.5px solid rgba(255,255,255,0.1)" : "none", color: isRealComponentStep ? "rgba(255,255,255,0.45)" : "white", fontSize: isRealComponentStep ? "12px" : "13px", fontWeight: isRealComponentStep ? "500" : "700", cursor: "pointer", boxShadow: isRealComponentStep ? "none" : "0 4px 16px rgba(124,58,237,0.4)", transition: "all 0.2s" }}>
                            {isRealComponentStep ? "Passer →" : "Suivant →"}
                        </button>
                    ) : (
                        <button onClick={() => resetScenario(scenario)} style={{ padding: "10px 20px", borderRadius: "100px", background: "linear-gradient(135deg, #7c3aed, #db2877)", color: "white", fontSize: "13px", fontWeight: "700", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}>
                            🔄 Recommencer
                        </button>
                    )}
                </div>

                {/* CTA */}
                <div style={{ textAlign: "center", marginTop: "56px" }}>
                    <a href="/admin/establishment/new" style={{ display: "inline-block", background: "linear-gradient(135deg, #7c3aed, #db2877)", color: "white", fontWeight: "700", fontSize: "16px", padding: "18px 40px", borderRadius: "100px", textDecoration: "none", boxShadow: "0 8px 32px rgba(124,58,237,0.5)" }}>
                        Démarrer mon essai gratuit 21 jours →
                    </a>
                    <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "12px", marginTop: "12px" }}>
                        Aucune carte bancaire · Configuré en 5 minutes
                    </div>
                </div>

            </div>
        </section>
    );
}