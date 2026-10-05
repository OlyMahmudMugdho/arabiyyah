import { Compass } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PathCard } from "@/components/PathCard";
import { getPathsAction } from "@/actions/path-actions";

export const revalidate = 60;

export default async function PathsPage() {
  const paths = await getPathsAction({ onlyPublished: true });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 bg-arabesque text-slate-900 dark:bg-[#0b101b] dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        {/* Page Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Sequential Curricula</span>
            <span className="font-arabic font-bold text-sm">المسارات المنهجية</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sequential Learning Paths
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
            Follow cohesive multi-stage curricula connecting specialized courses divided into milestone stages—from foundational grammar to classical literature.
          </p>
        </div>

        {/* Paths Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {paths.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
