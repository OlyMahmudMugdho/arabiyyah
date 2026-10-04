import { Compass } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PathCard } from "@/components/PathCard";
import { getPathsAction } from "@/actions/path-actions";

export default async function PathsPage() {
  const paths = await getPathsAction({ onlyPublished: true });

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] bg-arabesque text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        {/* Page Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/20">
            <Compass className="w-3.5 h-3.5" />
            <span>Curated Syllabi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Sequential Learning Paths
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
            Rather than learning in isolation, follow cohesive multi-stage curricula. Each path combines specialized courses divided into logical milestones—from foundational morphology to higher rhetoric.
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
