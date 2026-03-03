import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";

interface EmailFormProps {
    onSubmit: (email: string, phone: string) => void;
    establishmentName: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
}

export function EmailForm({ onSubmit, establishmentName, logoUrl, primaryColor = "#8b5cf6", secondaryColor = "#ffffff" }: EmailFormProps) {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [errors, setErrors] = useState({ email: "", phone: "" });

    const validateForm = () => {
        const newErrors = { email: "", phone: "" };
        let isValid = true;

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Veuillez entrer une adresse email valide";
            isValid = false;
        }

        const digitsOnly = phone.replace(/\D/g, "");
        if (digitsOnly.length !== 10) {
            newErrors.phone = "Veuillez entrer un numéro valide (10 chiffres)";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(email, phone);
        }
    };

    // Calcule si la couleur est claire ou foncée pour le filtre du logo
    const isLightColor = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000 > 128;
    };

    const logoFilter = primaryColor === "#ffffff" || isLightColor(primaryColor)
        ? "brightness(0) invert(1)"
        : "brightness(0)";

    return (
        <div className="min-h-screen flex items-center justify-center p-4 prizmo-gradient">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    {/* Logo ou icône par défaut */}
                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 overflow-hidden"
                        style={{ backgroundColor: logoUrl ? "transparent" : `${primaryColor}33` }}
                    >
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={`Logo ${establishmentName}`}
                                className="w-full h-full object-contain"
                                style={{ filter: logoFilter }}
                            />
                        ) : (
                            <span className="text-3xl">🎡</span>
                        )}
                    </div>
                    <CardTitle className="text-3xl">Bienvenue chez {establishmentName} !</CardTitle>
                    <CardDescription className="text-base">
                        Laissez-nous un avis Google et tentez de gagner un cadeau en tournant la roue de la fortune ! 🎁
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Adresse email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={errors.email ? "border-red-500" : "border-black"}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Numéro de téléphone
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+33 6 12 34 56 78"
                                value={phone}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const digits = val.replace(/[\s+()-]/g, "");
                                    if (digits.length <= 15) setPhone(val);
                                }}
                                className={errors.phone ? "border-red-500" : "border-black"}
                            />
                            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white text-xl font-bold py-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                            🎲 Commencer le jeu !
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            En participant, vous acceptez de recevoir des communications commerciales de notre part.
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}