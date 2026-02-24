import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Client Admin avec Service Role Key (contourne RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { establishmentId } = await req.json();

    if (!establishmentId) {
      throw new Error("establishmentId is required");
    }

    console.log(`Starting deletion for establishment: ${establishmentId}`);

    // 1. Récupère le profil
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("establishment_id", establishmentId)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found or error:", profileError);
      // On continue ou on arrête ? La demande implique l'utilisation du profileId pour les étapes 7 et 8.
      // Si pas de profil, on ne peut pas faire 7 et 8 correctement.
      throw new Error("Profile not found for this establishment");
    }

    // 2. Stocke ce profileId
    const profileId = profile.id;
    console.log(`Found Profile ID: ${profileId}`);

    // 3. Supprime les participants
    const { error: participantsError } = await supabaseAdmin
      .from("participants")
      .delete()
      .eq("establishment_id", establishmentId);
    
    if (participantsError) console.error("Error deleting participants:", participantsError);

    // 4. Supprime les segments
    const { error: segmentsError } = await supabaseAdmin
      .from("segments")
      .delete()
      .eq("establishment_id", establishmentId);
    
    if (segmentsError) console.error("Error deleting segments:", segmentsError);

    // 5. Supprime les logos dans le storage bucket establishment-logos
    const { data: files } = await supabaseAdmin.storage
      .from("establishment-logos")
      .list(establishmentId);

    if (files && files.length > 0) {
      const paths = files.map(file => `${establishmentId}/${file.name}`);
      const { error: storageError } = await supabaseAdmin.storage
        .from("establishment-logos")
        .remove(paths);
      
      if (storageError) console.error("Error deleting logos:", storageError);
    }

      // 6. Supprime le profil (AVANT l'établissement pour éviter les contraintes FK)
      const { error: deleteProfileError } = await supabaseAdmin
          .from("profiles")
          .delete()
          .eq("id", profileId);

      if (deleteProfileError) console.error("Error deleting profile:", deleteProfileError);

      // 7. Supprime l'utilisateur Auth
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(profileId);

      if (deleteUserError) console.error("Error deleting auth user:", deleteUserError);

      // 8. Supprime l'établissement (EN DERNIER, une fois le profil libéré)
      const { error: establishmentError } = await supabaseAdmin
          .from("establishments")
          .delete()
          .eq("id", establishmentId);

      if (establishmentError) {
          throw establishmentError;
      }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in delete-establishment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});