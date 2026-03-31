import { useState, useRef, useEffect } from "react";

type Scenario = "wheel" | "loyalty";
type WheelStep = 0 | 1 | 2 | 3 | 4 | 5;
type LoyaltyStep = 0 | 1 | 2 | 3 | 4;

const DEMO_PRIMARY = "#7c3aed";
const DEMO_SECONDARY = "#f3f0ff";
const DEMO_GOOGLE_URL = "https://www.google.com/search?q=Petit+Bao+Avis&tbm=lcl#lkt=LocalPoiReviews&lrd=0x47e66faa7ca728a7:0xbbd73bca2072db70,3,,,,";

// ─── Caption gris uniforme ────────────────────────────────────────────────────
function Caption({ text }: { text: string }) {
    return (
        <div style={{
            position: "absolute", bottom: "18px", left: "18px",
            background: "rgba(20,20,20,0.75)", backdropFilter: "blur(10px)",
            color: "white", fontSize: "12px", fontWeight: "600",
            padding: "8px 14px", borderRadius: "8px",
            maxWidth: "75%", lineHeight: "1.45",
            border: "1px solid rgba(255,255,255,0.1)",
        }}>{text}</div>
    );
}

// ─── Faux téléphone conteneur ─────────────────────────────────────────────────
function Phone({ children, bg = "white" }: { children: React.ReactNode; bg?: string }) {
    return (
        <div style={{
            width: "320px", height: "580px", margin: "0 auto",
            borderRadius: "40px", border: "8px solid #1a1a1a",
            boxShadow: "0 0 0 2px #2a2a2a, 0 40px 80px rgba(0,0,0,0.6)",
            overflow: "hidden", position: "relative", background: bg,
            display: "flex", flexDirection: "column",
        }}>
            {/* Notch */}
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "80px", height: "24px", background: "#1a1a1a", borderRadius: "0 0 16px 16px", zIndex: 20 }} />
            <div style={{ paddingTop: "32px", flex: 1, overflowY: "auto" }}>{children}</div>
        </div>
    );
}

// ─── Barre de progression (comme dans les vrais composants) ───────────────────
function ProgressBar({ step, total = 4 }: { step: number; total?: number }) {
    return (
        <div style={{ display: "flex", gap: "4px", padding: "12px 16px 8px", justifyContent: "center" }}>
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} style={{
                    flex: 1, height: "4px", borderRadius: "2px",
                    background: i < step ? `linear-gradient(90deg, ${DEMO_PRIMARY}, #db2877)` : "#e5e7eb",
                    maxWidth: "60px",
                }} />
            ))}
        </div>
    );
}

// ─── Roue SVG animée ──────────────────────────────────────────────────────────
const SEGMENTS = [
    { label: "Café offert", color: "#7c3aed" },
    { label: "Cookie", color: "#9d5ff0" },
    { label: "Boisson", color: "#db2877" },
    { label: "Café offert", color: "#7c3aed" },
    { label: "Cookie", color: "#9d5ff0" },
    { label: "Boisson", color: "#db2877" },
];

