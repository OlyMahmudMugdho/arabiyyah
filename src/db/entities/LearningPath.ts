import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import type { PathSection } from "./PathSection";

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
  level!: string; // Beginner, Intermediate, Advanced, All Levels

  @Column({ type: "varchar", length: 100, default: "40 hours" })
  estimatedHours!: string;

  @Column({ type: "varchar", length: 50, default: "Compass" })
  icon!: string; // Icon name e.g. Compass, BookOpen, GraduationCap, Feather, Award

  @Column({ type: "varchar", length: 50, default: "emerald" })
  color!: string; // emerald, amber, blue, purple, rose

  @Column({ type: "boolean", default: true })
  isPublished!: boolean;

  @Column({ type: "boolean", default: false })
  isFeatured!: boolean;

  @OneToMany("PathSection", (section: PathSection) => section.path, {
    cascade: true,
  })
  sections!: PathSection[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
