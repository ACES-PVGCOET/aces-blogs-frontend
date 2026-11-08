"use client";

import React, { useState, useEffect, useMemo, use, Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBlogByIdOrSlug,
  getAllBlogs,
  fetchBlogBySlug,
} from "@/lib/blog-service";
import { Blog } from "@/lib/types";
import TipTapRenderer from "@/components/editor/TipTapRenderer";

interface BlogPageProps {
  params: Promise<{ id: string }>;
}

function BlogContent({ params }: BlogPageProps) {
  const resolvedParams = use(params);
  const idOrSlug = resolvedParams.id;

  const [blog, setBlog] = useState<Blog | null>(() => getBlogByIdOrSlug(idOrSlug));
  const [loading, setLoading] = useState<boolean>(!blog);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetchBlogBySlug(idOrSlug)
      .then((fetched) => {
        if (fetched) {
          setBlog(fetched);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [idOrSlug]);

  const relatedBlogs = useMemo(() => {
    if (!blog) return [];
    return getAllBlogs()
      .filter((b) => b.id !== blog.id && b.status === "PUBLISHED")
      .slice(0, 2);
  }, [blog]);

  if (loading && !blog) {
    return (
      <div className="p-16 border-4 border-dashed border-[var(--border-black)] bg-[var(--bg-muted)] text-center font-mono text-sm uppercase">
        RETRIEVING MANUSCRIPT FROM ARCHIVE...
      </div>
    );
  }

  if (!blog) {
    notFound();
  }

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* 1. Breadcrumbs */}
      <nav className="font-mono text-xs font-bold uppercase text-[var(--text-muted)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
        <Link href="/" className="hover:underline text-[var(--text-main)]">
          HOME
        </Link>
        <span>➔</span>
        <Link href="/feed" className="hover:underline text-[var(--text-main)]">
          GLOBAL FEED
        </Link>
        <span>➔</span>
        <Link
          href={`/feed?category=${encodeURIComponent(blog.category)}`}
          className="hover:underline text-[var(--text-main)]"
        >
          {blog.category}
        </Link>
        <span>➔</span>
        <span className="truncate max-w-[200px] text-[var(--text-muted)]">
          {blog.title}
        </span>
      </nav>

      {/* 2. Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase">
          <span className="snappy-status-pill published">
            {blog.status.replace(/_/g, " ")}
          </span>
          <span className="text-[var(--text-main)] font-black">
            [{blog.category}]
          </span>
          <span className="text-[var(--text-muted)]">• {blog.readTime.toUpperCase()}</span>
          <span className="text-[var(--text-muted)]">
            • PUBLISHED {new Date(blog.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-tight tracking-tight text-[var(--text-main)]">
          {blog.title}
        </h1>

        {/* Abstract */}
        {blog.excerpt && (
          <p className="font-serif text-lg sm:text-xl text-[var(--text-body)] italic border-l-4 border-[var(--border-black)] pl-4 py-1 leading-relaxed">
            {blog.excerpt}
          </p>
        )}

        {/* Byline & Share Bar */}
        <div className="pt-4 border-t-2 border-b-2 border-[var(--border-black)] py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs uppercase">
          {/* Author info */}
          <div className="flex items-center gap-3">
            {blog.authorAvatar ? (
              <div className="w-12 h-12 border-2 border-[var(--border-black)] overflow-hidden bg-[var(--bg-card)]">
                <img
                  src={blog.authorAvatar}
                  alt={blog.authorName || "Author"}
                  className="w-full h-full object-cover filter grayscale"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="w-12 h-12 border-2 border-[var(--border-black)] bg-[var(--bg-muted)] flex items-center justify-center font-heading text-xl font-black">
                {(blog.authorName || "AC").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-heading text-base font-black text-[var(--text-main)]">
                {blog.authorName || "ACES Contributor"}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-bold">
                {blog.authorHandle || "@contributor"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleCopyLink}
              className="btn-broadsheet text-xs py-1.5 px-3 cursor-pointer"
              title="Copy dispatch link"
            >
              {copied ? "[ ✔ COPIED ]" : "[ ✂ SHARE ]"}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Lead Image */}
      {blog.thumbnail && (
        <div className="border-4 border-[var(--border-black)] bg-[var(--bg-muted)] relative overflow-hidden">
          <div className="w-full h-[320px] sm:h-[440px]">
            <img
              src={blog.thumbnail}
              alt={blog.title}
              className="w-full h-full object-cover filter grayscale"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        </div>
      )}

      {/* 4. Article Prose Body Rendered via TipTapRenderer */}
      <section className="pt-4">
        <TipTapRenderer
          content={blog.contentJson || blog.content}
          enableDropCap={true}
        />
      </section>

      {/* 5. Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="pt-6 border-t-2 border-[var(--border-black)] space-y-2">
          <span className="font-mono text-xs font-bold uppercase text-[var(--text-muted)] block">
            RESEARCH KEYWORDS &amp; TAGS:
          </span>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <Link
                key={tag}
                href={`/feed?q=${encodeURIComponent(tag)}`}
                className="px-2.5 py-1 border border-[var(--border-black)] bg-[var(--bg-card)] font-mono text-xs font-bold uppercase text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 6. Author Footer Card */}
      <div className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] p-6 space-y-4">
        <div className="font-mono text-xs font-black uppercase tracking-wider text-[var(--text-muted)] border-b-2 border-[var(--border-black)] pb-1">
          ABOUT THE AUTHOR
        </div>

        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {blog.authorAvatar ? (
            <div className="w-16 h-16 border-2 border-[var(--border-black)] flex-shrink-0 overflow-hidden bg-[var(--bg-card)]">
              <img
                src={blog.authorAvatar}
                alt={blog.authorName || "Author"}
                className="w-full h-full object-cover filter grayscale"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 border-2 border-[var(--border-black)] bg-[var(--bg-muted)] flex items-center justify-center font-heading text-2xl font-black flex-shrink-0">
              {(blog.authorName || "AC").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading text-xl font-black uppercase text-[var(--text-main)]">
                {blog.authorName || "ACES Contributor"}
              </h3>
              <span className="font-mono text-xs text-[var(--text-muted)] font-bold">
                {blog.authorHandle || "@contributor"}
              </span>
            </div>
            <div className="pt-1">
              <Link
                href="/profile"
                className="btn-broadsheet text-xs py-1 px-3"
              >
                ➔ VISIT WRITER DESK
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Related Dispatches */}
      {relatedBlogs.length > 0 && (
        <section className="space-y-4 pt-6 border-t-3 border-[var(--border-black)]">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-2xl font-black uppercase text-[var(--text-main)]">
              Related Dispatches
            </h3>
            <Link
              href="/feed"
              className="font-mono text-xs font-bold uppercase hover:underline"
            >
              VIEW ALL ➔
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedBlogs.map((b) => (
              <div
                key={b.id}
                className="border-2 border-[var(--border-black)] bg-[var(--bg-card)] p-4 space-y-2"
              >
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  <span className="text-[var(--text-main)]">[{b.category}]</span>
                  <span>• {b.readTime}</span>
                </div>
                <Link
                  href={`/blog/${b.slug || b.id}`}
                  className="font-heading text-lg font-black uppercase hover:underline text-[var(--text-main)] line-clamp-2 block"
                >
                  {b.title}
                </Link>
                {b.excerpt && (
                  <p className="font-serif text-xs text-[var(--text-muted)] line-clamp-2">
                    {b.excerpt}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

export default function BlogDetailPage({ params }: BlogPageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center font-mono text-sm uppercase">
          RETRIEVING MANUSCRIPT...
        </div>
      }
    >
      <BlogContent params={params} />
    </Suspense>
  );
}
