import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Globe,
  User,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCourseBySlugAction } from "@/actions/course-actions";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlugAction(slug);

  if (!course) {
    notFound();
  }

  let syllabusList: string[] = [];
  if (course.syllabus) {
    try {
      syllabusList = JSON.parse(course.syllabus);
    } catch {
      syllabusList = course.syllabus.split("\n").filter(Boolean);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] bg-arabesque text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        {/* Back Link */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </Link>

        {/* Course Header Banner */}
        <div className="rounded-3xl bg-[#0f172a]/80 border border-slate-800 p-6 md:p-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {course.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {course.level}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Language: {course.language}</span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white">
              {course.title}
            </h1>
            {course.titleArabic && (
              <p className="font-arabic text-xl md:text-2xl font-bold text-emerald-400">
                {course.titleArabic}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Instructor: <strong>{course.instructor}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Duration: <strong>{course.duration}</strong></span>
            </div>
          </div>

          {/* Action Button */}
          {course.resourceUrl && (
            <div className="pt-2">
              <a
                href={course.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 transition-all"
              >
                <span>Access Course Content / Video Series</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Course Description & Syllabus Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          {/* Main: Description & Syllabus */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-6 md:p-8 rounded-3xl bg-[#0f172a]/70 border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>Course Overview</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>

            {/* Syllabus */}
            {syllabusList.length > 0 && (
              <div className="p-6 md:p-8 rounded-3xl bg-[#0f172a]/70 border border-slate-800 space-y-4">
                <h2 className="text-lg font-bold text-white">
                  Curriculum & Lecture Outline ({syllabusList.length} Modules)
                </h2>
                <div className="space-y-3">
                  {syllabusList.map((item, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm text-slate-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Path Context */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#0f172a]/70 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Learning Paths</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This course is integrated into structured curricula designed for progressive mastery:
              </p>

              {course.pathCourses && course.pathCourses.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {course.pathCourses.map((pc) => {
                    const path = pc.section?.path;
                    if (!path) return null;
                    return (
                      <Link
                        key={pc.id}
                        href={`/paths/${path.slug}`}
                        className="block p-3 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-700/60 transition-colors group"
                      >
                        <span className="text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                          {path.title}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Stage: {pc.section?.title}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Available as a standalone course.
                </p>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-[#0f172a]/70 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Recommended Prerequisites</h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Basic ability to read Arabic script</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Notebook for writing vowel markings (Harakat)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
