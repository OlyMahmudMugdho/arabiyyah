"use server";

import { revalidatePath } from "next/cache";
import { getDataSource } from "@/db/data-source";
import { Course, AdminPermission } from "@/db/entities";
import { getSession, hasPermission } from "@/lib/auth";

export interface CourseFilter {
  language?: string;
  level?: string;
  category?: string;
  search?: string;
  onlyPublished?: boolean;
}

export async function getCoursesAction(filter?: CourseFilter) {
  try {
    const dataSource = await getDataSource();
    const courseRepo = dataSource.getRepository(Course);

    const query = courseRepo.createQueryBuilder("course");

    if (filter?.onlyPublished !== false) {
      // By default show published courses for public queries unless explicitly disabled (e.g. admin)
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
}

export async function getCourseBySlugAction(slug: string) {
  try {
    const dataSource = await getDataSource();
    const courseRepo = dataSource.getRepository(Course);
    return await courseRepo.findOne({
      where: { slug },
      relations: ["pathCourses", "pathCourses.section", "pathCourses.section.path"],
    });
  } catch (err) {
    console.error("Failed to fetch course by slug:", err);
    return null;
  }
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
    const dataSource = await getDataSource();
    const courseRepo = dataSource.getRepository(Course);

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
    revalidatePath("/courses");
    revalidatePath("/admin/courses");
    revalidatePath("/");
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
    const dataSource = await getDataSource();
    const courseRepo = dataSource.getRepository(Course);

    const course = await courseRepo.findOne({ where: { id } });
    if (!course) {
      return { error: "Course not found." };
    }

    Object.assign(course, data);
    const updated = await courseRepo.save(course);
    revalidatePath("/courses");
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath("/admin/courses");
    revalidatePath("/");
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
    const dataSource = await getDataSource();
    const courseRepo = dataSource.getRepository(Course);

    await courseRepo.delete({ id });
    revalidatePath("/courses");
    revalidatePath("/admin/courses");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete course:", err);
    return { error: "Failed to delete course." };
  }
}
