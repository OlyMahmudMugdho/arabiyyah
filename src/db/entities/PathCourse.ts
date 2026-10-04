import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { PathSection } from "./PathSection";
import type { Course } from "./Course";

@Entity("path_courses")
export class PathCourse {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  sectionId!: string;

  @ManyToOne("PathSection", (section: PathSection) => section.pathCourses, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sectionId" })
  section!: PathSection;

  @Column({ type: "uuid" })
  courseId!: string;

  @ManyToOne("Course", (course: Course) => course.pathCourses, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "courseId" })
  course!: Course;

  @Column({ type: "int", default: 1 })
  orderIndex!: number;

  @Column({ type: "boolean", default: true })
  isMandatory!: boolean;

  @Column({ type: "text", nullable: true })
  customNotes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
