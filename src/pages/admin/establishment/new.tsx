import { SEO } from "@/components/SEO";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Save, Store, Link, Palette, CheckCircle, UserPlus, Upload, Image as ImageIcon, MapPin } from "lucide-react";
import { storageService as dbStorage } from "@/lib/storage";
import { storageService as fileStorage } from "@/services/storageService";
import { authService } from "@/services/authService";
import { Establishment, WheelSegment } from "@/types";
import type React from "react";

const STEPS = [
  { id: 1, title: "Identité", description: "Votre restaurant", icon: Store },
  { id: 2, title: "Digital", description: "Vos liens", icon: Link },
  { id: 3, title: "Personnalisation", description: "Vos couleurs", icon: Palette },
  { id: 4, title: "Confirmation", description: "C'est parti !", icon: CheckCircle },
  { id: 5, title: "Compte", description: "Accès au dashboard", icon: UserPlus },
];

interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

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
    email: "",
    password: "",
    logo_url: "",
    logo_secondary_url: "",
    placeId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingPrimaryLogo, setUploadingPrimaryLogo] = useState(false);
  const [uploadingSecondaryLogo, setUploadingSecondaryLogo] = useState(false);

  // Google Places Autocomplete
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Ferme les suggestions si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
        const response = await fetch(
            `/api/places-autocomplete?input=${encodeURIComponent(input)}`
        );
      const data = await response.json();
      if (data.predictions) {
        setSuggestions(data.predictions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Erreur autocomplete:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    setFormData(prev => ({ ...prev, name: value, placeId: "" }));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 350);
  };

  const handleSelectPlace = async (place: PlaceSuggestion) => {
    const name = place.structured_formatting.main_text;
    const address = place.structured_formatting.secondary_text || "";

    setSearchInput(name);
    setShowSuggestions(false);
    setSuggestions([]);

    // Construit l'URL d'avis Google automatiquement
    const googleMapsUrl = `https://search.google.com/local/writereview?placeid=${place.place_id}`;

    setFormData(prev => ({
      ...prev,
      name,
      address,
      placeId: place.place_id,
      googleMapsUrl,
    }));

    // Supprime l'erreur si présente
    setErrors(prev => { const n = { ...prev }; delete n.name; return n; });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const handlePrimaryLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPrimaryLogo(true);
    try {
      const tempId = crypto.randomUUID();
      const url = await fileStorage.uploadLogo(file, tempId, "primary");
      handleChange("logo_url", url);
    } catch (error: any) {
      setErrors({ ...errors, logo_url: error.message });
    } finally {
      setUploadingPrimaryLogo(false);
    }
  };

  const handleSecondaryLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSecondaryLogo(true);
    try {
      const tempId = crypto.randomUUID();
      const url = await fileStorage.uploadLogo(file, tempId, "secondary");
      handleChange("logo_secondary_url", url);
    } catch (error: any) {
      setErrors({ ...errors, logo_secondary_url: error.message });
    } finally {
      setUploadingSecondaryLogo(false);
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Veuillez sélectionner votre établissement";
      if (!formData.placeId) newErrors.name = "Veuillez sélectionner un établissement dans la liste";
    }
    if (step === 2) {
      if (!formData.googleMapsUrl.trim()) newErrors.googleMapsUrl = "Le lien Google Maps est requis";
    }
    if (step === 3) {
      if (!formData.logo_url.trim()) newErrors.logo_url = "Le logo principal est requis";
    }
    if (step === 5) {
      if (!formData.email.trim()) {
        newErrors.email = "L'email est requis";
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        newErrors.email = "Format d'email invalide (ex: exemple@domaine.com)";
      }
      if (!formData.password.trim()) {
        newErrors.password = "Le mot de passe est requis";
      } else if (formData.password.length < 6) {
        newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    try {
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
        logo_url: formData.logo_url,
        logo_secondary_url: formData.logo_secondary_url || undefined,
        createdAt: new Date().toISOString(),
      };

      await dbStorage.saveEstablishment(newEstablishment);

      const defaultSegments: WheelSegment[] = [
        { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Boisson maison offerte", color: "#8b5cf6", type: "prize", probability: 25, order: 1 },
        { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Merci !", color: "#9ca3af", type: "no-prize", probability: 20, order: 2 },
        { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Dessert offert", color: "#f59e0b", type: "prize", probability: 20, order: 3 },
        { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Merci !", color: "#10b981", type: "no-prize", probability: 15, order: 4 },
        { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Café offert", color: "#3b82f6", type: "prize", probability: 15, order: 5 },
        { id: crypto.randomUUID(), establishmentId: newEstablishment.id, title: "Merci !", color: "#ef4444", type: "no-prize", probability: 5, order: 6 },
      ];

      await dbStorage.saveSegments(newEstablishment.id, defaultSegments);

      try {
        await authService.signUp(formData.email, formData.password, "merchant", newEstablishment.id);
        router.push("/admin");
      } catch (authError: any) {
        console.error("Auth error:", authError);
        setErrors({ submit: authError.message || "Erreur lors de la création du compte. Veuillez réessayer." });
      }
    } catch (error: any) {
      console.error("Error creating establishment:", error);
      setErrors({ submit: error.message || "Erreur lors de la création de l'établissement. Veuillez réessayer." });
    }
  };

  return (
    <>
      <SEO title="Nouvel établissement - Prizmo" description="Créez votre établissement" />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Button onClick={() => router.push("/admin")} variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold prizmo-text-gradient mb-2">Nouvel établissement</h1>
            <p className="text-gray-500">Configurez votre roue de la fortune en quelques étapes</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center mb-8 gap-0">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center w-16">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isCompleted ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg" :
                      isActive ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-110" :
                      "bg-gray-100 text-gray-400"
                    }`}>
                      {isCompleted ? "✓" : <Icon className="w-4 h-4" />}
                    </div>
                    <p className={`text-xs font-semibold mt-2 text-center ${
                      isActive ? "text-purple-600" : isCompleted ? "text-purple-400" : "text-gray-400"
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 transition-all duration-300 ${currentStep > step.id ? "bg-gradient-to-r from-purple-600 to-pink-600" : "bg-gray-200"}`}
                      style={{ width: "32px" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <Card className="border-2 shadow-xl">
            <CardContent className="p-8">

              {/* ÉTAPE 1 - Identité */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Store className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Votre établissement</h2>
                    <p className="text-gray-500 text-sm mt-1">Recherchez votre établissement</p>
                  </div>

                  <div className="space-y-2" ref={autocompleteRef}>
                    <Label htmlFor="name">Votre établissement *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="name"
                        placeholder="Ex: Le Petit Bistrot, Paris..."
                        value={searchInput}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                        autoComplete="off"
                      />
                      {isLoadingSuggestions && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-50 w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-xl mt-1 overflow-hidden">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.place_id}
                            onClick={() => handleSelectPlace(suggestion)}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-0"
                          >
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-sm">{suggestion.structured_formatting.main_text}</p>
                              <p className="text-xs text-gray-500">{suggestion.structured_formatting.secondary_text}</p>
                            </div>
                          </button>
                        ))}
                        <div className="flex justify-end px-4 py-2 bg-gray-50">
                          <img src="https://developers.google.com/static/maps/documentation/images/google_on_white.png" alt="Powered by Google" className="h-4" />
                        </div>
                      </div>
                    )}

                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}

                    {/* Confirmation sélection */}
                    {formData.placeId && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-green-800">{formData.name}</p>
                          <p className="text-xs text-green-600">{formData.address}</p>
                        </div>
                      </div>
                    )}
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
                    {formData.placeId && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <p className="text-xs font-medium">Lien détecté automatiquement via Google Places ✨</p>
                      </div>
                    )}
                    {errors.googleMapsUrl && <p className="text-sm text-red-500">{errors.googleMapsUrl}</p>}
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

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Logo principal *</Label>
                      <div className="flex gap-4 items-start">
                        <label className="flex-1 cursor-pointer">
                          <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                            uploadingPrimaryLogo ? "border-purple-400 bg-purple-50" : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                          }`}>
                            {uploadingPrimaryLogo ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-gray-600">Upload en cours...</p>
                              </div>
                            ) : formData.logo_url ? (
                              <div className="flex flex-col items-center gap-2">
                                <ImageIcon className="w-8 h-8 text-green-600" />
                                <p className="text-sm text-green-600 font-semibold">✓ Logo uploadé</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-gray-400" />
                                <p className="text-sm text-gray-600">Cliquez pour uploader</p>
                                <p className="text-xs text-gray-400">JPG, PNG, WEBP, SVG (max 2MB)</p>
                              </div>
                            )}
                          </div>
                          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml" onChange={handlePrimaryLogoUpload} className="hidden" disabled={uploadingPrimaryLogo} />
                        </label>
                        {formData.logo_url && (
                          <div className="w-24 h-24 border-2 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                            <img src={formData.logo_url} alt="Logo principal" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                      {errors.logo_url && <p className="text-sm text-red-500">{errors.logo_url}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Logo secondaire (optionnel)</Label>
                      <div className="flex gap-4 items-start">
                        <label className="flex-1 cursor-pointer">
                          <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                            uploadingSecondaryLogo ? "border-purple-400 bg-purple-50" : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                          }`}>
                            {uploadingSecondaryLogo ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-gray-600">Upload en cours...</p>
                              </div>
                            ) : formData.logo_secondary_url ? (
                              <div className="flex flex-col items-center gap-2">
                                <ImageIcon className="w-8 h-8 text-green-600" />
                                <p className="text-sm text-green-600 font-semibold">✓ Logo uploadé</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-gray-400" />
                                <p className="text-sm text-gray-600">Cliquez pour uploader</p>
                                <p className="text-xs text-gray-400">JPG, PNG, WEBP, SVG (max 2MB)</p>
                              </div>
                            )}
                          </div>
                          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml" onChange={handleSecondaryLogoUpload} className="hidden" disabled={uploadingSecondaryLogo} />
                        </label>
                        {formData.logo_secondary_url && (
                          <div className="w-24 h-24 border-2 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                            <img src={formData.logo_secondary_url} alt="Logo secondaire" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label>Couleur du logo</Label>
                      <div className="flex gap-3 items-center">
                        <input type="color" value={formData.primaryColor} onChange={(e) => handleChange("primaryColor", e.target.value)} className="w-14 h-14 rounded-xl cursor-pointer border-2 border-gray-200" />
                        <Input value={formData.primaryColor} onChange={(e) => handleChange("primaryColor", e.target.value)} placeholder="#8b5cf6" className="font-mono text-sm" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Couleur de fond</Label>
                      <div className="flex gap-3 items-center">
                        <input type="color" value={formData.secondaryColor} onChange={(e) => handleChange("secondaryColor", e.target.value)} className="w-14 h-14 rounded-xl cursor-pointer border-2 border-gray-200" />
                        <Input value={formData.secondaryColor} onChange={(e) => handleChange("secondaryColor", e.target.value)} placeholder="#d946ef" className="font-mono text-sm" />
                      </div>
                    </div>
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
                      <span className="text-sm text-gray-500">🏪 Établissement</span>
                      <span className="font-semibold text-sm">{formData.name}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-500">📍 Adresse</span>
                      <span className="font-semibold text-sm text-right max-w-48">{formData.address}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-500">🗺️ Google Maps</span>
                      <span className="font-semibold text-sm text-green-600">✓ Détecté automatiquement</span>
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
                  </div>
                </div>
              )}

              {/* ÉTAPE 5 - Compte */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Créez votre compte</h2>
                    <p className="text-gray-500 text-sm mt-1">Accédez à votre dashboard</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="votre@email.com" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className={errors.email ? "border-red-500" : ""} />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} className={errors.password ? "border-red-500" : ""} />
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    <p className="text-xs text-gray-400">Minimum 6 caractères</p>
                  </div>

                  {errors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                  )}
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

                {currentStep < 5 ? (
                  <Button onClick={nextStep} className="px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
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