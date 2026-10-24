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
  if (!session || !hasPermission(session, AdminPermission.MANAGE_BOOKS)) {
    return NextResponse.json(
      { error: "Unauthorized. Missing permission to manage books." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    configured: isCloudinaryConfigured(),
  });
}

/**
 * POST: Upload book file (PDF, EPUB, document) or book cover image to Cloudinary ("arabiyyah/books").
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !hasPermission(session, AdminPermission.MANAGE_BOOKS)) {
    return NextResponse.json(
      { error: "Unauthorized. Missing permission to manage books." },
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

    const mimeType = file.type || "application/pdf";
    const fileName = (file as File).name || "book_asset";

    if (uploadType === "cover") {
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
        folder: "arabiyyah/books",
        tags: ["book_cover", "arabiyyah"],
      });

      await logActivity({
        action: "book_cover_upload",
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

    // Default: book file (PDF / document) upload
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
      folder: "arabiyyah/books",
      tags: ["book_file", "arabiyyah"],
      resourceType: "auto",
      fileName,
    });

    await logActivity({
      action: "book_file_upload",
      userId: session.userId,
      userName: session.name,
      userEmail: session.email,
      details: {
        fileName,
        fileSize: file.size,
        mimeType,
        publicId: uploadResult.publicId,
        url: uploadResult.secureUrl,
        pages: uploadResult.pages,
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
    console.error("Cloudinary upload failed in books upload API route:", err);
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
