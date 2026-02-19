import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: "superadmin" | "merchant";
  establishmentId?: string;
}

export function ProtectedRoute({ children, requireRole, establishmentId }: ProtectedRouteProps) {
  const { user, loading, canAccessEstablishment } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    // Not authenticated - redirect to login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Check role requirements
    if (requireRole && user.role !== requireRole && user.role !== "superadmin") {
      // Merchants can only access their own establishment
      if (user.role === "merchant" && user.establishmentId) {
        router.replace(`/admin/establishment/${user.establishmentId}`);
      } else {
        router.replace("/login");
      }
      return;
    }

    // Check establishment access
    if (establishmentId && !canAccessEstablishment(establishmentId)) {
      // Redirect merchant to their own establishment
      if (user.role === "merchant" && user.establishmentId) {
        router.replace(`/admin/establishment/${user.establishmentId}`);
      } else {
        router.replace("/admin");
      }
      return;
    }

    setChecking(false);
  }, [user, loading, requireRole, establishmentId, router, canAccessEstablishment]);

  // Show loading state
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="mt-4 text-sm text-muted-foreground">Vérification...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}