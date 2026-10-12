import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { googleProfile } from "@/lib/google-profile";
import { isComplete } from "@/lib/profile";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destination = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  };
  if (!code || request.nextUrl.searchParams.has("error")) return destination("/login?error=callback");
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return destination("/login?error=callback");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return destination("/login?error=callback");
  const google = user.identities?.find(identity => identity.provider === "google");
  if (google) {
    const imported = googleProfile(google.identity_data ?? user.user_metadata);
    // Fill missing values only. A returning login must preserve manual edits.
    for (const field of ["first_name", "last_name"] as const) {
      if (imported[field]) {
        await supabase.from("profiles").update({ [field]: imported[field] })
          .eq("id", user.id).is(field, null);
      }
    }
  }
  const { data: profile } = await supabase.from("profiles").select("id, first_name, last_name, avatar_path").eq("id", user.id).maybeSingle();
  return destination(isComplete(profile) ? "/club" : "/profile");
}
