"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllBlogs, saveBlog } from "@/lib/blog-service";
import { mockWriterProfile } from "@/lib/mock-data";
import { Blog, BlogStatus, WriterProfile } from "@/lib/types";
import BadgePill from "@/components/BadgePill";
import EditProfileModal from "@/components/EditProfileModal";
import ReaderModal from "@/components/ReaderModal";

interface WriterProfileViewProps {
  userId?: string;
}

export default function WriterProfileView({ userId = "writer-101" }: WriterProfileViewProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<WriterProfile>(mockWriterProfile);
  const [blogs, setBlogs] = useState<Blog[]>(getAllBlogs);
  const [activeFilter, setActiveFilter] = useState<BlogStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<"modified_desc" | "modified_asc" | "title_asc">("modified_desc");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [bioExpanded, setBioExpanded] = useState<boolean>(false);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);

  // Load profile credentials
  useEffect(() => {
    try {
      const cached = localStorage.getItem("aces_user_profile");
      if (cached) {
        const parsed = JSON.parse(cached);
        setTimeout(() => {
          setProfile(parsed);
        }, 0);
      } else {
        // Fetch from API
        fetch(`/api/profile/${userId}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.name) {
              setProfile((prev) => ({
                ...prev,
                name: data.name,
                username: data.companion || prev.username,
                profileImg: data.avatarUrl || prev.profileImg,
                bio: data.hometown || prev.bio,
              }));
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, [userId]);

  // Statistics
  const stats = useMemo(() => {
    const posted = blogs.length;
    const passed = blogs.filter((b) => b.status === "PUBLISHED").length;
    const askedToChange = blogs.filter(
      (b) => b.status === "REJECT" || b.status === "REVISION_DRAFT"
    ).length;
    return { posted, passed, askedToChange };
  }, [blogs]);

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
    };
    blogs.forEach((b) => {
      if (counts[b.status] !== undefined) {
        counts[b.status]++;
      }
    });
    return counts;
  }, [blogs]);

  // Filtered & Sorted Blogs
  const filteredBlogs = useMemo(() => {
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
  const handlePublish = (blog: Blog) => {
    const updated = saveBlog({ ...blog, status: "PUBLISHED" });
    setBlogs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleArchive = (blog: Blog) => {
    const confirmed = window.confirm(`Archive "${blog.title}"?\nThis will mark the dispatch as read-only.`);
    if (!confirmed) return;
    const updated = saveBlog({ ...blog, status: "ARCHIVED" });
    setBlogs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleEditBlog = (blog: Blog) => {
    router.push(`/editor?id=${encodeURIComponent(blog.id)}`);
  };

  const statusTabs: { key: BlogStatus; label: string }[] = [
    { key: "ALL", label: "ALL DISPATCHES" },
    { key: "PUBLISHED", label: "PUBLISHED" },
    { key: "UNDER_REVIEW", label: "IN REVIEW" },
    { key: "DRAFT", label: "DRAFTS" },
    { key: "REVISION_DRAFT", label: "REVISION DRAFTS" },
    { key: "REJECT", label: "REJECTED" },
    { key: "ARCHIVED", label: "ARCHIVED" },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Academic Press Pass / Fellow Profile Card */}
      <section className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          {/* Left Column: Portrait, Seal, Coupons */}
          <div className="md:col-span-4 border-b-3 md:border-b-0 md:border-r-3 border-[var(--border-black)] p-6 flex flex-col items-center justify-between gap-4 bg-[var(--bg-card)]">
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Halftone portrait */}
              <div className="relative w-40 h-40">
                <span className="absolute -top-3 -right-3 font-mono text-xs font-black pointer-events-none text-[var(--text-main)]">
                  ⊕ ✛
                </span>
                <div className="avatar-halftone w-40 h-40">
                  <img
                    src={profile.profileImg}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Seal Box */}
              <div className="w-full py-1 px-2 border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-center font-mono text-xs font-black uppercase tracking-wider text-[var(--text-main)]">
                ★ OFFICIAL WRITER DESK
              </div>
            </div>

            {/* Mail Coupon Block */}
            <div className="w-full mail-coupon-block space-y-2">
              <div className="font-mono text-[10px] font-bold text-center tracking-wider uppercase text-[var(--text-muted)]">
                ✂ CUT ALONG DOTTED LINE TO CLAIM ✂
              </div>
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`coupon-action-btn ${isFollowing ? "active" : ""}`}
              >
                {isFollowing ? "[ ✔ FOLLOWING AUTHOR ]" : "[ ✂ FOLLOW AUTHOR ]"}
              </button>
              <button
                onClick={() => setIsSubscribed(!isSubscribed)}
                className={`coupon-action-btn ${isSubscribed ? "active" : ""}`}
              >
                {isSubscribed ? "[ ✔ SUBSCRIBED · 100% FREE ]" : "[ ✂ SUBSCRIBE — 100% FREE ]"}
              </button>
            </div>
          </div>

          {/* Right Column: Name, Bio, Accolades */}
          <div className="md:col-span-8 flex flex-col justify-between">
            {/* Title compartment */}
            <div className="p-6 border-b-2 border-[var(--border-black)] space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="font-heading text-3xl sm:text-5xl font-black uppercase text-[var(--text-main)] leading-none">
                  {profile.name}
                </h1>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn-broadsheet text-xs py-1 px-3"
                  title="Edit author profile credentials"
                >
                  [ ✎ EDIT PROFILE ]
                </button>
              </div>

              <div className="flex items-center flex-wrap gap-2 font-mono text-xs font-bold uppercase">
                <span className="px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-canvas)]">
                  [✔ VERIFIED FELLOW]
                </span>
                <span className="px-2 py-0.5 border border-[var(--border-black)] bg-[var(--bg-muted)] text-[var(--text-main)]">
                  @{profile.username}
                </span>
                <span className="text-[var(--text-muted)]">
                  • SYSTEMS ARCHITECTURE & COMPILERS
                </span>
              </div>
            </div>

            {/* Bio compartment */}
            <div className="p-6 space-y-3 flex-1">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                AUTHOR BIOGRAPHY & INVESTIGATIVE BEAT
              </span>
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

              {/* Signature Row */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[var(--text-muted)] uppercase">
                <div>
                  <span className="font-bold">AUTHORIZATION SIGNATURE: </span>
                  <span className="italic font-serif font-black text-[var(--text-main)]">
                    {profile.name} — Systems Lead
                  </span>
                </div>
                <div className="font-bold text-[var(--text-main)]">
                  VERIFIED: 2026 ACES FELLOW
                </div>
              </div>
            </div>

            {/* Accreditation Badges Footer */}
            <div className="p-4 bg-[var(--bg-muted)] border-t-2 border-[var(--border-black)] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold uppercase text-[var(--text-muted)]">
                  EDITORIAL LABELS:
                </span>
                {profile.labels.map((lbl) => (
                  <BadgePill key={lbl.key} label={lbl} />
                ))}
              </div>
              <div className="font-mono text-xs text-[var(--text-muted)] uppercase">
                ACCREDITATION CELL
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Editorial Performance & Metrics */}
      <section className="border-3 border-[var(--border-black)] bg-[var(--bg-card)] p-5 space-y-4">
        <h2 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wider text-[var(--text-main)] border-b-2 border-[var(--border-black)] pb-2">
          Editorial Performance & Readership Trajectory
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border-2 border-[var(--border-black)] p-4 bg-[var(--bg-muted)] flex flex-col justify-between">
            <div className="flex items-center justify-between font-mono text-xs font-black uppercase text-[var(--text-muted)]">
              <span>■ ALL DISPATCHES</span>
              <span>100%</span>
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
            <div className="flex items-center justify-between font-mono text-xs font-black uppercase text-[var(--text-muted)]">
              <span>▲ FACULTY APPROVED</span>
              <span>PASSED</span>
            </div>
            <div className="pt-4">
              <span className="font-heading text-5xl font-black text-[var(--text-main)] leading-none">
                {stats.passed}
              </span>
              <div className="font-mono text-xs uppercase font-bold text-[var(--text-muted)] mt-1">
                Publicly Certified
              </div>
            </div>
          </div>

          <div className="border-2 border-[var(--border-black)] p-4 bg-[var(--bg-muted)] flex flex-col justify-between">
            <div className="flex items-center justify-between font-mono text-xs font-black uppercase text-[var(--text-muted)]">
              <span>◆ PEER REVISIONS</span>
              <span>ACTIVE</span>
            </div>
            <div className="pt-4">
              <span className="font-heading text-5xl font-black text-[var(--text-main)] leading-none">
                {stats.askedToChange}
              </span>
              <div className="font-mono text-xs uppercase font-bold text-[var(--text-muted)] mt-1">
                Under Revision
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
              Stories & Editorial Pipeline
            </h2>
            <span className="font-mono text-xs font-bold uppercase text-[var(--text-muted)] mt-1 block">
              AUTHOR WORKBENCH · {filteredBlogs.length} DISPATCHES IN VIEW
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
              className="btn-broadsheet btn-broadsheet-primary h-9 flex items-center gap-1.5"
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
                  className={`text-[10px] px-1 font-mono font-bold ${
                    isActive
                      ? "bg-[var(--bg-canvas)] text-[var(--text-main)]"
                      : "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stories Ledger Rows */}
        {filteredBlogs.length === 0 ? (
          <div className="border-2 border-dashed border-[var(--border-black)] p-8 text-center bg-[var(--bg-muted)] space-y-2 font-mono text-xs uppercase">
            <div className="font-bold">No Dispatches in Current Tab & Filter</div>
            <Link href="/editor" className="btn-broadsheet mt-2 inline-block">
              ➔ COMPOSE FIRST DISPATCH
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
                  <div className="w-full md:w-36 h-28 border-2 border-[var(--border-black)] bg-[var(--bg-muted)] overflow-hidden flex-shrink-0 relative">
                    <img
                      src={blog.thumbnail}
                      alt={blog.title}
                      className="w-full h-full object-cover filter grayscale"
                    />
                    <span className="absolute top-1 right-1 font-mono text-[9px] bg-[var(--bg-card)] px-1 border border-[var(--border-black)]">
                      ⊕
                    </span>
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

                      <p className="font-serif text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                        {blog.excerpt}
                      </p>

                      {/* Editorial review indicators */}
                      {blog.status === "UNDER_REVIEW" && (
                        <div className="mt-2 p-1.5 border border-dashed border-[var(--border-black)] bg-[var(--bg-muted)] font-mono text-[11px] font-bold uppercase text-[var(--text-main)]">
                          🔒 ARTICLE CURRENTLY UNDER EDITORIAL REVIEW
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
                      className="btn-broadsheet text-xs py-1 px-3 w-full"
                    >
                      [ ☛ PREVIEW ]
                    </button>

                    <button
                      onClick={() => handleEditBlog(blog)}
                      disabled={blog.status === "UNDER_REVIEW"}
                      className="btn-broadsheet text-xs py-1 px-3 w-full disabled:opacity-40"
                      title={blog.status === "UNDER_REVIEW" ? "Under Review - Locked" : "Edit blog"}
                    >
                      [ ✂ EDIT ]
                    </button>

                    {blog.status !== "PUBLISHED" && (
                      <button
                        onClick={() => handlePublish(blog)}
                        className="btn-broadsheet btn-broadsheet-primary text-xs py-1 px-3 w-full"
                      >
                        [ ✈ PUBLISH ]
                      </button>
                    )}

                    {blog.status !== "ARCHIVED" && (
                      <button
                        onClick={() => handleArchive(blog)}
                        className="btn-broadsheet text-xs py-1 px-3 w-full text-[var(--text-muted)]"
                      >
                        [ ⌧ ARCHIVE ]
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={(updated) => setProfile(updated)}
      />

      <ReaderModal
        isOpen={!!previewBlog}
        onClose={() => setPreviewBlog(null)}
        blog={previewBlog}
      />
    </div>
  );
}
