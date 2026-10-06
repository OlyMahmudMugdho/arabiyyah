import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
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
  MANAGE_CATEGORIES = "manage_categories",
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

  @Column({ type: "varchar", length: 255, nullable: true })
  resetPasswordToken?: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  resetPasswordOtp?: string | null;

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExpires?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
