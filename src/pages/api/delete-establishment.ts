import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { establishmentId } = req.body;
  if (!establishmentId) return res.status(400).json({ error: "establishmentId is required" });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. Récupère le profil
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("establishment_id", establishmentId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: "Profile not found: " + JSON.stringify(profileError) });
    }

    // 2. Supprime les participants
    await supabase.from("participants").delete().eq("establishment_id", establishmentId);

    // 3. Supprime les segments
    await supabase.from("segments").delete().eq("establishment_id", establishmentId);

    // 4. Supprime les logos storage
    const { data: files } = await supabase.storage
      .from("establishment-logos")
      .list(establishmentId);
    if (files && files.length > 0) {
      const paths = files.map((f: any) => `${establishmentId}/${f.name}`);
      await supabase.storage.from("establishment-logos").remove(paths);
    }

    // 5. Supprime le profil
    await supabase.from("profiles").delete().eq("id", profile.id);

    // 6. Supprime le user Auth via la fonction SQL
    const { error: authError } = await supabase.rpc("delete_auth_user", { user_id: profile.id });
    if (authError) {
      return res.status(500).json({ error: "Auth delete failed: " + authError.message });
    }

    // 7. Supprime l'établissement
    await supabase.from("establishments").delete().eq("id", establishmentId);

    return res.status(200).json({ success: true });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}