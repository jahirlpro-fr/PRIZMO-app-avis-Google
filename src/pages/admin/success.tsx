import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push("/admin");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="text-center max-w-md mx-auto px-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="text-3xl font-black mb-3 text-gray-900">
                    Paiement réussi ! 🎉
                </h1>
                <p className="text-gray-500 mb-8">
                    Votre abonnement Prizmo est maintenant actif. Bienvenue dans l'aventure !
                </p>
                <p className="text-sm text-gray-400 mb-4">
                    Redirection automatique dans {countdown}s...
                </p>
                <Button
                    onClick={() => router.push("/admin")}
                    className="prizmo-gradient text-white px-8 py-3 rounded-full font-bold"
                >
                    Accéder à mon dashboard →
                </Button>
            </div>
        </div>
    );
}
