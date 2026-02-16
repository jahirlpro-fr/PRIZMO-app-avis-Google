import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Trash2, Plus, GripVertical } from "lucide-react";
import { storageService } from "@/lib/storage";
import { Establishment, WheelSegment } from "@/types";

export default function EditEstablishmentPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [segments, setSegments] = useState<WheelSegment[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    googleMapsUrl: "",
    instagramUrl: "",
    primaryColor: "#8b5cf6",
    secondaryColor: "#d946ef",
    enableInstagramWheel: false,
  });

  useEffect(() => {
    if (!router.isReady) return;
    
    const establishmentId = id as string;
    const found = storageService.getEstablishmentById(establishmentId);
    
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
      
      const establishmentSegments = storageService.getSegments(establishmentId);
      setSegments(establishmentSegments);
    }
  }, [router.isReady, id]);

  const handleSaveEstablishment = () => {
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

    storageService.saveEstablishment(updated);
    setEstablishment(updated);
    alert("Établissement mis à jour avec succès !");
  };

  const handleSaveSegments = () => {
    if (!establishment) return;
    storageService.saveSegments(establishment.id, segments);
    alert("Segments de la roue mis à jour avec succès !");
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
        title={`Éditer ${establishment.name} - Prizmo Admin`}
        description="Modifier les paramètres de votre établissement"
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
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Informations</TabsTrigger>
                <TabsTrigger value="wheel">Roue de la fortune</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Couleur principale</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={formData.primaryColor}
                              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                              className="w-20 h-10"
                            />
                            <Input
                              type="text"
                              value={formData.primaryColor}
                              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Couleur secondaire</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={formData.secondaryColor}
                              onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                              className="w-20 h-10"
                            />
                            <Input
                              type="text"
                              value={formData.secondaryColor}
                              onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleSaveEstablishment} className="w-full prizmo-gradient text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer les modifications
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Configuration de la roue */}
              <TabsContent value="wheel">
                <Card className="border-2 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">Configuration de la roue</CardTitle>
                    <CardDescription>Personnalisez les segments et les lots de votre roue</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {segments.map((segment, index) => (
                        <Card key={segment.id} className="border">
                          <CardContent className="pt-6">
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
                                <Label>Type</Label>
                                <select
                                  value={segment.type}
                                  onChange={(e) => handleUpdateSegment(index, "type", e.target.value)}
                                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                >
                                  <option value="prize">Lot gagnant</option>
                                  <option value="no-prize">Pas de gain</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label>Couleur</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="color"
                                    value={segment.color}
                                    onChange={(e) => handleUpdateSegment(index, "color", e.target.value)}
                                    className="w-20 h-10"
                                  />
                                  <Input
                                    type="text"
                                    value={segment.color}
                                    onChange={(e) => handleUpdateSegment(index, "color", e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Probabilité (%)</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={segment.probability}
                                  onChange={(e) => handleUpdateSegment(index, "probability", parseInt(e.target.value))}
                                />
                              </div>

                              <div className="col-span-2 flex justify-end">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteSegment(index)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Supprimer
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Button onClick={handleAddSegment} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un segment
                    </Button>

                    <Button onClick={handleSaveSegments} className="w-full prizmo-gradient text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer la configuration de la roue
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Analytics */}
              <TabsContent value="analytics">
                <Card className="border-2 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">Statistiques & Données clients</CardTitle>
                    <CardDescription>Analysez les performances de votre jeu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        Fonctionnalité en cours de développement
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Bientôt disponible : nombre de participations, lots distribués, export CSV des emails collectés
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}