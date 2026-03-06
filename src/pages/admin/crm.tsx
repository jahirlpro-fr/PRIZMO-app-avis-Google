import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Users, Store, TrendingUp, Clock, AlertTriangle, CheckCircle, XCircle, Search, Filter } from "lucide-react";

interface CRMEntry {
    id: string;
    email: string;
    created_at: string;
    plan: string | null;
    plan_status: string | null;
    trial_ends_at: string | null;
    current_period_ends_at: string | null;
    billing_cycle: string | null;
    establishment: {
        id: string;
        name: string;
        address: string;
    } | null;
    participants_count: number;
    loyalty_cards_count: number;
}

function getChurnRisk(entry: CRMEntry): "green" | "orange" | "red" {
    const now = new Date();

    if (entry.plan_status === "expired" || entry.plan_status === "cancelled") return "red";

    if (entry.plan === "trial" && entry.trial_ends_at) {
        const trialEnd = new Date(entry.trial_ends_at);
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 0) return "red";
        if (daysLeft <= 3) return "orange";
    }

    if (entry.participants_count === 0 && entry.loyalty_cards_count === 0) return "orange";

    return "green";
}

function getDaysLeft(dateStr: string | null): number | null {
    if (!dateStr) return null;
    const now = new Date();
    const end = new Date(dateStr);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function PlanBadge({ plan }: { plan: string | null }) {
    const styles: Record<string, string> = {
        trial: "bg-blue-100 text-blue-700",
        solo: "bg-purple-100 text-purple-700",
        pro: "bg-pink-100 text-pink-700",
        business: "bg-indigo-100 text-indigo-700",
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[plan || "trial"] || "bg-gray-100 text-gray-600"}`}>
            {(plan || "trial").toUpperCase()}
        </span>
    );
}

function StatusBadge({ status }: { status: string | null }) {
    if (status === "active") return (
        <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
            <CheckCircle className="w-3 h-3" /> Actif
        </span>
    );
    if (status === "expired") return (
        <span className="flex items-center gap-1 text-red-600 text-xs font-semibold">
            <XCircle className="w-3 h-3" /> Expiré
        </span>
    );
    if (status === "cancelled") return (
        <span className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
            <XCircle className="w-3 h-3" /> Annulé
        </span>
    );
    return <span className="text-gray-400 text-xs">—</span>;
}

function ChurnBadge({ risk }: { risk: "green" | "orange" | "red" }) {
    if (risk === "green") return <span className="text-lg" title="Faible risque">🟢</span>;
    if (risk === "orange") return <span className="text-lg" title="Risque modéré">🟡</span>;
    return <span className="text-lg" title="Risque élevé">🔴</span>;
}

export default function CRMPage() {
    const router = useRouter();
    const [entries, setEntries] = useState < CRMEntry[] > ([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterPlan, setFilterPlan] = useState("all");
    const [filterRisk, setFilterRisk] = useState("all");

    useEffect(() => {
        loadCRMData();
    }, []);

    const loadCRMData = async () => {
        setLoading(true);
        try {
            // Charger tous les profils marchands
            const { data: profiles } = await supabase
                .from("profiles")
                .select("*")
                .eq("role", "merchant")
                .order("created_at", { ascending: false });

            if (!profiles) { setLoading(false); return; }

            // Pour chaque profil, récupérer les données associées
            const enriched: CRMEntry[] = await Promise.all(
                profiles.map(async (profile) => {
                    // Établissement
                    let establishment = null;
                    if (profile.establishment_id) {
                        const { data: est } = await supabase
                            .from("establishments")
                            .select("id, name, address")
                            .eq("id", profile.establishment_id)
                            .single();
                        establishment = est;
                    }

                    // Participants
                    let participants_count = 0;
                    if (profile.establishment_id) {
                        const { count } = await supabase
                            .from("participants")
                            .select("*", { count: "exact", head: true })
                            .eq("establishment_id", profile.establishment_id);
                        participants_count = count || 0;
                    }

                    // Cartes fidélité
                    let loyalty_cards_count = 0;
                    if (profile.establishment_id) {
                        const { count } = await supabase
                            .from("loyalty_cards")
                            .select("*", { count: "exact", head: true })
                            .eq("establishment_id", profile.establishment_id);
                        loyalty_cards_count = count || 0;
                    }

                    return {
                        id: profile.id,
                        email: profile.email || "",
                        created_at: profile.created_at || "",
                        plan: profile.plan || "trial",
                        plan_status: profile.plan_status || "active",
                        trial_ends_at: profile.trial_ends_at || null,
                        current_period_ends_at: profile.current_period_ends_at || null,
                        billing_cycle: profile.billing_cycle || "monthly",
                        establishment,
                        participants_count,
                        loyalty_cards_count,
                    };
                })
            );

            setEntries(enriched);
        } catch (error) {
            console.error("Erreur chargement CRM:", error);
        }
        setLoading(false);
    };

    // Filtres
    const filtered = entries.filter((e) => {
        const matchSearch =
            e.email.toLowerCase().includes(search.toLowerCase()) ||
            (e.establishment?.name || "").toLowerCase().includes(search.toLowerCase());
        const matchPlan = filterPlan === "all" || e.plan === filterPlan;
        const risk = getChurnRisk(e);
        const matchRisk = filterRisk === "all" || risk === filterRisk;
        return matchSearch && matchPlan && matchRisk;
    });

    // KPIs globaux
    const totalMerchants = entries.length;
    const activeTrials = entries.filter(e => e.plan === "trial" && e.plan_status === "active").length;
    const paidPlans = entries.filter(e => e.plan !== "trial" && e.plan_status === "active").length;
    const atRisk = entries.filter(e => getChurnRisk(e) === "red").length;

    return (
        <ProtectedRoute requireRole="superadmin">
            <SEO title="CRM Commerçants - Prizmo Admin" description="Suivi des commerçants Prizmo" />

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Header */}
                <header className="bg-white border-b shadow-sm sticky top-0 z-50">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button onClick={() => router.push("/admin")} variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Retour
                            </Button>
                            <h1 className="text-2xl font-bold prizmo-text-gradient">CRM Commerçants</h1>
                        </div>
                        <Button onClick={loadCRMData} variant="outline" size="sm">
                            Actualiser
                        </Button>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-8 space-y-6">

                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="border-2">
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Users className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{totalMerchants}</p>
                                        <p className="text-xs text-gray-500">Commerçants total</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2">
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{activeTrials}</p>
                                        <p className="text-xs text-gray-500">En essai gratuit</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2">
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{paidPlans}</p>
                                        <p className="text-xs text-gray-500">Abonnés payants</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2">
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{atRisk}</p>
                                        <p className="text-xs text-gray-500">À risque 🔴</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filtres */}
                    <Card className="border-2">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex flex-col md:flex-row gap-3">
                                {/* Recherche */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher par email ou établissement..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    />
                                </div>

                                {/* Filtre plan */}
                                <select
                                    value={filterPlan}
                                    onChange={(e) => setFilterPlan(e.target.value)}
                                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                >
                                    <option value="all">Tous les plans</option>
                                    <option value="trial">Trial</option>
                                    <option value="solo">Solo</option>
                                    <option value="pro">Pro</option>
                                    <option value="business">Business</option>
                                </select>

                                {/* Filtre risque */}
                                <select
                                    value={filterRisk}
                                    onChange={(e) => setFilterRisk(e.target.value)}
                                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                >
                                    <option value="all">Tous les risques</option>
                                    <option value="green">🟢 Faible</option>
                                    <option value="orange">🟡 Modéré</option>
                                    <option value="red">🔴 Élevé</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table CRM */}
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="w-5 h-5" />
                                Suivi des commerçants ({filtered.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-12 text-gray-400">Chargement...</div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">Aucun commerçant trouvé</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="text-left p-3 font-semibold text-gray-600">Établissement</th>
                                                <th className="text-left p-3 font-semibold text-gray-600">Email</th>
                                                <th className="text-left p-3 font-semibold text-gray-600">Inscrit le</th>
                                                <th className="text-left p-3 font-semibold text-gray-600">Plan</th>
                                                <th className="text-left p-3 font-semibold text-gray-600">Statut</th>
                                                <th className="text-left p-3 font-semibold text-gray-600">Fin essai</th>
                                                <th className="text-left p-3 font-semibold text-gray-600">🎡 Participants</th>
                                                <th className="text-left p-3 font-semibold text-gray-600">🃏 Cartes</th>
                                                <th className="text-left p-3 font-semibold text-gray-600">Risque</th>
                                                <th className="text-left p-3 font-semibold text-gray-600">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((entry) => {
                                                const daysLeft = getDaysLeft(entry.trial_ends_at);
                                                const risk = getChurnRisk(entry);
                                                return (
                                                    <tr key={entry.id} className="border-b hover:bg-gray-50 transition-colors">
                                                        <td className="p-3">
                                                            <div className="font-semibold text-gray-800">
                                                                {entry.establishment?.name || "—"}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {entry.establishment?.address || ""}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-gray-600">{entry.email}</td>
                                                        <td className="p-3 text-gray-500">
                                                            {entry.created_at
                                                                ? new Date(entry.created_at)