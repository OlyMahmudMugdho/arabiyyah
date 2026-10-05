"use server";

import { revalidatePath } from "next/cache";
import { getCourseRepository } from "@/db/data-source";
import { Course, AdminPermission } from "@/db/entities";
import { getSession, hasPermission } from "@/lib/auth";
import { getOrSetCache, invalidateCache, CacheTags } from "@/lib/cache";
import { logActivity } from "@/lib/activity-logger";

export interface CourseFilter {
  language?: string;
  level?: string;
  category?: string;
  search?: string;
  onlyPublished?: boolean;
}

export async function getCoursesAction(filter?: CourseFilter) {
  const cacheKey = `courses:list:${JSON.stringify(filter || {})}`;
  return await getOrSetCache(
    cacheKey,
    async () => {
      try {
        const courseRepo = await getCourseRepository();
        const query = courseRepo.createQueryBuilder("course");

        if (filter?.onlyPublished !== false) {
          if (filter?.onlyPublished === true) {
            query.andWhere("course.isPublished = :isPublished", { isPublished: true });
          }
        }

        if (filter?.language && filter.language !== "All") {
          query.andWhere("LOWER(course.language) = LOWER(:language)", {
            language: filter.language,
          });
        }

        if (filter?.level && filter.level !== "All") {
          query.andWhere("LOWER(course.level) = LOWER(:level)", {
            level: filter.level,
          });
        }

        if (filter?.category && filter.category !== "All") {
          query.andWhere("LOWER(course.category) LIKE LOWER(:category)", {
            category: `%${filter.category}%`,
          });
        }

        if (filter?.search) {
          query.andWhere(
            "(LOWER(course.title) LIKE LOWER(:search) OR LOWER(course.description) LIKE LOWER(:search) OR LOWER(course.instructor) LIKE LOWER(:search) OR (course.titleArabic IS NOT NULL AND course.titleArabic LIKE :search))",
            { search: `%${filter.search}%` }
          );
        }

        query.orderBy("course.createdAt", "DESC");

        return await query.getMany();
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        return [];
      }
    },
    { ttlSeconds: 300, tags: [CacheTags.COURSES] }
  );
}

export async function getCourseBySlugAction(slug: string) {
  const cacheKey = `courses:slug:${slug}`;
  return await getOrSetCache(
    cacheKey,
    async () => {
      try {
        const courseRepo = await getCourseRepository();
        return await courseRepo.findOne({
          where: { slug },
          relations: {
            pathCourses: {
              section: {
                path: true,
              },
            },
          },
        });
      } catch (err) {
        console.error("Failed to fetch course by slug:", err);
        return null;
      }
    },
    { ttlSeconds: 300, tags: [CacheTags.COURSES] }
  );
}

export async function createCourseAction(data: {
  title: string;
  titleArabic?: string;
  slug: string;
  description: string;
  instructor: string;
  language: string;
  level: string;
  category: string;
  duration?: string;
  thumbnailUrl?: string;
  resourceUrl?: string;
  syllabus?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_COURSES)) {
    return { error: "Unauthorized. Missing permission to manage courses." };
  }

  try {
    const courseRepo = await getCourseRepository();

    const existing = await courseRepo.findOne({ where: { slug: data.slug } });
    if (existing) {
      return { error: "A course with this URL slug already exists." };
    }

    const course = courseRepo.create({
      ...data,
      duration: data.duration || "Self-paced",
      isPublished: data.isPublished ?? true,
      isFeatured: data.isFeatured ?? false,
    });

    const saved = await courseRepo.save(course);
    invalidateCache([CacheTags.COURSES, CacheTags.DASHBOARD]);
    revalidatePath("/courses");
    revalidatePath("/admin/courses");
    revalidatePath("/");

    await logActivity({
      action: "course_create",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id: saved.id, title: saved.title, slug: saved.slug },
    });

    return { success: true, course: saved };
  } catch (err: unknown) {
    console.error("Failed to create course:", err);
    return { error: "Failed to create course: " + (err instanceof Error ? err.message : "Unknown error") };
  }
}

export async function updateCourseAction(
  id: string,
  data: Partial<Course>
) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_COURSES)) {
    return { error: "Unauthorized. Missing permission to manage courses." };
  }

  try {
    const courseRepo = await getCourseRepository();

    const course = await courseRepo.findOne({ where: { id } });
    if (!course) {
      return { error: "Course not found." };
    }

    Object.assign(course, data);
    const updated = await courseRepo.save(course);
    invalidateCache([CacheTags.COURSES, CacheTags.DASHBOARD]);
    revalidatePath("/courses");
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath("/admin/courses");
    revalidatePath("/");

    await logActivity({
      action: "course_update",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id: updated.id, title: updated.title, slug: updated.slug },
    });

    return { success: true, course: updated };
  } catch (err: unknown) {
    console.error("Failed to update course:", err);
    return { error: "Failed to update course." };
  }
}

export async function deleteCourseAction(id: string) {
  const session = await getSession();
  if (!hasPermission(session, AdminPermission.MANAGE_COURSES)) {
    return { error: "Unauthorized. Missing permission to manage courses." };
  }

  try {
    const courseRepo = await getCourseRepository();

    const course = await courseRepo.findOne({ where: { id } });
    await courseRepo.delete({ id });
    invalidateCache([CacheTags.COURSES, CacheTags.DASHBOARD]);
    revalidatePath("/courses");
    revalidatePath("/admin/courses");
    revalidatePath("/");

    await logActivity({
      action: "course_delete",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id, title: course?.title, slug: course?.slug },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete course:", err);
    return { error: "Failed to delete course." };
  }
}
