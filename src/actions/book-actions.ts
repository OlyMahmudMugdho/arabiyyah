"use server";

import { revalidatePath } from "next/cache";
import { getBookRepository } from "@/db/data-source";
import { Book, AdminPermission } from "@/db/entities";
import { getSession, hasPermission } from "@/lib/auth";
import { getOrSetCache, invalidateCache, CacheTags } from "@/lib/cache";
import { logActivity } from "@/lib/activity-logger";
import {
  isCloudinaryConfigured,
  uploadFileToCloudinary,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";

export async function getBooksAction(filter?: {
  category?: string;
  level?: string;
  language?: string;
  search?: string;
  onlyPublished?: boolean;
}) {
  const cacheKey = `books:list:${JSON.stringify(filter || {})}`;
  return await getOrSetCache(
    cacheKey,
    async () => {
      try {
        const bookRepo = await getBookRepository();

        const query = bookRepo.createQueryBuilder("book");

        if (filter?.onlyPublished !== false) {
          if (filter?.onlyPublished === true) {
            query.andWhere("book.isPublished = :isPublished", { isPublished: true });
          }
        }

        if (filter?.category && filter.category !== "All") {
          query.andWhere("LOWER(book.category) LIKE LOWER(:category)", {
            category: `%${filter.category}%`,
          });
        }

        if (filter?.level && filter.level !== "All") {
          query.andWhere("LOWER(book.level) = LOWER(:level)", {
            level: filter.level,
          });
        }

        if (filter?.language && filter.language !== "All") {
          query.andWhere("LOWER(book.language) LIKE LOWER(:language)", {
            language: `%${filter.language}%`,
          });
        }

        if (filter?.search) {
          query.andWhere(
            "(LOWER(book.title) LIKE LOWER(:search) OR LOWER(book.author) LIKE LOWER(:search) OR LOWER(book.description) LIKE LOWER(:search) OR (book.titleArabic IS NOT NULL AND book.titleArabic LIKE :search))",
            { search: `%${filter.search}%` }
          );
        }

        query.orderBy("book.createdAt", "DESC");
        return await query.getMany();
      } catch (err) {
        console.error("Failed to fetch books:", err);
        return [];
      }
    },
    { ttlSeconds: 300, tags: [CacheTags.BOOKS] }
  );
}

export async function createBookAction(data: {
  title: string;
  titleArabic?: string;
  author: string;
  category: string;
  level: string;
  language: string;
  pages: number;
  fileUrl?: string;
  coverUrl?: string;
  description: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_BOOKS)) {
    return { error: "Unauthorized. Missing permission to manage books." };
  }

  try {
    const bookRepo = await getBookRepository();

    const book = bookRepo.create({
      ...data,
      isPublished: data.isPublished ?? true,
      isFeatured: data.isFeatured ?? false,
    });

    const saved = await bookRepo.save(book);
    invalidateCache([CacheTags.BOOKS, CacheTags.DASHBOARD]);
    revalidatePath("/books");
    revalidatePath("/admin/books");
    revalidatePath("/");

    await logActivity({
      action: "book_create",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id: saved.id, title: saved.title, author: saved.author },
    });

    return { success: true, book: saved };
  } catch (err: unknown) {
    console.error("Failed to create book:", err);
    return { error: "Failed to create book: " + (err instanceof Error ? err.message : "Unknown error") };
  }
}

export async function updateBookAction(id: string, data: Partial<Book>) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_BOOKS)) {
    return { error: "Unauthorized. Missing permission to manage books." };
  }

  try {
    const bookRepo = await getBookRepository();

    const book = await bookRepo.findOne({ where: { id } });
    if (!book) return { error: "Book not found." };

    Object.assign(book, data);
    const updated = await bookRepo.save(book);
    invalidateCache([CacheTags.BOOKS, CacheTags.DASHBOARD]);
    revalidatePath("/books");
    revalidatePath("/admin/books");
    revalidatePath("/");

    await logActivity({
      action: "book_update",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id: updated.id, title: updated.title, author: updated.author },
    });

    return { success: true, book: updated };
  } catch (err: unknown) {
    console.error("Failed to update book:", err);
    return { error: "Failed to update book." };
  }
}

export async function deleteBookAction(id: string) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_BOOKS)) {
    return { error: "Unauthorized. Missing permission to manage books." };
  }

  try {
    const bookRepo = await getBookRepository();

    const book = await bookRepo.findOne({ where: { id } });
    await bookRepo.delete({ id });
    invalidateCache([CacheTags.BOOKS, CacheTags.DASHBOARD]);
    revalidatePath("/books");
    revalidatePath("/admin/books");
    revalidatePath("/");

    await logActivity({
      action: "book_delete",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id, title: book?.title },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete book:", err);
    return { error: "Failed to delete book." };
  }
}

export async function uploadBookFileAction(formData: FormData): Promise<{
  success?: boolean;
  url?: string;
  publicId?: string;
  format?: string;
  bytes?: number;
  pages?: number;
  error?: string;
}> {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_BOOKS)) {
    return { error: "Unauthorized. Missing permission to manage books." };
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

  const fileName = (file as File).name || "book_file";
  const mimeType = file.type || "application/pdf";

  try {
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
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: {
        fileName,
        fileSize: file.size,
        mimeType,
        publicId: uploadResult.publicId,
        url: uploadResult.secureUrl,
        pages: uploadResult.pages,
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
    console.error("Failed to upload book file to Cloudinary:", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Failed to upload book file to Cloudinary.",
    };
  }
}

export async function uploadBookCoverAction(formData: FormData): Promise<{
  success?: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}> {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_BOOKS)) {
    return { error: "Unauthorized. Missing permission to manage books." };
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
      folder: "arabiyyah/books",
      tags: ["book_cover", "arabiyyah"],
    });

    await logActivity({
      action: "book_cover_upload",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: {
        fileName: (file as File).name || "book_cover",
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
    console.error("Failed to upload book cover to Cloudinary:", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Failed to upload cover image to Cloudinary.",
    };
  }
}
