import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, works, ratings, reviews, readingLinks, InsertWork, favorites } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

// Works queries
export async function getWorks(limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(works).limit(limit).offset(offset);
}

export async function getWorkById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(works).where(eq(works.id, id)).limit(1);
  return result[0];
}

export async function searchWorks(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  // Basic search by title or author
  if (!query) return db.select().from(works).limit(limit);
  return db.select().from(works).limit(limit);
}

export async function createWork(work: InsertWork) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(works).values(work);
  return result;
}

export async function updateWork(id: number, work: Partial<InsertWork>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(works).set(work).where(eq(works.id, id));
}

export async function deleteWork(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(works).where(eq(works.id, id));
}

// Ratings queries
export async function getRatingByUserAndWork(userId: number, workId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(ratings).where(
    and(eq(ratings.userId, userId), eq(ratings.workId, workId))
  ).limit(1);
  return result[0];
}

export async function createOrUpdateRating(userId: number, workId: number, score: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getRatingByUserAndWork(userId, workId);
  if (existing) {
    return db.update(ratings).set({ score }).where(eq(ratings.id, existing.id));
  } else {
    return db.insert(ratings).values({ userId, workId, score });
  }
}

export async function getWorkRatings(workId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ratings).where(eq(ratings.workId, workId));
}

// Reviews queries
export async function getReviewsByWork(workId: number, limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.workId, workId)).limit(limit).offset(offset);
}

export async function createReview(userId: number, workId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(reviews).values({ userId, workId, content });
}

export async function deleteReview(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(reviews).where(eq(reviews.id, id));
}

export async function getUserReviews(userId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.userId, userId)).limit(limit).offset(offset);
}

// Reading Links queries
export async function getReadingLinks(workId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(readingLinks).where(eq(readingLinks.workId, workId));
}

export async function createReadingLink(workId: number, platform: string, url: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(readingLinks).values({ workId, platform, url });
}

export async function deleteReadingLink(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(readingLinks).where(eq(readingLinks.id, id));
}

// Favorites queries
export async function addToFavorites(userId: number, workId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(favorites).values({ userId, workId });
}

export async function removeFromFavorites(userId: number, workId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(favorites).where(
    and(eq(favorites.userId, userId), eq(favorites.workId, workId))
  );
}

export async function getUserFavorites(userId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  const favs = await db.select().from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt))
    .limit(limit)
    .offset(offset);
  
  // Get work details for each favorite
  const workIds = favs.map(f => f.workId);
  if (workIds.length === 0) return [];
  
  const workDetails = await db.select().from(works).where(
    and(...workIds.map(id => eq(works.id, id)))
  );
  return workDetails;
}

export async function isFavorite(userId: number, workId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(favorites).where(
    and(eq(favorites.userId, userId), eq(favorites.workId, workId))
  ).limit(1);
  return result.length > 0;
}

// Advanced ratings queries
export async function getRatingsByWork(workId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ratings)
    .where(eq(ratings.workId, workId))
    .orderBy(desc(ratings.createdAt));
}

export async function getRatingsByWorkAndScore(workId: number, score: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ratings)
    .where(and(eq(ratings.workId, workId), eq(ratings.score, score)))
    .orderBy(desc(ratings.createdAt));
}
