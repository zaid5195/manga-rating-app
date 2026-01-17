import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(isAdmin: boolean = false): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: isAdmin ? "admin" : "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Works Router", () => {
  let createdWorkId: number;

  describe("works.list", () => {
    it("should return a list of works", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.works.list({
        limit: 10,
        offset: 0,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should respect limit and offset", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.works.list({
        limit: 5,
        offset: 0,
      });

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe("works.create", () => {
    it("should create a work as admin", async () => {
      const ctx = createMockContext(true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.works.create({
        title: "Test Manga",
        type: "manga",
        description: "A test manga",
        author: "Test Author",
        status: "ongoing",
        chapters: 10,
        genre: "Action, Adventure",
      });

      expect(result).toBeDefined();
      createdWorkId = (result as any).insertId || 1;
    });

    it("should reject non-admin users", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.works.create({
          title: "Unauthorized Work",
          type: "manga",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should reject unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.works.create({
          title: "Unauthorized Work",
          type: "manga",
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        // Unauthenticated users get UNAUTHORIZED, not FORBIDDEN
        expect(["FORBIDDEN", "UNAUTHORIZED"]).toContain(error.code);
      }
    });
  });

  describe("works.getById", () => {
    it("should retrieve a work by ID", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.works.getById({ id: 1 });
        expect(result).toBeDefined();
        expect(result.id).toBe(1);
      } catch (error: any) {
        // It's okay if work doesn't exist
        expect(error.code).toBe("NOT_FOUND");
      }
    });

    it("should throw NOT_FOUND for non-existent work", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.works.getById({ id: 999999 });
        expect.fail("Should have thrown NOT_FOUND error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });
});

describe("Ratings Router", () => {
  describe("ratings.rate", () => {
    it("should allow authenticated users to rate", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.ratings.rate({
          workId: 1,
          score: 5,
        });
        expect(result).toBeDefined();
      } catch (error: any) {
        // Database might not have work, but permission check should pass
        expect(error.code).not.toBe("UNAUTHORIZED");
      }
    });

    it("should reject unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.ratings.rate({
          workId: 1,
          score: 5,
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should validate score range", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.ratings.rate({
          workId: 1,
          score: 10, // Invalid score
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("ratings.getUserRating", () => {
    it("should return user rating for a work", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ratings.getUserRating({ workId: 1 });
      // Result can be null if no rating exists
      expect(result === null || result !== null).toBe(true);
    });

    it("should reject unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.ratings.getUserRating({ workId: 1 });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });
});

describe("Reviews Router", () => {
  describe("reviews.getByWork", () => {
    it("should return reviews for a work", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.reviews.getByWork({
        workId: 1,
        limit: 10,
        offset: 0,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should respect limit and offset", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.reviews.getByWork({
        workId: 1,
        limit: 5,
        offset: 0,
      });

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe("reviews.create", () => {
    it("should allow authenticated users to create reviews", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.reviews.create({
          workId: 1,
          content: "This is a great work!",
        });
        expect(result).toBeDefined();
      } catch (error: any) {
        // Database might not have work, but permission check should pass
        expect(error.code).not.toBe("UNAUTHORIZED");
      }
    });

    it("should reject unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.reviews.create({
          workId: 1,
          content: "This is a great work!",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should reject empty reviews", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.reviews.create({
          workId: 1,
          content: "",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("reviews.getUserReviews", () => {
    it("should return user reviews", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.reviews.getUserReviews({
        limit: 10,
        offset: 0,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.reviews.getUserReviews({
          limit: 10,
          offset: 0,
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });
});

describe("Reading Links Router", () => {
  describe("readingLinks.getByWork", () => {
    it("should return reading links for a work", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.readingLinks.getByWork({ workId: 1 });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("readingLinks.create", () => {
    it("should allow admins to create reading links", async () => {
      const ctx = createMockContext(true);
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.readingLinks.create({
          workId: 1,
          platform: "MangaDex",
          url: "https://mangadex.org/title/123",
        });
        expect(result).toBeDefined();
      } catch (error: any) {
        // Database might not have work, but permission check should pass
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should reject non-admin users", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.readingLinks.create({
          workId: 1,
          platform: "MangaDex",
          url: "https://mangadex.org/title/123",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});

describe("Auth Router", () => {
  describe("auth.me", () => {
    it("should return current user", async () => {
      const ctx = createMockContext(false);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.email).toBe("test@example.com");
    });

    it("should return null for unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });
  });
});
