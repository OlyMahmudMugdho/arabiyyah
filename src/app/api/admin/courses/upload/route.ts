import { NextRequest, NextResponse } from "next/server";
import { getSession, hasPermission } from "@/lib/auth";
import { AdminPermission } from "@/db/entities";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "@/lib/cloudinary";
import { logActivity } from "@/lib/activity-logger";

export const dynamic = "force-dynamic";

/**
 * GET: Check whether Cloudinary configuration environment variables are present.
 */
export async function GET() {
  const session = await getSession();
  if (!session || !hasPermission(session, AdminPermission.MANAGE_COURSES)) {
    return NextResponse.json(
      { error: "Unauthorized. Missing permission to manage courses." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    configured: isCloudinaryConfigured(),
  });
}

/**
 * POST: Upload course thumbnail image file to Cloudinary.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !hasPermission(session, AdminPermission.MANAGE_COURSES)) {
    return NextResponse.json(
      { error: "Unauthorized. Missing permission to manage courses." },
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

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No image file provided in request." },
        { status: 400 }
      );
    }

    const mimeType = file.type;
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image file (JPEG, PNG, WebP, etc.)." },
        { status: 400 }
      );
    }

    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image file exceeds maximum allowable size of 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadImageToCloudinary(buffer, {
      folder: "arabiyyah/courses",
      tags: ["course_thumbnail", "arabiyyah"],
    });

    await logActivity({
      action: "course_thumbnail_upload",
      userId: session.userId,
      userName: session.name,
      userEmail: session.email,
      details: {
        fileName: (file as File).name || "thumbnail",
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
  } catch (err: unknown) {
    console.error("Cloudinary upload failed in API route:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to upload image to Cloudinary.",
      },
      { status: 500 }
    );
  }
}
