import { supabase } from "@/integrations/supabase/client";

/**
 * Service for managing file uploads to Supabase Storage
 */
export const storageService = {
  /**
   * Upload a logo file to Supabase Storage
   * @param file - The file to upload
   * @param establishmentId - The establishment ID for organizing files
   * @param type - Type of logo (primary or secondary)
   * @returns The public URL of the uploaded file
   */
  async uploadLogo(
    file: File,
    establishmentId: string,
    type: "primary" | "secondary"
  ): Promise<string> {
    try {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Format de fichier invalide. Utilisez JPG, PNG, WEBP ou SVG.");
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error("Le fichier est trop volumineux. Taille maximale : 2MB.");
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${establishmentId}/${type}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("logos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        console.error("Storage upload error:", error);
        throw new Error("Erreur lors de l'upload du fichier.");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("logos")
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Exception in uploadLogo:", error);
      throw error;
    }
  },

  /**
   * Delete a logo file from Supabase Storage
   * @param url - The public URL of the file to delete
   */
  async deleteLogo(url: string): Promise<void> {
    try {
      // Extract path from URL
      const urlParts = url.split("/logos/");
      if (urlParts.length < 2) {
        throw new Error("URL invalide");
      }
      const path = urlParts[1];

      const { error } = await supabase.storage.from("logos").remove([path]);

      if (error) {
        console.error("Storage delete error:", error);
        throw new Error("Erreur lors de la suppression du fichier.");
      }
    } catch (error) {
      console.error("Exception in deleteLogo:", error);
      throw error;
    }
  },
};