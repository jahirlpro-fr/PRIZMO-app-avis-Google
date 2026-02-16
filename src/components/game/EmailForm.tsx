import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Sparkles } from "lucide-react";

interface EmailFormProps {
  onSubmit: (email: string, phone: string) => void;
  establishmentName: string;
}

export function EmailForm({ onSubmit, establishmentName }: EmailFormProps) {
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

    if (!phone || !/^[\d\s+()-]{10,}$/.test(phone)) {
      newErrors.phone = "Veuillez entrer un numéro de téléphone valide";
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 prizmo-gradient">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
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
                className={errors.email ? "border-red-500" : ""}
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
                onChange={(e) => setPhone(e.target.value)}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <Button type="submit" className="w-full prizmo-gradient text-white text-lg font-semibold py-6">
              Continuer vers le jeu 🎲
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