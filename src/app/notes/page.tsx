import { FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NoteFilterList } from "@/components/NoteFilterList";
import { getNotesAction } from "@/actions/note-actions";

export const revalidate = 60;

export default async function NotesPage() {
  const notes = await getNotesAction({ onlyPublished: true });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 bg-arabesque text-slate-900 dark:bg-[#0b101b] dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        {/* Page Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>High-Yield Study Summaries</span>
            <span className="font-arabic font-bold text-sm">الجداول والفوائد</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Grammar Matrices & Study Summaries
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
            Concise reference charts for ten-form verb paradigms, case endings (I&apos;rab), particle functions, and pronoun variations.
          </p>
        </div>

        <NoteFilterList initialNotes={notes} />
      </main>

      <Footer />
    </div>
  );
}
