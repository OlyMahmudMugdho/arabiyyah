import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseFilterList } from "@/components/CourseFilterList";
import { getCoursesAction } from "@/actions/course-actions";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getCoursesAction({ onlyPublished: true });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 bg-arabesque text-slate-900 dark:bg-[#0b101b] dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        <CourseFilterList initialCourses={courses} />
      </main>

      <Footer />
    </div>
  );
}
