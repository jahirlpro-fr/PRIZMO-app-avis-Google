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
      // 1. Récupère le profil (optionnel)
      const { data: profile } = await supabase
          .from("profiles")
          .select("id, email")
          .eq("establishment_id", establishmentId)
          .maybeSingle();

      // 2. Supprime les participants
      await supabase.from("participants").delete().eq("establishment_id", establishmentId);

      // 3. Supprime les segments
      await supabase.from("segments").delete().eq("establishment_id", establishmentId);

      // 4. Supprime loyalty_cards et loyalty_config
      await supabase.from("loyalty_cards").delete().eq("establishment_id", establishmentId);
      await supabase.from("loyalty_config").delete().eq("establishment_id", establishmentId);

      // 5. Supprime les logos storage
      const { data: files } = await supabase.storage
          .from("establishment-logos")
          .list(establishmentId);
      if (files && files.length > 0) {
          const paths = files.map((f: any) => `${establishmentId}/${f.name}`);
          await supabase.storage.from("establishment-logos").remove(paths);
      }

      // 6. Supprime le profil et user Auth si ils existent
      if (profile) {
          await supabase.from("profiles").delete().eq("id", profile.id);
          await supabase.rpc("delete_auth_user", { user_id: profile.id });
      }

      // 7. Supprime l'établissement
      await supabase.from("establishments").delete().eq("id", establishmentId);

    return res.status(200).json({ success: true });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}