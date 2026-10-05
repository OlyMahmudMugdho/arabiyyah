import "reflect-metadata";
import net from "node:net";
import { DataSource, Repository } from "typeorm";
import {
  UserSchema,
  CourseSchema,
  LearningPathSchema,
  PathSectionSchema,
  PathCourseSchema,
  BookSchema,
  NoteSchema,
  CategorySchema,
  User,
  Course,
  LearningPath,
  PathSection,
  PathCourse,
  Book,
  Note,
  Category,
} from "./entities";

// Ensure Node network stack doesn't fail on IPv6 when connecting to cloud DBs like Neon
if (typeof net.setDefaultAutoSelectFamily === "function") {
  net.setDefaultAutoSelectFamily(false);
}

const globalForTypeOrm = globalThis as unknown as {
  appDataSource?: DataSource;
};

const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5433/arabic_learning";
const isSsl = dbUrl.includes("sslmode=require") || dbUrl.includes("neon.tech");

export const AppDataSource =
  globalForTypeOrm.appDataSource ||
  new DataSource({
    type: "postgres",
    url: dbUrl,
    ssl: isSsl ? { rejectUnauthorized: false } : false,
    synchronize: true,
    logging: process.env.NODE_ENV === "development" ? ["error", "warn"] : false,
    entities: [
      UserSchema,
      CourseSchema,
      LearningPathSchema,
      PathSectionSchema,
      PathCourseSchema,
      BookSchema,
      NoteSchema,
      CategorySchema,
    ],
    subscribers: [],
    migrations: [],
    extra: {
      max: 10,
      ssl: isSsl ? { rejectUnauthorized: false } : undefined,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForTypeOrm.appDataSource = AppDataSource;
}

export async function getDataSource(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}

export async function getCourseRepository(): Promise<Repository<Course>> {
  const ds = await getDataSource();
  return ds.getRepository<Course>("Course");
}

export async function getPathRepository(): Promise<Repository<LearningPath>> {
  const ds = await getDataSource();
  return ds.getRepository<LearningPath>("LearningPath");
}

export async function getSectionRepository(): Promise<Repository<PathSection>> {
  const ds = await getDataSource();
  return ds.getRepository<PathSection>("PathSection");
}

export async function getPathCourseRepository(): Promise<Repository<PathCourse>> {
  const ds = await getDataSource();
  return ds.getRepository<PathCourse>("PathCourse");
}

export async function getBookRepository(): Promise<Repository<Book>> {
  const ds = await getDataSource();
  return ds.getRepository<Book>("Book");
}

export async function getNoteRepository(): Promise<Repository<Note>> {
  const ds = await getDataSource();
  return ds.getRepository<Note>("Note");
}

export async function getUserRepository(): Promise<Repository<User>> {
  const ds = await getDataSource();
  return ds.getRepository<User>("User");
}

export async function getCategoryRepository(): Promise<Repository<Category>> {
  const ds = await getDataSource();
  return ds.getRepository<Category>("Category");
}
