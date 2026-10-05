import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeaderSkeleton, FilterBarSkeleton, CourseCardSkeleton } from "@/components/Skeletons";

export default function CoursesLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 bg-arabesque text-slate-900 dark:bg-[#0b101b] dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        <PageHeaderSkeleton badgeWidth="w-56" />
        <FilterBarSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
