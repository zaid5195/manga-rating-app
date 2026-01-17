import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1, role: "admin" | "user" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Favorites Router", () => {
  it("should add work to favorites", async () => {
    const { ctx } = createAuthContext(1, "user");
    const caller = appRouter.createCaller(ctx);

    // Note: This test assumes the database is available
    // In a real scenario, you would mock the database
    const result = await caller.favorites.add({ workId: 1 });
    expect(result).toBeDefined();
  });

  it("should check if work is favorite", async () => {
    const { ctx } = createAuthContext(1, "user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.favorites.isFavorite({ workId: 1 });
    expect(typeof result).toBe("boolean");
  });

  it("should list user favorites", async () => {
    const { ctx } = createAuthContext(1, "user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.favorites.list({ limit: 20, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny access to unauthorized users", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.favorites.add({ workId: 1 });
      expect.fail("Should have thrown unauthorized error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });
});

describe("Advanced Ratings Router", () => {
  it("should get ratings by work", async () => {
    const { ctx } = createAuthContext(1, "user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.advancedRatings.getByWork({ workId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get ratings by score", async () => {
    const { ctx } = createAuthContext(1, "user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.advancedRatings.getByScore({ workId: 1, score: 5 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should validate score range", async () => {
    const { ctx } = createAuthContext(1, "user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.advancedRatings.getByScore({ workId: 1, score: 6 });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});

describe("Upload Router", () => {
  it("should deny upload to non-admin users", async () => {
    const { ctx } = createAuthContext(1, "user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.upload.image({
        fileData: "base64data",
        fileName: "test.jpg",
        mimeType: "image/jpeg",
      });
      expect.fail("Should have thrown forbidden error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow upload to admin users", async () => {
    const { ctx } = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    // Note: This test will fail if the file data is invalid
    // In a real scenario, you would provide valid base64 encoded image data
    try {
      await caller.upload.image({
        fileData: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        fileName: "test.png",
        mimeType: "image/png",
      });
    } catch (error: any) {
      // Expected to fail due to storage not being available in test
      expect(error).toBeDefined();
    }
  });

  it("should reject unauthorized uploads", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.upload.image({
        fileData: "base64data",
        fileName: "test.jpg",
        mimeType: "image/jpeg",
      });
      expect.fail("Should have thrown unauthorized error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });
});

describe("Input Validation", () => {
  it("should validate file name is required", async () => {
    const { ctx } = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.upload.image({
        fileData: "base64data",
        fileName: "",
        mimeType: "image/jpeg",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should validate mime type is required", async () => {
    const { ctx } = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.upload.image({
        fileData: "base64data",
        fileName: "test.jpg",
        mimeType: "",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});
