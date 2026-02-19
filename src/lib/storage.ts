import { Establishment, WheelSegment, Participant } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Generate URL-friendly slug from establishment name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

// Helper to convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export const storageService = {
  // Establishments
  async getEstablishments(): Promise<Establishment[]> {
    try {
      const { data, error } = await supabase
        .from("establishments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching establishments:", error);
        return [];
      }

      return toCamelCase(data || []);
    } catch (error) {
      console.error("Exception in getEstablishments:", error);
      return [];
    }
  },

  async getEstablishmentById(id: string): Promise<Establishment | null> {
    try {
      const { data, error } = await supabase
        .from("establishments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching establishment by id:", error);
        return null;
      }

      return toCamelCase(data);
    } catch (error) {
      console.error("Exception in getEstablishmentById:", error);
      return null;
    }
  },

  async saveEstablishment(establishment: Establishment): Promise<void> {
    try {
      // Generate slug if not provided
      if (!establishment.slug) {
        establishment.slug = generateSlug(establishment.name);
      }

      const snakeData = toSnakeCase(establishment);

      const { error } = await supabase
        .from("establishments")
        .upsert(snakeData, { onConflict: "id" });

      if (error) {
        console.error("Error saving establishment:", error);
        throw error;
      }
    } catch (error) {
      console.error("Exception in saveEstablishment:", error);
      throw error;
    }
  },

  async deleteEstablishment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("establishments")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting establishment:", error);
        throw error;
      }
    } catch (error) {
      console.error("Exception in deleteEstablishment:", error);
      throw error;
    }
  },

  async getEstablishmentBySlug(slug: string): Promise<Establishment | null> {
    try {
      const { data, error } = await supabase
        .from("establishments")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Error fetching establishment by slug:", error);
        return null;
      }

      return toCamelCase(data);
    } catch (error) {
      console.error("Exception in getEstablishmentBySlug:", error);
      return null;
    }
  },

  // Wheel Segments
  async getSegments(establishmentId: string): Promise<WheelSegment[]> {
    try {
      const { data, error } = await supabase
        .from("segments")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("order", { ascending: true });

      if (error) {
        console.error("Error fetching segments:", error);
        return [];
      }

      return toCamelCase(data || []);
    } catch (error) {
      console.error("Exception in getSegments:", error);
      return [];
    }
  },

  async saveSegments(establishmentId: string, segments: WheelSegment[]): Promise<void> {
    try {
      // Delete existing segments for this establishment
      const { error: deleteError } = await supabase
        .from("segments")
        .delete()
        .eq("establishment_id", establishmentId);

      if (deleteError) {
        console.error("Error deleting old segments:", deleteError);
        throw deleteError;
      }

      // Insert new segments
      if (segments.length > 0) {
        const snakeData = toSnakeCase(segments);
        
        const { error: insertError } = await supabase
          .from("segments")
          .insert(snakeData);

        if (insertError) {
          console.error("Error inserting segments:", insertError);
          throw insertError;
        }
      }
    } catch (error) {
      console.error("Exception in saveSegments:", error);
      throw error;
    }
  },

  // Participants
  async getParticipants(establishmentId: string): Promise<Participant[]> {
    try {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching participants:", error);
        return [];
      }

      return toCamelCase(data || []);
    } catch (error) {
      console.error("Exception in getParticipants:", error);
      return [];
    }
  },

  async getParticipantByEmail(establishmentId: string, email: string): Promise<Participant | null> {
    try {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("establishment_id", establishmentId)
        .ilike("email", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows found
          return null;
        }
        console.error("Error fetching participant by email:", error);
        return null;
      }

      return toCamelCase(data);
    } catch (error) {
      console.error("Exception in getParticipantByEmail:", error);
      return null;
    }
  },

  async saveParticipant(participant: Participant): Promise<void> {
    try {
      const snakeData = toSnakeCase(participant);

      const { error } = await supabase
        .from("participants")
        .upsert(snakeData, { onConflict: "id" });

      if (error) {
        console.error("Error saving participant:", error);
        throw error;
      }
    } catch (error) {
      console.error("Exception in saveParticipant:", error);
      throw error;
    }
  },

  // Initialize demo data (for first use)
  async initializeDemoData(): Promise<void> {
    try {
      const establishments = await this.getEstablishments();
      
      if (establishments.length === 0) {
        const demoEstablishment: Establishment = {
          id: "demo-restaurant",
          name: "Restaurant Demo",
          slug: "demo-restaurant",
          address: "123 Rue de la Gastronomie, Paris",
          googleMapsUrl: "https://www.google.com/maps",
          instagramUrl: "https://www.instagram.com",
          primaryColor: "#8b5cf6",
          secondaryColor: "#d946ef",
          enableInstagramWheel: true,
          createdAt: new Date().toISOString(),
        };
        
        await this.saveEstablishment(demoEstablishment);

        const demoSegments: WheelSegment[] = [
          { id: "1", establishmentId: "demo-restaurant", title: "Boisson maison offerte", color: "#8b5cf6", type: "prize", probability: 25, order: 1 },
          { id: "2", establishmentId: "demo-restaurant", title: "Merci !", color: "#ec4899", type: "no-prize", probability: 20, order: 2 },
          { id: "3", establishmentId: "demo-restaurant", title: "Dessert offert", color: "#f59e0b", type: "prize", probability: 20, order: 3 },
          { id: "4", establishmentId: "demo-restaurant", title: "Merci !", color: "#10b981", type: "no-prize", probability: 15, order: 4 },
          { id: "5", establishmentId: "demo-restaurant", title: "Café offert", color: "#3b82f6", type: "prize", probability: 15, order: 5 },
          { id: "6", establishmentId: "demo-restaurant", title: "Merci !", color: "#ef4444", type: "no-prize", probability: 5, order: 6 },
        ];
        
        await this.saveSegments("demo-restaurant", demoSegments);
      }
    } catch (error) {
      console.error("Exception in initializeDemoData:", error);
    }
  },
};