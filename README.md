# Bayan (بيان) - Arabic Learning Resource Sharing Platform

> **منصة بيان لمشاركة الموارد التعليمية للغة العربية**
> An open-access platform for curated learning paths, grammar courses, classical books, and study cheat sheets for seekers of the Arabic language.

---

## 🌟 Key Highlights & Requirements Fulfilled

1. **Beautiful Landing Page (`/`)**:
   - Modern emerald & amber Islamic aesthetic with subtle arabesque background motifs.
   - Arabic calligraphy accents (`بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ`) and bilingual typography with Google Fonts (*Amiri* & *Geist*).
   - Live statistics counter (Total courses, paths, books, notes).
   - Dedicated sections for:
     - **Curated Learning Tracks (Sequential multi-stage roadmaps)**
     - **Video Courses with live filter**
     - **Classical Books & Primers (PDF Downloads)**
     - **Grammar Notes & Cheat Sheets (Infographics & Matrices)**
     - **The Three Core Disciplines (Nahw, Sarf, Balagha)**

2. **Courses Catalog & Live Filtering (`/courses`)**:
   - **Language Filter**: English, Arabic (العربية), Urdu (اردو), Bangla (বাংলা), etc.
   - **Level Filter**: Beginner, Intermediate, Advanced, All Levels.
   - **Category Filter**: Nahw (Syntax), Sarf (Morphology), Balagha (Rhetoric), Quranic Arabic, Conversational, Reading, Tajweed.
   - Real-time search query matching across title, instructor, and Arabic titles.
   - Course detail pages (`/courses/[slug]`) with syllabus outlines, lessons, and linked paths.

3. **Multi-Stage Learning Paths (`/paths` & `/paths/[slug]`)**:
   - **"A path combines multiple courses divided into multiple sections."**
   - Each path features sequential milestone stages (e.g. Stage 1: Script & Phonetics, Stage 2: Core Grammar & Verb Forms, Stage 3: Applied Texts & Eloquence).
   - Each stage holds specific ordered courses with *Mandatory* / *Optional* indicators and curator advice notes.

4. **Books Library (`/books`)**:
   - Classical grammars (*Al-Ajrumiyyah*, *Al-Nahw Al-Wadih*, *Tuhfat al-Saniyyah*).
   - Root-based dictionaries (*Hans Wehr*).
   - Graded readers (*Qisas al-Nabiyyeen*).
   - Direct PDF download links, reading levels, and page counts.

5. **Study Notes & Cheat Sheets (`/notes`)**:
   - High-yield 10-form verb conjugation tables (Awzan).
   - Color-coded Case Endings (*I'rab* markers) cheat sheets.
   - Particle guides (*Harf Jarr, Harf Nasb, Harf Jazm*).
   - Pronoun matrices (Detached, Attached, Hidden).

6. **Hidden Admin Portal (`/admin` & `/admin/login`)**:
   - **Not exposed in public navigation**: Accessible only via direct URL.
   - **No public signup**: Registration is permanently disabled.
   - **Strict authentication**: Protected by JWT HTTP-only cookies and bcrypt password hashing.
   - **Superadmin User & Permission Management (`/admin/users`)**:
     - Only **Superadmins** can create new admin accounts.
     - Granular permission assignment:
       - `manage_courses`: Create, update, delete courses.
       - `manage_paths`: Create paths and build multi-stage sections.
       - `manage_books`: Manage textbook catalog.
       - `manage_notes`: Manage study notes.
       - `manage_users`: Superadmin delegation.
   - **Interactive Multi-Stage Path Builder (`/admin/paths/[id]`)**:
     - Add/reorder path stages.
     - Attach any course from the catalog to a stage, specify order, toggle mandatory requirement, and add student advice notes.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, Server Actions, Dynamic Rendering)
