"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAllBlogs,
  saveBlog,
  fetchMyAuthoredBlogs,
} from "@/lib/blog-service";
import { Blog, BlogStatus, WriterProfile } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import EditProfileModal from "@/components/EditProfileModal";
import ReaderModal from "@/components/ReaderModal";
import LoginModal from "@/components/LoginModal";
import {
  CheckCircle,
  AlertCircle,
  Check,
  X,
  Lock,
  LogIn,
} from "lucide-react";

export interface ReviewQueueItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  submittedAt: string | null;
  latestRevisionVersion?: number;
  author: { id: string; name: string };
}

interface WriterProfileViewProps {
  userId?: string;
}

export default function WriterProfileView({ userId }: WriterProfileViewProps) {
  const router = useRouter();
  const { user, isLoading, isAdmin, isReviewer, logout } = useAuth();

  const [customProfile, setCustomProfile] = useState<WriterProfile | null>(null);

  const profile = useMemo<WriterProfile>(() => {
    if (customProfile) return customProfile;
    if (user) {
      return {
        id: user.id,
        name: user.name,
        username: user.name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
        role: user.role,
        status: user.status,
        profileImg: user.profileImg || "",
        bio: user.bio || "",
        labels: [],
        createdAt: user.createdAt || "2026-01-01T00:00:00.000Z",
      };
    }
    return {
      id: userId || "",
      name: "",
      username: "",
      role: "WRITER",
      status: "ACTIVE",
      profileImg: "",
      bio: "",
      labels: [],
      createdAt: "2026-01-01T00:00:00.000Z",
    };
  }, [user, customProfile, userId]);

  const [blogs, setBlogs] = useState<Blog[]>(getAllBlogs);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<BlogStatus | "REVIEW_QUEUE">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<"modified_desc" | "modified_asc" | "title_asc">("modified_desc");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [bioExpanded, setBioExpanded] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);

  // Load author blogs from backend
  const refreshBlogs = useCallback(async () => {
    if (user) {
      try {
        const myBlogs = await fetchMyAuthoredBlogs();
        if (myBlogs && Array.isArray(myBlogs)) {
          setBlogs(myBlogs);
        }
      } catch (err) {
        console.warn("Could not fetch user blogs from backend, using cached:", err);
      }
    }
  }, [user]);

  // Load review queue for reviewers / admins
  const refreshReviewQueue = useCallback(async () => {
    if (isReviewer || isAdmin) {
      try {
        const queue = await apiClient.reviewer.getQueue();
        if (Array.isArray(queue)) {
          setReviewQueue(queue as ReviewQueueItem[]);
        }
      } catch (err) {
        console.warn("Could not fetch review queue:", err);
      }
    }
  }, [isReviewer, isAdmin]);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (user) {
        try {
          const myBlogs = await fetchMyAuthoredBlogs();
          if (active && myBlogs && Array.isArray(myBlogs)) {
            setBlogs(myBlogs);
          }
        } catch (err) {
          console.warn("Could not fetch user blogs from backend:", err);
        }
      }
      if (isReviewer || isAdmin) {
        try {
          const queue = await apiClient.reviewer.getQueue();
          if (active && Array.isArray(queue)) {
            setReviewQueue(queue as ReviewQueueItem[]);
          }
        } catch (err) {
          console.warn("Could not fetch review queue:", err);
        }
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [user, isReviewer, isAdmin]);

  // Statistics
  const stats = useMemo(() => {
    const posted = blogs.length;
    const passed = blogs.filter((b) => b.status === "PUBLISHED").length;
    const askedToChange = blogs.filter(
      (b) => b.status === "REJECT" || b.status === "REVISION_DRAFT"
    ).length;
    return { posted, passed, askedToChange };
  }, [blogs]);

  // Combined review queue (merging backend queue with pending manuscripts)
  const combinedReviewQueue = useMemo<ReviewQueueItem[]>(() => {
    const list = [...reviewQueue];
    blogs.forEach((b) => {
      if (b.status === "UNDER_REVIEW" && !list.some((q) => q.id === b.id || q.slug === b.slug)) {
        list.push({
          id: b.id,
          title: b.title,
          slug: b.slug,
          category: b.category,
          status: b.status,
          submittedAt: b.modifiedAt || b.createdAt,
          latestRevisionVersion: b.latestRevisionVersion || 1,
          author: { id: b.author, name: b.authorName || "ACES Contributor" },
        });
      }
    });
    return list;
  }, [reviewQueue, blogs]);

  // Status Tab Counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: blogs.length,
      PUBLISHED: 0,
      UNDER_REVIEW: 0,
      DRAFT: 0,
      REVISION_DRAFT: 0,
      REJECT: 0,
      ARCHIVED: 0,
      REVIEW_QUEUE: combinedReviewQueue.length,
    };
    blogs.forEach((b) => {
      if (counts[b.status] !== undefined) {
        counts[b.status]++;
      }
    });
    return counts;
  }, [blogs, combinedReviewQueue]);

  // Filtered & Sorted Blogs
  const filteredBlogs = useMemo(() => {
    if (activeFilter === "REVIEW_QUEUE") return [];

    let list = [...blogs];

    if (activeFilter !== "ALL") {
      list = list.filter((b) => b.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (sortKey === "modified_desc") {
      list.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
    } else if (sortKey === "modified_asc") {
      list.sort((a, b) => new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime());
    } else if (sortKey === "title_asc") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [blogs, activeFilter, searchQuery, sortKey]);

  // Blog row action handlers
  const handleSubmitForReview = async (blog: Blog) => {
    try {
      await apiClient.blogs.submit(blog.id);
      const updated = saveBlog({ ...blog, status: "UNDER_REVIEW" });
      setBlogs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setNotice(`Manuscript "${blog.title}" submitted to editorial review queue!`);
      refreshBlogs();
      refreshReviewQueue();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "submission error";
      const updated = saveBlog({ ...blog, status: "UNDER_REVIEW" });
      setBlogs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setNotice(`Manuscript "${blog.title}" submitted to review queue (${msg})`);
      refreshBlogs();
      refreshReviewQueue();
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const handlePublish = async (blog: Blog) => {
    try {
      if (isAdmin) {
        await apiClient.admin.publishBlog(blog.id);
        setNotice(`Published "${blog.title}" live!`);
      } else {
        await apiClient.reviewer.publish(blog.id);
        setNotice(`Approved and published "${blog.title}"!`);
      }
      refreshBlogs();
      refreshReviewQueue();
    } catch (err: unknown) {
      // Local fallback
      const updated = saveBlog({ ...blog, status: "PUBLISHED" });
      setBlogs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      const msg = err instanceof Error ? err.message : "local mode";
      setNotice(`Updated status to PUBLISHED (${msg})`);
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const handleArchive = async (blog: Blog) => {
    const confirmed = window.confirm(
      `Archive "${blog.title}"?\nThis will mark the dispatch as historical read-only.`
    );
    if (!confirmed) return;

    try {
      await apiClient.blogs.archive(blog.id);
      setNotice(`Archived dispatch "${blog.title}".`);
      refreshBlogs();
    } catch {
      const updated = saveBlog({ ...blog, status: "ARCHIVED" });
      setBlogs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setNotice(`Archived locally.`);
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDelete = async (blog: Blog) => {
    const confirmed = window.confirm(
      `Delete dispatch "${blog.title}"?\nThis will remove it from the broadsheet registry.`
    );
    if (!confirmed) return;

    try {
      await apiClient.blogs.delete(blog.id);
      setNotice(`Deleted dispatch "${blog.title}".`);
      refreshBlogs();
    } catch {
      setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
      setNotice(`Removed dispatch from view.`);
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const handleEditBlog = (blog: Blog) => {
    router.push(`/editor?id=${encodeURIComponent(blog.id)}`);
  };

  // Review Queue actions
  const handleClaimAndPublishFromQueue = async (queueItem: ReviewQueueItem) => {
    try {
      if (isAdmin) {
        try {
          await apiClient.admin.publishBlog(queueItem.id);
        } catch {
          await apiClient.reviewer.publish(queueItem.id, "Approved for broadsheet publication", queueItem.latestRevisionVersion || 1);
        }
      } else {
        try {
          await apiClient.reviewer.startReview(queueItem.id, "Starting review", queueItem.latestRevisionVersion || 1);
        } catch {}
        await apiClient.reviewer.publish(queueItem.id, "Approved for broadsheet publication", queueItem.latestRevisionVersion || 1);
      }
      setNotice(`Manuscript "${queueItem.title}" approved and published live!`);
    } catch (err: unknown) {
      console.warn("Backend publish notice:", err);
      const localUpdated = saveBlog({ id: queueItem.id, title: queueItem.title, status: "PUBLISHED" });
      setBlogs((prev) => prev.map((b) => (b.id === localUpdated.id ? localUpdated : b)));
      setNotice(`Approved and published "${queueItem.title}"!`);
    }
    refreshReviewQueue();
    refreshBlogs();
    setTimeout(() => setNotice(null), 3500);
  };

  const handleRejectFromQueue = async (queueItem: ReviewQueueItem) => {
    const reason = window.prompt(
      `Enter editorial feedback for rejecting "${queueItem.title}":`,
      "Please address editorial feedback and revise."
    );
    if (!reason) return;

    try {
      await apiClient.reviewer.reject(queueItem.id, reason, queueItem.latestRevisionVersion || 1);
      setNotice(`Revision requested for "${queueItem.title}".`);
    } catch (err: unknown) {
      console.warn("Backend reject notice:", err);
      const localUpdated = saveBlog({
        id: queueItem.id,
        title: queueItem.title,
        status: "REJECT",
        rejectionReason: reason,
      });
      setBlogs((prev) => prev.map((b) => (b.id === localUpdated.id ? localUpdated : b)));
      setNotice(`Revision requested for "${queueItem.title}".`);
    }
    refreshReviewQueue();
    refreshBlogs();
    setTimeout(() => setNotice(null), 3500);
  };

  const statusTabs: { key: BlogStatus | "REVIEW_QUEUE"; label: string }[] = [
    { key: "ALL", label: "ALL DISPATCHES" },
    { key: "PUBLISHED", label: "PUBLISHED" },
    { key: "UNDER_REVIEW", label: "IN REVIEW" },
    { key: "DRAFT", label: "DRAFTS" },
    { key: "REVISION_DRAFT", label: "REVISION DRAFTS" },
    { key: "REJECT", label: "REJECTED" },
    { key: "ARCHIVED", label: "ARCHIVED" },
  ];

  if (isReviewer || isAdmin) {
    statusTabs.push({ key: "REVIEW_QUEUE", label: "REVIEW QUEUE" });
  }

  // Not logged in gate: ask them to login first
  if (isLoading) {
    return (
      <div className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] p-12 text-center">
        <div className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] animate-pulse">
          VERIFYING FELLOW SESSION &amp; CREDENTIALS...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] p-8 sm:p-12 text-center space-y-6 shadow-[8px_8px_0px_var(--border-black)]">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--text-main)] text-[var(--bg-canvas)] font-mono text-xs font-black uppercase">
          <Lock className="w-3.5 h-3.5" />
          <span>AUTHENTICATION REQUIRED</span>
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl sm:text-5xl font-black uppercase text-[var(--text-main)]">
            Fellow Profile Restricted
          </h1>
          <p className="font-serif text-sm sm:text-base text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
            Access to author credentials, editorial workbench, and personal dispatch archives is restricted to registered ACES fellows. Please log in with your credentials to access your profile.
          </p>
        </div>
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="btn-broadsheet btn-broadsheet-primary text-xs sm:text-sm py-3 px-6 cursor-pointer flex items-center gap-2 shadow-[4px_4px_0px_var(--border-black)]"
          >
            <LogIn className="w-4 h-4" />
            <span>[ ☛ LOG IN TO ACCESS PROFILE ]</span>
          </button>
        </div>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => {
            refreshBlogs();
            refreshReviewQueue();
          }}
        />
      </div>
    );
  }

  // Get author initials for monogram avatar
  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AC";

  return (
    <div className="space-y-8">
      {/* Notice Banner */}
      {notice && (
        <div className="p-3 border-2 border-[var(--border-black)] bg-[var(--text-main)] text-[var(--bg-canvas)] font-mono text-xs font-black uppercase text-center animate-pulse">
          {notice}
        </div>
      )}

      {/* 1. Fellow Profile Card */}
      <section className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          {/* Left Column: Portrait & Actions */}
          <div className="md:col-span-4 border-b-3 md:border-b-0 md:border-r-3 border-[var(--border-black)] p-6 flex flex-col items-center justify-between gap-4 bg-[var(--bg-card)]">
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Halftone portrait / Monogram box */}
              <div className="relative w-36 h-36 border-2 border-[var(--border-black)] bg-[var(--bg-muted)] flex items-center justify-center overflow-hidden">
                {profile.profileImg ? (
                  <img
                    src={profile.profileImg}
                    alt={profile.name}
                    className="w-full h-full object-cover filter grayscale"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="font-heading text-4xl font-black text-[var(--text-main)] select-none">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="w-full space-y-2 pt-2">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`btn-broadsheet w-full text-xs py-2 cursor-pointer transition-colors ${
                  isFollowing ? "btn-broadsheet-primary" : ""
                }`}
              >
                {isFollowing ? "✓ FOLLOWING" : "+ FOLLOW AUTHOR"}
              </button>
              <button
                onClick={() => setIsSubscribed(!isSubscribed)}
                className={`btn-broadsheet w-full text-xs py-2 cursor-pointer transition-colors ${
                  isSubscribed ? "btn-broadsheet-primary" : ""
                }`}
              >
                {isSubscribed ? "✓ SUBSCRIBED" : "SUBSCRIBE TO DISPATCHES"}
              </button>
            </div>
          </div>

          {/* Right Column: Name & Bio */}
          <div className="md:col-span-8 flex flex-col justify-between">
            {/* Title compartment */}
            <div className="p-6 border-b-2 border-[var(--border-black)] space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h1 className="font-heading text-3xl sm:text-5xl font-black uppercase text-[var(--text-main)] leading-none">
                    {profile.name}
                  </h1>
                  <span className="font-mono text-xs font-bold uppercase text-[var(--text-muted)] mt-1 block">
                    {user?.email || "author@aces.org"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="btn-broadsheet text-xs py-1 px-3 cursor-pointer"
                    title="Edit profile credentials"
                  >
                    [ ✎ EDIT PROFILE ]
                  </button>
                  <button
                    onClick={() => logout()}
                    className="btn-broadsheet text-xs py-1 px-3 text-red-600 dark:text-red-400 hover:!bg-red-600 hover:!text-white cursor-pointer"
                  >
                    [ ⎋ LOGOUT ]
                  </button>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2 font-mono text-xs font-bold uppercase">
                {user?.role && (
                  <span className="px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-canvas)]">
                    {user.role}
                  </span>
                )}
                <span className="px-2 py-0.5 border border-[var(--border-black)] bg-[var(--bg-muted)] text-[var(--text-main)]">
                  @{profile.username}
                </span>
              </div>
            </div>

            {/* Bio compartment */}
            <div className="p-6 space-y-3 flex-1">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                BIOGRAPHY &amp; BEAT
              </span>
              {profile.bio ? (
                <>
                  <p
                    className={`font-serif text-sm leading-relaxed text-[var(--text-body)] ${
                      !bioExpanded ? "line-clamp-3" : ""
                    }`}
                  >
                    {profile.bio}
                  </p>
                  {profile.bio.length > 120 && (
                    <button
                      onClick={() => setBioExpanded(!bioExpanded)}
                      className="font-mono text-xs font-black underline uppercase text-[var(--text-main)] cursor-pointer"
                    >
                      {bioExpanded ? "Show less ▴" : "Read more ▾"}
                    </button>
                  )}
                </>
              ) : (
                <p className="font-serif text-xs italic text-[var(--text-muted)]">
                  No biography provided yet. Click [ ✎ EDIT PROFILE ] to add your research beat.
                </p>
              )}

              {/* Signature Row */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[var(--text-muted)] uppercase">
                <div>
                  <span className="font-bold">AUTHOR: </span>
                  <span className="italic font-serif font-black text-[var(--text-main)]">
                    {profile.name} {user?.role ? `(${user.role})` : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Editorial Metrics */}
      <section className="border-3 border-[var(--border-black)] bg-[var(--bg-card)] p-5 space-y-4">
        <h2 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wider text-[var(--text-main)] border-b-2 border-[var(--border-black)] pb-2">
          Editorial Ledger
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border-2 border-[var(--border-black)] p-4 bg-[var(--bg-muted)] flex flex-col justify-between">
            <div className="font-mono text-xs font-black uppercase text-[var(--text-muted)]">
              ■ ALL DISPATCHES
            </div>
            <div className="pt-4">
              <span className="font-heading text-5xl font-black text-[var(--text-main)] leading-none">
                {stats.posted}
              </span>
              <div className="font-mono text-xs uppercase font-bold text-[var(--text-muted)] mt-1">
                Manuscripts Authored
              </div>
            </div>
          </div>

          <div className="border-2 border-[var(--border-black)] p-4 bg-[var(--bg-muted)] flex flex-col justify-between">
            <div className="font-mono text-xs font-black uppercase text-[var(--text-muted)]">
              ▲ PUBLISHED
            </div>
            <div className="pt-4">
              <span className="font-heading text-5xl font-black text-[var(--text-main)] leading-none">
                {stats.passed}
              </span>
              <div className="font-mono text-xs uppercase font-bold text-[var(--text-muted)] mt-1">
                Published Live
              </div>
            </div>
          </div>

          <div className="border-2 border-[var(--border-black)] p-4 bg-[var(--bg-muted)] flex flex-col justify-between">
            <div className="font-mono text-xs font-black uppercase text-[var(--text-muted)]">
              ◆ UNDER REVISION
            </div>
            <div className="pt-4">
              <span className="font-heading text-5xl font-black text-[var(--text-main)] leading-none">
                {stats.askedToChange}
              </span>
              <div className="font-mono text-xs uppercase font-bold text-[var(--text-muted)] mt-1">
                Revisions In Progress
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stories & Editorial Pipeline (Workbench) */}
      <section className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-3 border-[var(--border-black)] pb-4">
          <div>
            <h2 className="font-heading text-3xl font-black uppercase text-[var(--text-main)] leading-none">
              Stories &amp; Editorial Pipeline
            </h2>
            <span className="font-mono text-xs font-bold uppercase text-[var(--text-muted)] mt-1 block">
              {activeFilter === "REVIEW_QUEUE"
                ? `REVIEW QUEUE · ${combinedReviewQueue.length} MANUSCRIPTS AWAITING REVIEW`
                : `AUTHOR WORKBENCH · ${filteredBlogs.length} DISPATCHES`}
            </span>
          </div>

          {/* Search, Sort, Write Action */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="FILTER TITLES OR TAGS..."
              className="h-9 px-3 bg-[var(--bg-card)] border-2 border-[var(--border-black)] font-mono text-xs font-bold uppercase text-[var(--text-main)] focus:outline-none min-w-[200px]"
            />

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as "modified_desc" | "modified_asc" | "title_asc")}
              className="h-9 px-2 bg-[var(--bg-card)] border-2 border-[var(--border-black)] font-mono text-xs font-bold uppercase text-[var(--text-main)] focus:outline-none cursor-pointer"
            >
              <option value="modified_desc">RECENTLY MODIFIED</option>
              <option value="modified_asc">OLDEST DISPATCH</option>
              <option value="title_asc">TITLE (A → Z)</option>
            </select>

            <Link
              href="/editor"
              className="btn-broadsheet btn-broadsheet-primary h-9 flex items-center gap-1.5 cursor-pointer"
            >
              <span>➔</span>
              <span>WRITE BLOG</span>
            </Link>
          </div>
        </div>

        {/* Segmented Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-b-2 border-[var(--border-black)]">
          {statusTabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            const count = statusCounts[tab.key] || 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3 py-1.5 font-mono text-xs font-black uppercase whitespace-nowrap border-2 border-[var(--border-black)] flex items-center gap-2 transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                    : "bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 font-mono font-bold ${
                    isActive
                      ? "bg-[var(--bg-canvas)] text-[var(--text-main)]"
                      : "bg-[var(--bg-muted)] text-[var(--text-main)] border border-[var(--border-black)]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Tab: REVIEW QUEUE VIEW */}
        {activeFilter === "REVIEW_QUEUE" ? (
          <div className="space-y-4">
            {combinedReviewQueue.length === 0 ? (
              <div className="border-2 border-dashed border-[var(--border-black)] p-12 text-center bg-[var(--bg-muted)] space-y-2 font-mono text-xs uppercase">
                <CheckCircle className="w-8 h-8 mx-auto text-green-700" />
                <div className="font-bold text-base">Review Queue Is Clear</div>
                <p className="text-[var(--text-muted)] font-serif lowercase">
                  all student manuscripts have been peer reviewed.
                </p>
              </div>
            ) : (
              combinedReviewQueue.map((item) => (
                <div
                  key={item.id}
                  className="border-3 border-[var(--border-black)] bg-[var(--bg-card)] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-[4px_4px_0px_var(--border-black)] transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase">
                      <span className="snappy-status-pill under_review">
                        UNDER REVIEW
                      </span>
                      <span className="text-[var(--text-main)] font-black">
                        [{item.category}]
                      </span>
                      <span className="text-[var(--text-muted)]">
                        • BY {item.author?.name?.toUpperCase() || "CONTRIBUTOR"}
                      </span>
                      {item.submittedAt && (
                        <span className="text-[var(--text-muted)]">
                          • SUBMITTED {new Date(item.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-xl font-black uppercase text-[var(--text-main)]">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    <Link
                      href={`/editor?id=${encodeURIComponent(item.id)}`}
                      className="btn-broadsheet text-xs py-1.5 px-3 cursor-pointer"
                    >
                      [ ☛ INSPECT DRAFT ]
                    </Link>
                    <button
                      onClick={() => handleClaimAndPublishFromQueue(item)}
                      className="btn-broadsheet btn-broadsheet-primary text-xs py-1.5 px-3 cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>[ ✔ APPROVE &amp; PUBLISH ]</span>
                    </button>
                    <button
                      onClick={() => handleRejectFromQueue(item)}
                      className="btn-broadsheet text-xs py-1.5 px-3 text-red-600 dark:text-red-400 hover:!bg-red-600 hover:!text-white cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>[ ✕ REQUEST REVISION ]</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Active Tab: Stories Ledger Rows */
          <>
            {filteredBlogs.length === 0 ? (
              <div className="border-2 border-dashed border-[var(--border-black)] p-8 text-center bg-[var(--bg-muted)] space-y-2 font-mono text-xs uppercase">
                <div className="font-bold">No Dispatches in Current Tab &amp; Filter</div>
                <Link href="/editor" className="btn-broadsheet mt-2 inline-block cursor-pointer">
                  ➔ COMPOSE DISPATCH
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBlogs.map((blog) => {
                  const statusKey = blog.status.toLowerCase();
                  const statusLabel = blog.status.replace(/_/g, " ");

                  return (
                    <div
                      key={blog.id}
                      className="border-3 border-[var(--border-black)] bg-[var(--bg-card)] p-4 flex flex-col md:flex-row items-stretch gap-4 hover:shadow-[4px_4px_0px_var(--border-black)] transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="w-full md:w-36 h-28 border-2 border-[var(--border-black)] bg-[var(--bg-muted)] overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                        {blog.thumbnail ? (
                          <img
                            src={blog.thumbnail}
                            alt={blog.title}
                            className="w-full h-full object-cover filter grayscale"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="font-mono text-xs font-bold text-[var(--text-muted)] uppercase">
                            [{blog.category}]
                          </span>
                        )}
                      </div>

                      {/* Information Details */}
                      <div className="flex-1 space-y-1.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center flex-wrap gap-2 font-mono text-xs font-bold uppercase mb-1">
                            <span className={`snappy-status-pill ${statusKey}`}>
                              {statusLabel}
                            </span>
                            <span className="text-[var(--text-main)] font-black">
                              [{blog.category}]
                            </span>
                            <span className="text-[var(--text-muted)]">
                              • {blog.readTime.toUpperCase()}
                            </span>
                            <span className="text-[var(--text-muted)]">
                              • UPDATED {new Date(blog.modifiedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <button
                            onClick={() => setPreviewBlog(blog)}
                            className="font-heading text-xl sm:text-2xl font-black uppercase text-left hover:underline text-[var(--text-main)] block cursor-pointer"
                          >
                            {blog.title}
                          </button>

                          {blog.excerpt && (
                            <p className="font-serif text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                              {blog.excerpt}
                            </p>
                          )}

                          {/* Editorial review indicators */}
                          {blog.status === "UNDER_REVIEW" && (
                            <div className="mt-2 p-1.5 border border-dashed border-[var(--border-black)] bg-[var(--bg-muted)] font-mono text-[11px] font-bold uppercase text-[var(--text-main)]">
                              ARTICLE CURRENTLY UNDER EDITORIAL REVIEW
                            </div>
                          )}
                          {blog.status === "REJECT" && blog.rejectionReason && (
                            <div className="mt-2 p-2 border-2 border-[var(--border-black)] bg-[var(--bg-muted)] space-y-1">
                              <div className="font-mono text-[10px] font-black uppercase text-[var(--text-main)]">
                                EDITORIAL REVISION FEEDBACK:
                              </div>
                              <div className="font-serif text-xs text-[var(--text-body)]">
                                {blog.rejectionReason}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions Cell */}
                      <div className="flex md:flex-col items-center justify-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 md:border-l-2 border-[var(--border-black)] md:pl-4">
                        <button
                          onClick={() => setPreviewBlog(blog)}
                          className="btn-broadsheet text-xs py-1 px-3 w-full cursor-pointer"
                        >
                          [ ☛ PREVIEW ]
                        </button>

                        <button
                          onClick={() => handleEditBlog(blog)}
                          disabled={blog.status === "UNDER_REVIEW"}
                          className="btn-broadsheet text-xs py-1 px-3 w-full disabled:opacity-40 cursor-pointer"
                          title={blog.status === "UNDER_REVIEW" ? "Under Review - Locked" : "Edit blog"}
                        >
                          [ ✂ EDIT ]
                        </button>

                        {(blog.status === "DRAFT" || blog.status === "REVISION_DRAFT" || blog.status === "REJECT") && (
                          <button
                            onClick={() => handleSubmitForReview(blog)}
                            className="btn-broadsheet btn-broadsheet-primary text-xs py-1 px-3 w-full cursor-pointer"
                            title="Submit manuscript to editorial review queue"
                          >
                            [ ✈ SUBMIT REVIEW ]
                          </button>
                        )}

                        {blog.status !== "PUBLISHED" && (isAdmin || isReviewer) && (
                          <button
                            onClick={() => handlePublish(blog)}
                            className="btn-broadsheet btn-broadsheet-primary text-xs py-1 px-3 w-full cursor-pointer"
                          >
                            [ ✈ PUBLISH ]
                          </button>
                        )}

                        {blog.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handleArchive(blog)}
                            className="btn-broadsheet text-xs py-1 px-3 w-full cursor-pointer"
                          >
                            [ ⌧ ARCHIVE ]
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(blog)}
                          className="btn-broadsheet text-xs py-1 px-3 w-full text-red-600 dark:text-red-400 hover:!bg-red-600 hover:!text-white cursor-pointer"
                        >
                          [ ⎚ DELETE ]
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={(updated) => setCustomProfile(updated)}
      />

      <ReaderModal
        isOpen={!!previewBlog}
        onClose={() => setPreviewBlog(null)}
        blog={previewBlog}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          refreshBlogs();
          refreshReviewQueue();
        }}
      />
    </div>
  );
}
