import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function callerFor(role: "user" | "admin") {
  const context: TrpcContext = {
    user: {
      id: 9,
      openId: `${role}-user`,
      email: `${role}@example.com`,
      name: "Test User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
  return appRouter.createCaller(context);
}

describe("content administration access", () => {
  it("protects news and board mutations from regular users", async () => {
    const caller = callerFor("user");
    await expect(caller.news.create({ title: "Test", excerpt: "Résumé", content: "Contenu", category: "Info", publishedAt: "2026-09-28", imageUrl: "", status: "draft" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.board.create({ name: "Test", role: "Membre", bio: "Bio", imageUrl: "", sortOrder: 0, active: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("protects media upload from regular users", async () => {
    const caller = callerFor("user");
    await expect(caller.media.uploadImage({ filename: "test.jpg", mimeType: "image/jpeg", size: 3, data: "aGVsbG8=" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
