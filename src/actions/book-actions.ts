"use server";

import { revalidatePath } from "next/cache";
import { getDataSource } from "@/db/data-source";
import { Book, AdminPermission } from "@/db/entities";
import { getSession, hasPermission } from "@/lib/auth";

export async function getBooksAction(filter?: {
  category?: string;
  level?: string;
  language?: string;
  search?: string;
  onlyPublished?: boolean;
}) {
  try {
    const dataSource = await getDataSource();
    const bookRepo = dataSource.getRepository(Book);

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
    const dataSource = await getDataSource();
    const bookRepo = dataSource.getRepository(Book);

    const book = bookRepo.create({
      ...data,
      isPublished: data.isPublished ?? true,
      isFeatured: data.isFeatured ?? false,
    });

    const saved = await bookRepo.save(book);
    revalidatePath("/books");
    revalidatePath("/admin/books");
    revalidatePath("/");
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
    const dataSource = await getDataSource();
    const bookRepo = dataSource.getRepository(Book);

    const book = await bookRepo.findOne({ where: { id } });
    if (!book) return { error: "Book not found." };

    Object.assign(book, data);
    const updated = await bookRepo.save(book);
    revalidatePath("/books");
    revalidatePath("/admin/books");
    revalidatePath("/");
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
    const dataSource = await getDataSource();
    const bookRepo = dataSource.getRepository(Book);

    await bookRepo.delete({ id });
    revalidatePath("/books");
    revalidatePath("/admin/books");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete book:", err);
    return { error: "Failed to delete book." };
  }
}
