import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { BoardMember, GalleryAlbum, NewsPost } from "../drizzle/schema";

type LocalAdmin = { id: string; openId: string; name: string; email: string; role: "admin"; createdAt: string };
type LocalData = { gallery: GalleryAlbum[]; news: NewsPost[]; board: BoardMember[]; admins: LocalAdmin[] };

const filePath = path.resolve(process.env.CESTOM_DATA_DIR ?? path.join(process.cwd(), "data"), "cestom.json");
const emptyData: LocalData = { gallery: [], news: [], board: [], admins: [] };
let queue = Promise.resolve();

async function load(): Promise<LocalData> {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as Partial<LocalData>;
    return { ...emptyData, ...parsed };
  } catch {
    return structuredClone(emptyData);
  }
}

async function save(data: LocalData) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function withLocalData<T>(fn: (data: LocalData) => T | Promise<T>): Promise<T> {
  let result!: T;
  queue = queue.then(async () => {
    const data = await load();
    result = await fn(data);
    await save(data);
  });
  await queue;
  return result;
}

export async function readLocalData(): Promise<LocalData> {
  return load();
}

export function localId(): number {
  return Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
}

export function localAdminId(): string { return randomUUID(); }
export type { LocalAdmin, LocalData };
