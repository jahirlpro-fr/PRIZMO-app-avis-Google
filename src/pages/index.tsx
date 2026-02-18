import { SEO } from "@/components/SEO";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Gift, TrendingUp, Users } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <SEO
        title="Prizmo - Boostez vos avis Google avec une roue de la fortune"
        description="Transformez vos clients en ambassadeurs ! Prizmo gamifie la collecte d'avis Google pour votre restaurant."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-block">
              <h1 className="text-6xl md:text-7xl font-bold prizmo-text-gradient mb-4">
                Prizmo
              </h1>
              <p className="text-xl md:text-2xl text-gray-600">
                La roue de la fortune qui transforme vos clients en ambassadeurs
              </p>
            </div>

            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Boostez vos avis Google de manière ludique ! Vos clients scannent un QR code, 
              laissent un avis, tournent la roue et gagnent un cadeau. Simple, efficace, mémorable.
            </p>

<div className="flex gap-4 justify-center flex-wrap">
  <Button 
    size="lg" 
    className="prizmo-gradient text-white text-lg px-8 py-6"
    onClick={() => router.push("/admin")}
  >
    <Sparkles className="w-5 h-5 mr-2" />
    Accès administrateur
  </Button>
</div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Boostez vos avis Google</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Incitez vos clients à laisser un avis en les récompensant avec un jeu ludique. 
                  Plus d'avis = meilleur référencement local.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Fidélisez vos clients</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Les clients reviennent pour récupérer leur cadeau et découvrir vos nouveautés. 
                  Une expérience mémorable qui crée du lien.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Collectez des données</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Constituez votre base de contacts (email + téléphone) pour vos futures 
                  campagnes marketing et newsletters.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section className="container mx-auto px-4 py-16 bg-white/50 backdrop-blur-sm rounded-3xl my-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold">Comment ça marche ?</h2>
            
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-semibold">Configuration</h3>
                <p className="text-gray-600">
                  Personnalisez votre roue, vos lots et téléchargez vos affiches avec QR code.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-semibold">Le client joue</h3>
                <p className="text-gray-600">
                  Vos clients scannent le QR, laissent un avis Google et tournent la roue.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-semibold">Récompense</h3>
                <p className="text-gray-600">
                  Le client gagne un cadeau qu'il peut récupérer immédiatement ou plus tard.
                </p>
              </div>
            </div>
          </div>
        </section>



        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-gray-600 border-t">
          <p>© {new Date().getFullYear()} Prizmo - Tous droits réservés</p>
        </footer>
      </div>
    </>
  );
}