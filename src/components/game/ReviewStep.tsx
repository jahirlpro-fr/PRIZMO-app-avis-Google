import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ExternalLink, CheckCircle2 } from "lucide-react";

interface ReviewStepProps {
  googleMapsUrl: string;
  establishmentName: string;
  onReviewConfirmed: () => void;
}

export function ReviewStep({ googleMapsUrl, establishmentName, onReviewConfirmed }: ReviewStepProps) {
  const handleOpenReview = () => {
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 prizmo-gradient">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-white fill-white" />
          </div>
          <CardTitle className="text-3xl">Laissez votre avis</CardTitle>
          <CardDescription className="text-base">
            Partagez votre expérience chez {establishmentName} sur Google pour accéder à la roue de la fortune !
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-900 font-medium">
              ⭐ Votre avis nous aide à nous améliorer et aide d'autres clients à nous découvrir !
            </p>
          </div>

          <Button
            onClick={handleOpenReview}
            className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white text-xl font-bold py-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <ExternalLink className="w-6 h-6 mr-2" />
            ⭐ Laisser un avis Google
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
            onClick={onReviewConfirmed}
            variant="outline"
            className="w-full border-3 border-green-600 text-green-700 hover:bg-green-50 hover:border-green-700 text-xl font-bold py-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <CheckCircle2 className="w-6 h-6 mr-2" />
            ✅ J'ai laissé mon avis
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Cliquez sur "J'ai laissé mon avis" une fois votre commentaire publié sur Google.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}