import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

export default function LoginPage() {
    const { signIn, loading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState < string | null > (null);

    // Effet 3D
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
    const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Veuillez remplir tous les champs");
            return;
        }
        try {
            const redirect = router.query.redirect as string | undefined;
            await signIn(email, password, redirect);
        } catch (err: any) {
            setError(err.message || "Email ou mot de passe incorrect");
        }
    };

    return (
        <>
            <SEO
                title="Connexion - Prizmo"
                description="Connectez-vous à votre espace administrateur Prizmo"
            />

            <div className="min-h-screen w-full bg-black relative overflow-hidden flex items-center justify-center">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-600/40 via-purple-800/50 to-black" />

                {/* Top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-purple-400/20 blur-[80px]" />
                <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-purple-300/20 blur-[60px]"
                    animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.98, 1.02, 0.98] }}
                    transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
                />
                <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-purple-500/20 blur-[60px]"
                    animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
                    transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", delay: 1 }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-sm relative z-10 px-4"
                    style={{ perspective: 1500 }}
                >
                    <motion.div
                        style={{ rotateX, rotateY }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="relative group">
                            {/* Light beam border */}
                            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
                                {/* Top beam */}
                                <motion.div
                                    className="absolute top-0 left-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                                    animate={{ left: ["-50%", "100%"] }}
                                    transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                                />
                                {/* Right beam */}
                                <motion.div
                                    className="absolute top-0 right-0 h-[50%] w-[2px] bg-gradient-to-b from-transparent via-purple-400 to-transparent"
                                    animate={{ top: ["-50%", "100%"] }}
                                    transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 }}
                                />
                                {/* Bottom beam */}
                                <motion.div
                                    className="absolute bottom-0 right-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                                    animate={{ right: ["-50%", "100%"] }}
                                    transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 }}
                                />
                                {/* Left beam */}
                                <motion.div
                                    className="absolute bottom-0 left-0 h-[50%] w-[2px] bg-gradient-to-b from-transparent via-purple-400 to-transparent"
                                    animate={{ bottom: ["-50%", "100%"] }}
                                    transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 }}
                                />
                            </div>

                            {/* Glass card */}
                            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.07] shadow-2xl">

                                {/* Logo Prizmo */}
                                <div className="text-center mb-6">
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", duration: 0.8 }}
                                        className="mx-auto mb-4"
                                    >
                                        <Link href="/">
                                            <img src="/LOGO.svg" alt="Prizmo" className="h-10 mx-auto brightness-0 invert" />
                                        </Link>
                                    </motion.div>
                                    <motion.h1
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-xl font-bold text-white"
                                    >
                                        Bon retour 👋
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-white/50 text-xs mt-1"
                                    >
                                        Connectez-vous à votre espace Prizmo
                                    </motion.p>
                                </div>

                                {/* Formulaire */}
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    {error && (
                                        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-xs">{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Email */}
                                    <motion.div
                                        className="relative"
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div className="relative flex items-center rounded-lg overflow-hidden">
                                            <Mail className={`absolute left-3 w-4 h-4 transition-colors duration-300 ${focusedInput === "email" ? "text-purple-400" : "text-white/30"}`} />
                                            <input
                                                type="email"
                                                placeholder="votre@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => setFocusedInput("email")}
                                                onBlur={() => setFocusedInput(null)}
                                                disabled={loading}
                                                autoComplete="email"
                                                className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 text-white placeholder:text-white/25 h-10 pl-10 pr-3 text-sm rounded-lg outline-none transition-all duration-300 focus:bg-white/8"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Password */}
                                    <motion.div
                                        className="relative"
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div className="relative flex items-center rounded-lg overflow-hidden">
                                            <Lock className={`absolute left-3 w-4 h-4 transition-colors duration-300 ${focusedInput === "password" ? "text-purple-400" : "text-white/30"}`} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onFocus={() => setFocusedInput("password")}
                                                onBlur={() => setFocusedInput(null)}
                                                disabled={loading}
                                                autoComplete="current-password"
                                                className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 text-white placeholder:text-white/25 h-10 pl-10 pr-10 text-sm rounded-lg outline-none transition-all duration-300 focus:bg-white/8"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 text-white/30 hover:text-white/70 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </motion.div>

                                    {/* Submit */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="w-full relative mt-2 group/btn"
                                    >
                                        <div className="absolute inset-0 bg-purple-500/30 rounded-lg blur-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold h-10 rounded-lg flex items-center justify-center text-sm overflow-hidden">
                                            <AnimatePresence mode="wait">
                                                {loading ? (
                                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                                                        Se connecter
                                                        <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform duration-300" />
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.button>
                                </form>

                                {/* Footer */}
                                <div className="mt-5 text-center space-y-2">
                                    <Link href="/admin/establishment/new" className="block text-xs text-white/40 hover:text-white/70 transition-colors">
                                        Pas encore de compte ? <span className="text-purple-400 font-medium">Essai gratuit 21 jours →</span>
                                    </Link>
                                    <Link href="/" className="block text-xs text-white/25 hover:text-white/50 transition-colors">
                                        ← Retour à l'accueil
                                    </Link>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}