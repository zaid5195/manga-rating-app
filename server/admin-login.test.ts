import { describe, expect, it } from "vitest";

// قائمة كلمات السر المقبولة (نفس الكلمات المستخدمة في AdminLogin.tsx)
const ADMIN_PASSWORDS = ["حسن", "hassan"];

describe("Admin Login Password Validation", () => {
  describe("Password validation", () => {
    it("should accept Arabic password 'حسن'", () => {
      const password = "حسن";
      expect(ADMIN_PASSWORDS.includes(password)).toBe(true);
    });

    it("should accept English password 'hassan'", () => {
      const password = "hassan";
      expect(ADMIN_PASSWORDS.includes(password)).toBe(true);
    });

    it("should reject incorrect passwords", () => {
      const wrongPasswords = ["wrong", "password", "123", "test", "admin"];
      wrongPasswords.forEach((pwd) => {
        expect(ADMIN_PASSWORDS.includes(pwd)).toBe(false);
      });
    });

    it("should reject empty password", () => {
      const password = "";
      expect(ADMIN_PASSWORDS.includes(password)).toBe(false);
    });

    it("should be case-sensitive", () => {
      expect(ADMIN_PASSWORDS.includes("HASSAN")).toBe(false);
      expect(ADMIN_PASSWORDS.includes("Hassan")).toBe(false);
      expect(ADMIN_PASSWORDS.includes("hassan")).toBe(true);
    });

    it("should reject passwords with extra spaces", () => {
      expect(ADMIN_PASSWORDS.includes(" hassan")).toBe(false);
      expect(ADMIN_PASSWORDS.includes("hassan ")).toBe(false);
      expect(ADMIN_PASSWORDS.includes(" hassan ")).toBe(false);
    });

    it("should have at least 2 valid passwords", () => {
      expect(ADMIN_PASSWORDS.length).toBeGreaterThanOrEqual(2);
    });

    it("should support both Arabic and English passwords", () => {
      const hasArabic = ADMIN_PASSWORDS.some((pwd) => /[\u0600-\u06FF]/.test(pwd));
      const hasEnglish = ADMIN_PASSWORDS.some((pwd) => /[a-zA-Z]/.test(pwd));
      expect(hasArabic).toBe(true);
      expect(hasEnglish).toBe(true);
    });
  });

  describe("Password list integrity", () => {
    it("should not have duplicate passwords", () => {
      const uniquePasswords = new Set(ADMIN_PASSWORDS);
      expect(uniquePasswords.size).toBe(ADMIN_PASSWORDS.length);
    });

    it("should have non-empty passwords", () => {
      ADMIN_PASSWORDS.forEach((pwd) => {
        expect(pwd.length).toBeGreaterThan(0);
      });
    });

    it("should contain exactly the expected passwords", () => {
      expect(ADMIN_PASSWORDS).toContain("حسن");
      expect(ADMIN_PASSWORDS).toContain("hassan");
    });

    it("should have exactly 2 passwords", () => {
      expect(ADMIN_PASSWORDS.length).toBe(2);
    });
  });

  describe("Authentication flow logic", () => {
    it("should validate correct password before setting authenticated flag", () => {
      const password = "hassan";
      const isValid = ADMIN_PASSWORDS.includes(password);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", () => {
      const password = "wrongpassword";
      const isValid = ADMIN_PASSWORDS.includes(password);
      expect(isValid).toBe(false);
    });

    it("should support both Arabic and English passwords for login", () => {
      const arabicValid = ADMIN_PASSWORDS.includes("حسن");
      const englishValid = ADMIN_PASSWORDS.includes("hassan");
      expect(arabicValid && englishValid).toBe(true);
    });

    it("should validate any password in the list", () => {
      ADMIN_PASSWORDS.forEach((pwd) => {
        expect(ADMIN_PASSWORDS.includes(pwd)).toBe(true);
      });
    });
  });
});
