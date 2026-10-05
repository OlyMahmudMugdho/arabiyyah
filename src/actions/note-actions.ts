"use server";

import { revalidatePath } from "next/cache";
import { getNoteRepository } from "@/db/data-source";
import { Note, AdminPermission } from "@/db/entities";
import { getSession, hasPermission } from "@/lib/auth";
import { getOrSetCache, invalidateCache, CacheTags } from "@/lib/cache";

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

    await noteRepo.delete({ id });
    invalidateCache([CacheTags.NOTES, CacheTags.DASHBOARD]);
    revalidatePath("/notes");
    revalidatePath("/admin/notes");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete note:", err);
    return { error: "Failed to delete note." };
  }
}
