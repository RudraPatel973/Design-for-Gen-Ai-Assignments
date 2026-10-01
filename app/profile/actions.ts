"use server";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/profile";
import { imageExtension, validateNames } from "@/lib/profile-validation";

export type ProfileState = { error?: string; success?: string };
export async function saveProfile(_state: ProfileState, form: FormData): Promise<ProfileState> {
  const { supabase, user, profile, error } = await getProfile();
  if (error || !profile) return { error: "Your profile isn’t available yet. Please try again shortly." };
  const names = validateNames(form.get("first_name"), form.get("last_name"));
  if (!names) return { error: "Please enter both names, using 80 characters or fewer for each." };
  const file = form.get("photo");
  let newPath: string | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > 2 * 1024 * 1024) return { error: "Please choose a photo smaller than 2 MB." };
    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = imageExtension(bytes, file.type);
    if (!extension) return { error: "Please choose a JPEG, PNG, or WebP photo." };
    newPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(newPath, bytes, { contentType: file.type, upsert: false });
    if (uploadError) return { error: "Your photo couldn’t be uploaded. Please try again." };
  }
  const { data, error: saveError } = await supabase.from("profiles")
    .update({ ...names, avatar_path: newPath ?? profile.avatar_path })
    .eq("id", user.id).select("id").single();
  if (saveError || !data) {
    if (newPath) await supabase.storage.from("avatars").remove([newPath]);
    return { error: "Your changes couldn’t be saved. Please try again." };
  }
  if (newPath && profile.avatar_path?.startsWith(`${user.id}/`)) {
    await supabase.storage.from("avatars").remove([profile.avatar_path]);
  }
  revalidatePath("/profile");
  revalidatePath("/club");
  return { success: "Looking good! Your profile is saved. You can now enter the club." };
}
