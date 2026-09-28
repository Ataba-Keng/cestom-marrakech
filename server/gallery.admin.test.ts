import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("gallery admin procedures", () => {
  it("rejects album creation for an authenticated non-admin", async () => {
    const context: TrpcContext = {
      user: {
        id: 7,
        openId: "regular-user",
        email: "student@example.com",
        name: "Student User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(context);
    await expect(caller.gallery.create({
      year: 2025,
      title: "Album test",
      category: "Test",
      eventDate: "1 janvier 2025",
      location: "Marrakech",
      imageUrl: "/manus-storage/test.jpg",
      imageAlt: "Image test",
      photoCount: 1,
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
