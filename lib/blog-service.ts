import { Blog } from "./types";
import { mockBlogs } from "./mock-data";

/**
 * Storage key for user-created/edited blogs in the browser.
 */
export const EDITOR_BLOGS_STORAGE_KEY = "aces_editor_blogs";

/**
 * Get all blogs, combining base mock data with any locally saved articles.
 */
export function getAllBlogs(): Blog[] {
  if (typeof window === "undefined") {
    return mockBlogs;
  }

  try {
    const saved = localStorage.getItem(EDITOR_BLOGS_STORAGE_KEY);
    if (!saved) return mockBlogs;

    const customBlogs: Blog[] = JSON.parse(saved);
    if (!Array.isArray(customBlogs)) return mockBlogs;

    const merged = [...mockBlogs];
    customBlogs.forEach((custom) => {
      const existingIdx = merged.findIndex((b) => b.id === custom.id);
      if (existingIdx !== -1) {
        merged[existingIdx] = { ...merged[existingIdx], ...custom };
      } else {
        merged.unshift(custom);
      }
    });
    return merged;
  } catch {
    return mockBlogs;
  }
}

/**
 * Find blog by ID or Slug.
 */
export function getBlogByIdOrSlug(idOrSlug: string): Blog | null {
  const blogs = getAllBlogs();
  const decoded = decodeURIComponent(idOrSlug);
  return blogs.find((b) => b.id === decoded || b.slug === decoded) || null;
}

/**
 * Save or update a blog in localStorage.
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
    thumbnail:
      blog.thumbnail ||
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    author: blog.author || "writer-101",
    authorName: blog.authorName || "Aarav Sharma",
    authorHandle: blog.authorHandle || "@aarav_writes",
    authorAvatar:
      blog.authorAvatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    reviewer: blog.reviewer ?? "Faculty Editorial Board",
    status: blog.status || "DRAFT",
    category: blog.category || "Systems & Compilers",
    tags: blog.tags && blog.tags.length > 0 ? blog.tags : ["systems", "engineering"],
    readTime: blog.readTime || "5 min read",
    readsCount: blog.readsCount ?? 0,
    content: blog.content || "Manuscript draft content.",
    excerpt: blog.excerpt || blog.title + " — Technical research dispatch.",
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
