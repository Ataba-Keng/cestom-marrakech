import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { BoardMember, GalleryAlbum, InsertBoardMember, InsertGalleryAlbum, InsertNewsPost, InsertUser, NewsPost, boardMembers, galleryAlbums, newsPosts, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { localId, readLocalData, withLocalData, type LocalAdmin } from './localStore';
import { supabaseConfigured } from "./supabase";
import * as sb from "./supabaseDb";

let _db: ReturnType<typeof drizzle> | null = null;

export type AdminRecord = { id: string; name: string; email: string; role: string; active: boolean; openId?: string; created_at?: string; createdAt?: string };

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listGalleryAlbums(): Promise<sb.GalleryAlbumWithPhotos[]> {
  if (supabaseConfigured) return sb.sbListGallery();
  const db = await getDb();
  if (!db) return (await readLocalData()).gallery.sort((a, b) => b.year - a.year || b.id - a.id).map((album) => ({ ...album, photos: [{ id: 0, albumId: album.id, imageUrl: album.imageUrl, imageAlt: album.imageAlt, sortOrder: 0, createdAt: album.createdAt }] }));
  const albums = await db.select().from(galleryAlbums).orderBy(desc(galleryAlbums.year), desc(galleryAlbums.id));
  return albums.map((album) => ({ ...album, photos: [{ id: 0, albumId: album.id, imageUrl: album.imageUrl, imageAlt: album.imageAlt, sortOrder: 0, createdAt: album.createdAt }] }));
}

export async function createGalleryAlbum(album: any): Promise<number | void> {
  if (supabaseConfigured) return sb.sbCreateGallery(album);
  const db = await getDb();
  const photos = Array.isArray(album.photos) ? album.photos : [{ imageUrl: album.imageUrl, imageAlt: album.imageAlt }];
  const cover = photos[0];
  if (!cover) throw new Error("Un album doit contenir au moins une photo.");
  const record = { ...album, imageUrl: cover.imageUrl, imageAlt: cover.imageAlt, photoCount: photos.length };
  delete record.photos;
  if (!db) { const id = localId(); await withLocalData(data => { data.gallery.push({ ...record, id, createdAt: new Date(), updatedAt: new Date() } as GalleryAlbum); }); return id; }
  await db.insert(galleryAlbums).values(record);
}

export async function updateGalleryAlbum(id: number, album: any): Promise<void> {
  if (supabaseConfigured) return sb.sbUpdateGallery(id, album);
  const db = await getDb();
  const photos = Array.isArray(album.photos) ? album.photos : [{ imageUrl: album.imageUrl, imageAlt: album.imageAlt }];
  const cover = photos[0];
  if (!cover) throw new Error("Un album doit contenir au moins une photo.");
  const record = { ...album, imageUrl: cover.imageUrl, imageAlt: cover.imageAlt, photoCount: photos.length };
  delete record.photos;
  if (!db) { await withLocalData(data => { const item = data.gallery.find(x => x.id === id); if (item) Object.assign(item, record, { updatedAt: new Date() }); }); return; }
  await db.update(galleryAlbums).set(record).where(eq(galleryAlbums.id, id));
}

export async function deleteGalleryAlbum(id: number): Promise<void> {
  if (supabaseConfigured) return sb.sbDeleteGallery(id);
  const db = await getDb();
  if (!db) { await withLocalData(data => { data.gallery = data.gallery.filter(x => x.id !== id); }); return; }
  await db.delete(galleryAlbums).where(eq(galleryAlbums.id, id));
}

export async function listNewsPosts(includeDrafts = false): Promise<NewsPost[]> {
  if (supabaseConfigured) return sb.sbListNews(includeDrafts);
  const db = await getDb();
  if (!db) { const posts = (await readLocalData()).news.filter(post => includeDrafts || post.status === "published"); return posts.sort((a, b) => b.id - a.id); }
  const query = db.select().from(newsPosts);
  if (!includeDrafts) return query.where(eq(newsPosts.status, "published")).orderBy(desc(newsPosts.id));
  return query.orderBy(desc(newsPosts.id));
}

export async function getNewsPost(id: number, includeDrafts = false): Promise<NewsPost | undefined> {
  if (supabaseConfigured) return sb.sbGetNews(id, includeDrafts);
  const db = await getDb();
  if (!db) { const post = (await readLocalData()).news.find(x => x.id === id); return post && (includeDrafts || post.status === "published") ? post : undefined; }
  const result = await db.select().from(newsPosts).where(eq(newsPosts.id, id)).limit(1);
  if (!result[0] || (!includeDrafts && result[0].status !== "published")) return undefined;
  return result[0];
}

export async function createNewsPost(post: InsertNewsPost): Promise<void> {
  if (supabaseConfigured) return sb.sbCreateNews(post);
  const db = await getDb();
  if (!db) { await withLocalData(data => { data.news.push({ ...post, id: localId(), createdAt: new Date(), updatedAt: new Date() } as NewsPost); }); return; }
  await db.insert(newsPosts).values(post);
}

export async function updateNewsPost(id: number, post: Partial<InsertNewsPost>): Promise<void> {
  if (supabaseConfigured) return sb.sbUpdateNews(id, post);
  const db = await getDb();
  if (!db) { await withLocalData(data => { const item = data.news.find(x => x.id === id); if (item) Object.assign(item, post, { updatedAt: new Date() }); }); return; }
  await db.update(newsPosts).set(post).where(eq(newsPosts.id, id));
}

export async function deleteNewsPost(id: number): Promise<void> {
  if (supabaseConfigured) return sb.sbDeleteNews(id);
  const db = await getDb();
  if (!db) { await withLocalData(data => { data.news = data.news.filter(x => x.id !== id); }); return; }
  await db.delete(newsPosts).where(eq(newsPosts.id, id));
}

export async function listBoardMembers(includeInactive = false): Promise<BoardMember[]> {
  if (supabaseConfigured) return sb.sbListBoard(includeInactive);
  const db = await getDb();
  if (!db) { const members = (await readLocalData()).board.filter(member => includeInactive || member.active === 1); return members.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id); }
  const query = db.select().from(boardMembers);
  if (!includeInactive) return query.where(eq(boardMembers.active, 1)).orderBy(asc(boardMembers.sortOrder), asc(boardMembers.id));
  return query.orderBy(asc(boardMembers.sortOrder), asc(boardMembers.id));
}

