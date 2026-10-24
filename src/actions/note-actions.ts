"use server";

import { revalidatePath } from "next/cache";
import { getNoteRepository } from "@/db/data-source";
import { Note, AdminPermission } from "@/db/entities";
import { getSession, hasPermission } from "@/lib/auth";
import { getOrSetCache, invalidateCache, CacheTags } from "@/lib/cache";
import { logActivity } from "@/lib/activity-logger";
import {
  isCloudinaryConfigured,
  uploadFileToCloudinary,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";

export async function getNotesAction(filter?: {
  topic?: string;
  level?: string;
  format?: string;
  search?: string;
  onlyPublished?: boolean;
}) {
  const cacheKey = `notes:list:${JSON.stringify(filter || {})}`;
  return await getOrSetCache(
    cacheKey,
    async () => {
      try {
        const noteRepo = await getNoteRepository();

        const query = noteRepo.createQueryBuilder("note");

        if (filter?.onlyPublished !== false) {
          if (filter?.onlyPublished === true) {
            query.andWhere("note.isPublished = :isPublished", { isPublished: true });
          }
        }

        if (filter?.topic && filter.topic !== "All") {
          query.andWhere("LOWER(note.topic) LIKE LOWER(:topic)", {
            topic: `%${filter.topic}%`,
          });
        }

        if (filter?.level && filter.level !== "All") {
          query.andWhere("LOWER(note.level) = LOWER(:level)", {
            level: filter.level,
          });
        }

        if (filter?.format && filter.format !== "All") {
          query.andWhere("LOWER(note.format) = LOWER(:format)", {
            format: filter.format,
          });
        }

        if (filter?.search) {
          query.andWhere(
            "(LOWER(note.title) LIKE LOWER(:search) OR LOWER(note.topic) LIKE LOWER(:search) OR LOWER(note.description) LIKE LOWER(:search) OR LOWER(note.author) LIKE LOWER(:search))",
            { search: `%${filter.search}%` }
          );
        }

        query.orderBy("note.createdAt", "DESC");
        return await query.getMany();
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        return [];
      }
    },
    { ttlSeconds: 300, tags: [CacheTags.NOTES] }
  );
}

export async function createNoteAction(data: {
  title: string;
  topic: string;
  level: string;
  format: string;
  fileUrl?: string;
  previewUrl?: string;
  description: string;
  author: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_NOTES)) {
    return { error: "Unauthorized. Missing permission to manage notes." };
  }

  try {
    const noteRepo = await getNoteRepository();

    const note = noteRepo.create({
      ...data,
      isPublished: data.isPublished ?? true,
      isFeatured: data.isFeatured ?? false,
    });

    const saved = await noteRepo.save(note);
    invalidateCache([CacheTags.NOTES, CacheTags.DASHBOARD]);
    revalidatePath("/notes");
    revalidatePath("/admin/notes");
    revalidatePath("/");

    await logActivity({
      action: "note_create",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id: saved.id, title: saved.title, topic: saved.topic },
    });

    return { success: true, note: saved };
  } catch (err: unknown) {
    console.error("Failed to create note:", err);
    return { error: "Failed to create note: " + (err instanceof Error ? err.message : "Unknown error") };
  }
}

export async function updateNoteAction(id: string, data: Partial<Note>) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_NOTES)) {
    return { error: "Unauthorized. Missing permission to manage notes." };
  }

  try {
    const noteRepo = await getNoteRepository();

    const note = await noteRepo.findOne({ where: { id } });
    if (!note) return { error: "Note not found." };

    Object.assign(note, data);
    const updated = await noteRepo.save(note);
    invalidateCache([CacheTags.NOTES, CacheTags.DASHBOARD]);
    revalidatePath("/notes");
    revalidatePath("/admin/notes");
    revalidatePath("/");

    await logActivity({
      action: "note_update",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id: updated.id, title: updated.title, topic: updated.topic },
    });

    return { success: true, note: updated };
  } catch (err: unknown) {
    console.error("Failed to update note:", err);
    return { error: "Failed to update note." };
  }
}

export async function deleteNoteAction(id: string) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_NOTES)) {
    return { error: "Unauthorized. Missing permission to manage notes." };
  }

  try {
    const noteRepo = await getNoteRepository();

    const note = await noteRepo.findOne({ where: { id } });
    await noteRepo.delete({ id });
    invalidateCache([CacheTags.NOTES, CacheTags.DASHBOARD]);
    revalidatePath("/notes");
    revalidatePath("/admin/notes");
    revalidatePath("/");

    await logActivity({
      action: "note_delete",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id, title: note?.title },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete note:", err);
    return { error: "Failed to delete note." };
  }
}

export async function uploadNoteFileAction(formData: FormData): Promise<{
  success?: boolean;
  url?: string;
  publicId?: string;
  format?: string;
  bytes?: number;
  pages?: number;
  error?: string;
}> {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_NOTES)) {
    return { error: "Unauthorized. Missing permission to manage notes." };
  }

  if (!isCloudinaryConfigured()) {
    return {
      error:
        "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.",
    };
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return { error: "No file provided." };
  }

  const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
  if (file.size > MAX_SIZE_BYTES) {
    return { error: "File exceeds maximum allowable size of 50MB." };
  }

  const fileName = (file as File).name || "note_file";
  const mimeType = file.type || "application/octet-stream";

  try {
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
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: {
        fileName,
        fileSize: file.size,
        mimeType,
        publicId: uploadResult.publicId,
        url: uploadResult.secureUrl,
      },
    });

    return {
      success: true,
      url: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      pages: uploadResult.pages,
    };
  } catch (err: unknown) {
    console.error("Failed to upload note file to Cloudinary:", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Failed to upload file to Cloudinary.",
    };
  }
}

export async function uploadNotePreviewAction(formData: FormData): Promise<{
  success?: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}> {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_NOTES)) {
    return { error: "Unauthorized. Missing permission to manage notes." };
  }

  if (!isCloudinaryConfigured()) {
    return {
      error:
        "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.",
    };
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return { error: "No image file provided." };
  }

  const mimeType = file.type;
  if (!mimeType.startsWith("image/")) {
    return { error: "Selected file must be an image (JPEG, PNG, WebP, etc.)." };
  }

  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE_BYTES) {
    return { error: "Image file exceeds maximum allowable size of 10MB." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadImageToCloudinary(buffer, {
      folder: "arabiyyah/notes",
      tags: ["note_preview", "arabiyyah"],
    });

    await logActivity({
      action: "note_preview_upload",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: {
        fileName: (file as File).name || "note_preview",
        fileSize: file.size,
        mimeType,
        publicId: uploadResult.publicId,
        url: uploadResult.secureUrl,
      },
    });

    return {
      success: true,
      url: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
    };
  } catch (err: unknown) {
    console.error("Failed to upload note preview image to Cloudinary:", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Failed to upload image to Cloudinary.",
    };
  }
}
