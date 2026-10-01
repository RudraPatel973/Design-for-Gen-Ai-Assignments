import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = { id: string; first_name: string | null; last_name: string | null; avatar_path: string | null };
export const isComplete = (profile: Profile | null) => Boolean(profile?.first_name?.trim() && profile?.last_name?.trim());

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return { supabase, user };
}

export async function getProfile() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from("profiles").select("id, first_name, last_name, avatar_path").eq("id", user.id).maybeSingle();
  return { supabase, user, profile: data as Profile | null, error };
}
