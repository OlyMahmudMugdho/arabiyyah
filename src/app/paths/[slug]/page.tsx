import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Compass,
  Clock,
  Layers,
  GraduationCap,
  Globe,
  ExternalLink,
  BookOpen,
  Info,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getPathBySlugAction } from "@/actions/path-actions";

export const dynamic = "force-dynamic";

export default async function PathDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = await getPathBySlugAction(slug);

  if (!path) {
    notFound();
  }

  const totalCourses =
    path.sections?.reduce(
      (sum, s) => sum + (s.pathCourses?.length || 0),
      0
    ) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] bg-arabesque text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        {/* Back Link */}
        <Link
          href="/paths"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Learning Paths</span>
        </Link>

        {/* Path Header */}
        <div className="rounded-3xl bg-[#0f172a]/90 border border-slate-800 p-6 md:p-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {path.level}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{path.estimatedHours} Total Roadmap</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{path.sections?.length || 0} Milestone Stages</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{totalCourses} Courses Combined</span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white">
              {path.title}
            </h1>
            {path.titleArabic && (
              <p className="font-arabic text-xl md:text-2xl font-bold text-emerald-400">
                {path.titleArabic}
              </p>
            )}
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            {path.description}
          </p>
        </div>

        {/* Multi-Section Roadmap Timeline */}
        <div className="mt-12 space-y-10">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">
              Sequential Milestone Stages
            </h2>
          </div>

          {path.sections && path.sections.length > 0 ? (
            <div className="space-y-12">
              {path.sections.map((section, sIndex) => (
                <div
                  key={section.id}
                  className="relative pl-6 md:pl-10 border-l-2 border-emerald-500/30 space-y-6"
                >
                  {/* Stage Number Node */}
                  <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-emerald-600 border-4 border-[#0b101b] text-white font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-900/40">
                    {sIndex + 1}
                  </div>

                  {/* Section Title & Description */}
                  <div className="space-y-1.5 bg-[#0f172a]/60 p-5 rounded-2xl border border-slate-800/80">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <h3 className="text-lg md:text-xl font-bold text-white">
                        {section.title}
                      </h3>
                      {section.titleArabic && (
                        <span className="font-arabic text-sm font-bold text-emerald-400">
                          {section.titleArabic}
                        </span>
                      )}
                    </div>
                    {section.description && (
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {section.description}
                      </p>
                    )}
                  </div>

                  {/* Courses in this section */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        Stage Courses ({section.pathCourses?.length || 0})
                      </span>
                    </h4>

                    {section.pathCourses && section.pathCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.pathCourses.map((pc, cIndex) => {
                          const course = pc.course;
                          if (!course) return null;

                          return (
                            <div
                              key={pc.id}
                              className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-emerald-500/40 flex flex-col justify-between space-y-4 transition-all"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-bold text-slate-400">
                                    Step {sIndex + 1}.{cIndex + 1}
                                  </span>
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                      pc.isMandatory
                                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                        : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                    }`}
                                  >
                                    {pc.isMandatory ? "Mandatory" : "Optional"}
                                  </span>
                                </div>

                                <h5 className="font-bold text-base text-white hover:text-emerald-300 transition-colors">
                                  <Link href={`/courses/${course.slug}`}>
                                    {course.title}
                                  </Link>
                                </h5>

                                {course.titleArabic && (
                                  <p className="font-arabic text-xs font-medium text-emerald-400/90">
                                    {course.titleArabic}
                                  </p>
                                )}

                                <p className="text-xs text-slate-400 line-clamp-2">
                                  {course.description}
                                </p>

                                {pc.customNotes && (
                                  <div className="mt-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-amber-300/90 flex items-start gap-2">
                                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                    <span className="leading-snug">
                                      {pc.customNotes}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                                <div className="flex items-center gap-1.5">
                                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{course.language}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/courses/${course.slug}`}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-white font-medium transition-colors"
                                  >
                                    Details
                                  </Link>
                                  {course.resourceUrl && (
                                    <a
                                      href={course.resourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                      title="Open Source Video/Material"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        No courses assigned to this section yet.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>Roadmap stages are currently being structured by administrators.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
