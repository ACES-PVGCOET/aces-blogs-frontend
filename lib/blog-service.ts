import { Blog } from "./types";
import { mockBlogs } from "./mock-data";
import { apiClient, ApiError } from "./api-client";

/**
 * Storage key for user-created/edited blogs in the browser.
 */
export const EDITOR_BLOGS_STORAGE_KEY = "aces_editor_blogs";

export interface BackendBlogItem {
  id: string;
  slug?: string;
  title: string;
  thumbnailUrl?: string | null;
  thumbnail?: string | null;
  authorId?: string;
  author?: {
    id?: string;
    name?: string;
    profileImg?: string | null;
    bio?: string | null;
  };
  reviewerId?: string | null;
  status?: string;
  category?: string;
  tags?: string[];
  readTime?: string;
  readsCount?: number;
  content?: unknown;
  latestContent?: unknown;
  excerpt?: string | null;
  reviewNote?: string | null;
  latestRevisionVersion?: number;
  latestPublishedVersion?: number | null;
  createdAt?: string;
  publishedAt?: string | null;
  modifiedAt?: string;
}

/**
 * Normalizes backend blog response to frontend Blog interface
 */
export function transformBackendBlogToFrontendBlog(raw: BackendBlogItem): Blog {
  const authorName = raw.author?.name || "ACES Contributor";
  const authorHandle = "@" + authorName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const authorAvatar = raw.author?.profileImg || "";

  let contentJson: Record<string, unknown> | null = null;
  let contentString = "";

  if (raw.content && typeof raw.content === "object") {
    contentJson = raw.content as Record<string, unknown>;
    contentString = JSON.stringify(raw.content);
  } else if (raw.latestContent && typeof raw.latestContent === "object") {
    contentJson = raw.latestContent as Record<string, unknown>;
    contentString = JSON.stringify(raw.latestContent);
  } else if (typeof raw.content === "string") {
    contentString = raw.content;
    try {
      contentJson = JSON.parse(raw.content);
    } catch {
      contentJson = null;
    }
  }

  // Calculate read time rough estimate
  let wordCount = 100;
  if (contentString) {
    wordCount = Math.max(50, Math.floor(contentString.length / 5));
  }
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  return {
    id: raw.id,
    slug: raw.slug || raw.id,
    title: raw.title,
    thumbnail: raw.thumbnailUrl || raw.thumbnail || "",
    author: raw.authorId || raw.author?.id || "fellow-author",
    authorName,
    authorHandle,
    authorAvatar,
    reviewer: raw.reviewerId ? "Faculty Editorial Board" : null,
    status: (raw.status as Blog["status"]) || "PUBLISHED",
    category: raw.category || "General",
    tags: Array.isArray(raw.tags) && raw.tags.length > 0 ? raw.tags : [],
    readTime: raw.readTime || readTime,
    readsCount: raw.readsCount ?? 0,
    content: contentString,
    contentJson,
    excerpt: raw.excerpt || "",
    rejectionReason: raw.reviewNote || null,
    latestRevisionVersion: raw.latestRevisionVersion || 1,
    latestPublishedVersion: raw.latestPublishedVersion || (raw.status === "PUBLISHED" ? 1 : 0),
    createdAt: raw.createdAt || raw.publishedAt || new Date().toISOString(),
    modifiedAt: raw.modifiedAt || raw.publishedAt || raw.createdAt || new Date().toISOString(),
  };
}

/**
 * Asynchronously fetch public published blogs from the NestJS backend
 */
export async function fetchPublicBlogs(params?: {
  search?: string;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}): Promise<Blog[]> {
  try {
    const res = await apiClient.blogs.listPublic({
      limit: params?.limit || 50,
      search: params?.search,
      category: params?.category,
      tag: params?.tag,
      page: params?.page,
    });

    if (res?.items && Array.isArray(res.items)) {
      const transformed = res.items.map((item) =>
        transformBackendBlogToFrontendBlog(item as BackendBlogItem)
      );
      // Cache in localStorage for offline resiliency
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("aces_public_blogs_cache", JSON.stringify(transformed));
        } catch {}
      }
      return transformed;
    }
  } catch (err) {
    console.warn("Backend fetchPublicBlogs failed, using local/cached fallback:", err);
  }

  // Fallback to local cache
  return getAllBlogs().filter((b) => b.status === "PUBLISHED");
}

/**
 * Asynchronously fetch single blog by Slug or ID from backend
 */
export async function fetchBlogBySlug(slugOrId: string): Promise<Blog | null> {
  const decoded = decodeURIComponent(slugOrId);
  try {
    const raw = await apiClient.blogs.getBySlug(decoded);
    if (raw) {
      return transformBackendBlogToFrontendBlog(raw as BackendBlogItem);
    }
  } catch (err: unknown) {
    if (!(err instanceof ApiError && err.statusCode === 404)) {
      console.warn(`fetchBlogBySlug for "${decoded}" failed against backend:`, err);
    }
  }

  // Fallback to local/cached blogs
  return getBlogByIdOrSlug(decoded);
}

/**
 * Asynchronously fetch author's own blogs
 */
