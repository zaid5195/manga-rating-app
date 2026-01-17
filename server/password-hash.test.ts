import { describe, expect, it } from "vitest";
import * as bcrypt from "bcryptjs";

describe("Password Hash Validation", () => {
  // كلمة السر الأصلية التي سيتم اختبارها
  const testPassword = "hassan";

  it("should have ADMIN_PASSWORD_HASH environment variable", () => {
    const hash = process.env.ADMIN_PASSWORD_HASH;
    expect(hash).toBeDefined();
    expect(hash).not.toBe("");
  });

  it("should reject incorrect password", async () => {
    const hash = process.env.ADMIN_PASSWORD_HASH;
    
    if (!hash) {
      throw new Error("ADMIN_PASSWORD_HASH is not set");
    }

    // التحقق من أن كلمة السر الخاطئة لا تطابق الـ hash
    const isValid = await bcrypt.compare("wrongpassword", hash);
    expect(isValid).toBe(false);
  });

  it("should reject empty password", async () => {
    const hash = process.env.ADMIN_PASSWORD_HASH;
    
    if (!hash) {
      throw new Error("ADMIN_PASSWORD_HASH is not set");
    }

    // التحقق من أن كلمة السر الفارغة لا تطابق الـ hash
    const isValid = await bcrypt.compare("", hash);
    expect(isValid).toBe(false);
  });

  it("should accept valid password", async () => {
    const hash = process.env.ADMIN_PASSWORD_HASH;
    
    if (!hash) {
      throw new Error("ADMIN_PASSWORD_HASH is not set");
    }

    // التحقق من أن كلمة السر الصحيحة تطابق الـ hash
    const isValid = await bcrypt.compare(testPassword, hash);
    expect(isValid).toBe(true);
  });
});
