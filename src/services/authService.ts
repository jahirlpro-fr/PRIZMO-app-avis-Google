import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  role: "superadmin" | "merchant";
  establishmentId: string | null;
  createdAt: string;
}

export const authService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp(email: string, password: string, role: "superadmin" | "merchant", establishmentId?: string) {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (authError) {
        console.error("Auth signup error:", authError);
        
        // Handle specific Supabase auth errors with user-friendly messages
        if (authError.message.includes("User already registered")) {
          throw new Error("Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.");
        }
        if (authError.message.includes("invalid") || authError.message.includes("Invalid")) {
          throw new Error("Format d'email invalide. Veuillez vérifier votre adresse email.");
        }
        if (authError.message.includes("weak password") || authError.message.includes("Password")) {
          throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
        }
        
        // Generic error fallback
        throw new Error(authError.message || "Erreur lors de la création du compte. Veuillez réessayer.");
      }

      if (!authData.user) {
        throw new Error("Aucun utilisateur retourné après l'inscription.");
      }

      // 2. Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          email,
          role,
          establishment_id: establishmentId || null,
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw new Error("Erreur lors de la création du profil utilisateur.");
      }

      return { user: authData.user, session: authData.session };
    } catch (error) {
      console.error("Exception in signUp:", error);
      throw error;
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Exception in signIn:", error);
      throw error;
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Exception in signOut:", error);
      throw error;
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Get session error:", error);
        return null;
      }
      return data.session;
    } catch (error) {
      console.error("Exception in getSession:", error);
      return null;
    }
  },

  /**
   * Get current user profile with role
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const session = await this.getSession();
      if (!session?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Get profile error:", error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        role: data.role,
        establishmentId: data.establishment_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error("Exception in getUserProfile:", error);
      return null;
    }
  },

  /**
   * Check if user has access to a specific establishment
   */
  async canAccessEstablishment(establishmentId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) {
        return false;
      }

      // Superadmin has access to all establishments
      if (profile.role === "superadmin") {
        return true;
      }

      // Merchant can only access their own establishment
      return profile.establishmentId === establishmentId;
    } catch (error) {
      console.error("Exception in canAccessEstablishment:", error);
      return false;
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },
};