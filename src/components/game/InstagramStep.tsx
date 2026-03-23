import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram } from "lucide-react";

interface SocialNetwork {
    name: string;
    url: string;
    enabled: boolean;
}

interface SocialStepProps {
    establishmentName: string;
    networks: SocialNetwork[];
    onDone: () => void;
    onSkip: () => void;
    secondaryColor?: string;
}

interface InstagramStepProps {
    instagramUrl: string;
    establishmentName: string;
    onFollowConfirmed: () => void;
    onSkip: () => void;
    secondaryColor?: string;
}

export function ProgressBar({ step, hasNetworks }: { step: 1 | 2 | 3, hasNetworks?: boolean }) {
    const steps = [
        { id: 1, label: "Avis Google" },
        { id: 2, label: "Réseaux", hidden: !hasNetworks },
        { id: 3, label: "Jeu" },
    ].filter(s => !s.hidden);

    return (
        <div className="flex items-center justify-center gap-0 mb-6 px-4">
            {steps.map((s, index) => (
                <div key={s.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step > s.id
                            ? "bg-green-500 text-white"
                            : step === s.id
                                ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                                : "bg-white opacity-50 text-gray-400"
                            }`}>
                            {step > s.id ? "✓" : s.id}
                        </div>
                        <span className={`text-xs mt-1 font-medium ${step >= s.id ? "text-white" : "text-white opacity-60"}`}>
                            {s.label}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`w-12 h-1 mb-4 mx-1 rounded transition-all duration-300 ${step > s.id ? "bg-green-400" : "bg-white opacity-30"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

function getNetworkConfig(name: string) {
    switch (name) {
        case "instagram":
            return {
                label: "Instagram",
                emoji: "📸",
                gradient: "from-purple-500 via-pink-500 to-orange-400",
                hoverGradient: "hover:from-purple-600 hover:via-pink-600 hover:to-orange-500",
                icon: <Instagram className="w-6 h-6 mr-2" />,
                bgIcon: "from-purple-500 via-pink-500 to-orange-400",
            };
        case "tiktok":
            return {
                label: "TikTok",
                emoji: "🎵",
                gradient: "from-gray-900 via-gray-800 to-black",
                hoverGradient: "hover:from-black hover:via-gray-900 hover:to-gray-800",
                icon: <span className="mr-2 text-lg">🎵</span>,
                bgIcon: "from-gray-900 to-black",
            };
        case "snapchat":
            return {
                label: "Snapchat",
                emoji: "👻",
                gradient: "from-yellow-300 via-yellow-400 to-yellow-500",
                hoverGradient: "hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-600",
                icon: <span className="mr-2 text-lg">👻</span>,
                bgIcon: "from-yellow-300 to-yellow-500",
            };
        case "facebook":
            return {
                label: "Facebook",
                emoji: "👍",
                gradient: "from-blue-600 via-blue-500 to-blue-700",
                hoverGradient: "hover:from-blue-700 hover:via-blue-600 hover:to-blue-800",
                icon: <span className="mr-2 text-lg">👍</span>,
                bgIcon: "from-blue-600 to-blue-700",
            };
        default:
            return {
                label: name,
                emoji: "🔗",
                gradient: "from-purple-500 to-pink-500",
                hoverGradient: "hover:from-purple-600 hover:to-pink-600",
                icon: <span className="mr-2">🔗</span>,
                bgIcon: "from-purple-500 to-pink-500",
            };
    }
}

export function SocialStep({ establishmentName, networks, onDone, onSkip }: SocialStepProps) {
    const activeNetworks = networks.filter(n => n.enabled && n.url);

    const handleOpen = (url: string) => {
        window.open(url, "_blank");
    };

    const networkIcons = activeNetworks.map(n => getNetworkConfig(n.name).emoji).join(" ");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 prizmo-gradient">
            <ProgressBar step={2} hasNetworks={true} />
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center gap-2 mb-4">
                        {activeNetworks.map((network) => {
                            const config = getNetworkConfig(network.name);
                            return (
                                <div
                                    key={network.name}
                                    className={`w-14 h-14 bg-gradient-to-br ${config.bgIcon} rounded-full flex items-center justify-center shadow-lg`}
                                >
                                    <span className="text-2xl">{config.emoji}</span>
                                </div>
                            );
                        })}
                    </div>
                    <CardTitle className="text-3xl">Augmentez vos chances !</CardTitle>
                    <CardDescription className="text-base">
                        Abonnez-vous aux réseaux sociaux de {establishmentName} pour maximiser vos gains 🎁
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-purple-900 font-medium">
                            {networkIcons} Rejoignez notre communauté et ne manquez aucune offre exclusive !
                        </p>
                    </div>

                    {activeNetworks.map((network) => {
                        const config = getNetworkConfig(network.name);
                        return (
                            <Button
                                key={network.name}
                                onClick={() => handleOpen(network.url)}
                                className={`w-full bg-gradient-to-r ${config.gradient} ${config.hoverGradient} text-white text-lg font-bold py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
                            >
                                {config.icon}
                                S'abonner sur {config.label}
                            </Button>
                        );
                    })}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Puis revenez ici</span>
                        </div>
                    </div>

                    <Button
                        onClick={onDone}
                        variant="outline"
                        className="w-full border-2 border-green-600 text-green-700 hover:bg-green-50 text-lg font-bold py-6 shadow-lg transition-all duration-300"
                    >
                        ✅ Je suis abonné(e) !
                    </Button>

                    <div className="text-center">
                        <button
                            onClick={onSkip}
                            className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors"
                        >
                            Passer cette étape
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function InstagramStep({ instagramUrl, establishmentName, onFollowConfirmed, onSkip, secondaryColor = "#ffffff" }: InstagramStepProps) {
    return (
        <SocialStep
            establishmentName={establishmentName}
            networks={[{ name: "instagram", url: instagramUrl, enabled: true }]}
            onDone={onFollowConfirmed}
            onSkip={onSkip}
            secondaryColor={secondaryColor}
        />
    );
}