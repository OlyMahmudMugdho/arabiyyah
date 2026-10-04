import { getCoursesAction } from "@/actions/course-actions";
import { CourseManager } from "./CourseManager";

export default async function AdminCoursesPage() {
  // Fetch all courses including drafts for admin view
  const courses = await getCoursesAction({ onlyPublished: false });

  return <CourseManager initialCourses={courses} />;
}
