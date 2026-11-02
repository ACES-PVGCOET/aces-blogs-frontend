import type { JSONContent } from "@tiptap/core";

export const DRAFT_STORAGE_KEY = "aces-blog-draft-demo";

export type BlogReviewStatus = "draft" | "submitted";

export type BlogDraft = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  thumbnail: string;
  content: JSONContent;
  status: BlogReviewStatus;
};

export const EMPTY_CONTENT: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function createSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function emptyDraft(title = ""): BlogDraft {
  return {
    title,
    slug: createSlug(title),
    excerpt: "",
    category: "",
    tags: [],
    thumbnail: "",
    content: EMPTY_CONTENT,
    status: "draft",
  };
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function readDraft(): BlogDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(DRAFT_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<BlogDraft>;
    const title = asString(parsed.title);

    return {
      title,
      slug: asString(parsed.slug) || createSlug(title),
      excerpt: asString(parsed.excerpt),
      category: asString(parsed.category),
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.filter(
            (tag): tag is string => typeof tag === "string",
          )
        : [],
      thumbnail: asString(parsed.thumbnail),
      content:
        parsed.content && typeof parsed.content === "object"
          ? parsed.content
          : EMPTY_CONTENT,
      status: parsed.status === "submitted" ? "submitted" : "draft",
    };
  } catch {
    return null;
  }
}

export function writeDraft(draft: BlogDraft): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify(draft),
    );
    return true;
  } catch {
    return false;
  }
}
