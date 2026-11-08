/**
 * Centralized API Client for ACES Blogs Backend (NestJS @ port 4000)
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const TOKEN_KEY = "aces_auth_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
}

export interface ApiResponseError {
  statusCode?: number;
  message: string | string[];
  error?: string;
}

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Do not set Content-Type if sending FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Include cookies for aces_session
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let message = "Request failed";
    if (typeof data === "object" && data !== null) {
      const err = data as ApiResponseError;
      if (Array.isArray(err.message)) {
        message = err.message.join(", ");
      } else if (err.message) {
        message = err.message;
      } else if (err.error) {
        message = err.error;
      }
    } else if (typeof data === "string" && data.trim()) {
      message = data;
    }
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

export const apiClient = {
  get baseUrl() {
    return API_BASE_URL;
  },

  // Auth
  auth: {
    async login(email: string, password: string) {
      const res = await request<{
        accessToken: string;
        user: {
          id: string;
          name: string;
          email: string;
          bio: string | null;
          profileImg: string | null;
          linkedIn: string | null;
          role: string;
          status: string;
          createdAt: string;
          updatedAt: string;
        };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res?.accessToken) {
        setStoredToken(res.accessToken);
      }
      return res;
    },

    async logout() {
      try {
        await request("/auth/logout", { method: "POST" });
      } catch (e) {
        console.warn("Logout request error:", e);
      } finally {
        setStoredToken(null);
      }
    },

    async getMe() {
      return request<{
        id: string;
        name: string;
        email: string;
        bio: string | null;
        profileImg: string | null;
        linkedIn: string | null;
        role: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      }>("/auth/me");
    },
  },

  // Users
  users: {
    async getMe() {
      return request<{
        id: string;
        name: string;
        email: string;
        bio: string | null;
        profileImg: string | null;
        linkedIn: string | null;
        role: string;
        status: string;
      }>("/users/me");
    },

    async updateMe(dto: { bio?: string; profileImg?: string; linkedIn?: string }) {
      return request<{
        id: string;
        name: string;
        email: string;
        bio: string | null;
        profileImg: string | null;
        linkedIn: string | null;
        role: string;
        status: string;
      }>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(dto),
      });
    },

    async list(params?: { page?: number; limit?: number; role?: string; search?: string }) {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.role) query.set("role", params.role);
      if (params?.search) query.set("search", params.search);
      const qs = query.toString();
      return request<{ items: unknown[]; total: number }>(`/users${qs ? `?${qs}` : ""}`);
    },
  },

  // Blogs (Public)
  blogs: {
    async listPublic(params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      tag?: string;
    }) {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.search) query.set("search", params.search);
      if (params?.category && params.category !== "ALL") query.set("category", params.category);
      if (params?.tag) query.set("tag", params.tag);
      const qs = query.toString();
      return request<{
        items: Array<{
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          thumbnailUrl: string | null;
          category: string;
          tags: string[];
          publishedAt: string | null;
          latestPublishedVersion: number | null;
          author: {
            id: string;
            name: string;
            profileImg: string | null;
          };
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/blogs/public${qs ? `?${qs}` : ""}`);
    },

    async getBySlug(slug: string) {
      return request<{
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        thumbnailUrl: string | null;
        category: string;
        tags: string[];
        publishedAt: string | null;
        revisionVersion: number;
        content: Record<string, unknown>;
        author: {
          id: string;
          name: string;
          profileImg: string | null;
          bio: string | null;
        };
      }>(`/blogs/public/${encodeURIComponent(slug)}`);
    },

    // Author blogs
    async listMine(params?: {
      status?: string;
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      tag?: string;
    }) {
      const query = new URLSearchParams();
      if (params?.status && params.status !== "ALL") query.set("status", params.status);
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.search) query.set("search", params.search);
      if (params?.category && params.category !== "ALL") query.set("category", params.category);
      if (params?.tag) query.set("tag", params.tag);
      const qs = query.toString();
      return request<{
        items: Array<{
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          thumbnailUrl: string | null;
          category: string;
          tags: string[];
          authorId: string;
          reviewerId: string | null;
          status: string;
          latestRevisionVersion: number;
          latestPublishedVersion: number | null;
          reviewNote: string | null;
          submittedAt: string | null;
          publishedAt: string | null;
          createdAt: string;
          modifiedAt: string;
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/blogs/mine${qs ? `?${qs}` : ""}`);
    },

    async getEditable(id: string) {
      return request<{
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        thumbnailUrl: string | null;
        category: string;
        tags: string[];
        authorId: string;
        reviewerId: string | null;
        status: string;
        latestRevisionVersion: number;
        latestPublishedVersion: number | null;
        reviewNote: string | null;
        submittedAt: string | null;
        publishedAt: string | null;
        createdAt: string;
        modifiedAt: string;
        author: {
          id: string;
          name: string;
          profileImg: string | null;
          bio: string | null;
        };
        latestContent: Record<string, unknown>;
      }>(`/blogs/${encodeURIComponent(id)}/editable`);
    },

    async create(dto: {
      title: string;
      slug: string;
      category: string;
      tags: string[];
      excerpt?: string;
      thumbnailUrl?: string;
      content: Record<string, unknown>;
      submitForReview?: boolean;
    }) {
      return request<{
        id: string;
        title: string;
        slug: string;
        category: string;
        status: string;
        latestRevisionVersion: number;
      }>("/blogs", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },

    async saveContent(
      id: string,
      dto: {
        content: Record<string, unknown>;
        expectedVersion: number;
        changeSummary?: string;
      }
    ) {
      return request<{
        id: string;
        version: number;
        content: Record<string, unknown>;
      }>(`/blogs/${encodeURIComponent(id)}/content`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      });
    },

    async submit(id: string) {
      return request<{ id: string; status: string }>(
        `/blogs/${encodeURIComponent(id)}/submit`,
        { method: "POST" }
      );
    },

    async archive(id: string) {
      return request<{ id: string; status: string }>(
        `/blogs/${encodeURIComponent(id)}/archive`,
        { method: "POST" }
      );
    },

    async delete(id: string) {
      return request<{ id: string; status: string }>(
        `/blogs/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
    },
  },

  // Reviewer & Admin Review Operations
  reviewer: {
    async getQueue() {
      return request<
        Array<{
          id: string;
          title: string;
          slug: string;
          category: string;
          status: string;
          submittedAt: string | null;
          author: { id: string; name: string };
        }>
      >("/reviewer/blogs-to-review");
    },

    async startReview(id: string, feedback?: string, expectedVersion?: number) {
      return request(`/reviewer/blogs/${encodeURIComponent(id)}/start-review`, {
        method: "POST",
        body: JSON.stringify({
          expectedVersion,
          feedback: feedback || "Starting editorial review",
        }),
      });
    },

    async getComparison(id: string) {
      return request<{
        blogId: string;
        title: string;
        draftVersion: number;
        publishedVersion: number | null;
        draftContent: Record<string, unknown>;
        publishedContent: Record<string, unknown> | null;
        hasChanges: boolean;
      }>(`/reviewer/blogs/${encodeURIComponent(id)}/comparison`);
    },

    async publish(id: string, feedback?: string, expectedVersion?: number) {
      return request(`/reviewer/blogs/${encodeURIComponent(id)}/publish`, {
        method: "POST",
        body: JSON.stringify({
          expectedVersion,
          feedback: feedback || "Approved for broadsheet publication",
        }),
      });
    },

    async reject(id: string, feedback: string, expectedVersion?: number) {
      return request(`/reviewer/blogs/${encodeURIComponent(id)}/reject-revision`, {
        method: "POST",
        body: JSON.stringify({
          expectedVersion,
          feedback,
        }),
      });
    },
  },

  // Admin Direct Publishing
  admin: {
    async publishBlog(id: string) {
      return request(`/admin/blogs/${encodeURIComponent(id)}/publish`, {
        method: "POST",
      });
    },
  },

  // Categories
  categories: {
    async list() {
      return request<Array<{ id: string; name: string; createdAt: string }>>(
        "/categories"
      );
    },
  },

  // Uploads
  uploads: {
    async image(file: File) {
      const formData = new FormData();
      formData.append("file", file);
      return request<{ url: string; publicId: string }>("/uploads/image", {
        method: "POST",
        body: formData,
      });
    },
  },
};
