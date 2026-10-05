"use server";

import { revalidatePath } from "next/cache";
import {
  getPathRepository,
  getSectionRepository,
  getPathCourseRepository,
} from "@/db/data-source";
import {
  LearningPath,
  PathSection,
  PathCourse,
  AdminPermission,
} from "@/db/entities";
import { getSession, hasPermission } from "@/lib/auth";
import { getOrSetCache, invalidateCache, CacheTags } from "@/lib/cache";

export async function getPathsAction(filter?: {
  level?: string;
  search?: string;
  onlyPublished?: boolean;
}) {
  const cacheKey = `paths:list:${JSON.stringify(filter || {})}`;
  return await getOrSetCache(
    cacheKey,
    async () => {
      try {
        const pathRepo = await getPathRepository();

        const query = pathRepo
          .createQueryBuilder("path")
          .leftJoinAndSelect("path.sections", "sections")
          .leftJoinAndSelect("sections.pathCourses", "pathCourses")
          .leftJoinAndSelect("pathCourses.course", "course");

        if (filter?.onlyPublished !== false) {
          if (filter?.onlyPublished === true) {
            query.andWhere("path.isPublished = :isPublished", { isPublished: true });
          }
        }

        if (filter?.level && filter.level !== "All") {
          query.andWhere("LOWER(path.level) = LOWER(:level)", {
            level: filter.level,
          });
        }

        if (filter?.search) {
          query.andWhere(
            "(LOWER(path.title) LIKE LOWER(:search) OR LOWER(path.description) LIKE LOWER(:search) OR (path.titleArabic IS NOT NULL AND path.titleArabic LIKE :search))",
            { search: `%${filter.search}%` }
          );
        }

        query.orderBy("path.createdAt", "DESC");
        query.addOrderBy("sections.orderIndex", "ASC");
        query.addOrderBy("pathCourses.orderIndex", "ASC");

        return await query.getMany();
      } catch (err) {
        console.error("Failed to fetch learning paths:", err);
        return [];
      }
    },
    { ttlSeconds: 300, tags: [CacheTags.PATHS] }
  );
}

export async function getPathBySlugAction(slug: string) {
  const cacheKey = `paths:slug:${slug}`;
  return await getOrSetCache(
    cacheKey,
    async () => {
      try {
        const pathRepo = await getPathRepository();

        return await pathRepo
          .createQueryBuilder("path")
          .leftJoinAndSelect("path.sections", "sections")
          .leftJoinAndSelect("sections.pathCourses", "pathCourses")
          .leftJoinAndSelect("pathCourses.course", "course")
          .where("path.slug = :slug", { slug })
          .orderBy("sections.orderIndex", "ASC")
          .addOrderBy("pathCourses.orderIndex", "ASC")
          .getOne();
      } catch (err) {
        console.error("Failed to fetch path by slug:", err);
        return null;
      }
    },
    { ttlSeconds: 300, tags: [CacheTags.PATHS] }
  );
}

export async function createPathAction(data: {
  title: string;
  titleArabic?: string;
  slug: string;
  description: string;
  level: string;
  estimatedHours: string;
  icon?: string;
  color?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_PATHS)) {
    return { error: "Unauthorized. Missing permission to manage paths." };
  }

  try {
    const pathRepo = await getPathRepository();

    const existing = await pathRepo.findOne({ where: { slug: data.slug } });
    if (existing) {
      return { error: "A path with this URL slug already exists." };
    }

    const path = pathRepo.create({
      ...data,
      icon: data.icon || "Compass",
      color: data.color || "emerald",
      isPublished: data.isPublished ?? true,
      isFeatured: data.isFeatured ?? false,
    });

    const saved = await pathRepo.save(path);
    invalidateCache([CacheTags.PATHS, CacheTags.DASHBOARD]);
    revalidatePath("/paths");
    revalidatePath("/admin/paths");
    revalidatePath("/");
    return { success: true, path: saved };
  } catch (err: unknown) {
    console.error("Failed to create path:", err);
    return { error: "Failed to create path: " + (err instanceof Error ? err.message : "Unknown error") };
  }
}

export async function updatePathAction(id: string, data: Partial<LearningPath>) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_PATHS)) {
    return { error: "Unauthorized. Missing permission to manage paths." };
  }

  try {
    const pathRepo = await getPathRepository();

    const path = await pathRepo.findOne({ where: { id } });
    if (!path) return { error: "Path not found." };

    Object.assign(path, data);
    const updated = await pathRepo.save(path);
    invalidateCache([CacheTags.PATHS, CacheTags.DASHBOARD]);
    revalidatePath("/paths");
    revalidatePath(`/paths/${path.slug}`);
    revalidatePath("/admin/paths");
    revalidatePath("/");
    return { success: true, path: updated };
  } catch (err: unknown) {
    console.error("Failed to update path:", err);
    return { error: "Failed to update path." };
  }
}

