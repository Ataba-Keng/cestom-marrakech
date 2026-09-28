import { supabaseAdmin } from "./supabase";
import type { BoardMember, GalleryAlbum, NewsPost } from "../drizzle/schema";

function client() { if (!supabaseAdmin) throw new Error("Supabase n’est pas configuré."); return supabaseAdmin; }
function fail(error: { message?: string } | null) { if (error) throw new Error(error.message ?? "Erreur Supabase"); }
const mapGallery = (row: any): GalleryAlbum => ({ id: row.id, year: row.year, title: row.title, category: row.category, eventDate: row.event_date, location: row.location, imageUrl: row.image_url, imageAlt: row.image_alt, photoCount: row.photo_count, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) });
const mapNews = (row: any): NewsPost => ({ id: row.id, title: row.title, excerpt: row.excerpt, content: row.content, category: row.category, publishedAt: row.published_at, imageUrl: row.image_url ?? "", status: row.status, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) });
const mapBoard = (row: any): BoardMember => ({ id: row.id, name: row.name, role: row.role, bio: row.bio, imageUrl: row.image_url ?? "", sortOrder: row.sort_order, active: row.active ? 1 : 0, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) });

export async function sbListGallery(): Promise<GalleryAlbum[]> { const { data, error } = await client().from("gallery_albums").select("*").order("year", { ascending: false }).order("id", { ascending: false }); fail(error); return (data ?? []).map(mapGallery); }
export async function sbCreateGallery(input: any) { const { error } = await client().from("gallery_albums").insert({ year: input.year, title: input.title, category: input.category, event_date: input.eventDate, location: input.location, image_url: input.imageUrl, image_alt: input.imageAlt, photo_count: input.photoCount }); fail(error); }
export async function sbUpdateGallery(id: number, input: any) { const { error } = await client().from("gallery_albums").update({ year: input.year, title: input.title, category: input.category, event_date: input.eventDate, location: input.location, image_url: input.imageUrl, image_alt: input.imageAlt, photo_count: input.photoCount }).eq("id", id); fail(error); }
export async function sbDeleteGallery(id: number) { const { error } = await client().from("gallery_albums").delete().eq("id", id); fail(error); }

export async function sbListNews(includeDrafts: boolean): Promise<NewsPost[]> { let query = client().from("news_posts").select("*").order("id", { ascending: false }); if (!includeDrafts) query = query.eq("status", "published"); const { data, error } = await query; fail(error); return (data ?? []).map(mapNews); }
export async function sbGetNews(id: number, includeDrafts: boolean) { const { data, error } = await client().from("news_posts").select("*").eq("id", id).maybeSingle(); fail(error); if (!data || (!includeDrafts && data.status !== "published")) return undefined; return mapNews(data); }
export async function sbCreateNews(input: any) { const { error } = await client().from("news_posts").insert({ title: input.title, excerpt: input.excerpt, content: input.content, category: input.category, published_at: input.publishedAt, image_url: input.imageUrl, status: input.status }); fail(error); }
export async function sbUpdateNews(id: number, input: any) { const { error } = await client().from("news_posts").update({ title: input.title, excerpt: input.excerpt, content: input.content, category: input.category, published_at: input.publishedAt, image_url: input.imageUrl, status: input.status }).eq("id", id); fail(error); }
export async function sbDeleteNews(id: number) { const { error } = await client().from("news_posts").delete().eq("id", id); fail(error); }

export async function sbListBoard(includeInactive: boolean): Promise<BoardMember[]> { let query = client().from("board_members").select("*").order("sort_order").order("id"); if (!includeInactive) query = query.eq("active", true); const { data, error } = await query; fail(error); return (data ?? []).map(mapBoard); }
export async function sbCreateBoard(input: any) { const { error } = await client().from("board_members").insert({ name: input.name, role: input.role, bio: input.bio, image_url: input.imageUrl, sort_order: input.sortOrder, active: input.active === 1 }); fail(error); }
export async function sbUpdateBoard(id: number, input: any) { const { error } = await client().from("board_members").update({ name: input.name, role: input.role, bio: input.bio, image_url: input.imageUrl, sort_order: input.sortOrder, active: input.active === 1 }).eq("id", id); fail(error); }
export async function sbDeleteBoard(id: number) { const { error } = await client().from("board_members").delete().eq("id", id); fail(error); }

export async function sbListAdmins() { const { data, error } = await client().from("admin_users").select("id,name,email,role,active,created_at").eq("active", true).order("created_at"); fail(error); return data ?? []; }
export async function sbAddAdmin(input: { name: string; email: string }) { const { data, error } = await client().from("admin_users").insert({ name: input.name, email: input.email.toLowerCase(), role: "admin", active: true }).select("*").single(); fail(error); return data; }
export async function sbRemoveAdmin(id: string) { const { error } = await client().from("admin_users").update({ active: false }).eq("id", id); fail(error); }
export async function sbIsAdminByUserId(userId: string) { const { data, error } = await client().from("admin_users").select("id").eq("user_id", userId).eq("active", true).maybeSingle(); return !error && Boolean(data); }
