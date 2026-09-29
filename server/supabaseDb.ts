import { supabaseAdmin } from "./supabase";
import type { BoardMember, GalleryAlbum, NewsPost } from "../drizzle/schema";

export type GalleryPhotoRecord = {
  id: number;
  albumId: number;
  imageUrl: string;
  imageAlt: string;
  sortOrder: number;
  createdAt: Date;
};

export type GalleryAlbumWithPhotos = GalleryAlbum & {
  photos: GalleryPhotoRecord[];
};

function client() {
  if (!supabaseAdmin) throw new Error("Supabase n’est pas configuré.");
  return supabaseAdmin;
}

function fail(error: { message?: string } | null) {
  if (error) throw new Error(error.message ?? "Erreur Supabase");
}

function mapPhoto(row: any): GalleryPhotoRecord {
  return {
    id: Number(row.id),
    albumId: Number(row.album_id),
    imageUrl: row.image_url,
    imageAlt: row.image_alt ?? "",
    sortOrder: row.sort_order ?? 0,
    createdAt: new Date(row.created_at),
  };
}

function mapGallery(row: any, photos: GalleryPhotoRecord[] = []): GalleryAlbumWithPhotos {
  return {
    id: Number(row.id),
    year: row.year,
    title: row.title,
    category: row.category,
    eventDate: row.event_date,
    location: row.location,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    photoCount: photos.length || row.photo_count || 0,
    photos,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

async function photosForAlbums(albumIds: number[]) {
  if (albumIds.length === 0) return new Map<number, GalleryPhotoRecord[]>();

  const { data, error } = await client()
    .from("gallery_photos")
    .select("*")
    .in("album_id", albumIds)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  fail(error);

  const grouped = new Map<number, GalleryPhotoRecord[]>();
  for (const row of data ?? []) {
    const photo = mapPhoto(row);
    const current = grouped.get(photo.albumId) ?? [];
    current.push(photo);
    grouped.set(photo.albumId, current);
  }
  return grouped;
}

function inputPhotos(input: any) {
  const photos = Array.isArray(input.photos) ? input.photos : [];
  if (photos.length > 0) return photos;
  if (input.imageUrl) return [{ imageUrl: input.imageUrl, imageAlt: input.imageAlt ?? "" }];
  return [];
}

export async function sbListGallery(): Promise<GalleryAlbumWithPhotos[]> {
  const { data, error } = await client()
    .from("gallery_albums")
    .select("*")
    .order("year", { ascending: false })
    .order("id", { ascending: false });

  fail(error);

  const albums = data ?? [];
  const grouped = await photosForAlbums(albums.map((row) => Number(row.id)));

  return albums.map((row) => {
    const photos = grouped.get(Number(row.id)) ?? [];
    if (photos.length === 0 && row.image_url) {
      photos.push({
        id: 0,
        albumId: Number(row.id),
        imageUrl: row.image_url,
        imageAlt: row.image_alt ?? "",
        sortOrder: 0,
        createdAt: new Date(row.created_at),
      });
    }
    return mapGallery(row, photos);
  });
}

export async function sbCreateGallery(input: any): Promise<number> {
  const photos = inputPhotos(input);
  const cover = photos[0];
  if (!cover) throw new Error("Un album doit contenir au moins une photo.");

  const { data, error } = await client()
    .from("gallery_albums")
    .insert({
      year: input.year,
      title: input.title,
      category: input.category,
      event_date: input.eventDate,
      location: input.location,
      image_url: cover.imageUrl,
      image_alt: cover.imageAlt,
      photo_count: photos.length,
    })
    .select("id")
    .single();

  fail(error);
  if (!data) throw new Error("Supabase n’a pas retourné l’identifiant du nouvel album.");
  const albumId = Number(data.id);

  const { error: photosError } = await client().from("gallery_photos").insert(
    photos.map((photo: any, index: number) => ({
      album_id: albumId,
      image_url: photo.imageUrl,
      image_alt: photo.imageAlt ?? cover.imageAlt ?? "",
      sort_order: index,
    })),
  );
  fail(photosError);
  return albumId;
}

export async function sbUpdateGallery(id: number, input: any) {
  const photos = inputPhotos(input);
  const cover = photos[0];
  if (!cover) throw new Error("Un album doit contenir au moins une photo.");

  const { error } = await client()
    .from("gallery_albums")
    .update({
      year: input.year,
      title: input.title,
      category: input.category,
      event_date: input.eventDate,
      location: input.location,
      image_url: cover.imageUrl,
      image_alt: cover.imageAlt,
      photo_count: photos.length,
    })
    .eq("id", id);
  fail(error);

  const { error: deleteError } = await client().from("gallery_photos").delete().eq("album_id", id);
  fail(deleteError);

  const { error: insertError } = await client().from("gallery_photos").insert(
    photos.map((photo: any, index: number) => ({
      album_id: id,
      image_url: photo.imageUrl,
      image_alt: photo.imageAlt ?? cover.imageAlt ?? "",
      sort_order: index,
    })),
  );
  fail(insertError);
}

export async function sbDeleteGallery(id: number) {
  const { error } = await client().from("gallery_albums").delete().eq("id", id);
  fail(error);
}

export async function sbListNews(includeDrafts: boolean): Promise<NewsPost[]> { let query = client().from("news_posts").select("*").order("id", { ascending: false }); if (!includeDrafts) query = query.eq("status", "published"); const { data, error } = await query; fail(error); return (data ?? []).map(mapNews); }
export async function sbGetNews(id: number, includeDrafts: boolean) { const { data, error } = await client().from("news_posts").select("*").eq("id", id).maybeSingle(); fail(error); if (!data || (!includeDrafts && data.status !== "published")) return undefined; return mapNews(data); }
export async function sbCreateNews(input: any) { const { error } = await client().from("news_posts").insert({ title: input.title, excerpt: input.excerpt, content: input.content, category: input.category, published_at: input.publishedAt, image_url: input.imageUrl, status: input.status }); fail(error); }
export async function sbUpdateNews(id: number, input: any) { const { error } = await client().from("news_posts").update({ title: input.title, excerpt: input.excerpt, content: input.content, category: input.category, published_at: input.publishedAt, image_url: input.imageUrl, status: input.status }).eq("id", id); fail(error); }
export async function sbDeleteNews(id: number) { const { error } = await client().from("news_posts").delete().eq("id", id); fail(error); }

function mapNews(row: any): NewsPost { return { id: Number(row.id), title: row.title, excerpt: row.excerpt, content: row.content, category: row.category, publishedAt: row.published_at, imageUrl: row.image_url ?? "", status: row.status, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) }; }

export async function sbListBoard(includeInactive: boolean): Promise<BoardMember[]> { let query = client().from("board_members").select("*").order("sort_order").order("id"); if (!includeInactive) query = query.eq("active", true); const { data, error } = await query; fail(error); return (data ?? []).map(mapBoard); }
export async function sbCreateBoard(input: any) { const { error } = await client().from("board_members").insert({ name: input.name, role: input.role, bio: input.bio, image_url: input.imageUrl, sort_order: input.sortOrder, active: input.active === 1 }); fail(error); }
export async function sbUpdateBoard(id: number, input: any) { const { error } = await client().from("board_members").update({ name: input.name, role: input.role, bio: input.bio, image_url: input.imageUrl, sort_order: input.sortOrder, active: input.active === 1 }).eq("id", id); fail(error); }
export async function sbDeleteBoard(id: number) { const { error } = await client().from("board_members").delete().eq("id", id); fail(error); }

function mapBoard(row: any): BoardMember { return { id: Number(row.id), name: row.name, role: row.role, bio: row.bio, imageUrl: row.image_url ?? "", sortOrder: row.sort_order, active: row.active ? 1 : 0, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) }; }

export async function sbListAdmins() { const { data, error } = await client().from("admin_users").select("id,name,email,role,active,created_at").eq("active", true).order("created_at"); fail(error); return data ?? []; }
export async function sbAddAdmin(input: { name: string; email: string }) { const { data, error } = await client().from("admin_users").insert({ name: input.name, email: input.email.toLowerCase(), role: "admin", active: true }).select("*").single(); fail(error); return data; }
export async function sbRemoveAdmin(id: string) { const { error } = await client().from("admin_users").update({ active: false }).eq("id", id); fail(error); }
export async function sbIsAdminByUserId(userId: string) { const { data, error } = await client().from("admin_users").select("id").eq("user_id", userId).eq("active", true).maybeSingle(); return !error && Boolean(data); }
