"use server";

import { cookies } from "next/headers";
import { authDestination, destinationCookie } from "@/lib/auth-destination";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(form: FormData) {
  const supabase = await createClient();
  const requestHeaders = await headers();
  // Next.js validates the Server Action's Origin against its Host.
  const origin = requestHeaders.get("origin") || process.env.APP_URL || "http://localhost:3000";
  const store = await cookies();
  store.set(destinationCookie, authDestination(form.get("next")), {
    httpOnly: true, sameSite: "lax", secure: new URL(origin).protocol === "https:", path: "/", maxAge: 900,
  });
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
  (await cookies()).delete(destinationCookie);
  redirect("/login");
}