function WheelSVG({ spinning, onDone }: { spinning: boolean; onDone: () => void }) {
    const [rotation, setRotation] = useState(0);
    const rafRef = useRef<number>(0);
    const startRef = useRef<number>(0);
    const spinningRef = useRef(false);

    useEffect(() => {
        if (spinning && !spinningRef.current) {
            spinningRef.current = true;
            const target = rotation + 360 * 6 + 30;
            const duration = 4000;
            startRef.current = performance.now();
            const from = rotation;

            const animate = (now: number) => {
                const elapsed = now - startRef.current;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setRotation(from + (target - from) * eased);
                if (progress < 1) {
                    rafRef.current = requestAnimationFrame(animate);
                } else {
                    spinningRef.current = false;
                    onDone();
                }
            };
            rafRef.current = requestAnimationFrame(animate);
        }
        return () => cancelAnimationFrame(rafRef.current);
    }, [spinning]);

    const cx = 100, cy = 100, r = 90;
    const count = SEGMENTS.length;
    const arc = (Math.PI * 2) / count;

    const getPath = (i: number) => {
        const start = (rotation * Math.PI / 180) + i * arc - Math.PI / 2;
        const end = start + arc;
        const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
        const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
        return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`;
    };

    const getLabelPos = (i: number) => {
        const angle = (rotation * Math.PI / 180) + i * arc + arc / 2 - Math.PI / 2;
        return {
            x: cx + (r * 0.62) * Math.cos(angle),
            y: cy + (r * 0.62) * Math.sin(angle),
            rotate: (rotation + i * (360 / count) + (360 / count) / 2) % 360,
        };
    };

    return (
        <div style={{ position: "relative", width: "180px", height: "180px", margin: "0 auto" }}>
            <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 4px 12px rgba(124,58,237,0.3))" }}>
                {SEGMENTS.map((seg, i) => {
                    const lp = getLabelPos(i);
                    return (
                        <g key={i}>
                            <path d={getPath(i)} fill={seg.color} stroke="white" strokeWidth="2" />
                            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
                                transform={`rotate(${lp.rotate - rotation}, ${lp.x}, ${lp.y})`}
                                fill="white" fontSize="7" fontWeight="bold"
                                style={{ pointerEvents: "none" }}>
                                {seg.label.length > 8 ? seg.label.substring(0, 8) : seg.label}
                            </text>
                        </g>
                    );
                })}
                <circle cx={cx} cy={cy} r="14" fill="white" stroke="#e5e7eb" strokeWidth="2" />
            </svg>
            {/* Pointeur */}
            <div style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "18px solid #ef4444", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
        </div>
    );
}

// ─── ROUE — Steps ─────────────────────────────────────────────────────────────
function WheelStepContent({ step, onNext }: { step: WheelStep; onNext: () => void }) {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [spinning, setSpinning] = useState(false);
    const [spun, setSpun] = useState(false);

    // Step 0 — Split image scan + chevalet
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

    // Step 1 — Inscription (faux téléphone statique)
    if (step === 1) {
        return (
            <Phone bg={DEMO_SECONDARY}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 20px 24px" }}>
                    <ProgressBar step={0} total={4} />
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: `${DEMO_PRIMARY}22`, display: "flex", alignItems: "center", justifyContent: "center", margin: "12px auto", fontSize: "24px" }}>🎡</div>
                    <h3 style={{ fontSize: "20px", fontWeight: "800", textAlign: "center", color: "#0f0f0f", margin: "0 0 6px" }}>Bienvenue dans<br />votre restaurant !</h3>
                    <p style={{ fontSize: "12px", color: "#666", textAlign: "center", margin: "0 0 20px", lineHeight: "1.5" }}>Laissez un avis Google et tentez de gagner un cadeau 🎁</p>
                    <div style={{ width: "100%", marginBottom: "10px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#555", marginBottom: "5px", display: "flex", alignItems: "center", gap: "5px" }}>✉️ Adresse email</div>
                        <input
                            type="email" placeholder="votre@email.com" value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #d1d5db", fontSize: "13px", boxSizing: "border-box" as const, outline: "none", background: "white" }}
                        />
                    </div>
                    <div style={{ width: "100%", marginBottom: "16px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#555", marginBottom: "5px", display: "flex", alignItems: "center", gap: "5px" }}>📞 Numéro de téléphone</div>
                        <input
                            type="tel" placeholder="+33 6 12 34 56 78" value={phone}
                            onChange={e => {
                                const d = e.target.value.replace(/\D/g, "");
                                if (d.length <= 10) setPhone(d);
                            }}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #d1d5db", fontSize: "13px", boxSizing: "border-box" as const, outline: "none", background: "white" }}
                        />
                    </div>
                    <button onClick={onNext} style={{ width: "100%", padding: "13px", borderRadius: "12px", background: "linear-gradient(135deg, #7c3aed, #f97316)", color: "white", fontWeight: "700", fontSize: "14px", border: "none", cursor: "pointer" }}>
                        🎲 Commencer le jeu !
                    </button>
                    <p style={{ fontSize: "10px", color: "#aaa", textAlign: "center", margin: "10px 0 0", lineHeight: "1.4" }}>En participant, vous acceptez de recevoir des communications commerciales de notre part.</p>
                </div>
            </Phone>
        );
    }

    // Step 2 — Avis Google (faux téléphone statique)
    if (step === 2) {
        return (
            <Phone bg="white">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 16px 24px" }}>
                    <ProgressBar step={1} total={4} />
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #fbbf24, #f97316)", display: "flex", alignItems: "center", justifyContent: "center", margin: "12px auto", fontSize: "22px" }}>⭐</div>
                    <h3 style={{ fontSize: "20px", fontWeight: "800", textAlign: "center", color: "#0f0f0f", margin: "0 0 6px" }}>Laissez votre avis</h3>
                    <p style={{ fontSize: "12px", color: "#666", textAlign: "center", margin: "0 0 16px", lineHeight: "1.5" }}>Partagez votre expérience sur Google pour accéder à la roue de la fortune !</p>
                    <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: "10px", padding: "10px 14px", width: "100%", marginBottom: "14px", boxSizing: "border-box" as const }}>
                        <p style={{ fontSize: "11px", color: "#92400e", fontWeight: "600", margin: 0, textAlign: "center" }}>⭐ Votre avis nous aide à nous améliorer et aide d'autres clients à nous découvrir !</p>
                    </div>
                    <a href={DEMO_GOOGLE_URL} target="_blank" rel="noreferrer"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "12px", borderRadius: "12px", background: "white", border: "2px solid #e5e7eb", color: "#0f0f0f", fontWeight: "700", fontSize: "13px", textDecoration: "none", marginBottom: "10px", boxSizing: "border-box" as const }}>
                        <img src="https://www.google.com/favicon.ico" width="16" height="16" alt="Google" />
                        Laisser mon avis Google ↗
                    </a>
                    <button onClick={onNext} style={{ width: "100%", padding: "12px", borderRadius: "12px", background: `linear-gradient(135deg, ${DEMO_PRIMARY}, #db2877)`, color: "white", fontWeight: "700", fontSize: "13px", border: "none", cursor: "pointer" }}>
                        ✅ J'ai laissé mon avis !
                    </button>
                </div>
            </Phone>
        );
    }

    // Step 3 — Réseaux sociaux (faux téléphone statique)
    if (step === 3) {
        return (
            <Phone bg="white">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 16px 24px" }}>
                    <ProgressBar step={2} total={4} />
                    <div style={{ display: "flex", gap: "8px", margin: "12px auto 10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📸</div>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🎵</div>
                    </div>
                    <h3 style={{ fontSize: "19px", fontWeight: "800", textAlign: "center", color: "#0f0f0f", margin: "0 0 4px" }}>Suivez-nous !</h3>
                    <p style={{ fontSize: "12px", color: "#666", textAlign: "center", margin: "0 0 14px" }}>Pour ne rien rater de nos offres</p>

                    {[
                        { name: "Instagram", handle: "@bimbambao_officiel", bg: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)", url: "https://instagram.com/bimbambao", icon: "📸" },
                        { name: "TikTok", handle: "@bimbambao", bg: "#000", url: "https://tiktok.com/@bimbambao", icon: "🎵" },
                    ].map(net => (
                        <div key={net.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "#f9fafb", borderRadius: "12px", padding: "10px 14px", marginBottom: "8px", boxSizing: "border-box" as const }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: net.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>{net.icon}</div>
                                <div>
                                    <div style={{ fontWeight: "700", fontSize: "13px" }}>{net.name}</div>
                                    <div style={{ fontSize: "11px", color: "#888" }}>{net.handle}</div>
                                </div>
                            </div>
                            <a href={net.url} target="_blank" rel="noreferrer"
                                style={{ background: net.bg, color: "white", fontSize: "11px", fontWeight: "700", padding: "5px 12px", borderRadius: "100px", textDecoration: "none" }}>
                                S'abonner
                            </a>
                        </div>
                    ))}

                    <div style={{ width: "100%", borderTop: "1px solid #e5e7eb", margin: "8px 0", position: "relative" }}>
                        <span style={{ position: "absolute", top: "-9px", left: "50%", transform: "translateX(-50%)", background: "white", padding: "0 8px", fontSize: "11px", color: "#888" }}>Puis revenez ici</span>
                    </div>
                    <button onClick={onNext} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #16a34a", background: "white", color: "#16a34a", fontWeight: "700", fontSize: "13px", cursor: "pointer", marginTop: "6px" }}>
                        ✅ Je suis abonné(e) !
                    </button>
                    <button onClick={onNext} style={{ background: "none", border: "none", color: "#aaa", fontSize: "11px", cursor: "pointer", marginTop: "8px", textDecoration: "underline" }}>Passer cette étape</button>
                </div>
            </Phone>
        );
    }

    // Step 4 — Roue animée (faux téléphone avec vraie animation)
    if (step === 4) {
        return (
            <Phone bg="white">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 16px 24px" }}>
                    <ProgressBar step={3} total={4} />
                    {!spun ? (
                        <>
                            <h3 style={{ fontSize: "20px", fontWeight: "800", textAlign: "center", color: "#0f0f0f", margin: "14px 0 4px" }}>Tournez la roue !</h3>
                            <p style={{ fontSize: "12px", color: "#666", textAlign: "center", margin: "0 0 16px" }}>Merci pour votre avis ! Tentez votre chance</p>
                            <WheelSVG spinning={spinning} onDone={() => setSpun(true)} />
                            <button
                                onClick={() => { if (!spinning) setSpinning(true); }}
                                disabled={spinning}
                                style={{ marginTop: "20px", width: "100%", padding: "14px", borderRadius: "12px", background: spinning ? "#e5e7eb" : `linear-gradient(135deg, ${DEMO_PRIMARY}, #db2877, #f97316)`, color: spinning ? "#aaa" : "white", fontWeight: "700", fontSize: "14px", border: "none", cursor: spinning ? "default" : "pointer" }}>
                                {spinning ? "⚡ La roue tourne..." : "TOURNER LA ROUE !"}
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #fbbf24, #f97316)", display: "flex", alignItems: "center", justifyContent: "center", margin: "20px auto 12px", fontSize: "28px" }}>🎉</div>
                            <h3 style={{ fontSize: "22px", fontWeight: "800", textAlign: "center", color: "#0f0f0f", margin: "0 0 16px" }}>Félicitations !</h3>
                            <div style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)", border: "2px solid #fbbf24", borderRadius: "14px", padding: "20px", width: "100%", textAlign: "center", marginBottom: "16px", boxSizing: "border-box" as const }}>
                                <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎁</div>
                                <div style={{ fontWeight: "800", fontSize: "15px", color: "#0f0f0f", marginBottom: "4px" }}>Vous avez gagné :</div>
                                <div style={{ fontWeight: "800", fontSize: "20px", color: "#d97706" }}>Café offert !</div>
                            </div>
                            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "10px 14px", width: "100%", marginBottom: "14px", boxSizing: "border-box" as const }}>
                                <p style={{ fontSize: "11px", color: "#1e40af", fontWeight: "600", margin: 0, textAlign: "center" }}>📱 Montrez cet écran à votre serveur pour récupérer votre cadeau !</p>
                            </div>
                            <button onClick={onNext} style={{ width: "100%", padding: "12px", borderRadius: "12px", background: `linear-gradient(135deg, ${DEMO_PRIMARY}, #db2877)`, color: "white", fontWeight: "700", fontSize: "14px", border: "none", cursor: "pointer" }}>
                                Terminer
                            </button>
                        </>
                    )}
                </div>
            </Phone>
        );
    }

    // Step 5 — Image finale gain
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

