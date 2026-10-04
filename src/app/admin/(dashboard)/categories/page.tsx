import { getCategoriesAction } from "@/actions/category-actions";
import { CategoryManager } from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesAction();

  return <CategoryManager initialCategories={categories} />;
}