export async function createBoardMember(member: InsertBoardMember): Promise<void> {
  if (supabaseConfigured) return sb.sbCreateBoard(member);
  const db = await getDb();
  if (!db) { await withLocalData(data => { data.board.push({ ...member, id: localId(), createdAt: new Date(), updatedAt: new Date() } as BoardMember); }); return; }
  await db.insert(boardMembers).values(member);
}

export async function updateBoardMember(id: number, member: Partial<InsertBoardMember>): Promise<void> {
  if (supabaseConfigured) return sb.sbUpdateBoard(id, member);
  const db = await getDb();
  if (!db) { await withLocalData(data => { const item = data.board.find(x => x.id === id); if (item) Object.assign(item, member, { updatedAt: new Date() }); }); return; }
  await db.update(boardMembers).set(member).where(eq(boardMembers.id, id));
}

export async function deleteBoardMember(id: number): Promise<void> {
  if (supabaseConfigured) return sb.sbDeleteBoard(id);
  const db = await getDb();
  if (!db) { await withLocalData(data => { data.board = data.board.filter(x => x.id !== id); }); return; }
  await db.delete(boardMembers).where(eq(boardMembers.id, id));
}


export async function listLocalAdmins(): Promise<AdminRecord[]> {
  if (supabaseConfigured) return sb.sbListAdmins() as Promise<AdminRecord[]>;
  return (await readLocalData()).admins.map(admin => ({ ...admin, active: true, created_at: admin.createdAt }));
}

export async function addLocalAdmin(input: { name: string; email: string }): Promise<AdminRecord> {
  if (supabaseConfigured) return sb.sbAddAdmin(input) as Promise<AdminRecord>;
  const admin: LocalAdmin = { id: crypto.randomUUID(), openId: `local:${input.email.toLowerCase()}`, name: input.name, email: input.email.toLowerCase(), role: "admin", createdAt: new Date().toISOString() };
  await withLocalData(data => { if (!data.admins.some(x => x.email === admin.email)) data.admins.push(admin); });
  return { ...admin, active: true, created_at: admin.createdAt };
}

export async function removeLocalAdmin(id: string): Promise<void> {
  if (supabaseConfigured) return sb.sbRemoveAdmin(id);
  await withLocalData(data => { data.admins = data.admins.filter(x => x.id !== id); });
}

export async function findLocalAdmin(identifier: string): Promise<LocalAdmin | undefined> {
  if (supabaseConfigured) return undefined;
  return (await readLocalData()).admins.find(x => x.email === identifier || x.openId === identifier);
}
