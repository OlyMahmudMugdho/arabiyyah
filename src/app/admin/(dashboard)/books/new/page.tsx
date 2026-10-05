import { getCategoriesAction } from "@/actions/category-actions";
import { BookCreateForm } from "./BookCreateForm";

export const dynamic = "force-dynamic";

export default async function NewBookPage() {
  const categories = await getCategoriesAction();
  const categoryNames = categories.map((c) => c.name);

  return <BookCreateForm initialCategories={categoryNames} />;
}
