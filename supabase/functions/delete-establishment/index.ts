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

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

        const { establishmentId } = await req.json();

        if (!establishmentId) {
            throw new Error("establishmentId is required");
        }

        console.log("=== START DELETE ===");
        console.log("establishmentId:", establishmentId);

        // 1. Récupère le profil
        console.log("STEP 1 - Fetching profile...");
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("id, email")
            .eq("establishment_id", establishmentId)
            .single();

        console.log("Profile data:", JSON.stringify(profile));
        console.log("Profile error:", JSON.stringify(profileError));

        if (profileError || !profile) {
            throw new Error(`Profile not found: ${JSON.stringify(profileError)}`);
        }

        const profileId = profile.id;
        console.log("profileId to delete:", profileId);

        // 2. Supprime les participants
        console.log("STEP 2 - Deleting participants...");
        const { error: participantsError, count: participantsCount } = await supabaseAdmin
            .from("participants")
            .delete()
            .eq("establishment_id", establishmentId);
        console.log("Participants deleted, error:", JSON.stringify(participantsError));

        // 3. Supprime les segments
        console.log("STEP 3 - Deleting segments...");
        const { error: segmentsError } = await supabaseAdmin
            .from("segments")
            .delete()
            .eq("establishment_id", establishmentId);
        console.log("Segments deleted, error:", JSON.stringify(segmentsError));

        // 4. Supprime les logos storage
        console.log("STEP 4 - Deleting storage files...");
        const { data: files } = await supabaseAdmin.storage
            .from("establishment-logos")
            .list(establishmentId);
        console.log("Files found:", JSON.stringify(files));

        if (files && files.length > 0) {
            const paths = files.map(file => `${establishmentId}/${file.name}`);
            const { error: storageError } = await supabaseAdmin.storage
                .from("establishment-logos")
                .remove(paths);
            console.log("Storage delete error:", JSON.stringify(storageError));
        }

        // 5. Supprime le profil
        console.log("STEP 5 - Deleting profile from profiles table...");
        const { error: deleteProfileError, data: deletedProfile } = await supabaseAdmin
            .from("profiles")
            .delete()
            .eq("id", profileId)
            .select();
        console.log("Deleted profile data:", JSON.stringify(deletedProfile));
        console.log("Delete profile error:", JSON.stringify(deleteProfileError));

        // 6. Supprime l'utilisateur Auth via SQL direct
        console.log("STEP 6 - Deleting auth user via SQL...");
        const { error: deleteUserError } = await supabaseAdmin.rpc('delete_auth_user', { user_id: profileId });
        console.log("Delete auth user error:", JSON.stringify(deleteUserError));

        // 7. Supprime l'établissement
        console.log("STEP 7 - Deleting establishment...");
        const { error: establishmentError, data: deletedEstablishment } = await supabaseAdmin
            .from("establishments")
            .delete()
            .eq("id", establishmentId)
            .select();
        console.log("Deleted establishment data:", JSON.stringify(deletedEstablishment));
        console.log("Delete establishment error:", JSON.stringify(establishmentError));

        if (establishmentError) {
            throw establishmentError;
        }

        console.log("=== DELETE SUCCESS ===");

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("=== DELETE FAILED ===", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});