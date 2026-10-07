import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Checks whether Cloudinary environment variables are configured.
 */
export function isCloudinaryConfigured(): boolean {
  if (process.env.CLOUDINARY_URL) return true;
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Configures the Cloudinary SDK using environment variables.
 * Returns true if configured successfully, false otherwise.
 */
export function configureCloudinary(): boolean {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloudinary_url: process.env.CLOUDINARY_URL,
      secure: true,
    });
    return true;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }

  return false;
}

/**
 * Uploads a file buffer to Cloudinary.
 *
 * @param buffer - The raw binary buffer of the image file
 * @param options - Upload options including target folder, public ID, and tags
 */
export async function uploadImageToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    publicId?: string;
    tags?: string[];
  } = {}
): Promise<CloudinaryUploadResult> {
  const configured = configureCloudinary();
  if (!configured) {
    throw new Error(
      "Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables."
    );
  }

  const folder =
    options.folder || process.env.CLOUDINARY_FOLDER || "arabiyyah/courses";

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options.publicId,
        resource_type: "image",
        tags: options.tags,
        overwrite: true,
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(
            error ||
              new Error("Failed to upload image to Cloudinary (no result returned).")
          );
        } else {
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deletes an asset from Cloudinary by its public ID.
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  if (!isCloudinaryConfigured()) return false;
  configureCloudinary();
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === "ok";
  } catch (err) {
    console.error("Failed to delete Cloudinary image:", err);
    return false;
  }
}
