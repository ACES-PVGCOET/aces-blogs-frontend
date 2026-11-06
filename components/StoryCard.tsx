import React from "react";
import Link from "next/link";
import { Blog } from "@/lib/types";

interface StoryCardProps {
  blog: Blog;
  variant?: "grid" | "row" | "lead" | "compact";
}

export default function StoryCard({ blog, variant = "grid" }: StoryCardProps) {
  const statusKey = (blog.status || "DRAFT").toLowerCase();
  const statusLabel = blog.status.replace(/_/g, " ");
  const blogLink = `/blog/${blog.id}`;

  if (variant === "compact") {
    return (
      <article className="border-2 border-[var(--border-black)] bg-[var(--bg-card)] p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-[var(--text-muted)]">
          <span className="text-[var(--text-main)] font-black">[{blog.category}]</span>
          <span>•</span>
          <span>{blog.readTime}</span>
        </div>
        <Link
          href={blogLink}
          className="font-heading text-base leading-tight font-black hover:underline uppercase text-[var(--text-main)]"
        >
          {blog.title}
        </Link>
        <p className="font-serif text-xs text-[var(--text-muted)] line-clamp-2">
          {blog.excerpt}
        </p>
      </article>
    );
  }

  if (variant === "lead") {
    return (
      <article className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Left / Top Lead Image */}
        <div className="lg:w-1/2 relative min-h-[280px] lg:min-h-[380px] border-b-3 lg:border-b-0 lg:border-r-3 border-[var(--border-black)] bg-[var(--bg-muted)] overflow-hidden">
          <img
            src={blog.thumbnail}
            alt={blog.title}
            className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
          />
          <span className="absolute top-2 left-2 bg-[var(--bg-card)] text-[var(--text-main)] font-mono text-[10px] font-black px-2 py-1 border border-[var(--border-black)] uppercase">
            LEAD TECHNICAL DISPATCH
          </span>
          <span className="absolute bottom-2 right-2 font-mono text-xs text-[var(--text-main)] bg-[var(--bg-card)] px-1.5 py-0.5 border border-[var(--border-black)]">
            ⊕ ✛ REG: 133 LPI
          </span>
        </div>

        {/* Right Lead Narrative */}
        <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center flex-wrap gap-2 font-mono text-xs font-bold uppercase">
              <span className={`snappy-status-pill ${statusKey}`}>{statusLabel}</span>
              <span className="text-[var(--text-main)] font-black">[{blog.category}]</span>
              <span className="text-[var(--text-muted)]">• {blog.readTime.toUpperCase()}</span>
            </div>

            <Link href={blogLink}>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black leading-none uppercase tracking-tight text-[var(--text-main)] hover:underline">
                {blog.title}
              </h2>
            </Link>

            <p className="font-serif text-base text-[var(--text-body)] leading-relaxed pt-2 drop-cap">
              {blog.excerpt}
            </p>

            {blog.reviewer && (
              <div className="p-2 border border-dashed border-[var(--border-black)] bg-[var(--bg-muted)] font-mono text-[11px] font-bold uppercase text-[var(--text-main)]">
                [✔] FACULTY ACCREDITED: {blog.reviewer}
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t-2 border-[var(--border-black)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {blog.authorAvatar && (
                <div className="w-10 h-10 border-2 border-[var(--border-black)] overflow-hidden">
                  <img
                    src={blog.authorAvatar}
                    alt={blog.authorName || "Author"}
                    className="w-full h-full object-cover filter grayscale"
                  />
                </div>
              )}
              <div className="flex flex-col">
                <Link
                  href={`/profile/${blog.author}`}
                  className="font-heading text-sm font-black uppercase hover:underline"
                >
                  {blog.authorName || "Aarav Sharma"}
                </Link>
                <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold">
                  {blog.authorHandle || "@aarav_writes"} · FELLOW
                </span>
              </div>
            </div>

            <Link
              href={blogLink}
              className="btn-broadsheet btn-broadsheet-primary"
            >
              READ FULL DISPATCH ➔
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "row") {
    return (
      <article className="border-3 border-[var(--border-black)] bg-[var(--bg-card)] p-4 sm:p-5 flex flex-col sm:flex-row items-stretch gap-4 sm:gap-6 hover:shadow-[4px_4px_0px_var(--border-black)] transition-all">
        {/* Thumbnail Box */}
        <div className="w-full sm:w-44 h-32 flex-shrink-0 border-2 border-[var(--border-black)] bg-[var(--bg-muted)] relative overflow-hidden">
          <img
            src={blog.thumbnail}
            alt={blog.title}
            className="w-full h-full object-cover filter grayscale"
          />
          <span className="absolute top-1 right-1 font-mono text-[9px] bg-[var(--bg-card)] text-[var(--text-main)] px-1 border border-[var(--border-black)]">
            ⊕
          </span>
        </div>

        {/* Content Details */}
        <div className="flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center flex-wrap gap-2 font-mono text-xs font-bold uppercase mb-1">
              <span className={`snappy-status-pill ${statusKey}`}>{statusLabel}</span>
              <span className="text-[var(--text-main)] font-black">[{blog.category}]</span>
              <span className="text-[var(--text-muted)]">• {blog.readTime.toUpperCase()}</span>
            </div>

            <Link
              href={blogLink}
              className="font-heading text-xl sm:text-2xl font-black leading-tight uppercase hover:underline text-[var(--text-main)] block"
            >
              {blog.title}
            </Link>

            <p className="font-serif text-sm text-[var(--text-muted)] line-clamp-2 mt-1">
              {blog.excerpt}
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-4 font-mono text-xs uppercase font-bold text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span>BY</span>
              <Link
                href={`/profile/${blog.author}`}
                className="text-[var(--text-main)] hover:underline font-black"
              >
                {blog.authorName || "AARAV SHARMA"}
              </Link>
            </div>
            <Link
              href={blogLink}
              className="font-black text-[var(--text-main)] hover:underline flex items-center gap-1"
            >
              <span>[ ☛ READ ]</span>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Default: Grid Card
  return (
    <article className="border-3 border-[var(--border-black)] bg-[var(--bg-card)] flex flex-col justify-between hover:shadow-[6px_6px_0px_var(--border-black)] transition-all">
      {/* Thumbnail */}
      <div className="h-48 w-full border-b-3 border-[var(--border-black)] bg-[var(--bg-muted)] relative overflow-hidden">
        <img
          src={blog.thumbnail}
          alt={blog.title}
          className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-200"
        />
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className={`snappy-status-pill ${statusKey}`}>{statusLabel}</span>
        </div>
        <span className="absolute bottom-2 right-2 font-mono text-[10px] font-bold bg-[var(--bg-card)] px-1.5 py-0.5 border border-[var(--border-black)] text-[var(--text-main)] uppercase">
          {blog.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="font-mono text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
            <span>{blog.readTime}</span>
            {blog.readsCount ? (
              <span> • {(blog.readsCount / 1000).toFixed(1)}k reads</span>
            ) : null}
          </div>

          <Link
            href={blogLink}
            className="font-heading text-xl sm:text-2xl font-black leading-tight uppercase hover:underline text-[var(--text-main)] block"
          >
            {blog.title}
          </Link>

          <p className="font-serif text-xs leading-relaxed text-[var(--text-muted)] line-clamp-3 mt-2">
            {blog.excerpt}
          </p>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t-2 border-[var(--border-black)] flex items-center justify-between gap-2 font-mono text-xs uppercase font-bold">
          <Link
            href={`/profile/${blog.author}`}
            className="text-[var(--text-main)] hover:underline truncate"
          >
            ✎ {blog.authorName || "Aarav Sharma"}
          </Link>
          <Link
            href={blogLink}
            className="text-[var(--text-main)] font-black hover:underline whitespace-nowrap"
          >
            [ ☛ READ ]
          </Link>
        </div>
      </div>
    </article>
  );
}
