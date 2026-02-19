import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService, UserProfile } from "@/services/authService";
import { useRouter } from "next/router";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  canAccessEstablishment: (establishmentId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load user profile on mount
    const loadUser = async () => {
      try {
        const profile = await authService.getUserProfile();
        setUser(profile);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Subscribe to auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (session) => {
      if (session) {
        const profile = await authService.getUserProfile();
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
      const profile = await authService.getUserProfile();
      setUser(profile);

      // Redirect based on role
      if (profile?.role === "superadmin") {
        router.push("/admin");
      } else if (profile?.role === "merchant" && profile.establishmentId) {
        router.push(`/admin/establishment/${profile.establishmentId}`);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const canAccessEstablishment = (establishmentId: string): boolean => {
    if (!user) return false;
    if (user.role === "superadmin") return true;
    return user.establishmentId === establishmentId;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, canAccessEstablishment }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}