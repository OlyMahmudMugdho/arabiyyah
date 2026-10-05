import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeaderSkeleton, FilterBarSkeleton, PathCardSkeleton } from "@/components/Skeletons";

export default function PathsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 bg-arabesque text-slate-900 dark:bg-[#0b101b] dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        <PageHeaderSkeleton badgeWidth="w-52" />
        <FilterBarSkeleton />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <PathCardSkeleton key={i} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
