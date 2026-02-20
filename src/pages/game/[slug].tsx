import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { EmailForm } from "@/components/game/EmailForm";
import { ReviewStep } from "@/components/game/ReviewStep";
import { WheelOfFortune } from "@/components/game/WheelOfFortune";
import { PrizeResult } from "@/components/game/PrizeResult";
import { storageService } from "@/lib/storage";
import { Establishment, Participant, WheelSegment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

type GameStep = "loading" | "email" | "review" | "wheel1" | "result1" | "instagram" | "wheel2" | "result2" | "already-played" | "error";

export default function GamePage() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [step, setStep] = useState<GameStep>("loading");
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [segments, setSegments] = useState<WheelSegment[]>([]);
  const [participant, setParticipant] = useState<Partial<Participant>>({});
  const [prize1, setPrize1] = useState<string>("");
  const [prize2, setPrize2] = useState<string>("");
  const [isWinner1, setIsWinner1] = useState(false);
  const [isWinner2, setIsWinner2] = useState(false);

  // Initialiser les données et charger l'établissement
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
      setStep("email");
    } else {
      setStep("error");
    }
  };

  initGame();
}, [router.isReady, router.query.slug]);

  const handleEmailSubmit = async (email: string, phone: string) => {
    if (!establishment) return;

    // Vérification anti-abus
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
    setStep("wheel1");
  };

  const handleSpin1Complete = async (prize: string) => {
    setPrize1(prize);
    
    // Vérifier si c'est un lot gagnant (basé sur le type de segment)
    const segment = segments.find(s => s.title === prize);
    const hasWon = segment?.type === "prize";
    setIsWinner1(hasWon);

    // Sauvegarder la participation partielle
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

    setStep("result1");
  };

  const handleContinueToInstagram = () => {
    if (establishment?.instagramUrl) {
      window.open(establishment.instagramUrl, "_blank");
      setStep("wheel2");
    }
  };

  const handleSpin2Complete = async (prize: string) => {
    setPrize2(prize);
    
    // Pour la 2ème roue, on utilise les mêmes segments pour l'instant
    // Idéalement, on aurait des segments spécifiques "Bonus"
    const segment = segments.find(s => s.title === prize);
    const hasWon = segment?.type === "prize";
    setIsWinner2(hasWon);

    // Mettre à jour la participation
    if (participant.id) {
      const updatedParticipant: Participant = {
        ...(participant as Participant),
        hasSpunWheel2: true,
        prize2: prize
      };
      await storageService.saveParticipant(updatedParticipant);
      setParticipant(updatedParticipant);
    }

    setStep("result2");
  };

  const handleFinish = () => {
    // Recharger la page ou rediriger vers l'accueil
    router.push("/");
  };

  // Rendu des différentes étapes
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
        />
      )}

      {step === "review" && (
        <ReviewStep
          googleMapsUrl={establishment.googleMapsUrl}
          establishmentName={establishment.name}
          onReviewConfirmed={handleReviewConfirmed}
        />
      )}

      {step === "wheel1" && (
        <WheelOfFortune
          segments={segments}
          onSpinComplete={handleSpin1Complete}
          wheelNumber={1}
          establishmentName={establishment.name}
        />
      )}

      {step === "result1" && (
        <PrizeResult
          prize={prize1}
          isWinner={isWinner1}
          wheelNumber={1}
          establishmentName={establishment.name}
          hasInstagramWheel={establishment.enableInstagramWheel}
          onContinueToInstagram={handleContinueToInstagram}
          onFinish={handleFinish}
        />
      )}

      {step === "wheel2" && (
        <WheelOfFortune
          segments={segments} // On pourrait utiliser des segments différents ici
          onSpinComplete={handleSpin2Complete}
          wheelNumber={2}
          establishmentName={establishment.name}
        />
      )}

      {step === "result2" && (
        <PrizeResult
          prize={prize2}
          isWinner={isWinner2}
          wheelNumber={2}
          establishmentName={establishment.name}
          hasInstagramWheel={false} // Pas de 3ème roue
          onFinish={handleFinish}
        />
      )}
    </>
  );
}