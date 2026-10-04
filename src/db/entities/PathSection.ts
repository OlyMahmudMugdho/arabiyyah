import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import type { LearningPath } from "./LearningPath";
import type { PathCourse } from "./PathCourse";

@Entity("path_sections")
export class PathSection {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  pathId!: string;

  @ManyToOne("LearningPath", (path: LearningPath) => path.sections, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "pathId" })
  path!: LearningPath;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  titleArabic!: string | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "int", default: 1 })
  orderIndex!: number;

  @OneToMany("PathCourse", (pathCourse: PathCourse) => pathCourse.section, {
    cascade: true,
  })
  pathCourses!: PathCourse[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
