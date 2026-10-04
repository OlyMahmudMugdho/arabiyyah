import "reflect-metadata";
import { DataSource, Repository } from "typeorm";
import {
  User,
  Course,
  LearningPath,
  PathSection,
  PathCourse,
  Book,
  Note,
} from "./entities";

const globalForTypeOrm = globalThis as unknown as {
  appDataSource?: DataSource;
};

export const AppDataSource =
  globalForTypeOrm.appDataSource ||
  new DataSource({
    type: "postgres",
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5433/arabic_learning",
    synchronize: true,
    logging: process.env.NODE_ENV === "development" ? ["error", "warn"] : false,
    entities: [User, Course, LearningPath, PathSection, PathCourse, Book, Note],
    subscribers: [],
    migrations: [],
    extra: {
      max: 10,
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
