import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storageService } from "@/lib/storage";
import { Establishment } from "@/types";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AdminDashboard() {
  const router = useRouter();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState < Establishment | null > (null);
  const [establishmentToDelete, setEstablishmentToDelete] = useState < Establishment | null > (null);

  useEffect(() => {
    // Charger les établissements
    storageService.initializeDemoData();
    const data = storageService.getEstablishments();
    setEstablishments(data);
  }, []);

  const handleCreateNew = () => {
    router.push("/admin/establishment/new");
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/establishment/${id}`);
  };

    const handleDelete = (establishment: Establishment) => {
        setEstablishmentToDelete(establishment);
    };

    const confirmDelete = () => {
        if (!establishmentToDelete) return;
        storageService.deleteEstablishment(establishmentToDelete.id);
        setEstablishments(establishments.filter(e => e.id !== establishmentToDelete.id));
        setEstablishmentToDelete(null);
    };


  return (
    <>
      <SEO 
        title="Dashboard Admin - Prizmo"
        description="Gérez vos établissements et leur roue de la fortune"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold prizmo-text-gradient">Prizmo Admin</h1>
              <Button onClick={() => router.push("/")} variant="outline">
                Retour accueil
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Quick Actions */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>Gérez vos établissements et leurs paramètres</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-4">
                <Button onClick={handleCreateNew} className="prizmo-gradient text-white h-auto py-4 flex-col gap-2">
                  <Plus className="w-6 h-6" />
                  Nouvel établissement
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Statistiques
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Users className="w-6 h-6" />
                  Base clients
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Settings className="w-6 h-6" />
                  Paramètres
                </Button>
              </CardContent>
            </Card>

            {/* Establishments List */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Mes établissements ({establishments.length})</CardTitle>
                <CardDescription>Gérez vos restaurants et leurs roues de la fortune</CardDescription>
              </CardHeader>
              <CardContent>
                {establishments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Aucun établissement créé</p>
                    <Button onClick={handleCreateNew} className="prizmo-gradient text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Créer mon premier établissement
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {establishments.map((establishment) => (
                      <Card key={establishment.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">{establishment.name}</CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {establishment.address}
                              </CardDescription>
                            </div>
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: establishment.primaryColor }}
                            >
                              <span className="text-2xl">🎡</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleEdit(establishment.id)}
                              variant="outline" 
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </Button>
                            <Button 
                              onClick={() => router.push(`/admin/establishment/${establishment.id}/qr`)}
                              variant="outline"
                              className="flex-1"
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              QR Code
                            </Button>
                          </div>
                          <Button 
                            onClick={() => router.push(`/game/${establishment.id}`)}
                            className="w-full"
                            variant="secondary"
                          >
                            Voir la page jeu
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}