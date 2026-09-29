import { COOKIE_NAME } from "@shared/const";
import { addLocalAdmin, createBoardMember, createGalleryAlbum, createNewsPost, deleteBoardMember, deleteGalleryAlbum, deleteNewsPost, getNewsPost, listBoardMembers, listGalleryAlbums, listLocalAdmins, listNewsPosts, removeLocalAdmin, updateBoardMember, updateGalleryAlbum, updateNewsPost } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { z } from "zod";

const galleryAlbumInput = z.object({
  year: z.number().int().min(2000).max(2100),
  title: z.string().trim().min(2).max(180),
  category: z.string().trim().min(2).max(120),
  eventDate: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(120),
  photos: z.array(z.object({
    imageUrl: z.string().trim().min(1).max(2000),
    imageAlt: z.string().trim().min(2).max(255),
  })).min(1, "Ajoutez au moins une photo.").max(100),
});

const newsPostInput = z.object({
  title: z.string().trim().min(2).max(180),
  excerpt: z.string().trim().min(2).max(500),
  content: z.string().trim().min(2).max(10000),
  category: z.string().trim().min(2).max(120),
  publishedAt: z.string().trim().min(2).max(80),
  imageUrl: z.string().trim().max(2000),
  status: z.enum(["draft", "published"]),
});

const boardMemberInput = z.object({
  name: z.string().trim().min(2).max(160),
  role: z.string().trim().min(2).max(160),
  bio: z.string().trim().min(2).max(2000),
  imageUrl: z.string().trim().max(2000),
  sortOrder: z.number().int().min(0).max(999),
  active: z.number().int().min(0).max(1),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    admins: adminProcedure.query(() => listLocalAdmins()),
    addAdmin: adminProcedure.input(z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().email() })).mutation(({ input }) => addLocalAdmin(input)),
    removeAdmin: adminProcedure.input(z.object({ id: z.string().uuid() })).mutation(({ input, ctx }) => {
      if (ctx.user.openId === `local:${input.id}`) throw new Error("Vous ne pouvez pas supprimer votre propre accès.");
      return removeLocalAdmin(input.id);
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  gallery: router({
    list: publicProcedure.query(() => listGalleryAlbums()),
    create: adminProcedure.input(galleryAlbumInput).mutation(({ input }) => createGalleryAlbum(input)),
    update: adminProcedure.input(galleryAlbumInput.extend({ id: z.number().int().positive() })).mutation(({ input }) => {
      const { id, ...album } = input;
      return updateGalleryAlbum(id, album);
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteGalleryAlbum(input.id)),
  }),
  media: router({
    uploadImage: adminProcedure.input(z.object({
      filename: z.string().trim().min(1).max(180),
      mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
      size: z.number().int().positive().max(8 * 1024 * 1024),
      data: z.string().min(20),
    })).mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.data, "base64");
      if (buffer.byteLength > 8 * 1024 * 1024) throw new Error("Image trop volumineuse (8 Mo maximum).");
      const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-120) || "image";
      const stored = await storagePut(`cestom/${ctx.user.id}/images/${safeFilename}`, buffer, input.mimeType);
      return { ...stored, filename: safeFilename };
    }),
  }),
  news: router({
    list: publicProcedure.query(() => listNewsPosts(false)),
    byId: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => getNewsPost(input.id, false)),
    adminList: adminProcedure.query(() => listNewsPosts(true)),
    create: adminProcedure.input(newsPostInput).mutation(({ input }) => createNewsPost(input)),
    update: adminProcedure.input(newsPostInput.extend({ id: z.number().int().positive() })).mutation(({ input }) => {
      const { id, ...post } = input;
      return updateNewsPost(id, post);
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteNewsPost(input.id)),
  }),
  board: router({
    list: publicProcedure.query(() => listBoardMembers(false)),
    adminList: adminProcedure.query(() => listBoardMembers(true)),
    create: adminProcedure.input(boardMemberInput).mutation(({ input }) => createBoardMember(input)),
    update: adminProcedure.input(boardMemberInput.extend({ id: z.number().int().positive() })).mutation(({ input }) => {
      const { id, ...member } = input;
      return updateBoardMember(id, member);
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteBoardMember(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
