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
import { ArrowLeft, Save, Trash2, Plus, Eye, Users, Star, TrendingUp, Gift, Download, Search, Filter, Calendar, QrCode, LogOut, Upload, ImageIcon, Settings, Printer, CreditCard, Lock, Hash } from "lucide-react";
import { storageService } from "@/lib/storage";
import { Establishment, WheelSegment, Participant } from "@/types";
import { WheelPreview } from "@/components/admin/WheelPreview";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts"; 
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
  const [posterFormat, setPosterFormat] = useState < "A4" | "A5" > ("A4");
  const [posterTextColor, setPosterTextColor] = useState("#000000");

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
    const [uploadingPrimaryLogo, setUploadingPrimaryLogo] = useState(false);
    const [uploadingSecondaryLogo, setUploadingSecondaryLogo] = useState(false);

    // Loyalty
    const [loyaltyConfig, setLoyaltyConfig] = useState({
        card_name: "Carte Fidélité",
        stamps_required: 10,
        prize_description: "",
        secret_code: "",
        is_active: true,
    });
    const [loyaltyCards, setLoyaltyCards] = useState < any[] > ([]);
    const [loyaltySaving, setLoyaltySaving] = useState(false);
    const [loyaltyConfigExists, setLoyaltyConfigExists] = useState(false);


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

              // Charger config fidélité
              const { data: loyaltyData } = await supabase
                  .from("loyalty_config")
                  .select("*")
                  .eq("establishment_id", establishmentId)
                  .single();

              if (loyaltyData) {
                  setLoyaltyConfig({
                      card_name: loyaltyData.card_name,
                      stamps_required: loyaltyData.stamps_required,
                      prize_description: loyaltyData.prize_description,
                      secret_code: loyaltyData.secret_code,
                      is_active: loyaltyData.is_active,
                  });
                  setLoyaltyConfigExists(true);
              }

              // Charger porteurs de carte
              const { data: cardsData } = await supabase
                  .from("loyalty_cards")
                  .select("*")
                  .eq("establishment_id", establishmentId)
                  .order("created_at", { ascending: false });

              if (cardsData) setLoyaltyCards(cardsData);
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

    const handleSaveLoyaltyConfig = async () => {
        if (!establishment) return;
        if (!loyaltyConfig.secret_code || loyaltyConfig.secret_code.length < 6) {
            alert("Le code secret doit contenir au moins 6 chiffres !");
            return;
        }
        if (!loyaltyConfig.prize_description.trim()) {
            alert("Veuillez renseigner la description du prize !");
            return;
        }

        setLoyaltySaving(true);
        try {
            if (loyaltyConfigExists) {
                await supabase
                    .from("loyalty_config")
                    .update({
                        card_name: loyaltyConfig.card_name,
                        stamps_required: loyaltyConfig.stamps_required,
                        prize_description: loyaltyConfig.prize_description,
                        secret_code: loyaltyConfig.secret_code,
                        is_active: loyaltyConfig.is_active,
                    })
                    .eq("establishment_id", establishment.id);
            } else {
                await supabase
                    .from("loyalty_config")
                    .insert({
                        establishment_id: establishment.id,
                        card_name: loyaltyConfig.card_name,
                        stamps_required: loyaltyConfig.stamps_required,
                        prize_description: loyaltyConfig.prize_description,
                        secret_code: loyaltyConfig.secret_code,
                        is_active: loyaltyConfig.is_active,
                    });
                setLoyaltyConfigExists(true);
            }
            alert("Configuration fidélité sauvegardée !");
        } catch (error: any) {
            alert("Erreur : " + error.message);
        } finally {
            setLoyaltySaving(false);
        }
    };

    const handleDeleteEstablishment = async () => {
        if (!establishment || !confirm("Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible.")) return;

        try {
            const response = await fetch("/api/delete-establishment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ establishmentId: establishment.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert("Erreur : " + data.error);
                return;
            }

            alert("Établissement supprimé avec succès !");
            router.push("/admin");
        } catch (error: any) {
            alert("Erreur : " + error.message);
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
                  <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
                      <Button onClick={() => router.push("/admin")} variant="ghost" size="sm">
                          <ArrowLeft className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Retour</span>
                      </Button>
                      <div className="flex items-center gap-2">
                          <Button
                              onClick={() => window.open(`/game/${establishment.slug}`, "_blank")}
                              variant="outline"
                              size="sm"
                          >
                              <Eye className="w-4 h-4 sm:mr-2" />
                              <span className="hidden sm:inline">Prévisualiser</span>
                          </Button>
                          <Button onClick={() => signOut()} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <LogOut className="w-4 h-4 sm:mr-2" />
                              <span className="hidden sm:inline">Déconnexion</span>
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
                      <div className="overflow-x-auto pb-1">
                          <TabsList className="flex w-max min-w-full">
                              <TabsTrigger value="wheel" className="flex-1 min-w-[120px] text-xs sm:text-sm">
                                  🎡 Roue
                              </TabsTrigger>
                              <TabsTrigger value="general" className="flex-1 min-w-[120px] text-xs sm:text-sm">
                                  <Settings className="h-4 w-4 mr-1" />
                                  Infos
                              </TabsTrigger>
                              <TabsTrigger value="posters" className="flex-1 min-w-[120px] text-xs sm:text-sm">
                                  <Printer className="h-4 w-4 mr-1" />
                                  Affiches
                              </TabsTrigger>
                              <TabsTrigger value="clients" className="flex-1 min-w-[120px] text-xs sm:text-sm">
                                  👥 Clients
                              </TabsTrigger>
                              <TabsTrigger value="analytics" className="flex-1 min-w-[120px] text-xs sm:text-sm">
                                  📊 Analytics
                              </TabsTrigger>
                                  <TabsTrigger value="loyalty" className="flex-1 min-w-[120px] text-xs sm:text-sm">
                                      <CreditCard className="h-4 w-4 mr-1" />
                                      Fidélité
                                  </TabsTrigger>
                              </TabsList>
                          </div>

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

{/* Tab: Fidélité */}
              <TabsContent value="loyalty">
                <div className="space-y-6">

                  {/* Configuration */}
                  <Card className="border-2 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-purple-600" />
                        Carte de Fidélité Digitale
                      </CardTitle>
                      <CardDescription>
                        Configurez la carte fidélité de vos clients — accessible via QR code, sans application
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                      {/* Toggle activation */}
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div>
                          <p className="font-semibold text-purple-900">Activer la carte fidélité</p>
                          <p className="text-sm text-purple-600">Vos clients pourront accéder à leur carte via QR code</p>
                        </div>
                        <Switch
                          checked={loyaltyConfig.is_active}
                          onCheckedChange={(v) => setLoyaltyConfig({ ...loyaltyConfig, is_active: v })}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Nom de la carte */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-purple-600" />
                            Nom de la carte *
                          </Label>
                          <Input
                            placeholder="Ex: Carte Fidélité Bimbambao"
                            value={loyaltyConfig.card_name}
                            onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, card_name: e.target.value })}
                          />
                        </div>

                        {/* Prize */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-purple-600" />
                            Prize (récompense) *
                          </Label>
                          <Input
                            placeholder="Ex: 1 repas offert"
                            value={loyaltyConfig.prize_description}
                            onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, prize_description: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Nombre de stamps */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-purple-600" />
                          Nombre de repas avant le prize : <span className="font-bold text-purple-600 ml-1">{loyaltyConfig.stamps_required}</span>
                        </Label>
                        <input
                          type="range"
                          min={5}
                          max={15}
                          value={loyaltyConfig.stamps_required}
                          onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, stamps_required: parseInt(e.target.value) })}
                          className="w-full accent-purple-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>5 repas</span>
                          <span>10 repas</span>
                          <span>15 repas</span>
                        </div>
                      </div>

                      {/* Code secret */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-purple-600" />
                          Code secret commerçant * (minimum 6 chiffres)
                        </Label>
                        <Input
                          type="password"
                          placeholder="Ex: 123456"
                          value={loyaltyConfig.secret_code}
                          onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, secret_code: e.target.value })}
                          maxLength={10}
                        />
                        <p className="text-xs text-gray-400">
                          Ce code est communiqué verbalement par vous au client pour valider sa visite. Ne le partagez pas publiquement.
                        </p>
                      </div>

                      <Button
                        onClick={handleSaveLoyaltyConfig}
                        className="w-full prizmo-gradient text-white"
                        size="lg"
                        disabled={loyaltySaving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loyaltySaving ? "Sauvegarde..." : "Sauvegarder la configuration"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* QR Code fidélité */}
                  {loyaltyConfigExists && loyaltyConfig.is_active && (
                    <Card className="border-2 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <QrCode className="w-5 h-5 text-purple-600" />
                          QR Code Fidélité
                        </CardTitle>
                        <CardDescription>
                          Affichez ce QR code dans votre restaurant — distinct du QR code de la roue
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-white border-2 border-purple-200 rounded-xl shadow-lg">
                          <QRCodeSVG
                            value={`${window.location.origin}/loyalty/${establishment.slug}`}
                            size={180}
                            level="H"
                            includeMargin={true}
                            fgColor="#8b5cf6"
                          />
                        </div>
                        <p className="text-sm text-gray-500 text-center">
                          URL : <span className="font-mono text-purple-600">/loyalty/{establishment.slug}</span>
                        </p>
                                              <Button
                                                  variant="outline"
                                                  onClick={() => window.open(`/loyalty/${establishment.slug}`, "_blank")}
                                              >
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
                      {/* Couleurs */}
                      <div className="space-y-3">
                        <Label>Couleur du logo</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer border" />
                          <Input value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="font-mono text-sm" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Couleur de fond</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={formData.secondaryColor}
                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer border" />
                          <Input value={formData.secondaryColor}
                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            className="font-mono text-sm" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Couleur de la police</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={posterTextColor}
                            onChange={(e) => setPosterTextColor(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer border" />
                          <Input value={posterTextColor}
                            onChange={(e) => setPosterTextColor(e.target.value)}
                            className="font-mono text-sm" />
                        </div>
                      </div>

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
                      className="shadow-2xl relative overflow-hidden"
                      style={{
                        width: "595px",
                        height: "842px",
                        backgroundColor: formData.secondaryColor,
                        transform: posterFormat === "A4" ? "scale(0.75)" : "scale(0.53)",
                        transformOrigin: "top center",
                        flexShrink: 0,
                          display: "flex",
                          flexDirection: "column",
                      }}
                    >
                      {/* BLOC HAUT — Logos */}
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px 40px 12px 40px",
                        flex: "0 0 auto",
                      }}>
                        {establishment?.logoUrl ? (
                          <img
                            src={establishment.logoUrl}
                            alt="Logo principal"
                            crossOrigin="anonymous"
                            style={{
                              maxHeight: "90px",
                              maxWidth: "280px",
                              objectFit: "contain",
                              marginBottom: "12px",
                              filter: formData.primaryColor === "#ffffff"
                                ? "brightness(0) invert(1)"
                                : "brightness(0)",
                            }}
                          />
                        ) : (
                          <div style={{ height: "90px" }} />
                        )}
                        {establishment?.logoSecondaryUrl ? (
                          <img
                            src={establishment.logoSecondaryUrl}
                            alt="Logo secondaire"
                            crossOrigin="anonymous"
                            style={{
                              maxHeight: "60px",
                              maxWidth: "220px",
                              objectFit: "contain",
                              filter: formData.primaryColor === "#ffffff"
                                ? "brightness(0) invert(1)"
                                : "brightness(0)",
                            }}
                          />
                        ) : (
                          <div style={{ height: "60px" }} />
                        )}
                      </div>

                      {/* BLOC MILIEU — Texte + Roue */}
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "0 40px",
                        gap: "16px",
                        flex: "1 1 auto",
                        justifyContent: "flex-start",
                        paddingTop: "8px",
                      }}>
                        <div style={{ textAlign: "center" }}>
                          <h1 style={{
                            fontSize: "36px",
                            fontWeight: "900",
                            textTransform: "uppercase",
                            letterSpacing: "-0.5px",
                            color: posterTextColor,
                            margin: "0 0 8px 0",
                          }}>
                            Tentez votre chance !
                          </h1>
                          <p style={{
                            fontSize: "16px",
                            color: posterTextColor,
                            opacity: 0.8,
                            margin: 0,
                          }}>
                            Tournez la roue et gagnez un cadeau 🎁
                          </p>
                        </div>
                        <WheelPreview segments={segments} size={270} pointerSize={34} />
                      </div>

                      {/* BLOC BAS — QR Code */}
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "12px 40px 24px 40px",
                        flex: "0 0 auto",
                      }}>
                        <div style={{
                          backgroundColor: "white",
                          padding: "12px",
                          borderRadius: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}>
                          <QRCodeSVG
                            value={`${window.location.origin}/game/${establishment.slug}`}
                            size={160}
                            level="H"
                            includeMargin={true}
                            fgColor="#000000"
                          />
                        </div>
                        <p style={{
                          fontSize: "15px",
                          fontWeight: "700",
                          letterSpacing: "3px",
                          textTransform: "uppercase",
                          color: posterTextColor,
                          opacity: 0.7,
                          marginTop: "12px",
                        }}>
                          Scannez pour jouer
                        </p>
                      </div>
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
                                          <div className="space-y-4">
                                              <Label>Logos de l'établissement</Label>
                                              {/* Logo principal */}
                                              <div className="flex items-center gap-4 p-4 border rounded-lg">
                                                  {establishment.logoUrl ? (
                                                      <img src={establishment.logoUrl} alt="Logo principal" className="w-20 h-20 object-contain rounded-lg border" />
                                                  ) : (
                                                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                                          <ImageIcon className="w-8 h-8 text-gray-400" />
                                                      </div>
                                                  )}
                                                  <div className="flex-1">
                                                      <p className="text-sm font-medium">Logo principal</p>
                                                      <p className="text-xs text-muted-foreground mb-2">
                                                          {establishment.logoUrl ? "✓ Logo uploadé" : "Aucun logo uploadé"}
                                                      </p>
                                                      <label className="cursor-pointer">
                                                          <Button variant="outline" size="sm" asChild>
                                                              <span>
                                                                  <Upload className="w-4 h-4 mr-2" />
                                                                  {establishment.logoUrl ? "Changer" : "Uploader"}
                                                              </span>
                                                          </Button>
                                                          <input
                                                              type="file"
                                                              accept="image/*"
                                                              className="hidden"
                                                              onChange={async (e) => {
                                                                  const file = e.target.files?.[0];
                                                                  if (!file || !establishment) return;
                                                                  setUploadingPrimaryLogo(true);
                                                                  try {
                                                                      const { storageService: fileStorage } = await import("@/services/storageService");
                                                                      const url = await fileStorage.uploadLogo(file, establishment.id, "primary");
                                                                      const updated = { ...establishment, logoUrl: url };
                                                                      await storageService.saveEstablishment(updated);
                                                                      setEstablishment(updated);
                                                                  } catch (err) {
                                                                      alert("Erreur lors de l'upload du logo");
                                                                  } finally {
                                                                      setUploadingPrimaryLogo(false);
                                                                  }
                                                              }}
                                                          />
                                                      </label>
                                                      {uploadingPrimaryLogo && <p className="text-xs text-purple-600 mt-1">Envoi en cours...</p>}
                                                  </div>
                                              </div>

                                              {/* Logo secondaire */}
                                              <div className="flex items-center gap-4 p-4 border rounded-lg">
                                                  {establishment.logoSecondaryUrl ? (
                                                      <img src={establishment.logoSecondaryUrl} alt="Logo secondaire" className="w-20 h-20 object-contain rounded-lg border" />
                                                  ) : (
                                                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                                          <ImageIcon className="w-8 h-8 text-gray-400" />
                                                      </div>
                                                  )}
                                                  <div className="flex-1">
                                                      <p className="text-sm font-medium">Logo secondaire</p>
                                                      <p className="text-xs text-muted-foreground mb-2">
                                                          {establishment.logoSecondaryUrl ? "✓ Logo uploadé" : "Aucun logo secondaire uploadé"}
                                                      </p>
                                                      <label className="cursor-pointer">
                                                          <Button variant="outline" size="sm" asChild>
                                                              <span>
                                                                  <Upload className="w-4 h-4 mr-2" />
                                                                  {establishment.logoSecondaryUrl ? "Changer" : "Uploader"}
                                                              </span>
                                                          </Button>
                                                          <input
                                                              type="file"
                                                              accept="image/*"
                                                              className="hidden"
                                                              onChange={async (e) => {
                                                                  const file = e.target.files?.[0];
                                                                  if (!file || !establishment) return;
                                                                  setUploadingSecondaryLogo(true);
                                                                  try {
                                                                      const { storageService: fileStorage } = await import("@/services/storageService");
                                                                      const url = await fileStorage.uploadLogo(file, establishment.id, "secondary");
                                                                      const updated = { ...establishment, logoSecondaryUrl: url };
                                                                      await storageService.saveEstablishment(updated);
                                                                      setEstablishment(updated);
                                                                  } catch (err) {
                                                                      alert("Erreur lors de l'upload du logo secondaire");
                                                                  } finally {
                                                                      setUploadingSecondaryLogo(false);
                                                                  }
                                                              }}
                                                          />
                                                      </label>
                                                      {uploadingSecondaryLogo && <p className="text-xs text-purple-600 mt-1">Envoi en cours...</p>}
                                                  </div>
                                              </div>
                                          </div>
                                          <Button onClick={handleSaveEstablishment} className="w-full prizmo-gradient text-white" size="lg">
                                              <Save className="w-4 h-4 mr-2" />
                                              Enregistrer les modifications
                                          </Button>

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