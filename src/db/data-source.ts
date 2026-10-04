import "reflect-metadata";
import { DataSource } from "typeorm";
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
    synchronize: true, // Automatically synchronize schema in development
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
