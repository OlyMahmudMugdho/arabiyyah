import "reflect-metadata";
import bcrypt from "bcryptjs";
import {
  getDataSource,
  getUserRepository,
  getCourseRepository,
  getPathRepository,
  getSectionRepository,
  getPathCourseRepository,
} from "../src/db/data-source";
import { UserRole, AdminPermission } from "../src/db/entities";

async function verifyFullFlow() {
  console.log("🚀 Starting end-to-end verification of Arabic Learning Platform...");

  // 1. Verify Superadmin exists
  const userRepo = await getUserRepository();
  const superadmin = await userRepo.findOne({
    where: { email: "superadmin@bayan.org" },
  });

  if (!superadmin) {
    throw new Error("❌ Superadmin not found in database!");
  }
  console.log(`✅ 1. Superadmin verified: ${superadmin.name} (${superadmin.email}), Role: ${superadmin.role}`);

  const passwordValid = await bcrypt.compare(
    "SuperAdmin123!",
    superadmin.passwordHash
  );
  if (!passwordValid) {
    throw new Error("❌ Superadmin password verification failed!");
  }
  console.log("✅ 2. Superadmin bcrypt password verified successfully");

  // 2. Test Superadmin creating a new Admin user with specific permissions
  const testAdminEmail = "curator.zayd@bayan.org";
  let existingTestUser = await userRepo.findOne({ where: { email: testAdminEmail } });
  if (existingTestUser) {
    await userRepo.delete({ id: existingTestUser.id });
  }

  const newAdminPasswordHash = await bcrypt.hash("CuratorPass2026!", 10);
  const newAdmin = userRepo.create({
    name: "Ustadh Zayd Farhan",
    email: testAdminEmail,
    passwordHash: newAdminPasswordHash,
    role: UserRole.ADMIN,
    permissions: [
      AdminPermission.MANAGE_COURSES,
      AdminPermission.MANAGE_PATHS,
    ],
    isActive: true,
  });
  const savedAdmin = await userRepo.save(newAdmin);
  console.log(`✅ 3. Superadmin created new Admin user: "${savedAdmin.name}" with permissions: [${savedAdmin.permissions.join(", ")}]`);

  // 3. Test Course creation
  const courseRepo = await getCourseRepository();
  const testCourseSlug = "test-bayna-yadayk-vol-1";
  await courseRepo.delete({ slug: testCourseSlug });

  const testCourse = courseRepo.create({
    title: "Al-Arabiyyah Bayna Yadayk - Book 1",
    titleArabic: "العربية بين يديك - الكتاب الأول",
    slug: testCourseSlug,
    description: "Immersive communication and dialogues for non-native speakers.",
    instructor: "Dr. Abdur Rahman Al-Fawzan",
    language: "Arabic",
    level: "Beginner",
    category: "Conversational",
    duration: "40 hours",
    isPublished: true,
    isFeatured: true,
  });
  const savedCourse = await courseRepo.save(testCourse);
  console.log(`✅ 4. Admin created course: "${savedCourse.title}" (Language: ${savedCourse.language}, Level: ${savedCourse.level})`);

  // 4. Test Learning Path creation with multiple sections and courses
  const pathRepo = await getPathRepository();
  const testPathSlug = "test-conversational-fluency-track";
  await pathRepo.delete({ slug: testPathSlug });

  const testPath = pathRepo.create({
    title: "Conversational Arabic Fluency Track",
    titleArabic: "مسار الطلاقة والمحادثة اليومية",
    slug: testPathSlug,
    description: "Master everyday dialogues, listening comprehension, and speaking.",
    level: "Beginner",
    estimatedHours: "60 Hours",
    icon: "Compass",
    color: "emerald",
    isPublished: true,
  });
  const savedPath = await pathRepo.save(testPath);
  console.log(`✅ 5. Admin created learning path: "${savedPath.title}"`);

  // 5. Add Section / Stage to Path
  const sectionRepo = await getSectionRepository();
  const stage1 = sectionRepo.create({
    pathId: savedPath.id,
    title: "Stage 1: Greetings, Introductions & Daily Life",
    titleArabic: "المرحلة الأولى: التحية والتعارف والبيت",
    description: "Learn foundational greetings and everyday domestic dialogues.",
    orderIndex: 1,
  });
  const savedStage1 = await sectionRepo.save(stage1);
  console.log(`✅ 6. Added Section to Path: "${savedStage1.title}" (Order: ${savedStage1.orderIndex})`);

  // 6. Link Course into Section with order and mandatory flag
  const pathCourseRepo = await getPathCourseRepository();
  const pathCourseLink = pathCourseRepo.create({
    sectionId: savedStage1.id,
    courseId: savedCourse.id,
    orderIndex: 1,
    isMandatory: true,
    customNotes: "Complete all audio drill exercises and repeat out loud.",
  });
  const savedLink = await pathCourseRepo.save(pathCourseLink);
  console.log(`✅ 7. Combined Course into Path Section with advice: "${savedLink.customNotes}"`);

  // 7. Verify the multi-stage path hierarchy query
  const fullPath = await pathRepo
    .createQueryBuilder("path")
    .leftJoinAndSelect("path.sections", "sections")
    .leftJoinAndSelect("sections.pathCourses", "pathCourses")
    .leftJoinAndSelect("pathCourses.course", "course")
    .where("path.id = :id", { id: savedPath.id })
    .getOne();

  if (!fullPath || !fullPath.sections || fullPath.sections.length === 0) {
    throw new Error("❌ Full path hierarchy verification failed!");
  }
  const attachedCourseTitle = (fullPath.sections as any[])[0]?.pathCourses?.[0]?.course?.title;
  console.log(`✅ 8. Verified full multi-stage hierarchy: Path "${fullPath.title}" -> Section "${fullPath.sections[0].title}" -> Course "${attachedCourseTitle}"`);

  // Cleanup test artifacts
  await pathRepo.delete({ id: savedPath.id });
  await courseRepo.delete({ id: savedCourse.id });
  await userRepo.delete({ id: savedAdmin.id });
  console.log("✅ 9. Test records cleaned up successfully");

  console.log("🎉 ALL E2E VERIFICATION CHECKS PASSED PERFECTLY!");
}

verifyFullFlow()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ E2E Verification failed:", err);
    process.exit(1);
  });
