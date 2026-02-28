import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { EmailForm } from "@/components/game/EmailForm";
import { ReviewStep } from "@/components/game/ReviewStep";
import { InstagramStep } from "@/components/game/InstagramStep";
import { WheelOfFortune } from "@/components/game/WheelOfFortune";
import { PrizeResult } from "@/components/game/PrizeResult";
import { storageService } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { Establishment, Participant, WheelSegment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

type GameStep = "loading" | "email" | "review" | "instagram" | "wheel1" | "result1" | "loyalty-prompt" | "already-played" | "error";

export default function GamePage() {
    const router = useRouter();
    const { slug } = router.query;

    const [step, setStep] = useState < GameStep > ("loading");
    const [establishment, setEstablishment] = useState < Establishment | null > (null);
    const [segments, setSegments] = useState < WheelSegment[] > ([]);
    const [participant, setParticipant] = useState < Partial < Participant >> ({});
    const [prize1, setPrize1] = useState < string > ("");
    const [isWinner1, setIsWinner1] = useState(false);
    const [loyaltyActive, setLoyaltyActive] = useState(false);
    const [loyaltyCardColor, setLoyaltyCardColor] = useState("#e3d6c0");

    useEffect(() => {
        if (!router.isReady || !router.query.slug) return;

        const initGame = async () => {
            const slugValue = router.query.slug as string;
            if (!slugValue || slugValue === ':slug') return;

            const found = await storageService.getEstablishmentBySlug(slugValue);

            if (found) {
                setEstablishment(found);
                const establishmentSegments = await storageService.getSegments(found.id);
                setSegments(establishmentSegments);

                // Vérifie si carte fidélité active
                const { data: loyaltyData } = await supabase
                    .from("loyalty_config")
                    .select("is_active")
                    .eq("establishment_id", found.id)
                    .maybeSingle();
                if (loyaltyData?.is_active) {
                    setLoyaltyActive(true);
                    setLoyaltyCardColor(loyaltyData.card_color || "#e3d6c0");
                }
                setStep("email");
            } else {
                setStep("error");
            }
        };

        initGame();
    }, [router.isReady, router.query.slug]);

    const handleEmailSubmit = async (email: string, phone: string) => {
        if (!establishment) return;

        const existingByEmail = await storageService.getParticipantByEmail(establishment.id, email);
        const existingByPhone = await storageService.getParticipantByPhone(establishment.id, phone);

        if (existingByEmail || existingByPhone) {
            setStep("already-played");
            return;
        }

        setParticipant({
            email,
            phone,
            establishmentId: establishment.id,
            createdAt: new Date().toISOString(),
            hasSpunWheel1: false,
            hasSpunWheel2: false
        });

        setStep("review");
    };

    const handleReviewConfirmed = () => {
        // Si l'établissement a un Instagram, on affiche l'étape Instagram
        if (establishment?.instagramUrl) {
            setStep("instagram");
        } else {
            setStep("wheel1");
        }
    };

    const handleInstagramDone = () => {
        setStep("wheel1");
    };

    const handleSpin1Complete = async (prize: string) => {
        setPrize1(prize);

        const segment = segments.find(s => s.title === prize);
        const hasWon = segment?.type === "prize";
        setIsWinner1(hasWon);

        if (participant.email && establishment) {
            const newParticipant: Participant = {
                ...(participant as Participant),
                id: crypto.randomUUID(),
                hasSpunWheel1: true,
                prize1: prize
            };
            await storageService.saveParticipant(newParticipant);
            setParticipant(newParticipant);
        }

        setTimeout(() => setStep("result1"), 200);
    };

const handleFinish = () => {
        if (loyaltyActive) {
            setStep("loyalty-prompt");
        } else {
            router.push("/");
        }
    };

    // Etats de chargement et erreurs
    if (step === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center prizmo-gradient">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
        );
    }

    if (step === "error" || !establishment) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                        <CardTitle>Établissement introuvable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">Désolé, nous ne trouvons pas cet établissement.</p>
                        <Button onClick={() => router.push("/")}>Retour à l'accueil</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step === "already-played") {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <Card className="w-full max-w-md text-center shadow-xl">
                    <CardHeader>
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-orange-500" />
                        </div>
                        <CardTitle>Vous avez déjà participé !</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-6">
                            Une seule participation est autorisée par personne chez <strong>{establishment.name}</strong>.
                            Merci de votre visite et à bientôt !
                        </p>
                        <Button onClick={() => router.push("/")} variant="outline">Retour à l'accueil</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            <SEO
                title={`Jeu Concours - ${establishment.name}`}
                description="Participez à notre jeu et tentez de gagner un cadeau !"
            />

            {step === "email" && (
                <EmailForm
                    onSubmit={handleEmailSubmit}
                    establishmentName={establishment.name}
                    logoUrl={establishment.logoUrl}
                    primaryColor={establishment.primaryColor}
                    secondaryColor={establishment.secondaryColor}
                />
            )}

            {step === "review" && (
                <ReviewStep
                    googleMapsUrl={establishment.googleMapsUrl}
                    establishmentName={establishment.name}
                    onReviewConfirmed={handleReviewConfirmed}
                    hasInstagram={!!establishment.instagramUrl}
                    secondaryColor={establishment.secondaryColor}
                />
            )}

            {step === "instagram" && establishment.instagramUrl && (
                <InstagramStep
                    instagramUrl={establishment.instagramUrl}
                    establishmentName={establishment.name}
                    onFollowConfirmed={handleInstagramDone}
                    onSkip={handleInstagramDone}
                    secondaryColor={establishment.secondaryColor}
                />
            )}

            {step === "wheel1" && (
                <WheelOfFortune
                    segments={segments}
                    onSpinComplete={handleSpin1Complete}
                    wheelNumber={1}
                    establishmentName={establishment.name}
                    secondaryColor={establishment.secondaryColor}
                />
            )}

            {step === "result1" && (
                <PrizeResult
                    prize={prize1}
                    isWinner={isWinner1}
                    wheelNumber={1}
                    establishmentName={establishment.name}
                    hasInstagramWheel={false}
                    onFinish={handleFinish}
                    establishmentSlug={establishment.slug}
                    loyaltyActive={loyaltyActive}
                />
            )}
            {step === "loyalty-prompt" && (
                <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
                    style={{ background: `linear-gradient(160deg, ${establishment.secondaryColor} 0%, #ffffff 60%)` }}>

                    {/* Cards fan avec animation */}
                    <div style={{
                        position: "relative", width: "300px", height: "240px",
                        marginBottom: "36px",
                        animation: "fadeSlideUp 0.7s ease forwards",
                    }}>
                        {/* Verso derrière */}
                        <div style={{
                            width: "280px", height: "175px",
                            backgroundColor: loyaltyCardColor,
                            borderRadius: "16px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                            position: "absolute", zIndex: 1,
                            transform: "rotate(8deg) translateX(20px) translateY(10px)",
                            display: "flex", flexWrap: "wrap",
                            alignItems: "center", justifyContent: "center",
                            padding: "12px", gap: "6px",
                        }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} style={{
                                    width: "30px", height: "30px", borderRadius: "50%",
                                    border: "2px solid rgba(80,80,80,0.3)",
                                }} />
                            ))}
                            <div style={{
                                width: "30px", height: "30px", borderRadius: "50%",
                                backgroundColor: "#FFD700", border: "2px solid #FFA500",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <span style={{ fontSize: "14px" }}>🎁</span>
                            </div>
                        </div>
                        {/* Recto devant */}
                        <div style={{
                            width: "280px", height: "175px",
                            backgroundColor: loyaltyCardColor,
                            borderRadius: "16px",
                            boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                            position: "absolute", zIndex: 2,
                            transform: "rotate(-3deg) translateX(-10px)",
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center", padding: "16px",
                        }}>
                            {establishment.logoUrl ? (
                                <img src={establishment.logoUrl} alt="Logo"
                                    style={{
                                        maxHeight: "70px", maxWidth: "180px", objectFit: "contain",
                                        filter: "brightness(0)"
                                    }} />
                            ) : null}
                            {establishment.logoSecondaryUrl && (
                                <img src={establishment.logoSecondaryUrl} alt="Logo 2"
                                    style={{
                                        maxHeight: "30px", maxWidth: "130px", objectFit: "contain",
                                        marginTop: "6px", filter: "brightness(0)"
                                    }} />
                            )}
                        </div>
                    </div>

                    {/* Texte */}
                    <div className="text-center mb-8" style={{ animation: "fadeSlideUp 0.9s ease forwards" }}>
                        <h2 className="text-2xl font-black mb-2" style={{ color: "#1a1a2e" }}>
                            🎁 Revenez et soyez récompensé !
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Cumulez vos visites chez <strong>{establishment.name}</strong> et débloquez votre récompense.
                        </p>
                    </div>

                    {/* Boutons */}
                    <div className="flex flex-col gap-3 w-full max-w-sm" style={{ animation: "fadeSlideUp 1.1s ease forwards" }}>
                        <button
                            onClick={() => router.push(`/loyalty/${establishment.slug}`)}
                            className="w-full text-white font-bold py-5 text-base rounded-2xl shadow-lg"
                            style={{ background: "linear-gradient(135deg, #8b5cf6, #d946ef)" }}
                        >
                            💳 Je veux ma carte de fidélité !
                        </button>
                        <button
                            onClick={() => { window.close(); setTimeout(() => router.push("/"), 300); }}
                            className="w-full text-gray-400 text-sm py-3 rounded-2xl hover:text-gray-600 transition-colors"
                        >
                            Non merci, terminer →
                        </button>
                    </div>

                    <p className="mt-8 text-xs text-gray-300">Propulsé par Prizmo 🎡</p>

                    <style>{`
                        @keyframes fadeSlideUp {
                            from { opacity: 0; transform: translateY(24px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}