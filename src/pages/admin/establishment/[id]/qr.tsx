import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { storageService } from "@/lib/storage";
import { Establishment } from "@/types";

export default function QRCodePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [gameUrl, setGameUrl] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    
    const establishmentId = id as string;
    const found = storageService.getEstablishmentById(establishmentId);
    
    if (found) {
      setEstablishment(found);
      const url = `${window.location.origin}/game/${establishmentId}`;
      setGameUrl(url);
    }
  }, [router.isReady, id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameUrl);
    alert("URL copiée dans le presse-papier !");
  };

  if (!establishment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`QR Code - ${establishment.name}`}
        description="Générez votre QR code pour le jeu"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Button onClick={() => router.push("/admin")} variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-3xl">QR Code & Affiches</CardTitle>
                <CardDescription>
                  Téléchargez votre QR code et vos supports de communication pour {establishment.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* URL du jeu */}
                <div className="space-y-2">
                  <h3 className="font-semibold">URL de votre jeu :</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={gameUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
                    />
                    <Button onClick={copyToClipboard} variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Copier
                    </Button>
                  </div>
                </div>

                {/* QR Code Preview */}
                <div className="bg-white border-2 rounded-lg p-8 text-center">
                  <h3 className="font-semibold mb-4">Aperçu du QR Code</h3>
                  <div className="inline-block p-6 bg-white border-2 rounded-lg">
                    <div 
                      className="w-64 h-64 flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${establishment.primaryColor}, ${establishment.secondaryColor})` 
                      }}
                    >
                      <p className="text-white font-bold text-center px-4">
                        QR Code<br/>
                        {establishment.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Le QR code réel sera généré lors du téléchargement
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button className="w-full prizmo-gradient text-white" size="lg" disabled>
                    <Download className="w-5 h-5 mr-2" />
                    Télécharger le QR Code (Bientôt disponible)
                  </Button>
                  
                  <Button className="w-full" variant="outline" size="lg" disabled>
                    <Download className="w-5 h-5 mr-2" />
                    Télécharger l'affiche A4 (Bientôt disponible)
                  </Button>
                  
                  <Button className="w-full" variant="outline" size="lg" disabled>
                    <Download className="w-5 h-5 mr-2" />
                    Télécharger le chevalet de table (Bientôt disponible)
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    💡 <strong>Astuce :</strong> Pour l'instant, vous pouvez utiliser un générateur de QR code en ligne 
                    (comme qr-code-generator.com) avec l'URL ci-dessus. La génération automatique arrive bientôt !
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}