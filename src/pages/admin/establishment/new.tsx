import { SEO } from "@/components/SEO";
import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Save, Store, Link, Palette, CheckCircle } from "lucide-react";
import { storageService } from "@/lib/storage";
import { Establishment, WheelSegment } from "@/types";

const STEPS = [
  { id: 1, title: "Identité", description: "Votre restaurant", icon: Store },
  { id: 2, title: "Connexion digitale", description: "Vos liens", icon: Link },
  { id: 3, title: "Personnalisation", description: "Vos couleurs", icon: Palette },
  { id: 4, title: "Confirmation", description: "C'est parti !", icon: CheckCircle },
];

export default function NewEstablishmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Le nom est requis";
      if (!formData.address.trim()) newErrors.address = "L'adresse est requise";
    }
    if (step === 2) {
      if (!formData.googleMapsUrl.trim()) newErrors.googleMapsUrl = "Le lien Google Maps est requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async () => {
    const slug = formData.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newEstablishment: Establishment = {
      id: crypto.randomUUID(),
      name: formData.name,
      slug,
      address: formData.address,
      googleMapsUrl: formData.googleMapsUrl,
      instagramUrl: formData.instagramUrl || undefined,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      enableInstagramWheel: formData.enableInstagramWheel,
      createdAt: new Date().toISOString(),
    };

    await storageService.saveEstablishment(newEstablishment);

    const defaultSegments: WheelSegment[] = [
      { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Boisson maison offerte", color: "#8b5cf6", type: "prize", probability: 25, order: 1 },
      { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Merci !", color: "#9ca3af", type: "no-prize", probability: 20, order: 2 },
      { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Dessert offert", color: "#f59e0b", type: "prize", probability: 20, order: 3 },
      { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Merci !", color: "#10b981", type: "no-prize", probability: 15, order: 4 },
      { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Café offert", color: "#3b82f6", type: "prize", probability: 15, order: 5 },
      { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Merci !", color: "#ef4444", type: "no-prize", probability: 5, order: 6 },
    ];

    await storageService.saveSegments(newEstablishment.id, defaultSegments);
    router.push(`/admin/establishment/${newEstablishment.id}`);
  };

  return (
    <>
      <SEO title="Nouvel établissement - Prizmo" description="Créez votre établissement" />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Button onClick={() => router.push("/admin")} variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">

          {/* Titre */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold prizmo-text-gradient mb-2">
              Nouvel établissement
            </h1>
            <p className="text-gray-500">Configurez votre roue de la fortune en quelques étapes</p>
          </div>

          {/* Stepper */}
                  <div className="flex items-center justify-between mb-8 px-8 max-w-2xl mx-auto">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isCompleted ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg" :
                      isActive ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-110" :
                      "bg-gray-100 text-gray-400"
                    }`}>
                      {isCompleted ? "✓" : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-xs font-semibold ${isActive ? "text-purple-600" : isCompleted ? "text-purple-400" : "text-gray-400"}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                      currentStep > step.id ? "bg-gradient-to-r from-purple-600 to-pink-600" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Card principale */}
          <Card className="border-2 shadow-xl">
            <CardContent className="p-8">

              {/* ÉTAPE 1 - Identité */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Store className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Votre restaurant</h2>
                    <p className="text-gray-500 text-sm mt-1">Dites-nous qui vous êtes !</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de l'établissement *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Le Petit Bistrot"
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
                      placeholder="Ex: 12 Rue de la Paix, 75001 Paris"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className={errors.address ? "border-red-500" : ""}
                      rows={2}
                    />
                    {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 - Connexion digitale */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Link className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Vos liens</h2>
                    <p className="text-gray-500 text-sm mt-1">Connectez vos plateformes digitales</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="googleMapsUrl">🗺️ Lien Google Maps (avis) *</Label>
                    <Input
                      id="googleMapsUrl"
                      type="url"
                      placeholder="https://search.google.com/local/writereview?placeid=..."
                      value={formData.googleMapsUrl}
                      onChange={(e) => handleChange("googleMapsUrl", e.target.value)}
                      className={errors.googleMapsUrl ? "border-red-500" : ""}
                    />
                    {errors.googleMapsUrl && <p className="text-sm text-red-500">{errors.googleMapsUrl}</p>}
                    <p className="text-xs text-gray-400">Trouvez ce lien dans Google My Business → "Demander des avis"</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagramUrl">📸 Lien Instagram (optionnel)</Label>
                    <Input
                      id="instagramUrl"
                      type="url"
                      placeholder="https://www.instagram.com/votrerestaurant"
                      value={formData.instagramUrl}
                      onChange={(e) => handleChange("instagramUrl", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border-2 rounded-xl bg-purple-50">
                    <div>
                      <p className="font-semibold text-sm">🎡 Activer la 2ème roue Instagram</p>
                      <p className="text-xs text-gray-500 mt-1">Offrir un 2ème cadeau si le client s'abonne</p>
                    </div>
                    <Switch
                      checked={formData.enableInstagramWheel}
                      onCheckedChange={(checked) => handleChange("enableInstagramWheel", checked)}
                    />
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 - Personnalisation */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Palette className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Vos couleurs</h2>
                    <p className="text-gray-500 text-sm mt-1">Personnalisez l'expérience à vos couleurs</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label>Couleur principale</Label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => handleChange("primaryColor", e.target.value)}
                          className="w-14 h-14 rounded-xl cursor-pointer border-2 border-gray-200"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => handleChange("primaryColor", e.target.value)}
                          placeholder="#8b5cf6"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Couleur secondaire</Label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => handleChange("secondaryColor", e.target.value)}
                          className="w-14 h-14 rounded-xl cursor-pointer border-2 border-gray-200"
                        />
                        <Input
                          value={formData.secondaryColor}
                          onChange={(e) => handleChange("secondaryColor", e.target.value)}
                          placeholder="#d946ef"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-gray-200 text-center">
                    <p className="text-xs text-gray-400 mb-3">Aperçu du dégradé</p>
                    <div
                      className="h-16 rounded-xl shadow-inner"
                      style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})` }}
                    />
                  </div>
                </div>
              )}

              {/* ÉTAPE 4 - Confirmation */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Tout est prêt !</h2>
                    <p className="text-gray-500 text-sm mt-1">Vérifiez les informations avant de créer</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-500">🏪 Restaurant</span>
                      <span className="font-semibold text-sm">{formData.name}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-500">📍 Adresse</span>
                      <span className="font-semibold text-sm text-right max-w-48">{formData.address}</span>
                    </div>
<div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
  <span className="text-sm text-gray-500">🗺️ Google Maps</span>
  <span className="font-semibold text-sm text-green-600">✓ Validé</span>
</div>
<div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
  <span className="text-sm text-gray-500">📸 Instagram</span>
  <span className={`font-semibold text-sm ${formData.instagramUrl ? "text-green-600" : "text-gray-400"}`}>
    {formData.instagramUrl ? "✓ Validé" : "Non renseigné"}
  </span>
</div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-500">🎨 Couleurs</span>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: formData.primaryColor }} />
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: formData.secondaryColor }} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-500">🎡 2ème roue Instagram</span>
                      <span className="font-semibold text-sm">{formData.enableInstagramWheel ? "✓ Activée" : "Désactivée"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <Button onClick={prevStep} variant="outline" className="px-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    className="px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Créer l'établissement !
                  </Button>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}