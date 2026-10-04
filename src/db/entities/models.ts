import { EntitySchema } from "typeorm";

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

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new EntitySchema<User>({
  name: "User",
  tableName: "users",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    name: { type: "varchar", length: 255 },
    email: { type: "varchar", length: 255, unique: true },
    passwordHash: { type: "varchar", length: 255 },
    role: { type: "varchar", length: 50, default: UserRole.ADMIN },
    permissions: { type: "simple-array", default: "" },
    isActive: { type: "boolean", default: true },
    createdAt: { type: "timestamp", createDate: true },
    updatedAt: { type: "timestamp", updateDate: true },
  },
});

export interface Course {
  id: string;
  title: string;
  titleArabic: string | null;
  slug: string;
  description: string;
  instructor: string;
  language: string;
  level: string;
  category: string;
  duration: string;
  thumbnailUrl: string | null;
  resourceUrl: string | null;
  syllabus: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  pathCourses?: PathCourse[];
  createdAt: Date;
  updatedAt: Date;
}

export const CourseSchema = new EntitySchema<Course>({
  name: "Course",
  tableName: "courses",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    title: { type: "varchar", length: 255 },
    titleArabic: { type: "varchar", length: 255, nullable: true },
    slug: { type: "varchar", length: 255, unique: true },
    description: { type: "text" },
    instructor: { type: "varchar", length: 255 },
    language: { type: "varchar", length: 100 },
    level: { type: "varchar", length: 50 },
    category: { type: "varchar", length: 100 },
    duration: { type: "varchar", length: 100, default: "Self-paced" },
    thumbnailUrl: { type: "text", nullable: true },
    resourceUrl: { type: "text", nullable: true },
    syllabus: { type: "text", nullable: true },
    isPublished: { type: "boolean", default: true },
    isFeatured: { type: "boolean", default: false },
    createdAt: { type: "timestamp", createDate: true },
    updatedAt: { type: "timestamp", updateDate: true },
  },
  relations: {
    pathCourses: {
      type: "one-to-many",
      target: "PathCourse",
      inverseSide: "course",
    },
  },
});

export interface LearningPath {
  id: string;
  title: string;
  titleArabic: string | null;
  slug: string;
  description: string;
  level: string;
  estimatedHours: string;
  icon: string;
  color: string;
  isPublished: boolean;
  isFeatured: boolean;
  sections?: PathSection[];
  createdAt: Date;
  updatedAt: Date;
}

export const LearningPathSchema = new EntitySchema<LearningPath>({
  name: "LearningPath",
  tableName: "learning_paths",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    title: { type: "varchar", length: 255 },
    titleArabic: { type: "varchar", length: 255, nullable: true },
    slug: { type: "varchar", length: 255, unique: true },
    description: { type: "text" },
    level: { type: "varchar", length: 50, default: "Beginner" },
    estimatedHours: { type: "varchar", length: 100, default: "40 hours" },
    icon: { type: "varchar", length: 50, default: "Compass" },
    color: { type: "varchar", length: 50, default: "emerald" },
    isPublished: { type: "boolean", default: true },
    isFeatured: { type: "boolean", default: false },
    createdAt: { type: "timestamp", createDate: true },
    updatedAt: { type: "timestamp", updateDate: true },
  },
  relations: {
    sections: {
      type: "one-to-many",
      target: "PathSection",
      inverseSide: "path",
      cascade: true,
    },
  },
});

export interface PathSection {
  id: string;
  pathId: string;
  path?: LearningPath;
  title: string;
  titleArabic: string | null;
  description: string | null;
  orderIndex: number;
  pathCourses?: PathCourse[];
  createdAt: Date;
  updatedAt: Date;
}

export const PathSectionSchema = new EntitySchema<PathSection>({
  name: "PathSection",
  tableName: "path_sections",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    pathId: { type: "uuid" },
    title: { type: "varchar", length: 255 },
    titleArabic: { type: "varchar", length: 255, nullable: true },
    description: { type: "text", nullable: true },
    orderIndex: { type: "int", default: 1 },
    createdAt: { type: "timestamp", createDate: true },
    updatedAt: { type: "timestamp", updateDate: true },
  },
  relations: {
    path: {
      type: "many-to-one",
      target: "LearningPath",
      inverseSide: "sections",
      joinColumn: { name: "pathId" },
      onDelete: "CASCADE",
    },
    pathCourses: {
      type: "one-to-many",
      target: "PathCourse",
      inverseSide: "section",
      cascade: true,
    },
  },
});

export interface PathCourse {
  id: string;
  sectionId: string;
  section?: PathSection;
  courseId: string;
  course?: Course;
  orderIndex: number;
  isMandatory: boolean;
  customNotes: string | null;
  createdAt: Date;
}

export const PathCourseSchema = new EntitySchema<PathCourse>({
  name: "PathCourse",
  tableName: "path_courses",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    sectionId: { type: "uuid" },
    courseId: { type: "uuid" },
    orderIndex: { type: "int", default: 1 },
    isMandatory: { type: "boolean", default: true },
    customNotes: { type: "text", nullable: true },
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    section: {
      type: "many-to-one",
      target: "PathSection",
      inverseSide: "pathCourses",
      joinColumn: { name: "sectionId" },
      onDelete: "CASCADE",
    },
    course: {
      type: "many-to-one",
      target: "Course",
      inverseSide: "pathCourses",
      joinColumn: { name: "courseId" },
      onDelete: "CASCADE",
    },
  },
});

export interface Book {
  id: string;
  title: string;
  titleArabic: string | null;
  author: string;
  category: string;
  level: string;
  language: string;
  pages: number;
  fileUrl: string | null;
  coverUrl: string | null;
  description: string;
  downloadCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const BookSchema = new EntitySchema<Book>({
  name: "Book",
  tableName: "books",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    title: { type: "varchar", length: 255 },
    titleArabic: { type: "varchar", length: 255, nullable: true },
    author: { type: "varchar", length: 255 },
    category: { type: "varchar", length: 100 },
    level: { type: "varchar", length: 50, default: "All Levels" },
    language: { type: "varchar", length: 100, default: "Arabic" },
    pages: { type: "int", default: 0 },
    fileUrl: { type: "text", nullable: true },
    coverUrl: { type: "text", nullable: true },
    description: { type: "text" },
    downloadCount: { type: "int", default: 0 },
    isPublished: { type: "boolean", default: true },
    isFeatured: { type: "boolean", default: false },
    createdAt: { type: "timestamp", createDate: true },
    updatedAt: { type: "timestamp", updateDate: true },
  },
});

export interface Note {
  id: string;
  title: string;
  topic: string;
  level: string;
  format: string;
  fileUrl: string | null;
  previewUrl: string | null;
  description: string;
  author: string;
  downloadCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const NoteSchema = new EntitySchema<Note>({
  name: "Note",
  tableName: "notes",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    title: { type: "varchar", length: 255 },
    topic: { type: "varchar", length: 150 },
    level: { type: "varchar", length: 50, default: "All Levels" },
    format: { type: "varchar", length: 50, default: "PDF" },
    fileUrl: { type: "text", nullable: true },
    previewUrl: { type: "text", nullable: true },
    description: { type: "text" },
    author: { type: "varchar", length: 150, default: "Community Scholar" },
    downloadCount: { type: "int", default: 0 },
    isPublished: { type: "boolean", default: true },
    isFeatured: { type: "boolean", default: false },
    createdAt: { type: "timestamp", createDate: true },
    updatedAt: { type: "timestamp", updateDate: true },
  },
});
