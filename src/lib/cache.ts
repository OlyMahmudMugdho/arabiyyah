import { revalidateTag } from "next/cache";

interface CacheItem<T> {
  data: T;
  expiresAt: number;
  tags: string[];
}

const globalForCache = globalThis as unknown as {
  __appMemoryCache?: Map<string, CacheItem<any>>;
  __inFlightRequests?: Map<string, Promise<any>>;
};

const memoryCache =
  globalForCache.__appMemoryCache || new Map<string, CacheItem<any>>();
const inFlightRequests =
  globalForCache.__inFlightRequests || new Map<string, Promise<any>>();

if (process.env.NODE_ENV !== "production") {
  globalForCache.__appMemoryCache = memoryCache;
  globalForCache.__inFlightRequests = inFlightRequests;
}

export const CacheTags = {
  COURSES: "courses",
  PATHS: "paths",
  BOOKS: "books",
  NOTES: "notes",
  CATEGORIES: "categories",
  USERS: "users",
  DASHBOARD: "dashboard",
} as const;

export type CacheTagType = (typeof CacheTags)[keyof typeof CacheTags];

/**
 * High-performance, stampede-protected in-memory caching layer
 * with TTL and tag-based invalidation.
 */
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttlSeconds?: number;
    tags?: string[];
  } = {}
): Promise<T> {
  const { ttlSeconds = 300, tags = [] } = options;
  const now = Date.now();

  const item = memoryCache.get(key);
  if (item && item.expiresAt > now) {
    return item.data as T;
  }

  // Deduplicate concurrent in-flight queries
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<T>;
  }

  const promise = (async () => {
    try {
      const freshData = await fetcher();
      memoryCache.set(key, {
        data: freshData,
        expiresAt: Date.now() + ttlSeconds * 1000,
        tags,
      });
      return freshData;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * Invalidate cached items by tag across in-memory cache and Next.js data cache.
 */
export function invalidateCache(tag: string | string[]): void {
  const tagsToInvalidate = Array.isArray(tag) ? tag : [tag];

  // Invalidate in-memory items matching any of the specified tags
  for (const [key, item] of memoryCache.entries()) {
    if (item.tags.some((t) => tagsToInvalidate.includes(t))) {
      memoryCache.delete(key);
    }
  }

  // Invalidate Next.js cache tags
  for (const t of tagsToInvalidate) {
    try {
      revalidateTag(t, { expire: 0 });
    } catch {
      // Safely ignore if called in a context where revalidateTag is restricted
    }
  }
}

/**
 * Clear the entire in-memory cache.
 */
export function clearAllCache(): void {
  memoryCache.clear();
  inFlightRequests.clear();
}
