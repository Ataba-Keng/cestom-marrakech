import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Request } from "express";

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseConfigured = Boolean(url && serviceRoleKey);
export const supabaseAdmin: SupabaseClient | null = supabaseConfigured
  ? createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

export function supabaseAccessToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) return header.slice(7);
  const cookie = req.headers.cookie?.split(";").map(value => value.trim()).find(value => value.startsWith("supabase-access-token="));
  return cookie?.slice("supabase-access-token=".length) ?? null;
}

export async function getSupabaseUser(req: Request): Promise<User | null> {
  if (!supabaseAdmin) return null;
  const token = supabaseAccessToken(req);
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) return null;
  return data.user;
}

export async function isSupabaseAdmin(user: User): Promise<boolean> {
  if (!supabaseAdmin) return false;
  const ownerEmail = process.env.SUPABASE_OWNER_EMAIL?.trim().toLowerCase();
  if (ownerEmail && user.email?.toLowerCase() === ownerEmail) return true;
  const { data, error } = await supabaseAdmin.from("admin_users").select("id").eq("user_id", user.id).eq("active", true).maybeSingle();
  if (!error && data) return true;
  if (!user.email) return false;
  const byEmail = await supabaseAdmin.from("admin_users").select("id").eq("email", user.email.toLowerCase()).eq("active", true).maybeSingle();
  return !byEmail.error && Boolean(byEmail.data);
}
