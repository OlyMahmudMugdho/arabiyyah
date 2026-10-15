import { notFound } from "next/navigation";
import { getCourseRepository } from "@/db/data-source";
import { getCategoriesAction } from "@/actions/category-actions";
import { CourseEditForm } from "./CourseEditForm";

export const dynamic = "force-dynamic";

export default async function AdminCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseRepo = await getCourseRepository();

  const [course, categories] = await Promise.all([
    courseRepo.findOne({ where: { id } }),
    getCategoriesAction(),
  ]);

  if (!course) {
    notFound();
  }

  const categoryNames = categories.map((c) => c.name);

  return <CourseEditForm course={course} initialCategories={categoryNames} />;
}
