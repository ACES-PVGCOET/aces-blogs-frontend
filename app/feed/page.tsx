"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getAllBlogs,
  getCategories,
  fetchPublicBlogs,
  fetchBackendCategories,
} from "@/lib/blog-service";
import { Blog } from "@/lib/types";
import StoryCard from "@/components/StoryCard";
import ReaderModal from "@/components/ReaderModal";

function FeedContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "ALL";
  const initialQuery = searchParams.get("q") || "";

  const [blogs, setBlogs] = useState<Blog[]>(getAllBlogs);
  const [backendCategories, setBackendCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest" | "title">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "row">("grid");
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch from backend
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [publicBlogs, cats] = await Promise.all([
          fetchPublicBlogs({
            category: selectedCategory !== "ALL" ? selectedCategory : undefined,
            search: searchQuery.trim() || undefined,
          }),
          fetchBackendCategories(),
        ]);
        if (!active) return;
        if (Array.isArray(publicBlogs)) {
          setBlogs(publicBlogs);
        }
        if (cats && cats.length > 0) {
          setBackendCategories(cats);
        }
      } catch (err) {
        console.warn("Could not load feed data:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const list = backendCategories.length > 0 ? backendCategories : getCategories(blogs);
    const unique = Array.from(new Set(list));
    return ["ALL", ...unique];
  }, [backendCategories, blogs]);

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
        {/* Categories Bar is unmounted per requirements */}

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
              onChange={(e) => {
                setIsLoading(true);
                setSearchQuery(e.target.value);
              }}
              placeholder="FILTER TITLES, TOPICS, TAGS..."
              className="w-full h-9 pl-7 pr-7 bg-[var(--bg-card)] border border-[var(--border-black)] font-mono text-xs font-bold uppercase text-[var(--text-main)] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                title="Clear search"
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
                className={`px-3 h-8 font-mono text-xs font-black uppercase cursor-pointer transition-colors ${
                  viewMode === "grid"
                    ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                    : "bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                }`}
                title="Grid Card View"
              >
                ⊞ GRID
              </button>
              <button
                onClick={() => setViewMode("row")}
                className={`px-3 h-8 font-mono text-xs font-black uppercase cursor-pointer transition-colors ${
                  viewMode === "row"
                    ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                    : "bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
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
          {isLoading && " (SYNCING WITH BACKEND...)"}
        </span>
        {selectedCategory !== "ALL" && (
          <button
            onClick={() => setSelectedCategory("ALL")}
            className="hover:underline text-[var(--text-main)] cursor-pointer"
          >
            [ CLEAR CATEGORY FILTER ✕ ]
          </button>
        )}
      </div>

      {/* Grid or Row Feed Output */}
      {filteredBlogs.length === 0 ? (
        <div className="border-3 border-dashed border-[var(--border-black)] p-12 text-center bg-[var(--bg-muted)] space-y-3 font-mono">
          <div className="text-base font-black uppercase text-[var(--text-main)]">
            NO DISPATCHES MATCHED YOUR QUERY
          </div>
          <p className="font-serif text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Try adjusting your search query, or clear active beat filters to inspect the full
            chronicle archive.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setSearchQuery("");
            }}
            className="btn-broadsheet mt-3 cursor-pointer"
          >
            RESET ARCHIVE FILTERS ↺
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((b) => (
            <StoryCard key={b.id} blog={b} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBlogs.map((b) => (
            <StoryCard key={b.id} blog={b} variant="row" />
          ))}
        </div>
      )}

      {/* Reader Modal (Instant Preview) */}
      <ReaderModal
        blog={previewBlog}
        isOpen={Boolean(previewBlog)}
        onClose={() => setPreviewBlog(null)}
      />
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center font-mono text-xs font-bold uppercase text-[var(--text-muted)]">
          LOADING FOLIO FEED...
        </div>
      }
    >
      <FeedContent />
    </Suspense>
  );
}
