import { useState, useRef, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Scenario = "wheel" | "loyalty";
type WheelStep = 0 | 1 | 2 | 3 | 4 | 5;
type LoyaltyStep = 0 | 1 | 2 | 3 | 4 | 5;

// ─── Wheel segments démo ─────────────────────────────────────────────────────
const SEGMENTS = [
  { label: "Café offert", color: "#7c3aed" },
  { label: "Cookie", color: "#db2777" },
  { label: "Boisson", color: "#7c3aed" },
  { label: "Café offert", color: "#db2777" },
  { label: "Cookie", color: "#7c3aed" },
  { label: "Boisson", color: "#db2877" },
];

// ─── Composant Roue ──────────────────────────────────────────────────────────
function WheelCanvas({ spinning, onDone }: { spinning: boolean; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number>(0);
  const spinningRef = useRef(false);

  useEffect(() => {
    drawWheel(angleRef.current);
  }, []);

  useEffect(() => {
    if (spinning && !spinningRef.current) {
      spinningRef.current = true;
      // Cible : "Café offert" = segment 0 → angle ~330° pour qu'il arrive sous le pointeur
      const targetAngle = angleRef.current + 360 * 5 + (330 - (angleRef.current % 360));
      const startAngle = angleRef.current;
      const duration = 3500;
      const start = performance.now();

      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Easing : easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        angleRef.current = startAngle + (targetAngle - startAngle) * eased;
        drawWheel(angleRef.current);
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

  function drawWheel(rotation: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 8;
    const count = SEGMENTS.length;
    const arc = (Math.PI * 2) / count;
    const rot = (rotation * Math.PI) / 180;

    ctx.clearRect(0, 0, size, size);

    // Shadow
    ctx.save();
    ctx.shadowColor = "rgba(124,58,237,0.3)";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.restore();

    // Segments
    SEGMENTS.forEach((seg, i) => {
      const startAngle = rot + i * arc - Math.PI / 2;
      const endAngle = startAngle + arc;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? seg.color : lighten(seg.color);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "white";
      ctx.font = `bold ${size < 200 ? 9 : 11}px DM Sans, sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 4;
      ctx.fillText(seg.label, r - 12, 4);
      ctx.restore();
    });

    // Centre circle
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 8;
    ctx.fill();

    // Pointeur
    ctx.save();
    ctx.translate(cx, 6);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -16);
    ctx.lineTo(10, -16);
    ctx.closePath();
    ctx.fillStyle = "#7c3aed";
    ctx.shadowColor = "rgba(124,58,237,0.5)";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }

  function lighten(hex: string) {
    // Rend la couleur plus claire pour alterner
    return hex === "#7c3aed" ? "#9d5ff0" : "#e4429a";
  }

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={220}
      style={{ display: "block", margin: "0 auto" }}
    />
  );
}

// ─── Écran simulé : wrapper mobile ───────────────────────────────────────────
function PhoneScreen({ children, bg = "#f8f5ff" }: { children: React.ReactNode; bg?: string }) {
  return (
    <div style={{
      width: "100%",
      maxWidth: "320px",
      margin: "0 auto",
      background: bg,
      borderRadius: "32px",
      border: "8px solid #1a1a1a",
      boxShadow: "0 0 0 2px #333, 0 32px 64px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Notch */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "80px", height: "24px", background: "#1a1a1a",
        borderRadius: "0 0 16px 16px", zIndex: 10,
      }} />
      <div style={{ paddingTop: "32px", minHeight: "480px" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Carte fidélité simulée ───────────────────────────────────────────────────
function LoyaltyCard({ stamps }: { stamps: number }) {
  const total = 8;
  return (
    <div style={{
      background: "linear-gradient(135deg, #e8dcc8, #d4c4a0)",
      borderRadius: "16px",
      padding: "20px",
      margin: "0 16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    }}>
      <div style={{ fontSize: "11px", fontWeight: "700", color: "#8b7355", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
        Bimbambao — Carte Fidélité
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "12px" }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            width: "100%",
            aspectRatio: "1",
            borderRadius: "50%",
            border: `2px solid ${i < stamps ? "#7c3aed" : "rgba(139,115,85,0.3)"}`,
            background: i < stamps ? "linear-gradient(135deg, #7c3aed, #db2877)" : "rgba(255,255,255,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px",
            transition: "all 0.4s",
            boxShadow: i < stamps ? "0 2px 8px rgba(124,58,237,0.4)" : "none",
          }}>
            {i < stamps ? "✓" : ""}
          </div>
        ))}
      </div>
      <div style={{ fontSize: "11px", color: "#8b7355", textAlign: "center" }}>
        {total} repas = 1 repas offert 🎁
      </div>
    </div>
  );
}

// ─── Steps Roue ──────────────────────────────────────────────────────────────
function WheelStepContent({ step, onNext }: { step: WheelStep; onNext: () => void }) {
  const [email, setEmail] = useState("marie@exemple.fr");
  const [phone, setPhone] = useState("0612345678");
  const [spinning, setSpinning] = useState(false);
  const [spun, setSpun] = useState(false);

  if (step === 0) {
    // Case 1 : split image
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "420px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid #efefef" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img src="/1A.png" alt="Client scannant le QR code" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, transparent 70%, rgba(0,0,0,0.15))",
          }} />
          <div style={{
            position: "absolute", bottom: "16px", left: "16px",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            color: "white", fontSize: "12px", fontWeight: "600",
            padding: "6px 12px", borderRadius: "100px",
          }}>📱 Le client scanne</div>
        </div>
        <div style={{ position: "relative", overflow: "hidden", borderLeft: "2px solid white" }}>
          <img src="/1B.png" alt="Affiche QR jeu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{
            position: "absolute", bottom: "16px", left: "12px", right: "12px",
            background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)",
            color: "white", fontSize: "12px", fontWeight: "600",
            padding: "6px 12px", borderRadius: "100px", textAlign: "center",
          }}>🎡 L'affiche en place</div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <PhoneScreen bg="#f8f5ff">
        <div style={{ padding: "20px 20px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #db2877)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🎡</div>
            <div style={{ fontSize: "17px", fontWeight: "800", color: "#0f0f0f" }}>Bienvenue chez Bimbambao !</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Laissez un avis et tentez votre chance 🎁</div>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#555", marginBottom: "6px" }}>✉️ Adresse email</div>
            <input readOnly value={email} onChange={e => setEmail(e.target.value)} style={{
              width: "100%", padding: "10px 14px", borderRadius: "12px",
              border: "1.5px solid #e0d4ff", background: "white",
              fontSize: "13px", color: "#0f0f0f", boxSizing: "border-box",
            }} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#555", marginBottom: "6px" }}>📞 Téléphone</div>
            <input readOnly value={phone} onChange={e => setPhone(e.target.value)} style={{
              width: "100%", padding: "10px 14px", borderRadius: "12px",
              border: "1.5px solid #e0d4ff", background: "white",
              fontSize: "13px", color: "#0f0f0f", boxSizing: "border-box",
            }} />
          </div>
          <button onClick={onNext} style={{
            width: "100%", padding: "14px", borderRadius: "14px",
            background: "linear-gradient(135deg, #7c3aed, #db2877)",
            color: "white", fontWeight: "700", fontSize: "14px",
            border: "none", cursor: "pointer",
          }}>🎲 Commencer le jeu !</button>
          <div style={{ fontSize: "10px", color: "#aaa", textAlign: "center", marginTop: "10px" }}>
            En participant, vous acceptez de recevoir nos communications.
          </div>
        </div>
      </PhoneScreen>
    );
  }

  if (step === 2) {
    return (
      <PhoneScreen bg="#fffdf5">
        <div style={{ padding: "20px" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #ef4444)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>⭐</div>
            <div style={{ fontSize: "17px", fontWeight: "800", color: "#0f0f0f" }}>Laissez votre avis</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Partagez votre expérience sur Google !</div>
          </div>
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px", padding: "12px", marginBottom: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "#92400e", fontWeight: "600" }}>
              ⭐ Votre avis aide d'autres clients à nous découvrir !
            </div>
          </div>
          <a href="https://g.page/r/demo" target="_blank" rel="noreferrer" style={{
            display: "block", width: "100%", padding: "13px", borderRadius: "14px",
            background: "#4285f4", color: "white", fontWeight: "700", fontSize: "13px",
            border: "none", cursor: "pointer", textAlign: "center", textDecoration: "none",
            marginBottom: "10px",
          }}>🌐 Laisser mon avis Google →</a>
          <button onClick={onNext} style={{
            width: "100%", padding: "13px", borderRadius: "14px",
            background: "linear-gradient(135deg, #7c3aed, #db2877)",
            color: "white", fontWeight: "700", fontSize: "13px",
            border: "none", cursor: "pointer",
          }}>✅ J'ai laissé mon avis !</button>
        </div>
      </PhoneScreen>
    );
  }

  if (step === 3) {
    return (
      <PhoneScreen bg="#f8f5ff">
        <div style={{ padding: "16px 16px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f0f0f" }}>Suivez-nous ! 🤝</div>
            <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>Pour ne rien rater de nos offres</div>
          </div>
          {[
            { name: "Instagram", icon: "📸", color: "#E1306C", handle: "@bimbambao_officiel" },
            { name: "TikTok", icon: "🎵", color: "#000", handle: "@bimbambao" },
          ].map((network) => (
            <div key={network.name} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "white", borderRadius: "12px", padding: "12px 14px",
              marginBottom: "8px", border: "1.5px solid #efefef",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>{network.icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700" }}>{network.name}</div>
                  <div style={{ fontSize: "11px", color: "#888" }}>{network.handle}</div>
                </div>
              </div>
              <div style={{
                background: network.color, color: "white",
                fontSize: "11px", fontWeight: "700",
                padding: "5px 12px", borderRadius: "100px",
              }}>Suivre</div>
            </div>
          ))}
          <button onClick={onNext} style={{
            width: "100%", marginTop: "8px", padding: "13px", borderRadius: "14px",
            background: "linear-gradient(135deg, #7c3aed, #db2877)",
            color: "white", fontWeight: "700", fontSize: "14px",
            border: "none", cursor: "pointer",
          }}>🎡 Tourner la roue !</button>
        </div>
      </PhoneScreen>
    );
  }

  if (step === 4) {
    return (
      <PhoneScreen bg="#f8f5ff">
        <div style={{ padding: "16px 16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "15px", fontWeight: "800", marginBottom: "4px" }}>Tentez votre chance !</div>
          <div style={{ fontSize: "11px", color: "#888", marginBottom: "16px" }}>Appuyez sur la roue pour jouer 🎁</div>
          <div
            onClick={() => { if (!spun) { setSpinning(true); } }}
            style={{ cursor: spun ? "default" : "pointer" }}
          >
            <WheelCanvas spinning={spinning} onDone={() => { setSpinning(false); setSpun(true); }} />
          </div>
          {spun && (
            <div style={{ marginTop: "16px", animation: "fadeUp 0.5s ease forwards" }}>
              <div style={{
                background: "linear-gradient(135deg, #7c3aed, #db2877)",
                color: "white", borderRadius: "14px", padding: "14px",
                fontWeight: "800", fontSize: "16px", marginBottom: "12px",
              }}>🎉 Café offert !</div>
              <button onClick={onNext} style={{
                width: "100%", padding: "12px", borderRadius: "14px",
                background: "#0f0f0f", color: "white",
                fontWeight: "700", fontSize: "13px", border: "none", cursor: "pointer",
              }}>Voir mon cadeau →</button>
            </div>
          )}
          {!spun && <div style={{ fontSize: "12px", color: "#aaa", marginTop: "12px" }}>Cliquez sur la roue pour jouer</div>}
        </div>
      </PhoneScreen>
    );
  }

  if (step === 5) {
    return (
      <div style={{ height: "420px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid #efefef", position: "relative" }}>
        <img src="/2.png" alt="Cliente montrant son gain au commerçant" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)",
        }} />
        <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px" }}>
          <div style={{
            background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
            borderRadius: "16px", padding: "16px 20px",
            display: "flex", alignItems: "center", gap: "14px",
          }}>
            <div style={{ fontSize: "32px" }}>☕</div>
            <div>
              <div style={{ fontWeight: "800", fontSize: "15px", color: "#0f0f0f" }}>Café offert récupéré !</div>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>Le commerçant offre le café 🎉</div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: "22px" }}>✅</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Steps Fidélité ───────────────────────────────────────────────────────────
function LoyaltyStepContent({ step, onNext }: { step: LoyaltyStep; onNext: () => void }) {
  const [email, setEmail] = useState("marie@exemple.fr");
  const [phone, setPhone] = useState("0612345678");
  const [code, setCode] = useState("");
  const [validated, setValidated] = useState(false);
  const [stamps, setStamps] = useState(0);

  if (step === 0) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "420px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid #efefef" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img src="/3A.png" alt="Client scannant le QR fidélité" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{
            position: "absolute", bottom: "16px", left: "16px",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            color: "white", fontSize: "12px", fontWeight: "600",
            padding: "6px 12px", borderRadius: "100px",
          }}>📱 Le client scanne</div>
        </div>
        <div style={{ position: "relative", overflow: "hidden", borderLeft: "2px solid white" }}>
          <img src="/3B.png" alt="Affiche carte fidélité" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{
            position: "absolute", bottom: "16px", left: "12px", right: "12px",
            background: "rgba(124,58,237,0.85)", backdropFilter: "blur(8px)",
            color: "white", fontSize: "12px", fontWeight: "600",
            padding: "6px 12px", borderRadius: "100px", textAlign: "center",
          }}>💳 L'affiche fidélité</div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <PhoneScreen bg="#faf8ff">
        <div style={{ padding: "20px" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #db2877)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>💳</div>
            <div style={{ fontSize: "17px", fontWeight: "800", color: "#0f0f0f" }}>Créer ma carte</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Chez <strong>Bimbambao</strong></div>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#555", marginBottom: "6px" }}>Email *</div>
            <input readOnly value={email} onChange={e => setEmail(e.target.value)} style={{
              width: "100%", padding: "10px 14px", borderRadius: "12px",
              border: "1.5px solid #e0d4ff", background: "white",
              fontSize: "13px", color: "#0f0f0f", boxSizing: "border-box",
            }} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#555", marginBottom: "6px" }}>Téléphone *</div>
            <input readOnly value={phone} onChange={e => setPhone(e.target.value)} style={{
              width: "100%", padding: "10px 14px", borderRadius: "12px",
              border: "1.5px solid #e0d4ff", background: "white",
              fontSize: "13px", color: "#0f0f0f", boxSizing: "border-box",
            }} />
          </div>
          <button onClick={onNext} style={{
            width: "100%", padding: "14px", borderRadius: "14px",
            background: "linear-gradient(135deg, #7c3aed, #db2877)",
            color: "white", fontWeight: "700", fontSize: "14px",
            border: "none", cursor: "pointer",
          }}>Créer ma carte 🎉</button>
        </div>
      </PhoneScreen>
    );
  }

  if (step === 2) {
    return (
      <PhoneScreen bg="#fafafa">
        <div style={{ padding: "16px" }}>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f0f0f" }}>Ma carte fidélité ✨</div>
            <div style={{ fontSize: "11px", color: "#888" }}>Chez Bimbambao</div>
          </div>
          <LoyaltyCard stamps={0} />
          <div style={{ margin: "16px 16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#aaa", marginBottom: "6px" }}>
              <span>0 repas validés</span><span>8 restants</span>
            </div>
            <div style={{ background: "#f0f0f0", borderRadius: "100px", height: "6px" }}>
              <div style={{ width: "0%", height: "6px", borderRadius: "100px", background: "linear-gradient(90deg, #7c3aed, #db2877)" }} />
            </div>
          </div>
          <div style={{ padding: "0 16px", marginTop: "16px" }}>
            <button onClick={onNext} style={{
              width: "100%", padding: "13px", borderRadius: "14px",
              background: "linear-gradient(135deg, #7c3aed, #db2877)",
              color: "white", fontWeight: "700", fontSize: "13px",
              border: "none", cursor: "pointer",
            }}>✅ Valider ma visite</button>
          </div>
        </div>
      </PhoneScreen>
    );
  }

  if (step === 3) {
    return (
      <div style={{ height: "420px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid #efefef", position: "relative" }}>
        <img src="/5.png" alt="Commerçant validant la visite" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
        }} />
        <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px" }}>
          <div style={{
            background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
            borderRadius: "16px", padding: "14px 18px",
          }}>
            <div style={{ fontWeight: "800", fontSize: "13px", color: "#0f0f0f", marginBottom: "8px" }}>🔐 Le commerçant entre le code</div>
            <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
              {["•", "•", "•", "•", "•", "•"].map((d, i) => (
                <div key={i} style={{
                  flex: 1, textAlign: "center", padding: "8px 0",
                  background: "#f3f0ff", borderRadius: "8px",
                  fontSize: "16px", color: "#7c3aed", fontWeight: "800",
                }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "#666" }}>Nombre de plats :</span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1.5px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#888" }}>−</div>
                <span style={{ fontWeight: "800", fontSize: "16px" }}>1</span>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "white" }}>+</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div style={{ height: "420px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid #efefef", position: "relative" }}>
        <img src="/4.png" alt="Carte fidélité tamponnée" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)",
        }} />
        <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px" }}>
          <div style={{
            background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
            borderRadius: "16px", padding: "14px 18px",
            display: "flex", alignItems: "center", gap: "14px",
          }}>
            <div style={{ fontSize: "28px" }}>💳</div>
            <div>
              <div style={{ fontWeight: "800", fontSize: "14px", color: "#0f0f0f" }}>1 tampon validé !</div>
              <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>Plus que 7 repas pour la récompense</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <div style={{ background: "linear-gradient(135deg, #7c3aed, #db2877)", color: "white", fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "100px" }}>1/8</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div style={{ height: "420px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid #efefef", position: "relative" }}>
        <img src="/6.png" alt="Cliente heureuse avec sa carte" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)",
        }} />
        <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px" }}>
          <div style={{
            background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
            borderRadius: "16px", padding: "16px 20px",
            display: "flex", alignItems: "center", gap: "14px",
          }}>
            <div style={{ fontSize: "28px" }}>🎉</div>
            <div>
              <div style={{ fontWeight: "800", fontSize: "14px", color: "#0f0f0f" }}>La boucle est bouclée !</div>
              <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>Elle reviendra pour compléter sa carte</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Labels des étapes ────────────────────────────────────────────────────────
const WHEEL_LABELS = ["Scan QR", "Inscription", "Avis Google", "Réseaux", "La roue", "Le gain"];
const LOYALTY_LABELS = ["Scan QR", "Inscription", "Ma carte", "Validation", "Tampon", "Fidèle !"];

// ─── Composant principal ──────────────────────────────────────────────────────
export function InteractiveDemo() {
  const [scenario, setScenario] = useState<Scenario>("wheel");
  const [wheelStep, setWheelStep] = useState<WheelStep>(0);
  const [loyaltyStep, setLoyaltyStep] = useState<LoyaltyStep>(0);

  const step = scenario === "wheel" ? wheelStep : loyaltyStep;
  const totalSteps = 6;
  const labels = scenario === "wheel" ? WHEEL_LABELS : LOYALTY_LABELS;

  const goNext = () => {
    if (scenario === "wheel" && wheelStep < 5) setWheelStep((s) => (s + 1) as WheelStep);
    if (scenario === "loyalty" && loyaltyStep < 5) setLoyaltyStep((s) => (s + 1) as LoyaltyStep);
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

  return (
    <section id="demo" style={{
      background: "linear-gradient(180deg, #0f0a1e 0%, #1a0d35 50%, #0f0a1e 100%)",
      padding: "80px 24px 100px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow BG */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "400px",
        background: "radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "880px", margin: "0 auto", position: "relative" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)",
            color: "#c4b5fd", padding: "6px 16px", borderRadius: "100px",
            fontSize: "12px", fontWeight: "600", letterSpacing: "0.06em",
            textTransform: "uppercase", marginBottom: "20px",
          }}>
            ▶ Démo interactive
          </div>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(28px, 4vw, 48px)",
            color: "white", fontWeight: "400", lineHeight: "1.15",
            marginBottom: "16px",
          }}>
            Vivez l'expérience{" "}
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Prizmo
            </span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px" }}>
            Choisissez un scénario et jouez le rôle du client
          </p>
        </div>

        {/* Sélecteur de scénario */}
        <div style={{
          display: "flex", gap: "12px", justifyContent: "center", marginBottom: "40px",
        }}>
          {[
            { key: "wheel" as Scenario, icon: "🎡", label: "Roue de la fortune" },
            { key: "loyalty" as Scenario, icon: "💳", label: "Carte fidélité" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => resetScenario(s.key)}
              style={{
                padding: "12px 24px", borderRadius: "100px",
                fontWeight: "700", fontSize: "14px", cursor: "pointer",
                border: scenario === s.key ? "2px solid #7c3aed" : "2px solid rgba(255,255,255,0.12)",
                background: scenario === s.key
                  ? "linear-gradient(135deg, #7c3aed, #db2877)"
                  : "rgba(255,255,255,0.05)",
                color: "white",
                transition: "all 0.25s",
              }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "32px" }}>
          {labels.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: i < step ? "linear-gradient(135deg, #7c3aed, #db2877)"
                    : i === step ? "white" : "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "800",
                  color: i === step ? "#7c3aed" : i < step ? "white" : "rgba(255,255,255,0.3)",
                  boxShadow: i === step ? "0 0 0 3px rgba(124,58,237,0.4)" : "none",
                  transition: "all 0.3s",
                  flexShrink: 0,
                }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <div style={{
                  fontSize: "10px", fontWeight: "600",
                  color: i === step ? "white" : "rgba(255,255,255,0.3)",
                  whiteSpace: "nowrap",
                  transition: "color 0.3s",
                }}>{label}</div>
              </div>
              {i < labels.length - 1 && (
                <div style={{
                  width: "40px", height: "2px",
                  background: i < step ? "linear-gradient(90deg, #7c3aed, #db2877)" : "rgba(255,255,255,0.1)",
                  margin: "0 4px", marginBottom: "22px",
                  transition: "all 0.3s",
                  flexShrink: 0,
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Contenu de l'étape */}
        <div style={{ position: "relative" }}>
          <div key={`${scenario}-${step}`} style={{ animation: "fadeUp 0.4s ease forwards" }}>
            {scenario === "wheel"
              ? <WheelStepContent step={wheelStep} onNext={goNext} />
              : <LoyaltyStepContent step={loyaltyStep} onNext={goNext} />
            }
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "28px",
        }}>
          <button
            onClick={goPrev}
            disabled={step === 0}
            style={{
              padding: "10px 20px", borderRadius: "100px",
              border: "1.5px solid rgba(255,255,255,0.15)",
              background: "transparent", color: step === 0 ? "rgba(255,255,255,0.2)" : "white",
              fontSize: "13px", fontWeight: "600", cursor: step === 0 ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >← Précédent</button>

          {/* Dots */}
          <div style={{ display: "flex", gap: "6px" }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{
                width: i === step ? "20px" : "6px",
                height: "6px", borderRadius: "100px",
                background: i === step ? "linear-gradient(90deg, #7c3aed, #db2877)" : "rgba(255,255,255,0.2)",
                transition: "all 0.3s",
              }} />
            ))}
          </div>

          {step < 5 ? (
            <button
              onClick={goNext}
              style={{
                padding: "10px 20px", borderRadius: "100px",
                background: "linear-gradient(135deg, #7c3aed, #db2877)",
                color: "white", fontSize: "13px", fontWeight: "700",
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
              }}
            >Suivant →</button>
          ) : (
            <button
              onClick={() => resetScenario(scenario)}
              style={{
                padding: "10px 20px", borderRadius: "100px",
                background: "linear-gradient(135deg, #7c3aed, #db2877)",
                color: "white", fontSize: "13px", fontWeight: "700",
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
              }}
            >🔄 Recommencer</button>
          )}
        </div>

        {/* CTA final */}
        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <a href="/admin/establishment/new" style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #7c3aed, #db2877)",
            color: "white", fontWeight: "700", fontSize: "15px",
            padding: "16px 36px", borderRadius: "100px",
            textDecoration: "none",
            boxShadow: "0 8px 32px rgba(124,58,237,0.45)",
          }}>
            Démarrer mon essai gratuit 21 jours →
          </a>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "12px" }}>
            Aucune carte bancaire · Configuré en 5 minutes
          </div>
        </div>
      </div>
    </section>
  );
}