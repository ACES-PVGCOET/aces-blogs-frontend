"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAllBlogs, getCategories } from "@/lib/blog-service";
import { Blog } from "@/lib/types";
import StoryCard from "@/components/StoryCard";
import ReaderModal from "@/components/ReaderModal";

function FeedContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "ALL";
  const initialQuery = searchParams.get("q") || "";

  const [blogs] = useState<Blog[]>(getAllBlogs);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest" | "title">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "row">("grid");
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);

  const categories = useMemo(() => {
    return ["ALL", ...getCategories(blogs)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    let result = blogs.filter((b) => b.status === "PUBLISHED" || b.status === "ARCHIVED");

    if (selectedCategory !== "ALL") {
      result = result.filter(
        (b) => b.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (sortOrder === "recent") {
      result.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
    } else if (sortOrder === "oldest") {
      result.sort((a, b) => new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime());
    } else if (sortOrder === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [blogs, selectedCategory, searchQuery, sortOrder]);

  return (
    <div className="space-y-8">
      {/* Folio Masthead Header */}
      <section className="border-b-3 border-[var(--border-black)] pb-4">
        <div className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">
          ACES TECHNICAL GAZETTE · GLOBAL RESEARCH LEDGER
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl font-black uppercase text-[var(--text-main)] leading-none">
          Global Dispatches Feed
        </h1>
        <p className="font-serif text-sm text-[var(--text-muted)] mt-2 max-w-2xl">
          Peer-reviewed systems papers, compiler audits, Linux kernel telemetry, and distributed
          consensus breakthroughs from ACES engineering fellows.
        </p>
      </section>

      {/* Filter and Search Controls Deck */}
      <section className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs font-bold uppercase">
          {categories.map((cat) => {
            const isSelected =
              selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 border-2 border-[var(--border-black)] transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                    : "bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                }`}
              >
                {cat === "ALL" ? "✦ ALL BEATS" : cat}
              </button>
            );
          })}
        </div>

        {/* Search, Sort, View Toggle Bar */}
        <div className="border-2 border-[var(--border-black)] bg-[var(--bg-card)] p-3 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          {/* Search Field */}
          <div className="relative w-full md:w-80">
            <span className="absolute left-2.5 top-2.5 text-xs text-[var(--text-muted)]">
              ☛
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="FILTER TITLES, TOPICS, TAGS..."
              className="w-full h-9 pl-7 pr-3 bg-[var(--bg-card)] border border-[var(--border-black)] font-mono text-xs font-bold uppercase text-[var(--text-main)] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-xs font-bold hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase text-[var(--text-muted)]">SORT:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "recent" | "oldest" | "title")}
                className="h-9 px-2 bg-[var(--bg-card)] border border-[var(--border-black)] font-mono text-xs font-bold uppercase text-[var(--text-main)] focus:outline-none cursor-pointer"
              >
                <option value="recent">RECENTLY FILED</option>
                <option value="oldest">OLDEST DISPATCH</option>
                <option value="title">TITLE (A → Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-[var(--border-black)]">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 h-8 font-mono text-xs font-black uppercase ${
                  viewMode === "grid"
                    ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                    : "bg-[var(--bg-card)] text-[var(--text-main)]"
                }`}
                title="Grid Card View"
              >
                ⊞ GRID
              </button>
              <button
                onClick={() => setViewMode("row")}
                className={`px-3 h-8 font-mono text-xs font-black uppercase ${
                  viewMode === "row"
                    ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                    : "bg-[var(--bg-card)] text-[var(--text-main)]"
                }`}
                title="Ledger List View"
              >
                ☰ LEDGER
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dispatches Count Indicator */}
      <div className="flex items-center justify-between font-mono text-xs font-bold uppercase text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-2">
        <span>
          SHOWING {filteredBlogs.length} OF {blogs.length} REGISTERED DISPATCHES
        </span>
        {selectedCategory !== "ALL" && (
          <button
            onClick={() => setSelectedCategory("ALL")}
            className="hover:underline text-[var(--text-main)]"
          >
            [ CLEAR CATEGORY FILTER ✕ ]
          </button>
        )}
      </div>

      {/* Stories Grid / Rows */}
      {filteredBlogs.length === 0 ? (
        <div className="border-3 border-dashed border-[var(--border-black)] p-12 text-center bg-[var(--bg-muted)] space-y-3">
          <span className="font-mono text-2xl font-black">∅</span>
          <h3 className="font-heading text-2xl font-black uppercase text-[var(--text-main)]">
            No Dispatches Found Matching Query
          </h3>
          <p className="font-serif text-sm text-[var(--text-muted)] max-w-md mx-auto">
            Try adjusting your search query or selecting a different category from the top broadsheet
            bar.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
            }}
            className="btn-broadsheet mt-3"
          >
            ➔ RESET ALL FILTERS
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <StoryCard key={blog.id} blog={blog} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBlogs.map((blog) => (
            <StoryCard key={blog.id} blog={blog} variant="row" />
          ))}
        </div>
      )}

      {/* Modal Preview Hook */}
      <ReaderModal
        isOpen={!!previewBlog}
        onClose={() => setPreviewBlog(null)}
        blog={previewBlog}
      />
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center font-mono text-sm uppercase">
          LOADING ACES BROADSHEET FEED...
        </div>
      }
    >
      <FeedContent />
    </Suspense>
  );
}
