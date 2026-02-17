import { SEO } from "@/components/SEO";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, CheckCircle2, FileText, Printer } from "lucide-react";
import { storageService } from "@/lib/storage";
import { Establishment } from "@/types";
import QRCode from "qrcode";
import { generatePoster } from "@/lib/pdfGenerator";

export default function QRCodePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [gameUrl, setGameUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!router.isReady) return;
    
    const establishmentId = id as string;
    const found = storageService.getEstablishmentById(establishmentId);
    
    if (found) {
      setEstablishment(found);
      const url = `${window.location.origin}/game/${found.slug}`;
      setGameUrl(url);
    }
  }, [router.isReady, id]);

  useEffect(() => {
    if (!gameUrl || !establishment) return;

    // Generate QR Code with custom colors
    QRCode.toCanvas(
      canvasRef.current,
      gameUrl,
      {
        width: 400,
        margin: 2,
        color: {
          dark: establishment.primaryColor,
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      },
      (error) => {
        if (error) console.error(error);
      }
    );

    // Generate data URL for download
    QRCode.toDataURL(
      gameUrl,
      {
        width: 1000,
        margin: 2,
        color: {
          dark: establishment.primaryColor,
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      },
      (error, url) => {
        if (error) {
          console.error(error);
          return;
        }
        setQrCodeUrl(url);
      }
    );
  }, [gameUrl, establishment]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl || !establishment) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qrcode-${establishment.slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePDF = async (format: "A4" | "A5" | "sticker") => {
    if (!establishment || !qrCodeUrl) return;

    try {
      await generatePoster({
        establishmentName: establishment.name,
        qrCodeDataUrl: qrCodeUrl,
        primaryColor: establishment.primaryColor,
        secondaryColor: establishment.secondaryColor,
        format: format
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Erreur lors de la génération du PDF");
    }
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
            <Button onClick={() => router.push(`/admin/establishment/${establishment.id}`)} variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'établissement
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                QR Code & Distribution
              </h1>
              <p className="text-muted-foreground text-lg">
                Téléchargez votre QR code et partagez votre jeu facilement
              </p>
            </div>

            {/* URL Card */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  URL de votre jeu
                </CardTitle>
                <CardDescription>
                  Partagez cette URL directement ou utilisez le QR code ci-dessous
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gameUrl}
                    readOnly
                    className="flex-1 px-4 py-3 border-2 rounded-lg bg-gray-50 text-sm font-mono"
                  />
                  <Button 
                    onClick={copyToClipboard} 
                    variant={copied ? "default" : "outline"}
                    className={copied ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-2" />
                        Copier
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Card */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📱 Votre QR Code personnalisé
                </CardTitle>
                <CardDescription>
                  QR code haute résolution aux couleurs de votre établissement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Code Preview */}
                <div className="bg-white border-2 rounded-lg p-8 text-center">
                  <div className="inline-block p-6 bg-white border-2 rounded-lg shadow-xl">
                    <canvas 
                      ref={canvasRef}
                      className="mx-auto"
                    />
                  </div>
                  <div className="mt-6 space-y-2">
                    <p className="font-semibold text-lg">{establishment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Scannez pour jouer et gagner un cadeau !
                    </p>
                  </div>
                </div>

                {/* Download Button */}
                <Button 
                  className="w-full prizmo-gradient text-white text-lg py-6"
                  size="lg"
                  onClick={downloadQRCode}
                  disabled={!qrCodeUrl}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Télécharger le QR Code (PNG haute résolution)
                </Button>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Comment utiliser votre QR code ?</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Imprimez le QR code sur des supports (affiches A4, chevalets de table, stickers)</li>
                    <li>Placez-le à des endroits stratégiques (caisse, tables, vitrine)</li>
                    <li>Encouragez vos clients à scanner après leur expérience</li>
                    <li>Le QR code redirige directement vers votre page de jeu personnalisée</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Supports Ideas Card */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>🎨 Idées de supports</CardTitle>
                <CardDescription>
                  Où placer votre QR code pour maximiser la participation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold mb-2">📄 Affiche A4</h4>
                    <p className="text-sm text-muted-foreground">
                      À placer en vitrine, près de la caisse ou dans la salle
                    </p>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <h4 className="font-semibold mb-2">🏷️ Chevalet de table</h4>
                    <p className="text-sm text-muted-foreground">
                      Sur chaque table pour une visibilité maximale
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold mb-2">🎟️ Sticker</h4>
                    <p className="text-sm text-muted-foreground">
                      Sur les menus, les notes ou les emballages
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold mb-2">📱 Réseaux sociaux</h4>
                    <p className="text-sm text-muted-foreground">
                      Partagez l'URL ou le QR code sur Instagram/Facebook
                    </p>
                  </div>
                </div>

                {/* PDF Posters Section */}
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Printer className="w-5 h-5 text-purple-600" />
                      Affiches PDF prêtes à imprimer
                    </CardTitle>
                    <CardDescription>
                      Téléchargez des affiches professionnelles avec votre QR code intégré
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* A4 Poster */}
                      <Card className="hover:shadow-lg transition-shadow border-purple-200">
                        <CardContent className="pt-6">
                          <div className="text-center space-y-3">
                            <div className="text-4xl">📄</div>
                            <h3 className="font-bold text-lg">Affiche A4</h3>
                            <p className="text-sm text-muted-foreground">
                              Format mural (210 × 297 mm)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Parfait pour vitrine, mur, ou entrée du restaurant
                            </p>
                            <Button
                              onClick={() => handleGeneratePDF("A4")}
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Télécharger A4
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* A5 Table Tent */}
                      <Card className="hover:shadow-lg transition-shadow border-pink-200">
                        <CardContent className="pt-6">
                          <div className="text-center space-y-3">
                            <div className="text-4xl">🏷️</div>
                            <h3 className="font-bold text-lg">Chevalet A5</h3>
                            <p className="text-sm text-muted-foreground">
                              Format table (148 × 210 mm)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Idéal pour les tables, comptoir, ou caisse
                            </p>
                            <Button
                              onClick={() => handleGeneratePDF("A5")}
                              className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Télécharger A5
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Sticker */}
                      <Card className="hover:shadow-lg transition-shadow border-orange-200">
                        <CardContent className="pt-6">
                          <div className="text-center space-y-3">
                            <div className="text-4xl">🎟️</div>
                            <h3 className="font-bold text-lg">Sticker</h3>
                            <p className="text-sm text-muted-foreground">
                              Format compact (100 × 100 mm)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Pour portes, fenêtres, ou support mobile
                            </p>
                            <Button
                              onClick={() => handleGeneratePDF("sticker")}
                              className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Télécharger Sticker
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Printing Tips */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="flex gap-3">
                          <Printer className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                          <div className="space-y-2">
                            <h4 className="font-semibold text-blue-900">Conseils d'impression</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Utilisez du papier blanc épais (200-300g) pour une meilleure qualité</li>
                              <li>• Imprimez en couleur pour un rendu optimal</li>
                              <li>• Pour les stickers, utilisez du papier autocollant</li>
                              <li>• Plastifiez l'affiche A4 pour une utilisation en extérieur</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}