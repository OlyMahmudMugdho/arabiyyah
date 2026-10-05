import { getCategoriesAction } from "@/actions/category-actions";
import { CourseCreateForm } from "./CourseCreateForm";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const categories = await getCategoriesAction();
  const categoryNames = categories.map((c) => c.name);

  return <CourseCreateForm initialCategories={categoryNames} />;
}
