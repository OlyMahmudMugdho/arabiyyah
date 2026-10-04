import { notFound } from "next/navigation";
import { getPathRepository, getCourseRepository } from "@/db/data-source";
import { PathSectionBuilder } from "./PathSectionBuilder";

export const dynamic = "force-dynamic";

export default async function AdminPathDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pathRepo, courseRepo] = await Promise.all([
    getPathRepository(),
    getCourseRepository(),
  ]);

  const [path, allCourses] = await Promise.all([
    pathRepo
      .createQueryBuilder("path")
      .leftJoinAndSelect("path.sections", "sections")
      .leftJoinAndSelect("sections.pathCourses", "pathCourses")
      .leftJoinAndSelect("pathCourses.course", "course")
      .where("path.id = :id", { id })
      .orderBy("sections.orderIndex", "ASC")
      .addOrderBy("pathCourses.orderIndex", "ASC")
      .getOne(),
    courseRepo.find({ order: { title: "ASC" } }),
  ]);

  if (!path) {
    notFound();
  }

  return <PathSectionBuilder initialPath={path} allCourses={allCourses} />;
}
