import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

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
  category!: string; // Grammar, Morphology, Vocabulary, Literature, Children, Dictionaries

  @Column({ type: "varchar", length: 50, default: "All Levels" })
  level!: string; // Beginner, Intermediate, Advanced, All Levels

  @Column({ type: "varchar", length: 100, default: "Arabic" })
  language!: string; // Arabic, English, Urdu, Bangla, Arabic/English

  @Column({ type: "int", default: 0 })
  pages!: number;

  @Column({ type: "text", nullable: true })
  fileUrl!: string | null; // Download / View link (PDF)

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