// ─── FIDÉLITÉ — Steps ─────────────────────────────────────────────────────────
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

    // Step 1 — Inscription fidélité (faux téléphone statique)
    if (step === 1) {
        return (
            <Phone bg={DEMO_SECONDARY}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 20px 28px" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: `linear-gradient(135deg, ${DEMO_PRIMARY}, #db2877)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "8px auto 14px", fontSize: "22px" }}>💳</div>
                    <h3 style={{ fontSize: "22px", fontWeight: "900", textAlign: "center", color: "#0f0f0f", margin: "0 0 4px", fontFamily: "'Righteous', cursive" }}>Créer ma carte</h3>
                    <p style={{ fontSize: "13px", color: "#888", margin: "0 0 24px", textAlign: "center" }}>Chez <strong>Bimbambao</strong></p>
                    <div style={{ width: "100%", marginBottom: "12px" }}>
                        <label style={{ fontSize: "12px", fontWeight: "600", color: "#555", display: "block", marginBottom: "6px" }}>Email *</label>
                        <input type="email" placeholder="votre@email.com"
                            style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1.5px solid #e5e7eb", background: "white", fontSize: "13px", boxSizing: "border-box" as const }} />
                    </div>
                    <div style={{ width: "100%", marginBottom: "20px" }}>
                        <label style={{ fontSize: "12px", fontWeight: "600", color: "#555", display: "block", marginBottom: "6px" }}>Téléphone *</label>
                        <input type="tel" placeholder="06 00 00 00 00"
                            style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1.5px solid #e5e7eb", background: "white", fontSize: "13px", boxSizing: "border-box" as const }} />
                    </div>
                    <button onClick={onNext} style={{ width: "100%", padding: "14px", borderRadius: "14px", background: `linear-gradient(135deg, ${DEMO_PRIMARY}, #db2877)`, color: "white", fontWeight: "700", fontSize: "15px", border: "none", cursor: "pointer" }}>
                        Créer ma carte 🎉
                    </button>
                </div>
            </Phone>
        );
    }

    // Step 2 — Image /4.png (client tenant son téléphone avec la carte) + caption
    if (step === 2) {
        return (
            <div style={{ height: "460px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.07)", position: "relative" }}>
                <img src="/4.png" alt="Carte fidélité sur téléphone"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)" }} />
                <div style={{ position: "absolute", bottom: "18px", left: "50%", transform: "translateX(-50%)", background: "rgba(20,20,20,0.75)", backdropFilter: "blur(10px)", color: "white", fontSize: "12px", fontWeight: "600", padding: "8px 16px", borderRadius: "8px", whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.1)" }}>
                    Votre carte de fidélité 100% digitale — vous ne la perdrez jamais !
                </div>
            </div>
        );
    }

    // Step 3 — Image validation commerçant
    if (step === 3) {
        return (
            <div style={{ height: "460px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.07)", position: "relative" }}>
                <img src="/5.png" alt="Commerçant validant"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 55%)" }} />
                <div style={{ position: "absolute", bottom: "18px", left: "50%", transform: "translateX(-50%)", background: "rgba(20,20,20,0.75)", backdropFilter: "blur(10px)", color: "white", fontSize: "12px", fontWeight: "600", padding: "8px 16px", borderRadius: "8px", whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.1)" }}>
                    Le client montre son téléphone au commerçant pour valider sa participation
                </div>
            </div>
        );
    }

    // Step 4 — Image /6.png (cliente heureuse) — étape "Tamponné"
    if (step === 4) {
        return (
            <div style={{ height: "460px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.07)", position: "relative" }}>
                <img src="/6.png" alt="Cliente avec carte tamponnée"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 10%" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 55%)" }} />
                <div style={{ position: "absolute", bottom: "18px", left: "50%", transform: "translateX(-50%)", background: "rgba(20,20,20,0.75)", backdropFilter: "blur(10px)", color: "white", fontSize: "12px", fontWeight: "600", padding: "8px 16px", borderRadius: "8px", whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.1)" }}>
                    Tampon validé — le client repart fidélisé, il reviendra !
                </div>
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
    const [scenario, setScenario] = useState<Scenario>("wheel");
    const [wheelStep, setWheelStep] = useState<WheelStep>(0);
    const [loyaltyStep, setLoyaltyStep] = useState<LoyaltyStep>(0);

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

    const isInteractiveStep = false; // tous les steps ont le bouton Suivant

    return (
        <section id="demo" style={{
            background: "linear-gradient(180deg, #0a0614 0%, #14082a 50%, #0a0614 100%)",
            padding: "80px 24px 100px",
            position: "relative", overflow: "hidden",
        }}>
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

                    {step < maxStep && !isInteractiveStep ? (
                        <button onClick={goNext} style={{ padding: "10px 20px", borderRadius: "100px", background: "linear-gradient(135deg, #7c3aed, #db2877)", color: "white", fontSize: "13px", fontWeight: "700", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}>
                            Suivant →
                        </button>
                    ) : step === maxStep ? (
                        <button onClick={() => resetScenario(scenario)} style={{ padding: "10px 20px", borderRadius: "100px", background: "linear-gradient(135deg, #7c3aed, #db2877)", color: "white", fontSize: "13px", fontWeight: "700", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}>
                            🔄 Recommencer
                        </button>
                    ) : (
                        <div style={{ width: "100px" }} /> // placeholder pour aligner les dots
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