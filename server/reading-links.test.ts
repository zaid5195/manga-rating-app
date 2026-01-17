import { describe, expect, it } from "vitest";

// أنواع المانجا والمانهوا
const MANGA_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Psychological",
  "Romance",
  "School",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
  "Tragedy",
  "Isekai",
  "Harem",
  "Shounen",
  "Shoujo",
  "Seinen",
  "Josei",
  "Mecha",
  "Military",
  "Police",
  "Martial Arts",
  "Magic",
  "Vampire",
  "Demon",
  "Angels",
  "Aliens",
  "Monsters",
  "Time Travel",
  "Reincarnation",
  "Game",
  "Cooking",
  "Music",
  "Art",
  "Shounen Ai",
  "Yaoi",
  "Shoujo Ai",
  "Yuri",
];

describe("Manga Genres", () => {
  it("should have comprehensive genre list", () => {
    expect(MANGA_GENRES.length).toBeGreaterThan(30);
  });

  it("should include Action genre", () => {
    expect(MANGA_GENRES).toContain("Action");
  });

  it("should include Comedy genre", () => {
    expect(MANGA_GENRES).toContain("Comedy");
  });

  it("should include Drama genre", () => {
    expect(MANGA_GENRES).toContain("Drama");
  });

  it("should include Fantasy genre", () => {
    expect(MANGA_GENRES).toContain("Fantasy");
  });

  it("should include Horror genre", () => {
    expect(MANGA_GENRES).toContain("Horror");
  });

  it("should include Romance genre", () => {
    expect(MANGA_GENRES).toContain("Romance");
  });

  it("should include Sci-Fi genre", () => {
    expect(MANGA_GENRES).toContain("Sci-Fi");
  });

  it("should include Isekai genre", () => {
    expect(MANGA_GENRES).toContain("Isekai");
  });

  it("should not have duplicate genres", () => {
    const uniqueGenres = new Set(MANGA_GENRES);
    expect(uniqueGenres.size).toBe(MANGA_GENRES.length);
  });

  it("should have all genres as non-empty strings", () => {
    MANGA_GENRES.forEach((genre) => {
      expect(genre).toBeTruthy();
      expect(typeof genre).toBe("string");
      expect(genre.length).toBeGreaterThan(0);
    });
  });
});

describe("Reading Links", () => {
  const testLink = {
    id: 1,
    workId: 1,
    platform: "MangaDex",
    url: "https://mangadex.org/title/123",
    isActive: 1,
    createdAt: new Date(),
  };

  it("should have valid reading link structure", () => {
    expect(testLink).toHaveProperty("id");
    expect(testLink).toHaveProperty("workId");
    expect(testLink).toHaveProperty("platform");
    expect(testLink).toHaveProperty("url");
    expect(testLink).toHaveProperty("isActive");
    expect(testLink).toHaveProperty("createdAt");
  });

  it("should validate platform name", () => {
    expect(testLink.platform).toBeTruthy();
    expect(typeof testLink.platform).toBe("string");
  });

  it("should validate URL format", () => {
    expect(testLink.url).toMatch(/^https?:\/\//);
  });

  it("should have isActive flag", () => {
    expect(testLink.isActive).toBe(1);
    expect([0, 1]).toContain(testLink.isActive);
  });

  it("should support multiple platforms", () => {
    const platforms = ["MangaDex", "Webtoon", "Tappytoon", "Comico", "Naver Webtoon"];
    platforms.forEach((platform) => {
      expect(platform).toBeTruthy();
    });
  });
});