export async function deletePathAction(id: string) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_PATHS)) {
    return { error: "Unauthorized. Missing permission to manage paths." };
  }

  try {
    const pathRepo = await getPathRepository();

    await pathRepo.delete({ id });
    invalidateCache([CacheTags.PATHS, CacheTags.DASHBOARD]);
    revalidatePath("/paths");
    revalidatePath("/admin/paths");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete path:", err);
    return { error: "Failed to delete path." };
  }
}

// Section Management
export async function createPathSectionAction(
  pathId: string,
  data: {
    title: string;
    titleArabic?: string;
    description?: string;
    orderIndex?: number;
  }
) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_PATHS)) {
    return { error: "Unauthorized. Missing permission to manage paths." };
  }

  try {
    const sectionRepo = await getSectionRepository();

    const count = await sectionRepo.count({ where: { pathId } });
    const section = sectionRepo.create({
      pathId,
      title: data.title,
      titleArabic: data.titleArabic,
      description: data.description,
      orderIndex: data.orderIndex ?? count + 1,
    });

    const saved = await sectionRepo.save(section);
    invalidateCache([CacheTags.PATHS, CacheTags.DASHBOARD]);
    revalidatePath("/paths");
    revalidatePath("/admin/paths");
    return { success: true, section: saved };
  } catch (err: unknown) {
    console.error("Failed to create path section:", err);
    return { error: "Failed to create path section." };
  }
}

export async function updatePathSectionAction(
  sectionId: string,
  data: Partial<PathSection>
) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_PATHS)) {
    return { error: "Unauthorized. Missing permission to manage paths." };
  }

  try {
    const sectionRepo = await getSectionRepository();

    const section = await sectionRepo.findOne({ where: { id: sectionId } });
    if (!section) return { error: "Section not found." };

    Object.assign(section, data);
    const updated = await sectionRepo.save(section);
    invalidateCache([CacheTags.PATHS, CacheTags.DASHBOARD]);
    revalidatePath("/paths");
    revalidatePath("/admin/paths");
    return { success: true, section: updated };
  } catch (err: unknown) {
    console.error("Failed to update path section:", err);
    return { error: "Failed to update path section." };
  }
}

export async function deletePathSectionAction(sectionId: string) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_PATHS)) {
    return { error: "Unauthorized. Missing permission to manage paths." };
  }

  try {
    const sectionRepo = await getSectionRepository();

    await sectionRepo.delete({ id: sectionId });
    invalidateCache([CacheTags.PATHS, CacheTags.DASHBOARD]);
    revalidatePath("/paths");
    revalidatePath("/admin/paths");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete path section:", err);
    return { error: "Failed to delete path section." };
  }
}

// Course in Section Management
export async function addCourseToSectionAction(data: {
  sectionId: string;
  courseId: string;
  orderIndex?: number;
  isMandatory?: boolean;
  customNotes?: string;
}) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_PATHS)) {
    return { error: "Unauthorized. Missing permission to manage paths." };
  }

  try {
    const pathCourseRepo = await getPathCourseRepository();

    const count = await pathCourseRepo.count({
      where: { sectionId: data.sectionId },
    });

    const item = pathCourseRepo.create({
      sectionId: data.sectionId,
      courseId: data.courseId,
      orderIndex: data.orderIndex ?? count + 1,
      isMandatory: data.isMandatory ?? true,
      customNotes: data.customNotes,
    });

    const saved = await pathCourseRepo.save(item);
    invalidateCache([CacheTags.PATHS, CacheTags.DASHBOARD]);
    revalidatePath("/paths");
    revalidatePath("/admin/paths");
    return { success: true, item: saved };
  } catch (err: unknown) {
    console.error("Failed to add course to path section:", err);
    return { error: "Failed to add course to path section." };
  }
}

export async function removeCourseFromSectionAction(pathCourseId: string) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_PATHS)) {
    return { error: "Unauthorized. Missing permission to manage paths." };
  }

  try {
    const pathCourseRepo = await getPathCourseRepository();

    await pathCourseRepo.delete({ id: pathCourseId });
    invalidateCache([CacheTags.PATHS, CacheTags.DASHBOARD]);
    revalidatePath("/paths");
    revalidatePath("/admin/paths");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to remove course from path section:", err);
    return { error: "Failed to remove course from section." };
  }
}
