import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getWorks,
  getWorkById,
  createWork,
  updateWork,
  deleteWork,
  createOrUpdateRating,
  getRatingByUserAndWork,
  getWorkRatings,
  getReviewsByWork,
  createReview,
  deleteReview,
  getUserReviews,
  getReadingLinks,
  createReadingLink,
  deleteReadingLink,
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  isFavorite,
  getRatingsByWork,
  getRatingsByWorkAndScore,
} from "./db";
import { TRPCError } from "@trpc/server";
import { uploadImage, validateImageFile } from "./upload-handler";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Works Router
  works: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        return getWorks(input.limit, input.offset);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const work = await getWorkById(input.id);
        if (!work) throw new TRPCError({ code: "NOT_FOUND" });
        
        // Get reading links and ratings for this work
        const links = await getReadingLinks(input.id);
        const workRatings = await getWorkRatings(input.id);
        
        // Calculate average rating
        const avgRating = workRatings.length > 0
          ? (workRatings.reduce((sum, r) => sum + r.score, 0) / workRatings.length).toFixed(1)
          : "0";
        
        return {
          ...work,
          averageRating: avgRating,
          totalRatings: workRatings.length,
          readingLinks: links,
        };
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
        type: z.enum(["manga", "manhwa"]),
        genre: z.string().optional(),
        status: z.enum(["ongoing", "completed", "hiatus"]).default("ongoing"),
        chapters: z.number().default(0),
        author: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can create works
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return createWork(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
        type: z.enum(["manga", "manhwa"]).optional(),
        genre: z.string().optional(),
        status: z.enum(["ongoing", "completed", "hiatus"]).optional(),
        chapters: z.number().optional(),
        author: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        const { id, ...data } = input;
        return updateWork(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return deleteWork(input.id);
      }),
  }),

  // Ratings Router
  ratings: router({
    rate: protectedProcedure
      .input(z.object({
        workId: z.number(),
        score: z.number().min(1).max(5),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        return createOrUpdateRating(ctx.user.id, input.workId, input.score);
      }),

    getUserRating: protectedProcedure
      .input(z.object({ workId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) return null;
        
        return getRatingByUserAndWork(ctx.user.id, input.workId);
      }),
  }),

  // Reviews Router
  reviews: router({
    getByWork: publicProcedure
      .input(z.object({
        workId: z.number(),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        return getReviewsByWork(input.workId, input.limit, input.offset);
      }),

    create: protectedProcedure
      .input(z.object({
        workId: z.number(),
        content: z.string().min(1).max(5000),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        return createReview(ctx.user.id, input.workId, input.content);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // TODO: Verify user owns this review
        return deleteReview(input.id);
      }),

    getUserReviews: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        return getUserReviews(ctx.user.id, input.limit, input.offset);
      }),
  }),

  // Reading Links Router
  readingLinks: router({
    getByWork: publicProcedure
      .input(z.object({ workId: z.number() }))
      .query(async ({ input }) => {
        return getReadingLinks(input.workId);
      }),

    create: protectedProcedure
      .input(z.object({
        workId: z.number(),
        platform: z.string().min(1).max(100),
        url: z.string().url(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return createReadingLink(input.workId, input.platform, input.url);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return deleteReadingLink(input.id);
      }),
  }),

  // Favorites Router
  favorites: router({
    add: protectedProcedure
      .input(z.object({ workId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return addToFavorites(ctx.user.id, input.workId);
      }),

    remove: protectedProcedure
      .input(z.object({ workId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return removeFromFavorites(ctx.user.id, input.workId);
      }),

    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return getUserFavorites(ctx.user.id, input.limit, input.offset);
      }),

    isFavorite: protectedProcedure
      .input(z.object({ workId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) return false;
        return isFavorite(ctx.user.id, input.workId);
      }),
  }),

  // Advanced Ratings Router
  advancedRatings: router({
    getByWork: publicProcedure
      .input(z.object({ workId: z.number() }))
      .query(async ({ input }) => {
        return getRatingsByWork(input.workId);
      }),

    getByScore: publicProcedure
      .input(z.object({
        workId: z.number(),
        score: z.number().min(1).max(5),
      }))
      .query(async ({ input }) => {
        return getRatingsByWorkAndScore(input.workId, input.score);
      }),
  }),

  upload: router({
    image: protectedProcedure
      .input(z.object({
        fileData: z.string(),
        fileName: z.string().min(1),
        mimeType: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          const buffer = Buffer.from(input.fileData, "base64");
          await validateImageFile({
            size: buffer.length,
            type: input.mimeType,
            name: input.fileName,
          });
          const result = await uploadImage(buffer, input.fileName, input.mimeType);
          return result;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Upload failed";
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message,
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
