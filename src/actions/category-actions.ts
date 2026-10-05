"use server";

import { revalidatePath } from "next/cache";
import { getCategoryRepository } from "@/db/data-source";
import { Category, AdminPermission } from "@/db/entities";
import { getSession, hasPermission } from "@/lib/auth";
import { getOrSetCache, invalidateCache, CacheTags } from "@/lib/cache";
import { logActivity } from "@/lib/activity-logger";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getCategoriesAction(filter?: { itemType?: string }) {
  const cacheKey = `categories:list:${JSON.stringify(filter || {})}`;
  return await getOrSetCache(
    cacheKey,
    async () => {
      try {
        const categoryRepo = await getCategoryRepository();
        const query = categoryRepo.createQueryBuilder("category");

        if (filter?.itemType && filter.itemType !== "all") {
          query.andWhere(
            "(category.itemType = :itemType OR category.itemType = 'all')",
            { itemType: filter.itemType }
          );
        }

        query.orderBy("category.name", "ASC");
        const categories = await query.getMany();
        return categories;
      } catch (err: unknown) {
        console.error("Failed to fetch categories:", err);
        return [];
      }
    },
    { ttlSeconds: 600, tags: [CacheTags.CATEGORIES] }
  );
}

export async function createCategoryAction(data: {
  name: string;
  nameArabic?: string;
  slug?: string;
  description?: string;
  itemType?: string;
  color?: string;
  isFeatured?: boolean;
}) {
  const session = await getSession();
  if (
    !session ||
    (!hasPermission(session, AdminPermission.MANAGE_CATEGORIES) &&
      !hasPermission(session, AdminPermission.MANAGE_COURSES) &&
      !hasPermission(session, AdminPermission.MANAGE_BOOKS))
  ) {
    return { error: "Unauthorized. Admin permissions required to create categories." };
  }

  const name = data.name.trim();
  if (!name) {
    return { error: "Category name is required." };
  }

  const slug = (data.slug?.trim() || slugify(name)) || `cat-${Date.now()}`;

  try {
    const categoryRepo = await getCategoryRepository();

    // Check for existing name or slug
    const existing = await categoryRepo.findOne({
      where: [{ name }, { slug }],
    });

    if (existing) {
      return {
        error:
          existing.name.toLowerCase() === name.toLowerCase()
            ? "A category with this name already exists."
            : "A category with this URL slug already exists.",
      };
    }

    const category = categoryRepo.create({
      name,
      nameArabic: data.nameArabic?.trim() || null,
      slug,
      description: data.description?.trim() || null,
      itemType: data.itemType || "all",
      color: data.color || "emerald",
      isFeatured: data.isFeatured ?? false,
    });

    await categoryRepo.save(category);
    invalidateCache([CacheTags.CATEGORIES, CacheTags.COURSES, CacheTags.BOOKS]);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/courses");
    revalidatePath("/admin/books");
    revalidatePath("/courses");
    revalidatePath("/books");

    await logActivity({
      action: "category_create",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id: category.id, name: category.name, slug: category.slug },
    });

    return { category };
  } catch (err: unknown) {
    console.error("Failed to create category:", err);
    return { error: "Failed to create category. Please try again." };
  }
}

export async function updateCategoryAction(
  id: string,
  data: {
    name?: string;
    nameArabic?: string;
    slug?: string;
    description?: string;
    itemType?: string;
    color?: string;
    isFeatured?: boolean;
  }
) {
  const session = await getSession();
  if (
    !session ||
    (!hasPermission(session, AdminPermission.MANAGE_CATEGORIES) &&
      !hasPermission(session, AdminPermission.MANAGE_COURSES) &&
      !hasPermission(session, AdminPermission.MANAGE_BOOKS))
  ) {
    return { error: "Unauthorized. Admin permissions required to update categories." };
  }

  try {
    const categoryRepo = await getCategoryRepository();
    const category = await categoryRepo.findOne({ where: { id } });

    if (!category) {
      return { error: "Category not found." };
    }

    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) return { error: "Category name cannot be empty." };
      category.name = name;
    }

    if (data.nameArabic !== undefined) {
      category.nameArabic = data.nameArabic.trim() || null;
    }

    if (data.slug !== undefined) {
      const slug = data.slug.trim() || slugify(category.name);
      category.slug = slug;
    }

    if (data.description !== undefined) {
      category.description = data.description.trim() || null;
    }

    if (data.itemType !== undefined) {
      category.itemType = data.itemType;
    }

    if (data.color !== undefined) {
      category.color = data.color;
    }

    if (data.isFeatured !== undefined) {
      category.isFeatured = data.isFeatured;
    }

    await categoryRepo.save(category);
    invalidateCache([CacheTags.CATEGORIES, CacheTags.COURSES, CacheTags.BOOKS]);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/courses");
    revalidatePath("/admin/books");
    revalidatePath("/courses");
    revalidatePath("/books");

    await logActivity({
      action: "category_update",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id: category.id, name: category.name, slug: category.slug },
    });

    return { category };
  } catch (err: unknown) {
    console.error("Failed to update category:", err);
    return { error: "Failed to update category. Please try again." };
  }
}

export async function deleteCategoryAction(id: string) {
  const session = await getSession();
  if (
    !session ||
    (!hasPermission(session, AdminPermission.MANAGE_CATEGORIES) &&
      !hasPermission(session, AdminPermission.MANAGE_COURSES) &&
      !hasPermission(session, AdminPermission.MANAGE_BOOKS))
  ) {
    return { error: "Unauthorized. Admin permissions required to delete categories." };
  }

  try {
    const categoryRepo = await getCategoryRepository();
    const category = await categoryRepo.findOne({ where: { id } });

    if (!category) {
      return { error: "Category not found." };
    }

    await categoryRepo.remove(category);
    invalidateCache([CacheTags.CATEGORIES, CacheTags.COURSES, CacheTags.BOOKS]);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/courses");
    revalidatePath("/admin/books");
    revalidatePath("/courses");
    revalidatePath("/books");

    await logActivity({
      action: "category_delete",
      userId: session?.userId,
      userName: session?.name,
      userEmail: session?.email,
      details: { id, name: category.name, slug: category.slug },
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete category:", err);
    return { error: "Failed to delete category. Please try again." };
  }
}
