"use client";

import React from "react";
import { JSONContent } from "@tiptap/react";
import TipTapRenderer from "./TipTapRenderer";

interface TipTapPreviewProps {
  title: string;
  category: string;
  readTime: string;
  thumbnail: string;
  excerpt: string;
  tags: string[];
  status: string;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  contentJson: JSONContent | null;
  rawContent?: string;
}

export default function TipTapPreview({
  title,
  category,
  readTime,
  thumbnail,
  excerpt,
  tags,
  status,
  authorName = "ACES Contributor",
  authorHandle = "@contributor",
  authorAvatar = "",
  contentJson,
  rawContent,
}: TipTapPreviewProps) {
  const initials = authorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="max-w-4xl mx-auto space-y-6 bg-[var(--bg-canvas)] p-4 sm:p-6 transition-all border-2 border-[var(--border-black)]">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[var(--border-black)] pb-2 font-mono text-[11px] font-black uppercase text-[var(--text-muted)] gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-[var(--text-main)] text-[var(--bg-canvas)] px-1.5 py-0.5">
            PROOF PREVIEW
          </span>
          <span>· TECHNICAL MANUSCRIPT</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="border border-[var(--border-black)] px-1">PREVIEW MODE</span>
        </div>
      </div>

      {/* 2. Metadata Bar */}
      <div className="flex items-center flex-wrap gap-2 font-mono text-xs font-bold uppercase">
        <span
          className={`snappy-status-pill ${
            status === "PUBLISHED"
              ? "published"
              : status === "UNDER_REVIEW"
              ? "under_review"
              : "draft"
          }`}
        >
          {status.replace(/_/g, " ")}
        </span>
        <span className="text-[var(--text-main)] font-black">[{category}]</span>
        {readTime && (
          <span className="text-[var(--text-muted)]">• {readTime.toUpperCase()}</span>
        )}
      </div>

      {/* 3. Headline */}
      <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black uppercase leading-tight tracking-tight text-[var(--text-main)]">
        {title || "UNTITLED DISPATCH"}
      </h1>

      {/* 4. Abstract / Excerpt */}
      {excerpt && (
        <p className="font-serif text-base sm:text-lg text-[var(--text-body)] italic border-l-4 border-[var(--border-black)] pl-4 py-1.5 leading-relaxed bg-[var(--bg-muted)]">
          {excerpt}
        </p>
      )}

      {/* 5. Author Bar */}
      <div className="border-t-2 border-b-2 border-[var(--border-black)] py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs uppercase">
        <div className="flex items-center gap-3">
          {authorAvatar ? (
            <div className="w-10 h-10 border-2 border-[var(--border-black)] overflow-hidden bg-[var(--bg-card)]">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-full h-full object-cover filter grayscale"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="w-10 h-10 border-2 border-[var(--border-black)] bg-[var(--bg-muted)] flex items-center justify-center font-heading text-sm font-black">
              {initials}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-heading text-sm font-black text-[var(--text-main)]">
              {authorName}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-bold">
              {authorHandle}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Lead Thumbnail */}
      {thumbnail && (
        <div className="border-3 border-[var(--border-black)] bg-[var(--bg-muted)] relative overflow-hidden">
          <div className="w-full h-[240px] sm:h-[340px]">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover filter grayscale"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        </div>
      )}

      {/* 7. Article Prose Content */}
      <section className="pt-2">
        <TipTapRenderer
          content={contentJson || rawContent}
          enableDropCap={true}
          className="space-y-4"
        />
      </section>

      {/* 8. Keywords & Tags */}
      {tags.length > 0 && (
        <div className="pt-6 border-t-2 border-[var(--border-black)] space-y-2">
          <span className="font-mono text-xs font-bold uppercase text-[var(--text-muted)] block">
            KEYWORDS &amp; TAGS:
          </span>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 border border-[var(--border-black)] bg-[var(--bg-card)] font-mono text-xs font-bold uppercase text-[var(--text-main)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
