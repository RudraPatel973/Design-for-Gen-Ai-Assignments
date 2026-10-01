"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  const supabase = await createClient();
  const requestHeaders = await headers();
  // Next.js validates the Server Action's Origin against its Host.
  const origin = requestHeaders.get("origin") || process.env.APP_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: new URL("/auth/callback", origin).toString() },
  });
  if (error || !data.url) redirect("/login?error=signin");
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) redirect("/profile?error=signout");
  redirect("/login");
}
