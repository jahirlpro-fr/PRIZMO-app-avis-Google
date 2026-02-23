import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { establishmentId } = await req.json();

    if (!establishmentId) {
      return new Response(
        JSON.stringify({ error: "establishmentId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user owns this establishment
    const { data: establishment, error: establishmentError } = await supabaseAdmin
      .from("establishments")
      .select("user_id")
      .eq("id", establishmentId)
      .single();

    if (establishmentError || !establishment) {
      return new Response(
        JSON.stringify({ error: "Establishment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (establishment.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to delete this establishment" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting deletion process for establishment: ${establishmentId}`);

    // Step 1: Delete all participants
    const { error: participantsError } = await supabaseAdmin
      .from("participants")
      .delete()
      .eq("establishment_id", establishmentId);

    if (participantsError) {
      console.error("Error deleting participants:", participantsError);
      throw new Error(`Failed to delete participants: ${participantsError.message}`);
    }
    console.log("✓ Participants deleted");

    // Step 2: Delete all wheel segments
    const { error: segmentsError } = await supabaseAdmin
      .from("wheel_segments")
      .delete()
      .eq("establishment_id", establishmentId);

    if (segmentsError) {
      console.error("Error deleting segments:", segmentsError);
      throw new Error(`Failed to delete segments: ${segmentsError.message}`);
    }
    console.log("✓ Wheel segments deleted");

    // Step 3: Delete logos from storage
    try {
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from("establishment-logos")
        .list(establishmentId);

      if (listError) {
        console.error("Error listing files:", listError);
      } else if (files && files.length > 0) {
        const filePaths = files.map(file => `${establishmentId}/${file.name}`);
        const { error: deleteFilesError } = await supabaseAdmin.storage
          .from("establishment-logos")
          .remove(filePaths);

        if (deleteFilesError) {
          console.error("Error deleting files:", deleteFilesError);
        } else {
          console.log(`✓ Deleted ${files.length} logo file(s)`);
        }
      }
    } catch (storageError) {
      console.error("Storage deletion error:", storageError);
      // Continue even if storage deletion fails
    }

    // Step 4: Get the auth user ID before deleting establishment
    const authUserId = establishment.user_id;

    // Step 5: Delete the establishment (this will cascade to profiles due to FK)
    const { error: establishmentDeleteError } = await supabaseAdmin
      .from("establishments")
      .delete()
      .eq("id", establishmentId);

    if (establishmentDeleteError) {
      console.error("Error deleting establishment:", establishmentDeleteError);
      throw new Error(`Failed to delete establishment: ${establishmentDeleteError.message}`);
    }
    console.log("✓ Establishment deleted");

    // Step 6: Delete profile (if not already deleted by cascade)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("establishment_id", establishmentId);

    if (profileError) {
      console.log("Profile deletion note:", profileError.message);
      // Don't throw - profile might already be deleted by cascade
    } else {
      console.log("✓ Profile deleted");
    }

    // Step 7: Delete Supabase Auth user
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);

    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      // Don't throw - establishment is already deleted, auth cleanup can be done manually if needed
      console.log("⚠ Auth user deletion failed, but establishment was deleted successfully");
    } else {
      console.log("✓ Auth user deleted");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Establishment and all related data deleted successfully" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Deletion error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred during deletion" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});