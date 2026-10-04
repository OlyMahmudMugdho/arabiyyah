import { FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NoteFilterList } from "@/components/NoteFilterList";
import { getNotesAction } from "@/actions/note-actions";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const notes = await getNotesAction({ onlyPublished: true });

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] bg-arabesque text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        {/* Page Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-3 border border-purple-500/20">
            <FileText className="w-3.5 h-3.5" />
            <span>High-Yield Study Summaries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Grammar Notes, Mindmaps & Cheat Sheets
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
            Concise, color-coded visual charts for 10-form verb paradigms, case endings (I&apos;rab), particle functions, and pronoun variations.
          </p>
        </div>

        <NoteFilterList initialNotes={notes} />
      </main>

      <Footer />
    </div>
  );
}
