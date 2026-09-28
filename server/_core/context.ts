import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { findLocalAdmin } from "../db";
import { getSupabaseUser, isSupabaseAdmin } from "../supabase";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  const localPreviewAdmin =
    process.env.CESTOM_PREVIEW_ADMIN === "true" &&
    ["localhost", "127.0.0.1"].includes(opts.req.hostname) &&
    opts.req.headers["x-cestom-preview-admin"] === "true";

  if (localPreviewAdmin) {
    user = {
      id: 0,
      openId: "local-preview-admin",
      name: "Administrateur local",
      email: "preview@cestom.local",
      loginMethod: "local-preview",
      role: "admin",
      createdAt: new Date(0),
      updatedAt: new Date(0),
      lastSignedIn: new Date(),
    };
  }

  if (!user) {
    const supabaseUser = await getSupabaseUser(opts.req);
    if (supabaseUser) {
      user = {
        id: 0,
        openId: `supabase:${supabaseUser.id}`,
        name: supabaseUser.user_metadata?.full_name ?? supabaseUser.email ?? "Utilisateur Supabase",
        email: supabaseUser.email ?? null,
        loginMethod: "supabase",
        role: (await isSupabaseAdmin(supabaseUser)) ? "admin" : "user",
        createdAt: new Date(supabaseUser.created_at),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };
    }
  }

  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  if (user) {
    const allowedAdmin = await findLocalAdmin(user.email ?? user.openId);
    if (allowedAdmin) user = { ...user, role: "admin" };
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
