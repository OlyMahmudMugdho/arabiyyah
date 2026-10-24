import { NextRequest, NextResponse } from "next/server";
import { getSession, hasPermission } from "@/lib/auth";
import { AdminPermission } from "@/db/entities";
import {
  isCloudinaryConfigured,
  uploadFileToCloudinary,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";
import { logActivity } from "@/lib/activity-logger";

export const dynamic = "force-dynamic";

/**
 * GET: Check whether Cloudinary configuration environment variables are present.
 */
export async function GET() {
  const session = await getSession();
  if (!session || !hasPermission(session, AdminPermission.MANAGE_NOTES)) {
    return NextResponse.json(
      { error: "Unauthorized. Missing permission to manage notes." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    configured: isCloudinaryConfigured(),
  });
}

/**
 * POST: Upload study note file (PDF, image, document) or preview thumbnail to Cloudinary ("arabiyyah/notes").
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !hasPermission(session, AdminPermission.MANAGE_NOTES)) {
    return NextResponse.json(
      { error: "Unauthorized. Missing permission to manage notes." },
      { status: 401 }
    );
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.",
        configured: false,
      },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const uploadType = (formData.get("type") as string) || "file";

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No file provided in request." },
        { status: 400 }
      );
    }

    const mimeType = file.type || "application/octet-stream";
    const fileName = (file as File).name || "note_asset";

    if (uploadType === "preview") {
      if (!mimeType.startsWith("image/")) {
        return NextResponse.json(
          { error: "Invalid file type. Please upload an image file (JPEG, PNG, WebP, etc.)." },
          { status: 400 }
        );
      }

      const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: "Image file exceeds maximum allowable size of 10MB." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await uploadImageToCloudinary(buffer, {
        folder: "arabiyyah/notes",
        tags: ["note_preview", "arabiyyah"],
      });

      await logActivity({
        action: "note_preview_upload",
        userId: session.userId,
        userName: session.name,
        userEmail: session.email,
        details: {
          fileName,
          fileSize: file.size,
          mimeType,
          publicId: uploadResult.publicId,
          url: uploadResult.secureUrl,
        },
      });

      return NextResponse.json({
        success: true,
        url: uploadResult.secureUrl,
        secureUrl: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
      });
    }

    // Default: note document/file upload
    const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds maximum allowable size of 50MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadFileToCloudinary(buffer, {
      folder: "arabiyyah/notes",
      tags: ["note_file", "arabiyyah"],
      resourceType: "auto",
      fileName,
    });

    await logActivity({
      action: "note_file_upload",
      userId: session.userId,
      userName: session.name,
      userEmail: session.email,
      details: {
        fileName,
        fileSize: file.size,
        mimeType,
        publicId: uploadResult.publicId,
        url: uploadResult.secureUrl,
      },
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secureUrl,
      secureUrl: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      pages: uploadResult.pages,
    });
  } catch (err: unknown) {
    console.error("Cloudinary upload failed in notes upload API route:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to upload file to Cloudinary.",
      },
      { status: 500 }
    );
  }
}
