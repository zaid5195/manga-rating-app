import { storagePut } from "./storage";
import { nanoid } from "nanoid";

/**
 * Upload image file to S3 storage
 * @param fileBuffer - The file buffer/bytes
 * @param fileName - Original file name
 * @param mimeType - MIME type of the file
 * @returns Object with URL and key
 */
export async function uploadImage(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  mimeType: string
) {
  try {
    // Generate a unique file name to prevent collisions
    const ext = fileName.split(".").pop() || "jpg";
    const uniqueName = `${nanoid()}.${ext}`;
    const fileKey = `manga-covers/${uniqueName}`;

    // Upload to S3
    const { url } = await storagePut(fileKey, fileBuffer, mimeType);

    return {
      success: true,
      url,
      key: fileKey,
    };
  } catch (error) {
    console.error("[Upload] Failed to upload image:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Validate image file
 * @param file - File object
 * @returns true if valid, throws error otherwise
 */
export async function validateImageFile(file: {
  size: number;
  type: string;
  name: string;
}) {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 5MB limit");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed");
  }

  if (!file.name) {
    throw new Error("File name is required");
  }

  return true;
}
