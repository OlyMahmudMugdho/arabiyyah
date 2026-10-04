import { getBooksAction } from "@/actions/book-actions";
import { BookManager } from "./BookManager";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const books = await getBooksAction({ onlyPublished: false });

  return <BookManager initialBooks={books} />;
}
