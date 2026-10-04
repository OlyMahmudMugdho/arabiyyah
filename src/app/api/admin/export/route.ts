import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/db/entities";
import {
  getCourseRepository,
  getPathRepository,
  getBookRepository,
  getNoteRepository,
  getUserRepository,
  getCategoryRepository,
} from "@/db/data-source";

export const dynamic = "force-dynamic";

function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return '""';
  if (value instanceof Date) return `"${value.toISOString()}"`;
  if (typeof value === "object") {
    const str = JSON.stringify(value);
    return `"${str.replace(/"/g, '""')}"`;
  }
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function toCSV(headers: string[], rows: Record<string, any>[]): string {
  const headerLine = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCSVValue(row[h])).join(",")
  );
  return [headerLine, ...dataLines].join("\r\n");
}

export async function GET(req: NextRequest) {
  // 1. Enforce strict Superadmin authorization
  const session = await getSession();
  if (!session || session.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      {
        error: "Forbidden. Exporting platform data is restricted exclusively to Superadmins.",
      },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource") || "all";
  const format = (searchParams.get("format") || "json").toLowerCase();

  const [courseRepo, pathRepo, bookRepo, noteRepo, userRepo, categoryRepo] =
    await Promise.all([
      getCourseRepository(),
      getPathRepository(),
      getBookRepository(),
      getNoteRepository(),
      getUserRepository(),
      getCategoryRepository(),
    ]);

  const timestamp = new Date().toISOString();
  const dateStr = timestamp.slice(0, 10);

  // Fetch relevant data depending on resource
  if (resource === "courses") {
    const courses = await courseRepo.find({ order: { createdAt: "DESC" } });

    if (format === "csv") {
      const headers = [
        "id",
        "title",
        "titleArabic",
        "slug",
        "instructor",
        "language",
        "level",
        "category",
        "duration",
        "isPublished",
        "isFeatured",
        "resourceUrl",
        "description",
        "createdAt",
      ];
      const csv = toCSV(headers, courses);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bayan-courses-export-${dateStr}.csv"`,
        },
      });
    }

    return new NextResponse(
      JSON.stringify(
        {
          platform: "Bayan Arabic Learning Platform",
          resource: "courses",
          exportTimestamp: timestamp,
          exportedBy: {
            id: session.userId,
            name: session.name,
            email: session.email,
          },
          count: courses.length,
          data: courses,
        },
        null,
        2
      ),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="bayan-courses-export-${dateStr}.json"`,
        },
      }
    );
  }

  if (resource === "paths") {
    const paths = await pathRepo.find({
      relations: {
        sections: {
          pathCourses: {
            course: true,
          },
        },
      },
      order: { createdAt: "DESC" },
    });

    if (format === "csv") {
      const headers = [
        "id",
        "title",
        "titleArabic",
        "slug",
        "level",
        "estimatedHours",
        "icon",
        "color",
        "stagesCount",
        "coursesCount",
        "isPublished",
        "isFeatured",
        "description",
        "createdAt",
      ];
      const rows = paths.map((p) => {
        let totalCourses = 0;
        if (p.sections) {
          p.sections.forEach((s) => {
            totalCourses += s.pathCourses?.length || 0;
          });
        }
        return {
          id: p.id,
          title: p.title,
          titleArabic: p.titleArabic,
          slug: p.slug,
          level: p.level,
          estimatedHours: p.estimatedHours,
          icon: p.icon,
          color: p.color,
          stagesCount: p.sections?.length || 0,
          coursesCount: totalCourses,
          isPublished: p.isPublished,
          isFeatured: p.isFeatured,
          description: p.description,
          createdAt: p.createdAt,
        };
      });
      const csv = toCSV(headers, rows);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bayan-paths-export-${dateStr}.csv"`,
        },
      });
    }

    return new NextResponse(
      JSON.stringify(
        {
          platform: "Bayan Arabic Learning Platform",
          resource: "paths",
          exportTimestamp: timestamp,
          exportedBy: {
            id: session.userId,
            name: session.name,
            email: session.email,
          },
          count: paths.length,
          data: paths,
        },
        null,
        2
      ),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="bayan-paths-export-${dateStr}.json"`,
        },
      }
    );
  }

  if (resource === "books") {
    const books = await bookRepo.find({ order: { createdAt: "DESC" } });

    if (format === "csv") {
      const headers = [
        "id",
        "title",
        "titleArabic",
        "author",
        "category",
        "level",
        "language",
        "pages",
        "fileUrl",
        "downloadCount",
        "isPublished",
        "isFeatured",
        "description",
        "createdAt",
      ];
      const csv = toCSV(headers, books);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bayan-books-export-${dateStr}.csv"`,
        },
      });
    }

    return new NextResponse(
      JSON.stringify(
        {
          platform: "Bayan Arabic Learning Platform",
          resource: "books",
          exportTimestamp: timestamp,
          exportedBy: {
            id: session.userId,
            name: session.name,
            email: session.email,
          },
          count: books.length,
          data: books,
        },
        null,
        2
      ),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="bayan-books-export-${dateStr}.json"`,
        },
      }
    );
  }

  if (resource === "notes") {
    const notes = await noteRepo.find({ order: { createdAt: "DESC" } });

    if (format === "csv") {
      const headers = [
        "id",
        "title",
        "topic",
        "level",
        "format",
        "author",
        "fileUrl",
        "previewUrl",
        "downloadCount",
        "isPublished",
        "isFeatured",
        "description",
        "createdAt",
      ];
      const csv = toCSV(headers, notes);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bayan-notes-export-${dateStr}.csv"`,
        },
      });
    }

    return new NextResponse(
      JSON.stringify(
        {
          platform: "Bayan Arabic Learning Platform",
          resource: "notes",
          exportTimestamp: timestamp,
          exportedBy: {
            id: session.userId,
            name: session.name,
            email: session.email,
          },
          count: notes.length,
          data: notes,
        },
        null,
        2
      ),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="bayan-notes-export-${dateStr}.json"`,
        },
      }
    );
  }

  if (resource === "users") {
    const rawUsers = await userRepo.find({ order: { createdAt: "DESC" } });
    // Sanitize: never export passwordHash
    const sanitizedUsers = rawUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      permissions: u.permissions,
      isActive: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    if (format === "csv") {
      const headers = [
        "id",
        "name",
        "email",
        "role",
        "permissions",
        "isActive",
        "createdAt",
      ];
      const csv = toCSV(headers, sanitizedUsers);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bayan-users-export-${dateStr}.csv"`,
        },
      });
    }

    return new NextResponse(
      JSON.stringify(
        {
          platform: "Bayan Arabic Learning Platform",
          resource: "users",
          exportTimestamp: timestamp,
          exportedBy: {
            id: session.userId,
            name: session.name,
            email: session.email,
          },
          count: sanitizedUsers.length,
          data: sanitizedUsers,
        },
        null,
        2
      ),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="bayan-users-export-${dateStr}.json"`,
        },
      }
    );
  }

  if (resource === "categories") {
    const categories = await categoryRepo.find({ order: { name: "ASC" } });

    if (format === "csv") {
      const headers = [
        "id",
        "name",
        "nameArabic",
        "slug",
        "itemType",
        "color",
        "isFeatured",
        "description",
        "createdAt",
      ];
      const csv = toCSV(headers, categories);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bayan-categories-export-${dateStr}.csv"`,
        },
      });
    }

    return new NextResponse(
      JSON.stringify(
        {
          platform: "Bayan Arabic Learning Platform",
          resource: "categories",
          exportTimestamp: timestamp,
          exportedBy: {
            id: session.userId,
            name: session.name,
            email: session.email,
          },
          count: categories.length,
          data: categories,
        },
        null,
        2
      ),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="bayan-categories-export-${dateStr}.json"`,
        },
      }
    );
  }

  // Default: Full platform backup ("all")
  const [courses, paths, books, notes, rawUsers, categories] = await Promise.all([
    courseRepo.find({ order: { createdAt: "DESC" } }),
    pathRepo.find({
      relations: {
        sections: {
          pathCourses: {
            course: true,
          },
        },
      },
      order: { createdAt: "DESC" },
    }),
    bookRepo.find({ order: { createdAt: "DESC" } }),
    noteRepo.find({ order: { createdAt: "DESC" } }),
    userRepo.find({ order: { createdAt: "DESC" } }),
    categoryRepo.find({ order: { name: "ASC" } }),
  ]);

  const sanitizedUsers = rawUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    permissions: u.permissions,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));

  if (format === "csv") {
    // Generate unified multi-resource summary CSV
    const headers = [
      "resourceType",
      "id",
      "titleOrName",
      "categoryOrTopicOrRole",
      "levelOrPermissions",
      "authorOrInstructor",
      "status",
      "createdAt",
    ];

    const rows: Record<string, any>[] = [
      ...courses.map((c) => ({
        resourceType: "Course",
        id: c.id,
        titleOrName: c.title,
        categoryOrTopicOrRole: c.category,
        levelOrPermissions: c.level,
        authorOrInstructor: c.instructor,
        status: c.isPublished ? "Published" : "Draft",
        createdAt: c.createdAt,
      })),
      ...paths.map((p) => ({
        resourceType: "LearningPath",
        id: p.id,
        titleOrName: p.title,
        categoryOrTopicOrRole: `${p.sections?.length || 0} Stages`,
        levelOrPermissions: p.level,
        authorOrInstructor: p.estimatedHours,
        status: p.isPublished ? "Published" : "Draft",
        createdAt: p.createdAt,
      })),
      ...books.map((b) => ({
        resourceType: "Book",
        id: b.id,
        titleOrName: b.title,
        categoryOrTopicOrRole: b.category,
        levelOrPermissions: b.level,
        authorOrInstructor: b.author,
        status: b.isPublished ? "Published" : "Draft",
        createdAt: b.createdAt,
      })),
      ...notes.map((n) => ({
        resourceType: "Note",
        id: n.id,
        titleOrName: n.title,
        categoryOrTopicOrRole: n.topic,
        levelOrPermissions: n.level,
        authorOrInstructor: n.author,
        status: n.isPublished ? "Published" : "Draft",
        createdAt: n.createdAt,
      })),
      ...sanitizedUsers.map((u) => ({
        resourceType: "AdminUser",
        id: u.id,
        titleOrName: u.name,
        categoryOrTopicOrRole: u.role,
        levelOrPermissions: (u.permissions || []).join("; "),
        authorOrInstructor: u.email,
        status: u.isActive ? "Active" : "Disabled",
        createdAt: u.createdAt,
      })),
      ...categories.map((cat) => ({
        resourceType: "Category",
        id: cat.id,
        titleOrName: cat.name,
        categoryOrTopicOrRole: cat.itemType,
        levelOrPermissions: cat.color,
        authorOrInstructor: cat.slug,
        status: cat.isFeatured ? "Featured" : "Standard",
        createdAt: cat.createdAt,
      })),
    ];

    const csv = toCSV(headers, rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bayan-full-platform-backup-${dateStr}.csv"`,
      },
    });
  }

  // Full platform JSON backup bundle
  const payload = {
    platform: "Bayan Arabic Learning Platform",
    version: "1.0.0",
    exportTimestamp: timestamp,
    exportedBy: {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
    },
    summary: {
      coursesCount: courses.length,
      pathsCount: paths.length,
      booksCount: books.length,
      notesCount: notes.length,
      usersCount: sanitizedUsers.length,
      categoriesCount: categories.length,
      totalRecords:
        courses.length +
        paths.length +
        books.length +
        notes.length +
        sanitizedUsers.length +
        categories.length,
    },
    data: {
      courses,
      paths,
      books,
      notes,
      users: sanitizedUsers,
      categories,
    },
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="bayan-full-platform-backup-${dateStr}.json"`,
    },
  });
}
