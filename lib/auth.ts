import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_ROLES = new Set(["ADMIN", "DEVELOPER"]);

export async function getSupportUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("id, full_name, role").eq("id", user.id).single();
  if (!profile || !ALLOWED_ROLES.has(profile.role)) return null;
  return { user, profile, supabase };
}

export async function requireSupportUser() {
  const auth = await getSupportUser();
  if (!auth) redirect("/admin/login");
  return auth;
}
