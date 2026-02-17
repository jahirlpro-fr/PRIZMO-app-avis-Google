import { SEO } from "@/components/SEO";
import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { storageService } from "@/lib/storage";
import { Establishment, WheelSegment } from "@/types";

export default function NewEstablishmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    googleMapsUrl: "",
    instagramUrl: "",
    primaryColor: "#8b5cf6",
    secondaryColor: "#d946ef",
    enableInstagramWheel: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'établissement est requis";
    }
    if (!formData.address.trim()) {
      newErrors.address = "L'adresse est requise";
    }
    if (!formData.googleMapsUrl.trim()) {
      newErrors.googleMapsUrl = "Le lien Google Maps est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Créer l'établissement
    const newEstablishment: Establishment = {
      id: formData.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      name: formData.name,
      address: formData.address,
      googleMapsUrl: formData.googleMapsUrl,
      instagramUrl: formData.instagramUrl || undefined,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      enableInstagramWheel: formData.enableInstagramWheel,
      createdAt: new Date().toISOString(),
    };

    storageService.saveEstablishment(newEstablishment);

    // Créer les segments par défaut
    const defaultSegments: WheelSegment[] = [
      { id: "1", establishmentId: newEstablishment.id, title: "Boisson maison offerte", color: "#8b5cf6", type: "prize", probability: 25, order: 1 },
      { id: "2", establishmentId: newEstablishment.id, title: "Merci !", color: "#ec4899", type: "no-prize", probability: 20, order: 2 },
      { id: "3", establishmentId: newEstablishment.id, title: "Dessert offert", color: "#f59e0b", type: "prize", probability: 20, order: 3 },
      { id: "4", establishmentId: newEstablishment.id, title: "Merci !", color: "#10b981", type: "no-prize", probability: 15, order: 4 },
      { id: "5", establishmentId: newEstablishment.id, title: "Café offert", color: "#3b82f6", type: "prize", probability: 15, order: 5 },
      { id: "6", establishmentId: newEstablishment.id, title: "Merci !", color: "#ef4444", type: "no-prize", probability: 5, order: 6 },
    ];

    storageService.saveSegments(newEstablishment.id, defaultSegments);

    // Rediriger vers la page d'édition
    router.push(`/admin/establishment/${newEstablishment.id}`);
  };

  const handleCreate = () => {
    if (!formData.name) return;

    const slug = formData.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newEstablishment: Establishment = {
      id: crypto.randomUUID(),
      name: formData.name,
      slug: slug,
      address: formData.address,
      googleMapsUrl: formData.googleMapsUrl,
      instagramUrl: formData.instagramUrl || undefined,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      enableInstagramWheel: formData.enableInstagramWheel,
      createdAt: new Date().toISOString(),
    };

    storageService.saveEstablishment(newEstablishment);
    storageService.initializeDemoData(); // Ensure default segments are created if needed, though usually handled separately
    
    // Create default segments for this new establishment
    const defaultSegments: WheelSegment[] = [
      { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Boisson offerte", color: "#8b5cf6", type: "prize", probability: 25, order: 1 },
      { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Perdu", color: "#9ca3af", type: "no-prize", probability: 20, order: 2 },
      { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Dessert offert", color: "#f59e0b", type: "prize", probability: 15, order: 3 },
      { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Perdu", color: "#9ca3af", type: "no-prize", probability: 20, order: 4 },
      { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Café offert", color: "#10b981", type: "prize", probability: 10, order: 5 },
      { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Perdu", color: "#9ca3af", type: "no-prize", probability: 10, order: 6 },
    ];
    
    storageService.saveSegments(newEstablishment.id, defaultSegments);

    router.push(`/admin/establishment/${newEstablishment.id}`);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <>
      <SEO 
        title="Nouvel établissement - Prizmo Admin"
        description="Créez un nouvel établissement"
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
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-3xl">Nouvel établissement</CardTitle>
                <CardDescription>
                  Configurez votre établissement et sa roue de la fortune
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informations de base */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Informations de base</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de l'établissement *</Label>
                      <Input
                        id="name"
                        placeholder="Restaurant Le Gourmet"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse *</Label>
                      <Textarea
                        id="address"
                        placeholder="123 Rue de la Gastronomie, 75001 Paris"
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        className={errors.address ? "border-red-500" : ""}
                        rows={2}
                      />
                      {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                    </div>
                  </div>

                  {/* Liens */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Liens sociaux</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="googleMapsUrl">Lien Google Maps (page d'avis) *</Label>
                      <Input
                        id="googleMapsUrl"
                        type="url"
                        placeholder="https://www.google.com/maps/..."
                        value={formData.googleMapsUrl}
                        onChange={(e) => handleChange("googleMapsUrl", e.target.value)}
                        className={errors.googleMapsUrl ? "border-red-500" : ""}
                      />
                      {errors.googleMapsUrl && <p className="text-sm text-red-500">{errors.googleMapsUrl}</p>}
                      <p className="text-xs text-muted-foreground">
                        Le lien vers votre fiche Google My Business pour les avis
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagramUrl">Lien Instagram (optionnel)</Label>
                      <Input
                        id="instagramUrl"
                        type="url"
                        placeholder="https://www.instagram.com/votrerestaurant"
                        value={formData.instagramUrl}
                        onChange={(e) => handleChange("instagramUrl", e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="enableInstagram">Activer la 2ème roue Instagram</Label>
                        <p className="text-sm text-muted-foreground">
                          Proposer un 2ème cadeau si le client s'abonne à Instagram
                        </p>
                      </div>
                      <Switch
                        id="enableInstagram"
                        checked={formData.enableInstagramWheel}
                        onCheckedChange={(checked) => handleChange("enableInstagramWheel", checked)}
                      />
                    </div>
                  </div>

                  {/* Couleurs */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personnalisation</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Couleur principale</Label>
                        <div className="flex gap-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={formData.primaryColor}
                            onChange={(e) => handleChange("primaryColor", e.target.value)}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={formData.primaryColor}
                            onChange={(e) => handleChange("primaryColor", e.target.value)}
                            placeholder="#8b5cf6"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                        <div className="flex gap-2">
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={formData.secondaryColor}
                            onChange={(e) => handleChange("secondaryColor", e.target.value)}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={formData.secondaryColor}
                            onChange={(e) => handleChange("secondaryColor", e.target.value)}
                            placeholder="#d946ef"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push("/admin")}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 prizmo-gradient text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Créer l'établissement
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}