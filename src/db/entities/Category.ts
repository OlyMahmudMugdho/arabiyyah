import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 150, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 150, nullable: true })
  nameArabic!: string | null;

  @Column({ type: "varchar", length: 150, unique: true })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 50, default: "all" })
  itemType!: string; // 'all', 'course', 'book', 'note'

  @Column({ type: "varchar", length: 50, default: "emerald" })
  color!: string;

  @Column({ type: "boolean", default: false })
  isFeatured!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