export async function fetchMyAuthoredBlogs(params?: {
  status?: string;
  category?: string;
  search?: string;
}): Promise<Blog[]> {
  try {
    const res = await apiClient.blogs.listMine({
      status: params?.status,
      category: params?.category,
      search: params?.search,
      limit: 100,
    });
    if (res?.items && Array.isArray(res.items)) {
      return res.items.map((item) =>
        transformBackendBlogToFrontendBlog(item as BackendBlogItem)
      );
    }
  } catch (err) {
    console.warn("fetchMyAuthoredBlogs failed, falling back to local blogs:", err);
  }

  return getAllBlogs();
}

/**
 * Fetch dynamic categories from the backend
 */
export async function fetchBackendCategories(): Promise<string[]> {
  try {
    const list = await apiClient.categories.list();
    if (Array.isArray(list) && list.length > 0) {
      return list.map((c) => c.name);
    }
  } catch (err) {
    console.warn("fetchBackendCategories failed, using fallback:", err);
  }

  return [
    "Kernel & OS",
    "Systems & Compilers",
    "Distributed Systems",
    "Applied Cryptography",
    "Web Infrastructure",
    "Emerging Tech",
    "Technology",
    "Tutorials",
  ];
}

/**
 * Synchronous get all blogs (combining cached backend blogs with locally saved articles)
 */
export function getAllBlogs(): Blog[] {
  if (typeof window === "undefined") {
    return mockBlogs;
  }

  try {
    const cached = localStorage.getItem("aces_public_blogs_cache");
    const saved = localStorage.getItem(EDITOR_BLOGS_STORAGE_KEY);

    const list: Blog[] = [];

    if (cached) {
      const parsedCached = JSON.parse(cached);
      if (Array.isArray(parsedCached) && parsedCached.length > 0) {
        parsedCached.forEach((c: Blog) => {
          const idx = list.findIndex((b) => b.id === c.id || b.slug === c.slug);
          if (idx !== -1) {
            list[idx] = c;
          } else {
            list.push(c);
          }
        });
      }
    }

    if (saved) {
      const customBlogs: Blog[] = JSON.parse(saved);
      if (Array.isArray(customBlogs)) {
        customBlogs.forEach((custom) => {
          const existingIdx = list.findIndex((b) => b.id === custom.id);
          if (existingIdx !== -1) {
            list[existingIdx] = { ...list[existingIdx], ...custom };
          } else {
            list.unshift(custom);
          }
        });
      }
    }

    return list;
  } catch {
    return [];
  }
}

/**
 * Synchronous find blog by ID or Slug
 */
export function getBlogByIdOrSlug(idOrSlug: string): Blog | null {
  const blogs = getAllBlogs();
  const decoded = decodeURIComponent(idOrSlug);
  return blogs.find((b) => b.id === decoded || b.slug === decoded) || null;
}

/**
 * Save or update a blog in localStorage and returns full blog instance.
 */
export function saveBlog(blog: Partial<Blog> & { title: string }): Blog {
  const existingBlogs = getAllBlogs();
  const existingIdx = blog.id ? existingBlogs.findIndex((b) => b.id === blog.id) : -1;

  const now = new Date().toISOString();
  const id = blog.id || ("blog-" + Date.now());
  const slug =
    blog.slug ||
    blog.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const fullBlog: Blog = {
    id,
    slug,
    title: blog.title,
    thumbnail: blog.thumbnail || "",
    author: blog.author || "contributor",
    authorName: blog.authorName || "ACES Contributor",
    authorHandle: blog.authorHandle || "@contributor",
    authorAvatar: blog.authorAvatar || "",
    reviewer: blog.reviewer ?? null,
    status: blog.status || "DRAFT",
    category: blog.category || "General",
    tags: blog.tags && blog.tags.length > 0 ? blog.tags : [],
    readTime: blog.readTime || "5 min read",
    readsCount: blog.readsCount ?? 0,
    content: blog.content || "{}",
    contentJson: blog.contentJson || null,
    excerpt: blog.excerpt || "",
    latestRevisionVersion: (blog.latestRevisionVersion || 1) + (existingIdx !== -1 ? 1 : 0),
    latestPublishedVersion: blog.status === "PUBLISHED" ? 1 : (blog.latestPublishedVersion || 0),
    createdAt: blog.createdAt || now,
    modifiedAt: now,
  };

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(EDITOR_BLOGS_STORAGE_KEY);
      let localList: Blog[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(localList)) localList = [];

      const localIdx = localList.findIndex((b) => b.id === id);
      if (localIdx !== -1) {
        localList[localIdx] = fullBlog;
      } else {
        localList.unshift(fullBlog);
      }
      localStorage.setItem(EDITOR_BLOGS_STORAGE_KEY, JSON.stringify(localList));
    } catch (e) {
      console.warn("Could not persist blog to localStorage:", e);
    }
  }

  return fullBlog;
}

/**
 * Get distinct categories across all dispatches.
 */
export function getCategories(blogs: Blog[]): string[] {
  const set = new Set<string>();
  blogs.forEach((b) => {
    if (b.category) set.add(b.category);
  });
  return Array.from(set);
}
