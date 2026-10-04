import "reflect-metadata";
import bcrypt from "bcryptjs";
import {
  getUserRepository,
  getCourseRepository,
  getPathRepository,
  getSectionRepository,
  getPathCourseRepository,
  getBookRepository,
  getNoteRepository,
  getCategoryRepository,
} from "./data-source";
import { UserRole, AdminPermission } from "./entities";

export async function seedDatabase() {
  const userRepo = await getUserRepository();
  const courseRepo = await getCourseRepository();
  const pathRepo = await getPathRepository();
  const sectionRepo = await getSectionRepository();
  const pathCourseRepo = await getPathCourseRepository();
  const bookRepo = await getBookRepository();
  const noteRepo = await getNoteRepository();
  const categoryRepo = await getCategoryRepository();

  console.log("🌱 Checking superadmin account...");
  const adminEmail =
    process.env.INITIAL_SUPERADMIN_EMAIL || "superadmin@bayan.org";
  let superadmin = await userRepo.findOne({ where: { email: adminEmail } });

  if (!superadmin) {
    const defaultPassword =
      process.env.INITIAL_SUPERADMIN_PASSWORD || "SuperAdmin123!";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    superadmin = userRepo.create({
      name: process.env.INITIAL_SUPERADMIN_NAME || "Super Admin",
      email: adminEmail,
      passwordHash,
      role: UserRole.SUPERADMIN,
      permissions: Object.values(AdminPermission),
      isActive: true,
    });
    await userRepo.save(superadmin);
    console.log(`✅ Created default superadmin: ${adminEmail} (password: ${defaultPassword})`);
  } else {
    console.log(`ℹ️ Superadmin already exists: ${adminEmail}`);
  }

  // Seed courses if empty
  const courseCount = await courseRepo.count();
  let createdCourses: Record<string, any> = {};

  if (courseCount === 0) {
    console.log("🌱 Seeding initial courses...");
    const coursesData = [
      {
        slug: "madinah-arabic-book-1",
        title: "Madinah Arabic Book 1: Complete Breakdown",
        titleArabic: "دروس اللغة العربية - الجزء الأول",
        description:
          "Comprehensive step-by-step video lecture series covering Dr. V. Abdur Rahim's world-renowned Madinah Book 1. Ideal for absolute beginners learning sentence structure, noun cases, and vocabulary.",
        instructor: "Shaykh Dr. V. Abdur Rahim & Ustadh Asif Meherali",
        language: "English",
        level: "Beginner",
        category: "Nahw (Syntax)",
        duration: "30 hours • 23 Lessons",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
        resourceUrl: "https://www.youtube.com/playlist?list=PL28D98C1265D468FD",
        syllabus: JSON.stringify([
          "Lesson 1: Demonstrative Pronouns (Haza / Dhalika)",
          "Lesson 2: Definite vs Indefinite Nouns (Al-Ta'reef)",
          "Lesson 3: Solar & Lunar Letters (Al-Huruf Ash-Shamsiyyah)",
          "Lesson 4: Prepositions (Huruf Al-Jarr)",
          "Lesson 5: Possession & Construct (Idhafah)",
        ]),
        isPublished: true,
        isFeatured: true,
      },
      {
        slug: "al-ajrumiyyah-masterclass",
        title: "Al-Ajrumiyyah Masterclass (شرح الآجرومية)",
        titleArabic: "شرح المقدمة الآجرومية في علم العربية",
        description:
          "In-depth scholarly study of the classical primer 'Al-Muqaddimah Al-Ajrumiyyah'. Learn the core foundations of Arabic syntax, case markers, marfoo'at, mansoobat, and majroorat.",
        instructor: "Dr. Muhammad Akram Nadwi",
        language: "Arabic",
        level: "Intermediate",
        category: "Nahw (Syntax)",
        duration: "25 hours • 18 Lectures",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800",
        resourceUrl: "https://www.youtube.com/playlist?list=PLwNehl86K0Y1wQoQ",
        syllabus: JSON.stringify([
          "Types of Speech (Kalam, Ism, Fi'l, Harf)",
          "Marks of I'rab (Dhammah, Fat-hah, Kasrah, Sukun)",
          "Substitutes in I'rab (Waw, Alif, Ya, Nun)",
          "Af'al (Past, Present, Imperative) and their rulers",
          "Marfoo'at of Nouns (Faa'il, Mubtada, Khabar)",
        ]),
        isPublished: true,
        isFeatured: true,
      },
      {
        slug: "quranic-arabic-grammar-scratch",
        title: "Quranic Arabic Grammar from Scratch",
        titleArabic: "قواعد لغة التنزيل للمبتدئين",
        description:
          "Designed specifically for students seeking direct comprehension of the Holy Quran. Connect grammatical concepts with direct Quranic ayaat examples.",
        instructor: "Ustadh Nouman Ali Khan",
        language: "English",
        level: "Beginner",
        category: "Quranic Arabic",
        duration: "45 hours • 35 Lessons",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=800",
        resourceUrl: "https://www.bayyinah.tv",
        syllabus: JSON.stringify([
          "The 4 Properties of Ism: Status, Number, Gender, Type",
          "Fragments: Idafah, Mawsoof Sifah, Harf Jarr, Harf Nasb",
          "Sentences: Jumlah Ismiyyah and Jumlah Fi'liyyah",
          "Quranic Rhetorical Nuances (Balaghah introduction)",
        ]),
        isPublished: true,
        isFeatured: true,
      },
      {
        slug: "sarf-made-easy-ilm-us-seegha",
        title: "Sarf Made Easy: Ilm us-Seegha",
        titleArabic: "علم الصيغة في الصرف العربي",
        description:
          "Thorough exploration of Arabic morphology in Urdu. Master the 10 trilateral verb scales, regular and irregular roots (mu'tal, muda'af, mahmooz), and morphophonemic shifts.",
        instructor: "Mufti Muhammad Taqi Usmani",
        language: "Urdu",
        level: "Intermediate",
        category: "Sarf (Morphology)",
        duration: "32 hours • 28 Lessons",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800",
        resourceUrl: "https://www.youtube.com/playlist?list=PLurdu_sarf_sample",
        syllabus: JSON.stringify([
          "Thulaathi Mujarrad (6 Abwaab)",
          "Thulaathi Mazeed Feeh (Forms 2 through 10)",
          "Ta'leelat: Rules of Hamzah and Weak Letters",
          "Ism Faa'il, Ism Maf'ool, and Ism Taafeeq derivation",
        ]),
        isPublished: true,
        isFeatured: true,
      },
      {
        slug: "arabic-morphology-sarf-bangla",
        title: "Arabic Morphology: Foundations of Sarf (সহজ সরফ)",
        titleArabic: "مبادئ علم الصرف باللغة البنغالية",
        description:
          "A lucid and accessible introduction to Arabic word derivations and verb patterns taught in Bengali. Ideal for students in Bangladesh, West Bengal, and the Bengali diaspora.",
        instructor: "Mawlana Abu Taher Misbah",
        language: "Bangla",
        level: "Beginner",
        category: "Sarf (Morphology)",
        duration: "20 hours • 16 Lessons",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800",
        resourceUrl: "https://www.youtube.com/playlist?list=PLbangla_sarf_sample",
        syllabus: JSON.stringify([
          "শব্দ ও রূপমূলের ধারণা (Root & Pattern Concept)",
          "মাযী ও মুযারে এর গর্দান (Past & Present Conjugation)",
          "আম্‌র ও নাহী গঠন (Imperatives & Prohibitions)",
          "নিয়মিত ও অনিয়মিত ধাতুর রূপান্তর",
        ]),
        isPublished: true,
        isFeatured: false,
      },
      {
        slug: "al-nahw-al-wadih-full-track",
        title: "Al-Nahw Al-Wadih: Primary to Secondary",
        titleArabic: "النحو الواضح للمرحلة الابتدائية والثانوية",
        description:
          "The modern standard Egyptian curriculum that has trained generations of Arabists worldwide. Taught entirely in clear, classical Arabic with extensive drill exercises.",
        instructor: "Shaykh Muhammad Hassan",
        language: "Arabic",
        level: "Intermediate",
        category: "Nahw (Syntax)",
        duration: "40 hours • 40 Lessons",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
        resourceUrl: "https://www.youtube.com/playlist?list=PLnahw_alwadih",
        syllabus: JSON.stringify([
          "Al-Jumlah Al-Mufeedah & Ajza' Al-Jumlah",
          "Taqseem Al-Fi'l bi I'tibar Zamanihi",
          "Al-Mubtada wal Khabar & Inna / Kaana",
          "Nawasib and Jawazim of Al-Fi'l Al-Mudari'",
        ]),
        isPublished: true,
        isFeatured: false,
      },
      {
        slug: "al-balaghah-al-wadihah",
        title: "Al-Balaghah Al-Wadihah Explained",
        titleArabic: "البلاغة الواضحة: البيان والمعاني والبديع",
        description:
          "Advanced study of Arabic rhetoric: Bayan (Metaphor & Simile), Ma'ani (Semantic meanings & Sentence emphasis), and Badi' (Stylistic embellishments). Essential for Quranic appreciation.",
        instructor: "Dr. Ayman Swayd & Dr. Taha Jabir",
        language: "Arabic",
        level: "Advanced",
        category: "Balagha (Rhetoric)",
        duration: "36 hours • 24 Lectures",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
        resourceUrl: "https://www.youtube.com/playlist?list=PLbalaghah_wadihah",
        syllabus: JSON.stringify([
          "Ilm al-Bayan: At-Tashbeeh (Simile) & Al-Majaz (Metaphor)",
          "Al-Isti'arah: Tasreehiyyah and Makniyyah",
          "Ilm al-Ma'ani: Al-Khabar wal Insha', Al-Qasr, Al-Ijaz wal Itnab",
          "Ilm al-Badi': At-Tabaq, Al-Jinas, As-Saj'",
        ]),
        isPublished: true,
        isFeatured: true,
      },
      {
        slug: "spoken-arabic-daily-life",
        title: "Spoken Arabic for Daily Life & Travel",
        titleArabic: "العربية للحياة اليومية والتواصل",
        description:
          "Learn active conversational Modern Standard Arabic for everyday dialogues, travel, shopping, asking directions, and social greetings.",
        instructor: "Ustadh Imran Al-Farooq",
        language: "English",
        level: "Beginner",
        category: "Conversational",
        duration: "15 hours • 12 Modules",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800",
        resourceUrl: "https://www.youtube.com/playlist?list=PLspoken_arabic_1",
        syllabus: JSON.stringify([
          "Greetings, Introductions, and Courtesy Expressions",
          "At the Airport, Hotel, and Taxi",
          "Dining at Restaurants & Ordering Food",
          "Numbers, Currencies, and Bargaining in the Souq",
        ]),
        isPublished: true,
        isFeatured: false,
      },
      {
        slug: "qisas-an-nabiyyeen-reading",
        title: "Qisas an-Nabiyyeen Guided Reading Practice",
        titleArabic: "قراءة في قصص النبيين لأبي الحسن الندوي",
        description:
          "Bridge the gap between grammar rules and reading actual Arabic literature. Read and parse sentences from the timeless classic by Abul Hasan Ali Nadwi.",
        instructor: "Ustadh Hamza Yusuf",
        language: "English",
        level: "Intermediate",
        category: "Reading",
        duration: "18 hours • 15 Lessons",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800",
        resourceUrl: "https://www.youtube.com/playlist?list=PLqisas_nabiyyeen",
        syllabus: JSON.stringify([
          "Story of Sayyiduna Ibrahim (AS) - Part 1",
          "Grammatical breakdown of complex past verbs",
          "Story of Sayyiduna Yusuf (AS) - Sentence nuances",
          "Vocabulary expansion and idiomatic expressions",
        ]),
        isPublished: true,
        isFeatured: false,
      },
      {
        slug: "shatha-al-arf-fi-fann-al-sarf",
        title: "Shatha al-Arf fi Fann al-Sarf",
        titleArabic: "شذا العرف في فن الصرف للحملاوي",
        description:
          "Comprehensive classical treatise on advanced Arabic morphology by Ahmad al-Hamalawi. Explores rare scales, phonetic assimilations (Idgham), and poetic licenses.",
        instructor: "Shaykh Dr. Walid Al-Ali",
        language: "Arabic",
        level: "Advanced",
        category: "Sarf (Morphology)",
        duration: "28 hours • 22 Lessons",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800",
        resourceUrl: "https://www.youtube.com/playlist?list=PLshatha_al_arf",
        syllabus: JSON.stringify([
          "Taqseem Al-Fi'l ila Saheeh wa Mu'tal",
          "Al-Mujarrad wal Mazeed Al-Rubaa'i",
          "Ahkam Al-I'lal wal Ibdal",
          "Al-Waqf and Tashkeel an-Nusoos",
        ]),
        isPublished: true,
        isFeatured: false,
      },
    ];

    for (const c of coursesData) {
      const savedCourse = await courseRepo.save(courseRepo.create(c));
      createdCourses[c.slug] = savedCourse;
    }
    console.log(`✅ Seeded ${coursesData.length} courses`);
  } else {
    const allCourses = await courseRepo.find();
    for (const c of allCourses) {
      createdCourses[c.slug] = c;
    }
  }

  // Seed Learning Paths if empty
  const pathCount = await pathRepo.count();
  if (pathCount === 0) {
    console.log("🌱 Seeding learning paths with multi-stage courses...");

    // Path 1
    const path1 = pathRepo.create({
      slug: "quranic-arabic-fluency-track",
      title: "Quranic Arabic Fluency Track",
      titleArabic: "مسار فقه وفهم لغة القرآن الكريم",
      description:
        "A structured, milestone-driven curriculum designed to take a complete beginner to direct understanding of 85%+ of the Quran's linguistic structures and classical nuances.",
      level: "Beginner",
      estimatedHours: "95 Hours",
      icon: "BookOpen",
      color: "emerald",
      isPublished: true,
      isFeatured: true,
    });
    const savedPath1 = await pathRepo.save(path1);

    // Section 1: Foundations
    const sec1 = await sectionRepo.save(
      sectionRepo.create({
        pathId: savedPath1.id,
        title: "Stage 1: Script, Vocabulary & Foundations",
        titleArabic: "المرحلة الأولى: أصول الحروف والمفردات",
        description:
          "Master phonetic pronunciation, essential conversational expressions, and the fundamental building blocks of Arabic words.",
        orderIndex: 1,
      })
    );

    // Section 2: Core Grammar & Morphology
    const sec2 = await sectionRepo.save(
      sectionRepo.create({
        pathId: savedPath1.id,
        title: "Stage 2: Core Grammar (Nahw) & Verb Forms (Sarf)",
        titleArabic: "المرحلة الثانية: قواعد النحو وتصريف الأفعال",
        description:
          "Internalize the 4 properties of the noun, basic sentence diagrams, and the 10 trilateral verb derivations.",
        orderIndex: 2,
      })
    );

    // Section 3: Classical Texts & Quranic Application
    const sec3 = await sectionRepo.save(
      sectionRepo.create({
        pathId: savedPath1.id,
        title: "Stage 3: Applied Text Analysis & Rhetoric",
        titleArabic: "المرحلة الثالثة: الإعراب التطبيقي والبلاغة القرآنية",
        description:
          "Direct grammatical parsing of prophetic narratives, surahs from the Quran, and introduction to Arabic eloquence.",
        orderIndex: 3,
      })
    );

    // Link courses to sections
    const p1CourseMap = [
      {
        section: sec1,
        courseSlug: "spoken-arabic-daily-life",
        order: 1,
        mandatory: true,
        notes: "Build conversational intuition and active recall before diving into formal grammatical analysis.",
      },
      {
        section: sec1,
        courseSlug: "madinah-arabic-book-1",
        order: 2,
        mandatory: true,
        notes: "Work through every exercise thoroughly; write all sentences with full harakat.",
      },
      {
        section: sec2,
        courseSlug: "quranic-arabic-grammar-scratch",
        order: 1,
        mandatory: true,
        notes: "Pay careful attention to the 4 status markers (Raf', Nasb, Jarr, Jazm) in Quranic verses.",
      },
      {
        section: sec2,
        courseSlug: "sarf-made-easy-ilm-us-seegha",
        order: 2,
        mandatory: false,
        notes: "Recommended companion for mastering the 10 verb forms (awzan) and morphological tables.",
      },
      {
        section: sec3,
        courseSlug: "qisas-an-nabiyyeen-reading",
        order: 1,
        mandatory: true,
        notes: "Read aloud to develop fluency in parsing continuous unvowelled classical prose.",
      },
      {
        section: sec3,
        courseSlug: "al-ajrumiyyah-masterclass",
        order: 2,
        mandatory: true,
        notes: "The golden standard for understanding the reasons behind every case ending in Arabic.",
      },
    ];

    for (const item of p1CourseMap) {
      const course = createdCourses[item.courseSlug];
      if (course) {
        await pathCourseRepo.save(
          pathCourseRepo.create({
            sectionId: item.section.id,
            courseId: course.id,
            orderIndex: item.order,
            isMandatory: item.mandatory,
            customNotes: item.notes,
          })
        );
      }
    }

    // Path 2: Classical Grammatical Mastery
    const path2 = pathRepo.create({
      slug: "classical-arabic-scholar-track",
      title: "Classical Arabic Scholar Track",
      titleArabic: "مسار النحوي المتخصص في علوم اللسان",
      description:
        "The rigorous traditional curriculum followed in Islamic institutions worldwide, covering classical Nahw, intricate Sarf, and the branches of Balagha.",
      level: "Intermediate",
      estimatedHours: "140 Hours",
      icon: "GraduationCap",
      color: "amber",
      isPublished: true,
      isFeatured: true,
    });
    const savedPath2 = await pathRepo.save(path2);

    const p2Sec1 = await sectionRepo.save(
      sectionRepo.create({
        pathId: savedPath2.id,
        title: "Section 1: Structural Foundations & The Sentence",
        titleArabic: "المبحث الأول: أسس التركيب والجملة العربية",
        description: "Deconstructing speech into nominal and verbal sentences with complete rules.",
        orderIndex: 1,
      })
    );

    const p2Sec2 = await sectionRepo.save(
      sectionRepo.create({
        pathId: savedPath2.id,
        title: "Section 2: Morphological Mastery (Sarf)",
        titleArabic: "المبحث الثاني: دقائق علم الصرف والعلل",
        description: "Mastery of roots, weak verbs (mu'tallat), defective letters, and derivations.",
        orderIndex: 2,
      })
    );

    const p2Sec3 = await sectionRepo.save(
      sectionRepo.create({
        pathId: savedPath2.id,
        title: "Section 3: Higher Rhetoric & Balaghah",
        titleArabic: "المبحث الثالث: علوم البلاغة الثلاثة",
        description: "Investigating Bayan, Ma'ani, and Badi' for profound linguistic literary analysis.",
        orderIndex: 3,
      })
    );

    const p2CourseMap = [
      {
        section: p2Sec1,
        courseSlug: "madinah-arabic-book-1",
        order: 1,
        mandatory: true,
        notes: "Quick review of basic nominal patterns.",
      },
      {
        section: p2Sec1,
        courseSlug: "al-nahw-al-wadih-full-track",
        order: 2,
        mandatory: true,
        notes: "Complete primary and secondary sections for rigorous grammatical drills.",
      },
      {
        section: p2Sec2,
        courseSlug: "sarf-made-easy-ilm-us-seegha",
        order: 1,
        mandatory: true,
        notes: "Essential for mastering morphophonemic shift rules.",
      },
      {
        section: p2Sec2,
        courseSlug: "shatha-al-arf-fi-fann-al-sarf",
        order: 2,
        mandatory: true,
        notes: "The comprehensive classical reference on Sarf.",
      },
      {
        section: p2Sec3,
        courseSlug: "al-ajrumiyyah-masterclass",
        order: 1,
        mandatory: true,
        notes: "Scholarly commentary and proof texts.",
      },
      {
        section: p2Sec3,
        courseSlug: "al-balaghah-al-wadihah",
        order: 2,
        mandatory: true,
        notes: "Cap your Arabic journey with mastery of rhetorical aesthetics.",
      },
    ];

    for (const item of p2CourseMap) {
      const course = createdCourses[item.courseSlug];
      if (course) {
        await pathCourseRepo.save(
          pathCourseRepo.create({
            sectionId: item.section.id,
            courseId: course.id,
            orderIndex: item.order,
            isMandatory: item.mandatory,
            customNotes: item.notes,
          })
        );
      }
    }

    console.log("✅ Seeded learning paths with multi-stage sections and courses");
  }

  // Seed Books if empty
  const bookCount = await bookRepo.count();
  if (bookCount === 0) {
    console.log("🌱 Seeding books repository...");
    const booksData = [
      {
        title: "Durus al-Lughat al-Arabiyyah (Madinah Book 1)",
        titleArabic: "دروس اللغة العربية لغير الناطقين بها - الجزء الأول",
        author: "Dr. V. Abdur Rahim",
        category: "Grammar",
        level: "Beginner",
        language: "Arabic / English",
        pages: 128,
        fileUrl: "https://ia800204.us.archive.org/21/items/MadinaArabicBook1_201602/Madina_Arabic_Book_1.pdf",
        coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
        description:
          "The premier foundational textbook taught at the Islamic University of Madinah. Teaches basic Arabic grammar and vocabulary using an immersive intuitive approach.",
        downloadCount: 1420,
        isPublished: true,
        isFeatured: true,
      },
      {
        title: "Matn al-Ajrumiyyah with Vocalized Text",
        titleArabic: "متن الآجرومية في علم النحو مشكولاً كاملاً",
        author: "Ibn Ajurrum as-Sanhaji",
        category: "Grammar",
        level: "Intermediate",
        language: "Arabic",
        pages: 32,
        fileUrl: "https://ia800305.us.archive.org/30/items/AjroomiyyahMatn/Ajroomiyyah_vocalized.pdf",
        coverUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800",
        description:
          "The famous 7th-century Moroccan grammar poem that forms the bedrock of classical Nahw studies across the Islamic world.",
        downloadCount: 2310,
        isPublished: true,
        isFeatured: true,
      },
      {
        title: "Al-Nahw Al-Wadih: Primary Part 1-3",
        titleArabic: "النحو الواضح في قواعد اللغة العربية للمدارس الابتدائية",
        author: "Ali Al-Jarim & Mustafa Amin",
        category: "Grammar",
        level: "Beginner",
        language: "Arabic",
        pages: 210,
        fileUrl: "https://ia802908.us.archive.org/15/items/NahwWadihPart1/Nahw_Wadih_1.pdf",
        coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
        description:
          "Remarkably clear inductive method presenting examples first, extracting the rule, and providing graded exercises.",
        downloadCount: 980,
        isPublished: true,
        isFeatured: true,
      },
      {
        title: "Hans Wehr: Dictionary of Modern Written Arabic",
        titleArabic: "معجم هانز فير للغة العربية المعاصرة",
        author: "Hans Wehr (Ed. J. Milton Cowan)",
        category: "Dictionaries",
        level: "All Levels",
        language: "Arabic / English",
        pages: 1300,
        fileUrl: "https://ia800306.us.archive.org/1/items/HansWehrDict/Hans_Wehr_Searchable.pdf",
        coverUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800",
        description:
          "The most authoritative Arabic-English dictionary arranged strictly by Arabic root system. Indispensable for every student.",
        downloadCount: 4520,
        isPublished: true,
        isFeatured: true,
      },
      {
        title: "Qisas al-Nabiyyeen lil-Atfal (Parts 1-4)",
        titleArabic: "قصص النبيين للأطفال بأسلوب مبسط",
        author: "Abul Hasan Ali Nadwi",
        category: "Literature",
        level: "Intermediate",
        language: "Arabic",
        pages: 195,
        fileUrl: "https://ia801601.us.archive.org/12/items/QisasAlNabiyyeenComplete/Qisas_Complete.pdf",
        coverUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800",
        description:
          "Enchanting graded reader narrating the lives of prophets using pure, elegant Arabic sentence structure suited for language learners.",
        downloadCount: 1850,
        isPublished: true,
        isFeatured: false,
      },
      {
        title: "At-Tuhfat al-Saniyyah bi-Sharh al-Ajrumiyyah",
        titleArabic: "التحفة السنية بشرح المقدمة الآجرومية",
        author: "Muhammad Muhyiddin Abdul-Hamid",
        category: "Grammar",
        level: "Intermediate",
        language: "Arabic",
        pages: 204,
        fileUrl: "https://ia802804.us.archive.org/3/items/TuhfatulSaniyyah/Tuhfah_Saniyyah.pdf",
        coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
        description:
          "The gold standard commentary on Al-Ajrumiyyah with comprehensive questions, exercises, and syntactical parsing formulas.",
        downloadCount: 3120,
        isPublished: true,
        isFeatured: true,
      },
    ];

    for (const b of booksData) {
      await bookRepo.save(bookRepo.create(b));
    }
    console.log(`✅ Seeded ${booksData.length} books`);
  }

  // Seed Notes if empty
  const noteCount = await noteRepo.count();
  if (noteCount === 0) {
    console.log("🌱 Seeding notes and cheat sheets...");
    const notesData = [
      {
        title: "All 10 Trilateral Verb Forms (الأوزان العشرة) Cheat Sheet",
        topic: "Verb Conjugation & Morphology",
        level: "Intermediate",
        format: "PDF",
        fileUrl: "https://example.com/notes/arabic_10_verb_forms.pdf",
        previewUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800",
        description:
          "A compact 2-page full color matrix covering forms I through X: past tense, present tense, masdar, active participle, passive participle, and semantic meaning shifts.",
        author: "Ustadh Zayd Farhan",
        downloadCount: 3890,
        isPublished: true,
        isFeatured: true,
      },
      {
        title: "Complete Guide to Case Endings (علامات الإعراب الأصلية والفرعية)",
        topic: "Irab & Case Endings",
        level: "Beginner",
        format: "Infographic",
        fileUrl: "https://example.com/notes/arabic_irab_guide.pdf",
        previewUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
        description:
          "Color-coded visual mindmap illustrating Raf', Nasb, Jarr, and Jazm across singular nouns, duals, sound plurals, broken plurals, and the five nouns (Asma' Khamsah).",
        author: "Madinah Arabic Study Circle",
        downloadCount: 5210,
        isPublished: true,
        isFeatured: true,
      },
      {
        title: "Everyday Particles Reference: Harf Jar, Nasb, & Jazm",
        topic: "Pronouns & Particles",
        level: "Beginner",
        format: "Cheat Sheet",
        fileUrl: "https://example.com/notes/arabic_particles_guide.pdf",
        previewUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
        description:
          "All common Arabic prepositions, subjunctives, jussives, and conjunctions listed with their governing effects on ensuing words.",
        author: "Br. Tariq Mansoor",
        downloadCount: 2470,
        isPublished: true,
        isFeatured: true,
      },
      {
        title: "Possession & Construct (الإضافة) Rules & Exceptions",
        topic: "Sentence Structure",
        level: "Beginner",
        format: "PDF",
        fileUrl: "https://example.com/notes/idhafah_rules_summary.pdf",
        previewUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800",
        description:
          "Definite and indefinite mudhaf/mudhaf ilayh chains, dropped nun in dual and sound plurals, and pronoun attachments explained with clear diagrams.",
        author: "Institute of Quranic Studies",
        downloadCount: 1680,
        isPublished: true,
        isFeatured: false,
      },
      {
        title: "Pronouns Matrix: Detached, Attached, and Hidden (الضمائر)",
        topic: "Pronouns & Particles",
        level: "Beginner",
        format: "Infographic",
        fileUrl: "https://example.com/notes/arabic_pronouns_matrix.pdf",
        previewUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=800",
        description:
          "Full 14-person pronoun paradigm for 1st, 2nd, and 3rd person (masculine, feminine, singular, dual, plural) with examples in nominative, accusative, and genitive.",
        author: "Dr. Fatima Az-Zahra",
        downloadCount: 4120,
        isPublished: true,
        isFeatured: true,
      },
    ];

    for (const n of notesData) {
      await noteRepo.save(noteRepo.create(n));
    }
    console.log(`✅ Seeded ${notesData.length} study notes`);
  }

  // Seed categories if empty
  const categoryCount = await categoryRepo.count();
  if (categoryCount === 0) {
    console.log("🌱 Seeding curriculum categories...");
    const categoriesData = [
      {
        name: "Nahw (Syntax)",
        nameArabic: "علم النحو",
        slug: "nahw-syntax",
        description: "Classical Arabic syntax, sentence mechanics, case endings (I'rab), and grammatical structures.",
        itemType: "all",
        color: "emerald",
        isFeatured: true,
      },
      {
        name: "Sarf (Morphology)",
        nameArabic: "علم الصرف",
        slug: "sarf-morphology",
        description: "Word derivation patterns, root systems, 10 verb forms, and noun templates.",
        itemType: "all",
        color: "amber",
        isFeatured: true,
      },
      {
        name: "Balagha (Rhetoric)",
        nameArabic: "علم البلاغة",
        slug: "balagha-rhetoric",
        description: "Sciences of Bayan (metaphor), Ma'ani (semantics), and Badi' (literary ornamentation).",
        itemType: "all",
        color: "purple",
        isFeatured: true,
      },
      {
        name: "Quranic Arabic",
        nameArabic: "العربية القرآنية",
        slug: "quranic-arabic",
        description: "Linguistic breakdown, vocabulary, and grammar applied directly to the Holy Quran.",
        itemType: "all",
        color: "teal",
        isFeatured: true,
      },
      {
        name: "Conversational",
        nameArabic: "المحادثة والتواصل",
        slug: "conversational",
        description: "Active spoken Modern Standard Arabic for dialogues, media, and daily interactions.",
        itemType: "course",
        color: "blue",
        isFeatured: false,
      },
      {
        name: "Reading & Literature",
        nameArabic: "القراءة والأدب",
        slug: "reading-literature",
        description: "Graded readers, classical stories, biographical collections, and anthologies.",
        itemType: "all",
        color: "emerald",
        isFeatured: false,
      },
      {
        name: "Tajweed & Phonetics",
        nameArabic: "التجويد وعلم الأصوات",
        slug: "tajweed-phonetics",
        description: "Correct pronunciation, Makharij al-Huruf, characteristics of letters, and recitation rules.",
        itemType: "all",
        color: "cyan",
        isFeatured: false,
      },
      {
        name: "Dictionaries & Lexicons",
        nameArabic: "المعاجم والقواميس",
        slug: "dictionaries-lexicons",
        description: "Comprehensive classical Arabic lexicons, root-based dictionaries, and student glossaries.",
        itemType: "book",
        color: "amber",
        isFeatured: false,
      },
      {
        name: "Grammar",
        nameArabic: "قواعد اللغة",
        slug: "grammar",
        description: "Introductory and foundational grammar rules for early learners.",
        itemType: "book",
        color: "emerald",
        isFeatured: false,
      },
      {
        name: "Literature",
        nameArabic: "الأدب العربي",
        slug: "literature",
        description: "Classical and modern literary treatises, poetry, and prose.",
        itemType: "book",
        color: "purple",
        isFeatured: false,
      },
      {
        name: "Vocabulary",
        nameArabic: "المفردات",
        slug: "vocabulary",
        description: "Thematic vocabulary lists, flashcards, and frequency dictionaries.",
        itemType: "book",
        color: "blue",
        isFeatured: false,
      },
    ];

    for (const c of categoriesData) {
      await categoryRepo.save(categoryRepo.create(c));
    }
    console.log(`✅ Seeded ${categoriesData.length} curriculum categories`);
  }

  console.log("🌟 Database initialization & seeding completed successfully!");
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Done seeding.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding error:", err);
      process.exit(1);
    });
}

