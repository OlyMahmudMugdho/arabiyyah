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

export enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
}

export enum AdminPermission {
  MANAGE_COURSES = "manage_courses",
  MANAGE_PATHS = "manage_paths",
  MANAGE_BOOKS = "manage_books",
  MANAGE_NOTES = "manage_notes",
  MANAGE_USERS = "manage_users",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({
    type: "varchar",
    length: 50,
    default: UserRole.ADMIN,
  })
  role!: UserRole;

  @Column("simple-array", { default: "" })
  permissions!: string[];

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

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
  language!: string;

  @Column({ type: "varchar", length: 50 })
  level!: string;

  @Column({ type: "varchar", length: 100 })
  category!: string;

  @Column({ type: "varchar", length: 100, default: "Self-paced" })
  duration!: string;

  @Column({ type: "text", nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: "text", nullable: true })
  resourceUrl!: string | null;

  @Column({ type: "text", nullable: true })
  syllabus!: string | null;

  @Column({ type: "boolean", default: true })
  isPublished!: boolean;

  @Column({ type: "boolean", default: false })
  isFeatured!: boolean;

  @OneToMany(() => PathCourse, (pathCourse) => pathCourse.course)
  pathCourses!: PathCourse[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("learning_paths")
export class LearningPath {
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

  @Column({ type: "varchar", length: 50, default: "Beginner" })
  level!: string;

  @Column({ type: "varchar", length: 100, default: "40 hours" })
  estimatedHours!: string;

  @Column({ type: "varchar", length: 50, default: "Compass" })
  icon!: string;

  @Column({ type: "varchar", length: 50, default: "emerald" })
  color!: string;

  @Column({ type: "boolean", default: true })
  isPublished!: boolean;

  @Column({ type: "boolean", default: false })
  isFeatured!: boolean;

  @OneToMany(() => PathSection, (section) => section.path, {
    cascade: true,
  })
  sections!: PathSection[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("path_sections")
export class PathSection {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  pathId!: string;

  @ManyToOne(() => LearningPath, (path) => path.sections, {
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

  @OneToMany(() => PathCourse, (pathCourse) => pathCourse.section, {
    cascade: true,
  })
  pathCourses!: PathCourse[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("path_courses")
export class PathCourse {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  sectionId!: string;

  @ManyToOne(() => PathSection, (section) => section.pathCourses, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sectionId" })
  section!: PathSection;

  @Column({ type: "uuid" })
  courseId!: string;

  @ManyToOne(() => Course, (course) => course.pathCourses, {
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

@Entity("books")
export class Book {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  titleArabic!: string | null;

  @Column({ type: "varchar", length: 255 })
  author!: string;

  @Column({ type: "varchar", length: 100 })
  category!: string;

  @Column({ type: "varchar", length: 50, default: "All Levels" })
  level!: string;

  @Column({ type: "varchar", length: 100, default: "Arabic" })
  language!: string;

  @Column({ type: "int", default: 0 })
  pages!: number;

  @Column({ type: "text", nullable: true })
  fileUrl!: string | null;

  @Column({ type: "text", nullable: true })
  coverUrl!: string | null;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "int", default: 0 })
  downloadCount!: number;

  @Column({ type: "boolean", default: true })
  isPublished!: boolean;

  @Column({ type: "boolean", default: false })
  isFeatured!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("notes")
export class Note {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 150 })
  topic!: string;

  @Column({ type: "varchar", length: 50, default: "All Levels" })
  level!: string;

  @Column({ type: "varchar", length: 50, default: "PDF" })
  format!: string;

  @Column({ type: "text", nullable: true })
  fileUrl!: string | null;

  @Column({ type: "text", nullable: true })
  previewUrl!: string | null;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 150, default: "Community Scholar" })
  author!: string;

  @Column({ type: "int", default: 0 })
  downloadCount!: number;

  @Column({ type: "boolean", default: true })
  isPublished!: boolean;

  @Column({ type: "boolean", default: false })
  isFeatured!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
