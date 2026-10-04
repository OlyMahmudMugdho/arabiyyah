import { notFound } from "next/navigation";
import { getDataSource } from "@/db/data-source";
import { LearningPath, Course } from "@/db/entities";
import { PathSectionBuilder } from "./PathSectionBuilder";

export default async function AdminPathDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dataSource = await getDataSource();

  const pathRepo = dataSource.getRepository(LearningPath);
  const courseRepo = dataSource.getRepository(Course);

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
