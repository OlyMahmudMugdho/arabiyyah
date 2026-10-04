import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("notes")
export class Note {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 150 })
  topic!: string; // Verb Conjugation, Irab, Pronouns, Particles, Sentence Analysis

  @Column({ type: "varchar", length: 50, default: "All Levels" })
  level!: string; // Beginner, Intermediate, Advanced, All Levels

  @Column({ type: "varchar", length: 50, default: "PDF" })
  format!: string; // PDF, Infographic, Markdown, Cheat Sheet

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
