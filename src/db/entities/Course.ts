import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { PathCourse } from "./PathCourse";

@Entity("courses")
export class Course {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  titleArabic!: string | null;

  @Column({ type: "varchar", length: 255, unique: true })
  slug!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 255 })
  instructor!: string;

  @Column({ type: "varchar", length: 100 })
  language!: string; // e.g. English, Arabic, Urdu, Bangla

  @Column({ type: "varchar", length: 50 })
  level!: string; // Beginner, Intermediate, Advanced, All Levels

  @Column({ type: "varchar", length: 100 })
  category!: string; // Nahw, Sarf, Balagha, Quranic Arabic, Conversational, etc.

  @Column({ type: "varchar", length: 100, default: "Self-paced" })
  duration!: string;

  @Column({ type: "text", nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: "text", nullable: true })
  resourceUrl!: string | null;

  @Column({ type: "text", nullable: true })
  syllabus!: string | null; // JSON string of lessons/topics

  @Column({ type: "boolean", default: true })
  isPublished!: boolean;

  @Column({ type: "boolean", default: false })
  isFeatured!: boolean;

  @OneToMany(() => PathCourse, (pathCourse: PathCourse) => pathCourse.course)
  pathCourses!: PathCourse[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