- **ORM**: TypeORM
- **Database**: PostgreSQL (Latest - PostgreSQL 18 via Docker container)
- **Styling**: Tailwind CSS + Lucide Icons + Amiri Arabic Font
- **Authentication**: Jose JWT + BcryptJS (HTTP-Only Secure Cookies)

---

## 🔐 Default Superadmin Credentials

For initial testing, the database is pre-seeded with an initial Superadmin account:

- **Email**: `superadmin@bayan.org`
- **Password**: `SuperAdmin123!`
- **Role**: `SUPERADMIN` (Possesses all permissions)
- **Login URL**: `http://localhost:3001/admin/login`

---

## 🚀 Running the Project

### 1. PostgreSQL (Latest)
PostgreSQL is running via Docker:
```bash
docker run -d --name arabic_learning_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=arabic_learning \
  -p 5433:5432 \
  --restart unless-stopped postgres:latest
```

### 2. Environment Variables (`.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/arabic_learning
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=arabic_learning

JWT_SECRET=super-secret-jwt-bayan-arabic-platform-key-2026-secure!
INITIAL_SUPERADMIN_NAME=Super Admin
INITIAL_SUPERADMIN_EMAIL=superadmin@bayan.org
INITIAL_SUPERADMIN_PASSWORD=SuperAdmin123!
```

### 3. Database Seeding
To populate courses, learning paths, books, notes, and the superadmin:
```bash
npm run seed
```

### 4. Build and Start
```bash
# Build production bundle
npm run build

# Start on port 3001
npm run start -- -p 3001
```

### 5. Run E2E Verification Test
```bash
npx tsx scripts/verify-full-flow.ts
```

---

## 📁 Project Structure

```
arabic-learning-platform/
├── src/
│   ├── actions/                  # Next.js Server Actions
│   │   ├── auth-actions.ts       # Login, Logout, Session check
│   │   ├── course-actions.ts     # Course CRUD and language/level filtering
│   │   ├── path-actions.ts       # Path & multi-stage section builder actions
│   │   ├── book-actions.ts       # Book repository actions
│   │   ├── note-actions.ts       # Note & cheat sheet actions
│   │   └── user-actions.ts       # Superadmin RBAC user management
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Landing page (Hero, Paths, Courses, Books, Notes)
│   │   ├── courses/              # Courses catalog & course details
│   │   ├── paths/                # Learning paths & stage roadmap view
│   │   ├── books/                # Books repository with download links
│   │   ├── notes/                # Study notes and infographics
│   │   └── admin/                # Private Admin Panel
│   │       ├── login/            # Dedicated login (no signup)
│   │       └── (dashboard)/      # Admin Layout with role-protected sidebar
│   │           ├── page.tsx      # Metrics & overview dashboard
│   │           ├── courses/      # Course Manager
│   │           ├── paths/        # Path Manager & [id] Stage Builder
│   │           ├── books/        # Book Manager
│   │           ├── notes/        # Note Manager
│   │           └── users/        # Superadmin User & Permissions Control
│   ├── components/               # UI Components
│   │   ├── Navbar.tsx            # Header (admin link hidden)
│   │   ├── Footer.tsx            # Footer with Islamic quotes and disciplines
│   │   ├── CourseCard.tsx        # Course card
│   │   ├── CourseFilterList.tsx  # Interactive filter by language and level
│   │   ├── PathCard.tsx          # Learning path card with stage pipeline preview
│   │   ├── BookCard.tsx          # Book card with PDF download
│   │   └── NoteCard.tsx          # Cheat sheet card
│   ├── db/
│   │   ├── data-source.ts        # TypeORM DataSource singleton & repository getters
│   │   ├── entities/             # TypeORM models (User, Course, Path, Section, etc.)
│   │   └── seed.ts               # Database seeder
│   └── lib/
│       └── auth.ts               # Jose JWT & cookie session verifier
├── scripts/
│   └── verify-full-flow.ts       # End-to-end verification suite
└── next.config.ts                # Next.js configuration with serverExternalPackages
```
