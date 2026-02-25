import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, ExternalLink, CheckCircle2 } from "lucide-react";

interface InstagramStepProps {
    instagramUrl: string;
    establishmentName: string;
    onFollowConfirmed: () => void;
    onSkip: () => void;
    secondaryColor?: string;
}

export function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
    const steps = [
        { id: 1, label: "Avis Google" },
        { id: 2, label: "Instagram" },
        { id: 3, label: "Jeu" },
    ];

    return (
        <div className="flex items-center justify-center gap-0 mb-6 px-4">
            {steps.map((s, index) => (
                <div key={s.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step > s.id
                                ? "bg-green-500 text-white"
                                : step === s.id
                                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                                    : "bg-white opacity-50 text-gray-400"
                            }`}>
                            {step > s.id ? "✓" : s.id}
                        </div>
                        <span className={`text-xs mt-1 font-medium ${step >= s.id ? "text-white" : "text-white opacity-60"
                            }`}>
                            {s.label}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`w-12 h-1 mb-4 mx-1 rounded transition-all duration-300 ${step > s.id ? "bg-green-400" : "bg-white opacity-30"
                            }`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export function InstagramStep({ instagramUrl, establishmentName, onFollowConfirmed, onSkip, secondaryColor = "#ffffff" }: InstagramStepProps) {
    const handleOpenInstagram = () => {
        window.open(instagramUrl, "_blank");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 prizmo-gradient">
            <ProgressBar step={2} />
            <Card className="w-full max-w-md shadow-2xl" style={{ backgroundColor: secondaryColor }}>
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center mb-4">
                        <Instagram className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl">Augmentez vos chances !</CardTitle>
                    <CardDescription className="text-base">
                        Abonnez-vous à la page Instagram de {establishmentName} pour maximiser vos gains 🎁
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-purple-900 font-medium">
                            📸 Rejoignez notre communauté et ne manquez aucune offre exclusive !
                        </p>
                    </div>

                    <Button
                        onClick={handleOpenInstagram}
                        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 text-white text-xl font-bold py-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                        <ExternalLink className="w-6 h-6 mr-2" />
                        <Instagram className="w-6 h-6 mr-2" />
                        S'abonner sur Instagram
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Puis revenez ici</span>
                        </div>
                    </div>

                    <Button
                        onClick={onFollowConfirmed}
                        variant="outline"
                        className="w-full border-3 border-green-600 text-green-700 hover:bg-green-50 hover:border-green-700 text-xl font-bold py-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <CheckCircle2 className="w-6 h-6 mr-2" />
                        ✅ Je suis abonné(e) !
                    </Button>

                    <div className="text-center">
                        <button
                            onClick={onSkip}
                            className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors"
                        >
                            Passer cette étape
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}