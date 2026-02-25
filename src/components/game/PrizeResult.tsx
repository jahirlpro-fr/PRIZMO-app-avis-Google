import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, PartyPopper, Frown } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface PrizeResultProps {
    prize: string;
    isWinner: boolean;
    wheelNumber: 1 | 2;
    establishmentName: string;
    hasInstagramWheel: boolean;
    onContinueToInstagram?: () => void;
    onFinish?: () => void;
}

export function PrizeResult({
    prize,
    isWinner,
    establishmentName,
    onFinish,
}: PrizeResultProps) {

    useEffect(() => {
        if (isWinner) {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            function randomInRange(min: number, max: number) {
                return Math.random() * (max - min) + min;
            }

            const interval: ReturnType<typeof setInterval> = setInterval(function () {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isWinner]);

    const handleFinish = () => {
        // Ferme l'onglet si possible, sinon redirige vers l'accueil
        window.close();
        // Fallback si window.close() ne fonctionne pas (page ouverte via navigation directe)
        setTimeout(() => {
            if (onFinish) onFinish();
        }, 300);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 prizmo-gradient">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${isWinner ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-gray-400 to-gray-600'}`}>
                        {isWinner ? (
                            <PartyPopper className="w-10 h-10 text-white" />
                        ) : (
                            <Frown className="w-10 h-10 text-white" />
                        )}
                    </div>
                    <CardTitle className="text-3xl">
                        {isWinner ? "🎉 Félicitations !" : "😔 Pas de chance..."}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isWinner ? (
                        <>
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-6 text-center">
                                <Gift className="w-12 h-12 mx-auto mb-3 text-orange-600" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Vous avez gagné :</h3>
                                <p className="text-3xl font-bold text-orange-600">{prize}</p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-900 text-center font-medium">
                                    📱 Montrez cet écran à votre serveur pour récupérer votre cadeau !
                                </p>
                            </div>

                            <Button
                                onClick={handleFinish}
                                className="w-full prizmo-gradient text-white text-lg font-semibold py-6"
                            >
                                Terminer
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                                <p className="text-lg text-gray-700 mb-2">
                                    Ce n'est pas gagné cette fois...
                                </p>
                                <p className="text-sm text-gray-600">
                                    Merci d'avoir participé chez <strong>{establishmentName}</strong> !
                                </p>
                            </div>

                            <Button
                                onClick={handleFinish}
                                variant="outline"
                                className="w-full text-lg font-semibold py-6"
                            >
                                Terminer
                            </Button>
                        </>
                    )}

                    <p className="text-xs text-center text-muted-foreground">
                        Merci de votre visite ! À bientôt chez {establishmentName} 💜
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}