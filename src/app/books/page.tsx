import { BookOpen } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookFilterList } from "@/components/BookFilterList";
import { getBooksAction } from "@/actions/book-actions";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const books = await getBooksAction({ onlyPublished: true });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 bg-arabesque text-slate-900 dark:bg-[#0b101b] dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        {/* Page Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-semibold mb-3 dark:border-amber-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Classical Library & Modern Textbooks</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Arabic Books, Primers & Dictionaries
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
            Free downloadable PDFs of foundational grammatical poems (mutun), modern inductive curricula (Al-Nahw Al-Wadih), root-based lexicons (Hans Wehr), and graded readers.
          </p>
        </div>

        <BookFilterList initialBooks={books} />
      </main>

      <Footer />
    </div>
  );
}
