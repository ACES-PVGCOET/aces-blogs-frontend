"use client";

import React from "react";
import Link from "next/link";
import { Blog } from "@/lib/types";

interface ReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: Blog | null;
}

export default function ReaderModal({
  isOpen,
  onClose,
  blog,
}: ReaderModalProps) {
  if (!isOpen || !blog) return null;

  return (
    <div
      className="snappy-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="snappy-modal-pane"
        style={{ maxWidth: "780px", maxHeight: "85vh" }}
      >
        {/* Head */}
        <div className="snappy-modal-head">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black uppercase text-[var(--text-muted)]">
              BROADSHEET PROOF ·
            </span>
            <span className="snappy-modal-title line-clamp-1">
              {blog.title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-sm font-black px-2 py-1 border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)]"
          >
            [ ✕ CLOSE ]
          </button>
        </div>

        {/* Content */}
        <div className="snappy-modal-content space-y-4">
          {blog.thumbnail && (
            <div className="w-full h-56 border-3 border-[var(--border-black)] bg-[var(--bg-muted)] overflow-hidden relative">
              <img
                src={blog.thumbnail}
                alt={blog.title}
                className="w-full h-full object-cover filter grayscale"
              />
              <span className="absolute bottom-2 right-2 font-mono text-[10px] bg-[var(--bg-card)] text-[var(--text-main)] px-1.5 py-0.5 border border-[var(--border-black)]">
                ⊕ PROOF MANUSCRIPT
              </span>
            </div>
          )}

          <div className="pb-3 border-b-2 border-[var(--border-black)]">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase mb-2">
              <span className="snappy-status-pill published">
                {blog.status.replace(/_/g, " ")}
              </span>
              <span>{blog.category}</span>
              <span>• REV v{blog.latestRevisionVersion || 1}</span>
            </div>

            <h2 className="font-heading text-3xl font-black uppercase leading-tight text-[var(--text-main)]">
              {blog.title}
            </h2>

            <div className="font-mono text-xs text-[var(--text-muted)] flex items-center gap-4 mt-2 uppercase font-bold">
              <span>AUTHOR: {blog.authorName || "AARAV SHARMA"}</span>
              <span>READ TIME: {blog.readTime}</span>
            </div>
          </div>

          <div className="font-serif text-sm leading-relaxed text-[var(--text-body)] space-y-3 pt-2">
            <p className="font-bold italic text-base border-l-3 border-[var(--border-black)] pl-3">
              {blog.excerpt}
            </p>
            <div className="whitespace-pre-line leading-relaxed">
              {blog.content}
            </div>
          </div>
        </div>

        {/* Foot */}
        <div className="snappy-modal-foot">
          <button type="button" onClick={onClose} className="btn-broadsheet">
            [ ✕ CLOSE PROOF ]
          </button>
          <Link
            href={`/blog/${blog.id}`}
            onClick={onClose}
            className="btn-broadsheet btn-broadsheet-primary"
          >
            OPEN FULL ARTICLE PAGE ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
