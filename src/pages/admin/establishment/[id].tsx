import { SEO } from "@/components/SEO";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Trash2, Plus, Eye, Users, Star, TrendingUp, Gift, Download, Search, Filter, Calendar, QrCode, LogOut, Upload, ImageIcon, Settings, Printer } from "lucide-react";
import { storageService } from "@/lib/storage";
import { Establishment, WheelSegment, Participant } from "@/types";
import { WheelPreview } from "@/components/admin/WheelPreview";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
// Fix import - importing generatePoster instead if generateQRCodePDF doesn't exist, or check pdfGenerator.ts
import { generatePoster } from "@/lib/pdfGenerator"; 
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";

export default function EditEstablishmentPage() {
  const router = useRouter();
  const { id } = router.query;
  const { signOut } = useAuth();
  
  const posterRef = useRef<HTMLDivElement>(null);
  const [posterFormat, setPosterFormat] = useState<"A4" | "A5">("A4");

  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [segments, setSegments] = useState<WheelSegment[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPrize, setFilterPrize] = useState<string>("all");
  const [analyticsPeriod, setAnalyticsPeriod] = useState<7 | 30 | 90 | 365>(30);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    googleMapsUrl: "",
    instagramUrl: "",
    primaryColor: "#8b5cf6",
    secondaryColor: "#d946ef",
    enableInstagramWheel: false,
  });
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingPrimaryLogo, setUploadingPrimaryLogo] = useState(false);
  const [uploadingSecondaryLogo, setUploadingSecondaryLogo] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    
    const fetchData = async () => {
      const establishmentId = id as string;
      const found = await storageService.getEstablishmentById(establishmentId);
      
      if (found) {
        setEstablishment(found);
        setFormData({
          name: found.name,
          address: found.address,
          googleMapsUrl: found.googleMapsUrl,
          instagramUrl: found.instagramUrl || "",
          primaryColor: found.primaryColor,
          secondaryColor: found.secondaryColor,
          enableInstagramWheel: found.enableInstagramWheel,
        });
        
        const establishmentSegments = await storageService.getSegments(establishmentId);
        setSegments(establishmentSegments);
        
        const establishmentParticipants = await storageService.getParticipants(establishmentId);
        setParticipants(establishmentParticipants);
      }
    };

    fetchData();
  }, [router.isReady, id]);

  const handleSaveEstablishment = async () => {
    if (!establishment) return;

    const updated: Establishment = {
      ...establishment,
      name: formData.name,
      address: formData.address,
      googleMapsUrl: formData.googleMapsUrl,
      instagramUrl: formData.instagramUrl || undefined,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      enableInstagramWheel: formData.enableInstagramWheel,
    };

    await storageService.saveEstablishment(updated);
    setEstablishment(updated);
    alert("Établissement mis à jour avec succès !");
  };

  const handleSaveSegments = async () => {
    if (!establishment) return;
    await storageService.saveSegments(establishment.id, segments);
    alert("Configuration de la roue sauvegardée !");
  };

  const handleAddSegment = () => {
    if (!establishment) return;
    
    const newSegment: WheelSegment = {
      id: crypto.randomUUID(),
      establishmentId: establishment.id,
      title: "Nouveau lot",
      color: "#3b82f6",
      type: "prize",
      probability: 10,
      order: segments.length + 1,
    };
    
    setSegments([...segments, newSegment]);
  };

  const handleUpdateSegment = (index: number, field: keyof WheelSegment, value: string | number) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], [field]: value };
    setSegments(updated);
  };

  const handleDeleteSegment = (index: number) => {
    const updated = segments.filter((_, i) => i !== index);
    setSegments(updated);
  };

  const totalProbability = segments.reduce((sum, seg) => sum + seg.probability, 0);

  // CSV Export function
  const handleExportCSV = () => {
    if (participants.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }

    const headers = ["Date", "Email", "Téléphone", "Lot 1", "Lot 2"];
    const csvContent = [
      headers.join(","),
      ...participants.map(p => [
        new Date(p.createdAt).toLocaleDateString("fr-FR"),
        p.email,
        p.phone || "",
        p.prize1 || "",
        p.prize2 || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `prizmo_clients_${establishment?.slug}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and search logic
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = 
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (participant.phone && participant.phone.includes(searchTerm));
    
    const matchesPrize = 
      filterPrize === "all" || 
      (filterPrize === "winner" && participant.prize1 && participant.prize1 !== "Merci !") ||
      (filterPrize === "loser" && (!participant.prize1 || participant.prize1 === "Merci !"));

    return matchesSearch && matchesPrize;
  });

  // Analytics calculations
  const totalParticipants = participants.length;
  const participantsWithPrize = participants.filter(p => p.prize1 && p.prize1 !== "Merci !").length;
  const conversionRate = totalParticipants > 0 ? Math.round((participantsWithPrize / totalParticipants) * 100) : 0;

  // Prize distribution
  const prizeDistribution = segments.reduce((acc, segment) => {
    const count = participants.filter(p => p.prize1 === segment.title || p.prize2 === segment.title).length;
    if (count > 0) {
      acc[segment.title] = count;
    }
    return acc;
  }, {} as Record<string, number>);

  // Recent participants (last 5)
  const recentParticipants = [...participants]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleDeleteEstablishment = async () => {
    if (!establishment || !confirm("Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible et supprimera toutes les données associées (participants, segments, logos, compte utilisateur).")) return;

    try {
      const { data, error } = await supabase.functions.invoke("delete-establishment", {
        body: { establishmentId: establishment.id }
      });

      if (error) {
        console.error("Error deleting establishment:", error);
        alert("Erreur lors de la suppression de l'établissement : " + error.message);
        return;
      }

      alert("Établissement supprimé avec succès !");
      router.push("/admin");
    } catch (error) {
      console.error("Error calling delete function:", error);
      alert("Une erreur est survenue lors de la suppression.");
    }
  };

  const handleDownloadPoster = async (type: "png" | "pdf") => {
    if (!posterRef.current || !establishment) return;

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2, // Better quality
        useCORS: true, // For images from Supabase
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      if (type === "png") {
        const link = document.createElement("a");
        link.download = `affiche-${establishment.slug}-${posterFormat}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: posterFormat.toLowerCase(),
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`affiche-${establishment.slug}-${posterFormat}.pdf`);
      }
    } catch (error) {
      console.error("Error generating poster:", error);
      alert("Une erreur est survenue lors de la génération de l'affiche.");
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
    <ProtectedRoute establishmentId={id as string}>
      <SEO 
        title={`Éditer ${establishment.name} - Prizmo Admin`}
        description="Modifier les paramètres de votre établissement"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <header className="bg-white border-b shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button onClick={() => router.push("/admin")} variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => window.open(`/game/${establishment.slug}`, "_blank")}
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                Prévisualiser le jeu
              </Button>
              <Button onClick={() => signOut()} variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">{establishment.name}</h1>
              <p className="text-muted-foreground">Gérez votre établissement et personnalisez l'expérience client</p>
            </div>

            <Tabs defaultValue="analytics" className="space-y-6">
                          <TabsList className="grid w-full grid-cols-5">
                              <TabsTrigger value="wheel">🎡 Configuration Roue</TabsTrigger>
                              <TabsTrigger value="general">
                                <Settings className="h-4 w-4 mr-2" />
                                Informations
                              </TabsTrigger>
                              <TabsTrigger value="posters">
                                <Printer className="h-4 w-4 mr-2" />
                                Affiches
                              </TabsTrigger>
                              <TabsTrigger value="clients">👥 Clients</TabsTrigger>
                              <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
                          </TabsList>

              {/* Tab: Analytics - NEW PRIORITY */}
              <TabsContent value="analytics">
                <div className="space-y-6">
                  {/* Period Filter */}
                  <Card className="border-2 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <span className="font-semibold">Période d'analyse :</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant={analyticsPeriod === 7 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAnalyticsPeriod(7)}
                          >
                            7 jours
                          </Button>
                          <Button
                            variant={analyticsPeriod === 30 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAnalyticsPeriod(30)}
                          >
                            30 jours
                          </Button>
                          <Button
                            variant={analyticsPeriod === 90 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAnalyticsPeriod(90)}
                          >
                            3 mois
                          </Button>
                          <Button
                            variant={analyticsPeriod === 365 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAnalyticsPeriod(365)}
                          >
                            1 an
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* KPIs Cards */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="border-2 shadow-lg">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Participants totaux
                          </CardTitle>
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{totalParticipants}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Clients ayant joué
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 shadow-lg">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Avis générés
                          </CardTitle>
                          <Star className="w-5 h-5 text-yellow-600" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{totalParticipants}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Clics sur "Laisser un avis"
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 shadow-lg">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Taux de gain
                          </CardTitle>
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{conversionRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {participantsWithPrize} lots gagnés
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Analytics Charts Component */}
                  <AnalyticsCharts participants={participants} period={analyticsPeriod} />

                  {/* Prize Distribution */}
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="w-5 h-5" />
                        Distribution des lots
                      </CardTitle>
                      <CardDescription>Répartition des gains offerts à vos clients</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {Object.keys(prizeDistribution).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(prizeDistribution).map(([prize, count]) => {
                            const segment = segments.find(s => s.title === prize);
                            return (
                              <div key={prize} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: segment?.color || "#888" }}
                                  />
                                  <span className="font-medium">{prize}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold">{count}</span>
                                  <span className="text-sm text-muted-foreground">
                                    ({totalParticipants > 0 ? Math.round((count / totalParticipants) * 100) : 0}%)
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          Aucune donnée disponible pour le moment
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Participants */}
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <CardTitle>Derniers participants</CardTitle>
                      <CardDescription>Activité récente de votre jeu</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recentParticipants.length > 0 ? (
                        <div className="space-y-2">
                          {recentParticipants.map((participant) => (
                            <div 
                              key={participant.id}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors"
                            >
                              <div className="space-y-1">
                                <p className="font-medium">{participant.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(participant.createdAt).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">
                                  {participant.prize1 || "En attente"}
                                </p>
                                {participant.prize2 && (
                                  <p className="text-xs text-muted-foreground">
                                    + {participant.prize2}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          Aucun participant pour le moment
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab: Configuration de la roue - SPLIT SCREEN */}
              <TabsContent value="wheel">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* LEFT: Preview */}
                  <Card className="border-2 shadow-xl lg:sticky lg:top-24 h-fit">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Aperçu de la roue
                      </CardTitle>
                      <CardDescription>
                        Visualisation en temps réel
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                      <WheelPreview segments={segments} size={400} />
                      
                      <div className="w-full p-4 bg-muted rounded-lg">
                        <p className="text-sm font-semibold mb-2">Statistiques</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Segments</p>
                            <p className="font-bold text-lg">{segments.length}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Probabilité totale</p>
                            <p className={`font-bold text-lg ${totalProbability === 100 ? "text-green-600" : "text-orange-600"}`}>
                              {totalProbability}%
                            </p>
                          </div>
                        </div>
                        {totalProbability !== 100 && (
                          <p className="text-xs text-orange-600 mt-2">
                            ⚠️ La somme des probabilités devrait être égale à 100%
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* RIGHT: Configuration */}
                  <div className="space-y-4">
                    <Card className="border-2 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-xl">Segments de la roue</CardTitle>
                        <CardDescription>
                          Personnalisez les lots et leurs probabilités
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {segments.map((segment, index) => (
                          <Card key={segment.id} className="border-2">
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-sm font-semibold text-muted-foreground">
                                    Segment #{index + 1}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSegment(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Titre du lot</Label>
                                    <Input
                                      value={segment.title}
                                      onChange={(e) => handleUpdateSegment(index, "title", e.target.value)}
                                      placeholder="Ex: Dessert offert"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Type de segment</Label>
                                    <select
                                      value={segment.type}
                                      onChange={(e) => handleUpdateSegment(index, "type", e.target.value)}
                                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    >
                                      <option value="prize">🎁 Lot gagnant</option>
                                      <option value="no-prize">❌ Pas de gain</option>
                                    </select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Couleur</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={segment.color}
                                        onChange={(e) => handleUpdateSegment(index, "color", e.target.value)}
                                        className="w-20 h-10 cursor-pointer"
                                      />
                                      <Input
                                        type="text"
                                        value={segment.color}
                                        onChange={(e) => handleUpdateSegment(index, "color", e.target.value)}
                                        placeholder="#000000"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Probabilité (%)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={segment.probability}
                                      onChange={(e) => handleUpdateSegment(index, "probability", parseInt(e.target.value) || 0)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        <Button 
                          onClick={handleAddSegment} 
                          variant="outline" 
                          className="w-full border-2 border-dashed hover:border-solid"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter un segment
                        </Button>

                        <Button 
                          onClick={handleSaveSegments} 
                          className="w-full prizmo-gradient text-white font-semibold"
                          size="lg"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Enregistrer la configuration
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Affiches */}
              <TabsContent value="posters">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left: Controls */}
                  <Card className="border-2 shadow-xl lg:col-span-1 h-fit">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Printer className="w-5 h-5" />
                        Générateur d'affiches
                      </CardTitle>
                      <CardDescription>
                        Créez une affiche QR Code pour votre établissement
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Label>Format de l'affiche</Label>
                        <div className="flex gap-2">
                          <Button 
                            variant={posterFormat === "A4" ? "default" : "outline"}
                            onClick={() => setPosterFormat("A4")}
                            className="flex-1"
                          >
                            A4
                          </Button>
                          <Button 
                            variant={posterFormat === "A5" ? "default" : "outline"}
                            onClick={() => setPosterFormat("A5")}
                            className="flex-1"
                          >
                            A5
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Téléchargement</Label>
                        <div className="grid grid-cols-1 gap-2">
                          <Button onClick={() => handleDownloadPoster("png")} variant="outline" className="w-full">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Télécharger en PNG
                          </Button>
                          <Button onClick={() => handleDownloadPoster("pdf")} className="w-full prizmo-gradient text-white">
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger en PDF
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                        <p className="font-semibold mb-1">Conseil d'impression :</p>
                        <p>Pour une qualité optimale, imprimez sur du papier cartonné ou glacé. Placez l'affiche à un endroit visible (comptoir, tables, entrée).</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right: Preview */}
                  <div className="lg:col-span-2 flex justify-center bg-gray-100 p-8 rounded-xl border overflow-auto">
                    <div 
                      ref={posterRef}
                      className="bg-white shadow-2xl relative flex flex-col items-center justify-between overflow-hidden"
                      style={{
                        width: posterFormat === "A4" ? "595px" : "420px",
                        height: posterFormat === "A4" ? "842px" : "595px",
                        padding: posterFormat === "A4" ? "40px" : "30px",
                        transform: "scale(0.8)", // Visual scaling for preview
                        transformOrigin: "top center",
                      }}
                    >
                      {/* Background decoration */}
                      <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
                      
                      {/* Header Section */}
                      <div className="text-center w-full space-y-4 mt-4">
                        {establishment.logo_url ? (
                          <img 
                            src={establishment.logo_url} 
                            alt="Logo" 
                            className="h-24 mx-auto object-contain"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="h-24 flex items-center justify-center">
                            <h2 className="text-3xl font-bold text-gray-800">{establishment.name}</h2>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 uppercase tracking-tight">
                            Tentez votre chance !
                          </h1>
                          <p className="text-xl text-gray-600 font-medium">
                            Tournez la roue et gagnez un cadeau 🎁
                          </p>
                        </div>
                      </div>

                      {/* Middle: Wheel Visual */}
                      <div className="relative flex-1 flex items-center justify-center w-full my-4">
                        <div className="transform scale-125">
                          <WheelPreview segments={segments} size={300} pointerSize={40} />
                        </div>
                      </div>

                      {/* Bottom: QR Code */}
                      <div className="flex flex-col items-center space-y-4 mb-4">
                        <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-dashed border-gray-200">
                          <QRCodeSVG
                            value={`${window.location.origin}/game/${establishment.slug}`}
                            size={180}
                            level="H"
                            includeMargin={true}
                            fgColor={establishment.primaryColor || "#000000"}
                          />
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">
                            Scannez pour jouer
                          </p>
                          <p className="font-bold text-xl text-gray-800">
                            {establishment.name}
                          </p>
                        </div>
                      </div>

                      {/* Footer decoration */}
                      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Informations générales */}
              <TabsContent value="general">
                <Card className="border-2 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">Informations de l'établissement</CardTitle>
                    <CardDescription>Modifiez les détails de votre restaurant</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                                          <div className="space-y-2">
                                              <Label>Logo de l'établissement</Label>
                                              <div className="flex items-center gap-4 p-4 border rounded-lg">
                                                  {establishment.logo_url ? (
                                                      <img
                                                          src={establishment.logo_url}
                                                          alt="Logo"
                                                          className="w-20 h-20 object-contain rounded-lg border"
                                                      />
                                                  ) : (
                                                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                                          <ImageIcon className="w-8 h-8 text-gray-400" />
                                                      </div>
                                                  )}
                                                  <div className="flex-1">
                                                      <p className="text-sm font-medium">
                                                          {establishment.logo_url ? "Logo actuel" : "Aucun logo uploadé"}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground mb-2">
                                                          PNG ou JPEG, 200x200px recommandé
                                                      </p>
                                                      <label className="cursor-pointer">
                                                          <Button variant="outline" size="sm" asChild>
                                                              <span>
                                                                  <Upload className="w-4 h-4 mr-2" />
                                                                  {establishment.logo_url ? "Changer le logo" : "Uploader un logo"}
                                                              </span>
                                                          </Button>
                                                          <input
                                                              type="file"
                                                              accept="image/*"
                                                              className="hidden"
                                                              onChange={async (e) => {
                                                                  const file = e.target.files?.[0];
                                                                  if (!file || !establishment) return;
                                                                  setIsLogoUploading(true);
                                                                  try {
                                                                      const { storageService: fileStorage } = await import("@/services/storageService");
                                                                      const url = await fileStorage.uploadLogo(file, establishment.id, "primary");
                                                                      const updated = { ...establishment, logo_url: url };
                                                                      await storageService.saveEstablishment(updated);
                                                                      setEstablishment(updated);
                                                                  } catch (err) {
                                                                      alert("Erreur lors de l'upload du logo");
                                                                  } finally {
                                                                      setIsLogoUploading(false);
                                                                  }
                                                              }}
                                                          />
                                                      </label>
                                                  </div>
                                              </div>
                                          </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Nom de l'établissement</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="googleMapsUrl">Lien Google Maps (avis)</Label>
                        <Input
                          id="googleMapsUrl"
                          type="url"
                          value={formData.googleMapsUrl}
                          onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagramUrl">Lien Instagram (optionnel)</Label>
                        <Input
                          id="instagramUrl"
                          type="url"
                          value={formData.instagramUrl}
                          onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label>Activer la 2ème roue Instagram</Label>
                          <p className="text-sm text-muted-foreground">
                            Offrir un 2ème cadeau si le client s'abonne à Instagram
                          </p>
                        </div>
                        <Switch
                          checked={formData.enableInstagramWheel}
                          onCheckedChange={(checked) => setFormData({ ...formData, enableInstagramWheel: checked })}
                        />
                      </div>


                    </div>

                    <Button onClick={handleSaveEstablishment} className="w-full prizmo-gradient text-white" size="lg">
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer les modifications
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="clients">
                <Card className="border-2 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">Base de données clients</CardTitle>
                        <CardDescription>
                          {participants.length} participant{participants.length > 1 ? "s" : ""} enregistré{participants.length > 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                      {participants.length > 0 && (
                        <Button onClick={handleExportCSV} className="prizmo-gradient text-white">
                          <Download className="w-4 h-4 mr-2" />
                          Exporter CSV
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {participants.length > 0 ? (
                      <>
                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Rechercher par email ou téléphone..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <select
                              value={filterPrize}
                              onChange={(e) => setFilterPrize(e.target.value)}
                              className="h-10 px-3 rounded-md border border-input bg-background"
                            >
                              <option value="all">Tous les participants</option>
                              <option value="winner">🎁 Gagnants uniquement</option>
                              <option value="loser">❌ Non-gagnants</option>
                            </select>
                          </div>
                        </div>

                        {/* Results count */}
                        {filteredParticipants.length !== participants.length && (
                          <p className="text-sm text-muted-foreground">
                            {filteredParticipants.length} résultat{filteredParticipants.length > 1 ? "s" : ""} sur {participants.length}
                          </p>
                        )}

                        {/* Participants Table */}
                        {filteredParticipants.length > 0 ? (
                          <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="text-left p-3 font-semibold">Date</th>
                                  <th className="text-left p-3 font-semibold">Email</th>
                                  <th className="text-left p-3 font-semibold">Téléphone</th>
                                  <th className="text-left p-3 font-semibold">Lot gagné</th>
                                  <th className="text-left p-3 font-semibold">Statut</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredParticipants.map((participant, index) => {
                                  const hasWon = participant.prize1 && participant.prize1 !== "Merci !";
                                  return (
                                    <tr 
                                      key={participant.id} 
                                      className={`border-b hover:bg-muted/50 ${index % 2 === 0 ? "bg-white" : "bg-muted/20"}`}
                                    >
                                      <td className="p-3 text-sm">
                                        {new Date(participant.createdAt).toLocaleDateString("fr-FR", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric"
                                        })}
                                      </td>
                                      <td className="p-3 font-medium">{participant.email}</td>
                                      <td className="p-3 text-sm">{participant.phone || "-"}</td>
                                      <td className="p-3">
                                        <span className="font-medium">
                                          {participant.prize1 || "En attente"}
                                        </span>
                                        {participant.prize2 && (
                                          <span className="text-xs text-muted-foreground ml-2 block">
                                            + {participant.prize2}
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-3">
                                        {hasWon ? (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            🎁 Gagnant
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Participation
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            Aucun résultat ne correspond à votre recherche
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                          Aucun participant pour le moment
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Les clients qui jouent apparaîtront ici
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}