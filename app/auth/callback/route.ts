import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
  const { data: profile } = await supabase.from("profiles").select("id, first_name, last_name, avatar_path").eq("id", user.id).maybeSingle();
  return destination(isComplete(profile) ? "/club" : "/profile");
}
