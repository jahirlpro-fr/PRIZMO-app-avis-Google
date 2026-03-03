import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, CreditCard, ArrowRight, ArrowLeft, Check, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";

interface LoyaltyConfig {
    card_name: string;
    stamps_required: number;
    prize_description: string;
    is_active: boolean;
    card_color: string;
}

interface Establishment {
    id: string;
    name: string;
    slug: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    logoSecondaryUrl?: string;
}

interface LoyaltyCard {
    id: string;
    stamp_count: number;
    reset_count: number;
    email: string;
    phone: string;
}

type PageStep = "hero" | "register" | "login" | "card" | "validate";

export default function LoyaltyPage() {
    const router = useRouter();
    const { slug } = router.query;

    const [step, setStep] = useState < PageStep > ("hero");
    const [establishment, setEstablishment] = useState < Establishment | null > (null);
    const [config, setConfig] = useState < LoyaltyConfig | null > (null);
    const [loyaltyCard, setLoyaltyCard] = useState < LoyaltyCard | null > (null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [secretCode, setSecretCode] = useState("");
    const [stampCount, setStampCount] = useState(1);
  const [validateSuccess, setValidateSuccess] = useState(false);
  const [prizeWon, setPrizeWon] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        phone: "",
    });

    useEffect(() => {
        if (!router.isReady || !slug) return;
        fetchData();
    }, [router.isReady, slug]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch establishment
            const { data: estData } = await supabase
                .from("establishments")
                .select("*")
                .eq("slug", slug)
                .single();

            if (!estData) {
                setLoading(false);
                return;
            }

            setEstablishment(estData);

            // Fetch loyalty config
            const { data: configData } = await supabase
                .from("loyalty_config")
                .select("*")
                .eq("establishment_id", estData.id)
                .maybeSingle();

            if (configData) setConfig(configData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!formData.email.trim() || !formData.phone.trim()) {
            setError("Email et téléphone requis");
            return;
        }
        if (!establishment) return;

        setSubmitting(true);
        setError("");
        try {
            // Vérifie si email existe déjà
            const { data: existingByEmail } = await supabase
                .from("loyalty_cards")
                .select("*")
                .eq("establishment_id", establishment.id)
                .eq("email", formData.email.trim().toLowerCase())
                .maybeSingle();

            if (existingByEmail) {
                setError("Vous avez déjà une carte avec cet email. Utilisez \"J'en ai déjà une !\"");
                setSubmitting(false);
                return;
            }

            // Vérifie si téléphone existe déjà
            const { data: existingByPhone } = await supabase
                .from("loyalty_cards")
                .select("*")
                .eq("establishment_id", establishment.id)
                .eq("phone", formData.phone.trim())
                .maybeSingle();

            if (existingByPhone) {
                setError("Vous avez déjà une carte avec ce numéro. Utilisez \"J'en ai déjà une !\"");
                setSubmitting(false);
                return;
            }

            // Crée nouvelle carte
            const { data: newCard, error: insertError } = await supabase
                .from("loyalty_cards")
                .insert({
                    establishment_id: establishment.id,
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone.trim(),
                    stamp_count: 0,
                    reset_count: 0,
                })
                .select()
                .single();

            if (insertError) throw insertError;
            setLoyaltyCard(newCard);
            setStep("card");
        } catch (err: any) {
            setError(err.message || "Erreur lors de la création");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogin = async () => {
        if (!formData.email.trim() || !formData.phone.trim()) {
            setError("Email et téléphone requis");
            return;
        }
        if (!establishment) return;

        setSubmitting(true);
        setError("");
        try {
            const { data: card } = await supabase
                .from("loyalty_cards")
                .select("*")
                .eq("establishment_id", establishment.id)
                .eq("email", formData.email.trim().toLowerCase())
                .eq("phone", formData.phone.trim())
                .maybeSingle();

            if (!card) {
                setError("Aucune carte trouvée avec ces informations");
                return;
            }
            setLoyaltyCard(card);
            setStep("card");
        } catch (err: any) {
            setError(err.message || "Erreur");
        } finally {
            setSubmitting(false);
        }
    };

    const handleValidateStamp = async () => {
        if (!config || !loyaltyCard || !establishment) return;
        if (secretCode !== config.secret_code) {
            setError("Code incorrect !");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            const newStampCount = loyaltyCard.stamp_count + stampCount;

          if (newStampCount >= config.stamps_required) {
            // Prize atteint → reset
            await supabase
              .from("loyalty_cards")
              .update({
                stamp_count: 0,
                reset_count: loyaltyCard.reset_count + 1,
                last_stamp_at: new Date().toISOString(),
              })
              .eq("id", loyaltyCard.id);

            setLoyaltyCard({
              ...loyaltyCard,
              stamp_count: 0,
              reset_count: loyaltyCard.reset_count + 1,
            });
            setValidateSuccess(false);
            setPrizeWon(true);
            return;
          } else {
                await supabase
                    .from("loyalty_cards")
                    .update({
                        stamp_count: newStampCount,
                        last_stamp_at: new Date().toISOString(),
                    })
                    .eq("id", loyaltyCard.id);

                setLoyaltyCard({ ...loyaltyCard, stamp_count: newStampCount });
            }

            setValidateSuccess(true);
            setSecretCode("");
            setStampCount(1);
            setTimeout(() => {
                setValidateSuccess(false);
                setStep("card");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Erreur");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!establishment || !config || !config.is_active) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-center p-8">
                    <CreditCard className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Carte fidélité non disponible</p>
                </div>
            </div>
        );
    }

    const bgColor = (establishment as any).secondary_color || establishment.secondaryColor || "#f3f0ff";
    const cardColor = config?.card_color || bgColor;
    const primaryColor = (establishment as any).primary_color || establishment.primaryColor || "#8b5cf6";
    const logoUrl = (establishment as any).logo_url || establishment.logoUrl;
    const logoSecondaryUrl = (establishment as any).logo_secondary_url || establishment.logoSecondaryUrl;

    // Composant carte recto
    const CardRecto = ({ rotate = 0, scale = 1, zIndex = 1, translateX = 0, translateY = 0 }) => (
        <div style={{
            width: "300px",
            height: "190px",
            backgroundColor: cardColor,
            borderRadius: "16px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            transform: `rotate(${rotate}deg) scale(${scale}) translateX(${translateX}px) translateY(${translateY}px)`,
            position: "absolute",
            zIndex,
            transition: "all 0.3s ease",
        }}>
            {logoUrl ? (
                <img src={logoUrl} alt="Logo"
                    style={{
                        maxHeight: "80px", maxWidth: "200px", objectFit: "contain",
                        filter: primaryColor === "#ffffff" ? "brightness(0) invert(1)" : "brightness(0)"
                    }} />
            ) : (
                <CreditCard className="w-12 h-12 text-white/40" />
            )}
            {logoSecondaryUrl && (
                <img src={logoSecondaryUrl} alt="Logo 2"
                    style={{
                        maxHeight: "35px", maxWidth: "140px", objectFit: "contain", marginTop: "8px",
                        filter: primaryColor === "#ffffff" ? "brightness(0) invert(1)" : "brightness(0)"
                    }} />
            )}
        </div>
    );

    // Composant carte verso
    const CardVerso = ({ rotate = 0, scale = 1, zIndex = 1, translateX = 0, translateY = 0 }) => {
        const stampsRequired = config.stamps_required;
        const currentStamps = loyaltyCard?.stamp_count || 0;
        return (
            <div style={{
                width: "300px",
                minHeight: "190px",
                backgroundColor: cardColor,
                borderRadius: "16px",
                boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                transform: `rotate(${rotate}deg) scale(${scale}) translateX(${translateX}px) translateY(${translateY}px)`,
                position: "absolute",
                zIndex,
            }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "7px", maxWidth: "270px" }}>
                    {Array.from({ length: stampsRequired }).map((_, i) => {
                        const isPrize = i === stampsRequired - 1;
                        const isValidated = i < currentStamps;
                        if (isPrize) {
                            return (
                                <div key={i} style={{
                                    width: "36px", height: "36px", borderRadius: "50%",
                                    backgroundColor: isValidated ? "#FFD700" : "#FFD70044",
                                    border: "2px solid #FFA500",
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                }}>
                                    <Gift className="w-4 h-4 text-white" />
                                </div>
                            );
                        }
                        return (
                            <div key={i} style={{
                                width: "36px", height: "36px", borderRadius: "50%",
                                border: "2px solid rgba(80,80,80,0.4)",
                                backgroundColor: isValidated ? "rgba(139,92,246,0.15)" : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                            }}>
                                {isValidated && (
                                    <Check className="w-4 h-4" style={{ color: "#8b5cf6" }} />
                                )}
                            </div>
                        );
                    })}
                </div>
                {config.prize_description && (
                    <p style={{ marginTop: "10px", fontSize: "10px", color: "rgba(0,0,0,0.5)", fontWeight: "600", textAlign: "center" }}>
                        {stampsRequired} plats achetés = 🎁 {config.prize_description}
                    </p>
                )}
            </div>
        );
    };

    return (
        <>
            <SEO title={`Carte Fidélité — ${establishment.name}`} description="Votre carte de fidélité digitale" />

            <div className="min-h-screen" style={{ background: `linear-gradient(160deg, ${bgColor} 0%, #ffffff 60%)` }}>

                {/* ── HERO ── */}
                {step === "hero" && (
                    <div className="flex flex-col items-center min-h-screen px-6 py-12">

                        {/* Cards fan */}
                        <div style={{ position: "relative", width: "300px", height: "260px", marginBottom: "40px" }}>
                            {/* Verso derrière — incliné */}
                            <CardVerso rotate={8} scale={0.92} zIndex={1} translateX={20} translateY={10} />
                            {/* Recto devant — droit */}
                            <CardRecto rotate={-3} scale={1} zIndex={2} translateX={-10} translateY={0} />
                        </div>

                        {/* Accroche */}
                        <div className="text-center mb-8 max-w-sm">
                            <h1 className="text-3xl font-black mb-3" style={{ color: "#1a1a2e" }}>
                                Fidélité récompensée 🎁
                            </h1>
                            <p className="text-gray-500 text-base leading-relaxed">
                                Chaque repas compte ! Cumulez vos visites et débloquez{" "}
                                <span className="font-bold" style={{ color: primaryColor }}>
                                    {config.prize_description || "votre récompense"}
                                </span>
                                {" "}après {config.stamps_required} repas.
                            </p>
                        </div>

                        {/* Boutons */}
                        <div className="flex flex-col gap-3 w-full max-w-sm">
                            <Button
                                onClick={() => { setStep("register"); setError(""); setFormData({ email: "", phone: "" }); }}
                                className="w-full text-white font-bold py-6 text-base rounded-2xl shadow-lg"
                                style={{ background: `linear-gradient(135deg, #8b5cf6, #d946ef)` }}
                            >
                                <CreditCard className="w-5 h-5 mr-2" />
                                Je veux ma carte fidélité !
                            </Button>
                            <Button
                                onClick={() => { setStep("login"); setError(""); setFormData({ email: "", phone: "" }); }}
                                variant="outline"
                                className="w-full font-semibold py-6 text-base rounded-2xl border-2"
                                style={{ borderColor: primaryColor, color: primaryColor }}
                            >
                                J'en ai déjà une !
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>

                        {/* Branding Prizmo */}
                        <p className="mt-10 text-xs text-gray-300 font-medium">Propulsé par Prizmo 🎡</p>
                    </div>
                )}

                {/* ── INSCRIPTION ── */}
                {step === "register" && (
                    <div className="flex flex-col items-center min-h-screen px-6 py-12">
                        <button onClick={() => setStep("hero")} className="self-start flex items-center gap-1 text-gray-400 mb-8 hover:text-gray-600">
                            <ArrowLeft className="w-4 h-4" /> Retour
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                style={{ background: `linear-gradient(135deg, #8b5cf6, #d946ef)` }}>
                                <CreditCard className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-black mb-2">Créer ma carte</h2>
                            <p className="text-gray-500 text-sm">Chez <strong>{establishment.name}</strong></p>
                        </div>

                        <div className="w-full max-w-sm space-y-4">
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input type="email" placeholder="votre@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label>Téléphone *</Label>
                                <Input type="tel" placeholder="06 00 00 00 00"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="h-12 rounded-xl" />
                            </div>

                            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                            <Button onClick={handleRegister} disabled={submitting}
                                className="w-full text-white font-bold py-6 text-base rounded-2xl"
                                style={{ background: `linear-gradient(135deg, #8b5cf6, #d946ef)` }}>
                                {submitting ? "Création..." : "Créer ma carte 🎉"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── CONNEXION ── */}
                {step === "login" && (
                    <div className="flex flex-col items-center min-h-screen px-6 py-12">
                        <button onClick={() => setStep("hero")} className="self-start flex items-center gap-1 text-gray-400 mb-8 hover:text-gray-600">
                            <ArrowLeft className="w-4 h-4" /> Retour
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                style={{ background: `linear-gradient(135deg, #8b5cf6, #d946ef)` }}>
                                <CreditCard className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-black mb-2">Ma carte fidélité</h2>
                            <p className="text-gray-500 text-sm">Chez <strong>{establishment.name}</strong></p>
                        </div>

                        <div className="w-full max-w-sm space-y-4">
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input type="email" placeholder="votre@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label>Téléphone *</Label>
                                <Input type="tel" placeholder="06 00 00 00 00"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="h-12 rounded-xl" />
                            </div>

                            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                            <Button onClick={handleLogin} disabled={submitting}
                                className="w-full text-white font-bold py-6 text-base rounded-2xl"
                                style={{ background: `linear-gradient(135deg, #8b5cf6, #d946ef)` }}>
                                {submitting ? "Recherche..." : "Accéder à ma carte →"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── CARTE ── */}
                {step === "card" && loyaltyCard && (
                    <div className="flex flex-col items-center min-h-screen px-6 py-12">
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-400 mb-1">Chez <strong>{establishment.name}</strong></p>
                            <h2 className="text-2xl font-black">Ma carte fidélité</h2>
                            {loyaltyCard.reset_count > 0 && (
                                <p className="text-xs text-purple-600 font-semibold mt-1">
                                    🏆 {loyaltyCard.reset_count} prize{loyaltyCard.reset_count > 1 ? "s" : ""} déjà obtenu{loyaltyCard.reset_count > 1 ? "s" : ""}
                                </p>
                            )}
                        </div>

                        {/* Carte verso avec vrais stamps */}
                        <div style={{ position: "relative", width: "300px", height: "220px", marginBottom: "32px" }}>
                            <CardVerso rotate={0} scale={1} zIndex={1} translateX={0} translateY={0} />
                        </div>

                        {/* Progression */}
                        <div className="w-full max-w-sm mb-6">
                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                                <span>{loyaltyCard.stamp_count} repas validés</span>
                                <span>{config.stamps_required - loyaltyCard.stamp_count} restants</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="h-2 rounded-full transition-all"
                                    style={{
                                        width: `${Math.min((loyaltyCard.stamp_count / config.stamps_required) * 100, 100)}%`,
                                        background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
                                    }} />
                            </div>
                        </div>

                        {/* Bouton valider */}
                        <div className="w-full max-w-sm space-y-3">
                            <Button
                                onClick={() => { setStep("validate"); setError(""); setSecretCode(""); setStampCount(1); }}
                                className="w-full text-white font-bold py-6 text-base rounded-2xl shadow-lg"
                                style={{ background: `linear-gradient(135deg, #8b5cf6, #d946ef)` }}
                            >
                                ✅ Valider ma visite
                            </Button>
                            <Button variant="ghost" onClick={() => setStep("hero")}
                                className="w-full text-gray-400 text-sm">
                                Retour à l'accueil
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── VALIDATION ── */}
                {step === "validate" && (
                    <div className="flex flex-col items-center min-h-screen px-6 py-12">
                        <button onClick={() => setStep("card")} className="self-start flex items-center gap-1 text-gray-400 mb-8 hover:text-gray-600">
                            <ArrowLeft className="w-4 h-4" /> Retour
                        </button>

                        {validateSuccess ? (
                            <div className="flex flex-col items-center justify-center flex-1 gap-4">
                                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                    <Check className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-black text-green-600">Validé !</h2>
                                <p className="text-gray-500">Votre visite a été enregistrée 🎉</p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-purple-100">
                                        <span className="text-3xl">🔐</span>
                                    </div>
                                    <h2 className="text-2xl font-black mb-2">Valider ma visite</h2>
                                    <p className="text-gray-500 text-sm">Demandez le code secret au commerçant et donnez-lui votre téléphone</p>
                                </div>

                                <div className="w-full max-w-sm space-y-5">
                                    <div className="space-y-2">
                                        <Label>Code secret *</Label>
                                        <Input
                                            type="password"
                                            placeholder="••••••"
                                            value={secretCode}
                                            onChange={(e) => setSecretCode(e.target.value)}
                                            className="h-12 rounded-xl text-center text-xl tracking-widest"
                                            maxLength={10}
                                        />
                                    </div>

                                    {/* Nombre de plats */}
                                    <div className="space-y-2">
                                        <Label>Nombre de plats à valider</Label>
                                        <div className="flex items-center gap-4 justify-center">
                                            <button
                                                onClick={() => setStampCount(Math.max(1, stampCount - 1))}
                                                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-bold hover:border-purple-400 transition-colors"
                                            >−</button>
                                            <span className="text-2xl font-black w-8 text-center">{stampCount}</span>
                                            <button
                                                onClick={() => setStampCount(Math.min(config.stamps_required, stampCount + 1))}
                                                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-bold hover:border-purple-400 transition-colors"
                                            >+</button>
                                        </div>
                                    </div>

                                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                                    <Button onClick={handleValidateStamp} disabled={submitting || !secretCode}
                                        className="w-full text-white font-bold py-6 text-base rounded-2xl"
                                        style={{ background: `linear-gradient(135deg, #8b5cf6, #d946ef)` }}>
                                        {submitting ? "Validation..." : `Valider ${stampCount} plat${stampCount > 1 ? "s" : ""} ✅`}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}