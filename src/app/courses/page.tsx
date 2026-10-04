import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseFilterList } from "@/components/CourseFilterList";
import { getCoursesAction } from "@/actions/course-actions";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getCoursesAction({ onlyPublished: true });

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] bg-arabesque text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        <CourseFilterList initialCourses={courses} />
      </main>

      <Footer />
    </div>
  );
}
