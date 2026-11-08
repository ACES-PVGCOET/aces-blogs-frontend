"use client";

import React, { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getBlogByIdOrSlug, saveBlog } from "@/lib/blog-service";
import { Blog } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { ImageIcon, Loader2 } from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import TipTapEditor from "@/components/editor/TipTapEditor";
import TipTapPreview from "@/components/editor/TipTapPreview";
import TipTapJsonViewer from "@/components/editor/TipTapJsonViewer";
import { convertTextOrMarkdownToTipTap, EMPTY_DISPATCH_JSON } from "@/lib/tiptap-utils";

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const existing = editId ? getBlogByIdOrSlug(editId) : null;

  const [title, setTitle] = useState(() => existing?.title || "");
  const [category, setCategory] = useState(() => existing?.category || "");
  const [tags, setTags] = useState(() => existing?.tags.join(", ") || "");
  const [readTime, setReadTime] = useState(() => existing?.readTime || "5 min read");
  const [thumbnail, setThumbnail] = useState(() => existing?.thumbnail || "");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [excerpt, setExcerpt] = useState(() => existing?.excerpt || "");
  const [status, setStatus] = useState<Blog["status"]>(() => existing?.status || "DRAFT");
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "split" | "json">("split");
  const [message, setMessage] = useState<string | null>(null);

  // TipTap Content State
  const [contentJson, setContentJson] = useState<JSONContent>(() => {
    if (existing?.contentJson) {
      return existing.contentJson as JSONContent;
    }
    if (existing?.content) {
      return convertTextOrMarkdownToTipTap(existing.content);
    }
    return EMPTY_DISPATCH_JSON;
  });
  const [contentText, setContentText] = useState<string>(() => existing?.content || "");

  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleEditorChange = (json: JSONContent, text: string) => {
    setContentJson(json);
    setContentText(text);

    // Calculate approximate reading time dynamically
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setReadTime(`${minutes} min read`);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image exceeds 5MB limit.");
      return;
    }

    setIsUploadingThumbnail(true);
    try {
      const res = await apiClient.uploads.image(file);
      if (res?.url) {
        setThumbnail(res.url);
        return;
      }
    } catch (err) {
      console.warn("Backend thumbnail upload failed, falling back to local file reader:", err);
    } finally {
      setIsUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }

    // Fallback to FileReader data URL
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) setThumbnail(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (newStatus?: Blog["status"]) => {
    if (!title.trim()) {
      alert("Please provide a title for the manuscript.");
      return;
    }

    const targetStatus = newStatus || status;
    const tagArray = tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    saveBlog({
      id: editId || undefined,
      title: title.trim(),
      category: category.trim() || "General",
      tags: tagArray.length > 0 ? tagArray : ["engineering"],
      readTime: readTime.trim() || "5 min read",
      thumbnail: thumbnail.trim(),
      excerpt: excerpt.trim() || title + " — Technical dispatch.",
      content: JSON.stringify(contentJson),
      contentJson: contentJson as Record<string, unknown>,
      status: targetStatus,
    });

    setMessage(
      targetStatus === "PUBLISHED"
        ? "Dispatch published to live broadsheet gazette!"
        : targetStatus === "UNDER_REVIEW"
        ? "Manuscript submitted to ACES Editorial Committee for review!"
        : "Draft saved successfully!"
    );

    setTimeout(() => {
      router.push("/profile");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Folio Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-3 border-[var(--border-black)] pb-4 font-mono text-xs uppercase">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="hover:underline font-bold text-[var(--text-main)] flex items-center gap-1"
          >
            <span>←</span>
            <span>RETURN TO WRITER DESK</span>
          </Link>
          <span className="text-[var(--text-muted)]">•</span>
          <span className="font-black text-[var(--text-main)]">
            {editId ? `EDITING MANUSCRIPT #${editId.slice(0, 8)}` : "NEW TECHNICAL DISPATCH"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            className="btn-broadsheet text-xs py-1.5 px-3 cursor-pointer"
          >
            [ 💾 SAVE AS DRAFT ]
          </button>
          <button
            type="button"
            onClick={() => handleSave("UNDER_REVIEW")}
            className="btn-broadsheet text-xs py-1.5 px-3 cursor-pointer"
          >
            [ ➔ SUBMIT FOR REVIEW ]
          </button>
          <button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            className="btn-broadsheet btn-broadsheet-primary text-xs py-1.5 px-3 cursor-pointer"
          >
            [ ✈ PUBLISH NOW ]
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {message && (
        <div className="p-3 border-2 border-[var(--border-black)] bg-[var(--text-main)] text-[var(--bg-canvas)] font-mono text-xs font-black uppercase text-center animate-pulse">
          {message}
        </div>
      )}

      {/* Main Metadata Form */}
      <div className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] p-6 space-y-5">
        <div>
          <label className="block font-mono text-xs font-bold uppercase mb-1 text-[var(--text-muted)]">
            MANUSCRIPT HEADLINE:
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.G. HIGH-THROUGHPUT ZERO-COPY KERNEL TRACING..."
            className="w-full h-14 px-4 font-heading text-2xl sm:text-3xl font-black uppercase border-3 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none"
          />
        </div>

        {/* Row 2: Category, Tags, Read Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <label className="block font-bold uppercase mb-1 text-[var(--text-muted)]">
              RESEARCH BEAT / CATEGORY:
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Distributed Systems, Linux Kernel..."
              className="w-full h-10 px-3 border-2 border-[var(--border-black)] bg-[var(--bg-card)] font-bold uppercase text-[var(--text-main)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold uppercase mb-1 text-[var(--text-muted)]">
              TAGS (COMMA SEPARATED):
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="eBPF, Kernel, Observability"
              className="w-full h-10 px-3 border-2 border-[var(--border-black)] bg-[var(--bg-card)] font-bold text-[var(--text-main)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold uppercase mb-1 text-[var(--text-muted)]">
              ESTIMATED READ TIME:
            </label>
            <input
              type="text"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              placeholder="5 min read"
              className="w-full h-10 px-3 border-2 border-[var(--border-black)] bg-[var(--bg-card)] font-bold uppercase text-[var(--text-main)] focus:outline-none"
            />
          </div>
        </div>

        {/* Row 3: Thumbnail & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="block font-bold uppercase mb-1 text-[var(--text-muted)]">
              FIGURE / THUMBNAIL IMAGE (FILE UPLOAD):
            </label>
            <input
              type="file"
              ref={thumbnailInputRef}
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="hidden"
            />
            {thumbnail ? (
              <div className="flex items-center gap-3 p-2 border-2 border-[var(--border-black)] bg-[var(--bg-card)] h-12">
                <img
                  src={thumbnail}
                  alt="Thumbnail Preview"
                  className="w-12 h-8 object-cover border border-[var(--border-black)] flex-shrink-0"
                />
                <span className="truncate flex-1 font-mono text-[11px] text-[var(--text-main)] font-bold uppercase">
                  Image attached
                </span>
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={isUploadingThumbnail}
                  className="px-2 py-0.5 border border-[var(--border-black)] bg-[var(--bg-muted)] text-[10px] font-bold uppercase hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] transition-colors cursor-pointer"
                >
                  [ CHANGE ]
                </button>
                <button
                  type="button"
                  onClick={() => setThumbnail("")}
                  className="px-2 py-0.5 border border-red-500 text-red-600 dark:text-red-400 bg-[var(--bg-muted)] text-[10px] font-bold uppercase hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                >
                  [ REMOVE ]
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isUploadingThumbnail}
                onClick={() => thumbnailInputRef.current?.click()}
                className="w-full h-12 px-3 border-2 border-dashed border-[var(--border-black)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {isUploadingThumbnail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>UPLOADING THUMBNAIL...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    <span>[ ⇪ UPLOAD THUMBNAIL FILE ]</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div>
            <label className="block font-bold uppercase mb-1 text-[var(--text-muted)]">
              INITIAL PUBLISHING STATUS:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Blog["status"])}
              className="w-full h-12 px-3 border-2 border-[var(--border-black)] bg-[var(--bg-card)] font-bold uppercase text-[var(--text-main)] focus:outline-none cursor-pointer"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>
        </div>

        {/* Abstract */}
        <div>
          <label className="block font-mono text-xs font-bold uppercase mb-1 text-[var(--text-muted)]">
            MANUSCRIPT ABSTRACT / EXCERPT:
          </label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief technical summary and problem statement..."
            className="w-full p-3 font-serif text-sm border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[var(--border-black)] pb-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase text-[var(--text-muted)]">EDITOR ENGINE:</span>
          <span className="px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-canvas)] font-black text-[11px]">
            TIPTAP PROSE WYSIWYG
          </span>
        </div>

        {/* Tab view modes */}
        <div className="flex items-center border border-[var(--border-black)]">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-3 py-1 font-mono text-xs font-black uppercase cursor-pointer ${
              activeTab === "edit"
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "bg-[var(--bg-card)] text-[var(--text-main)]"
            }`}
          >
            COMPOSER
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("split")}
            className={`px-3 py-1 font-mono text-xs font-black uppercase hidden md:inline-block cursor-pointer ${
              activeTab === "split"
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "bg-[var(--bg-card)] text-[var(--text-main)]"
            }`}
          >
            SPLIT PROOF
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1 font-mono text-xs font-black uppercase cursor-pointer ${
              activeTab === "preview"
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "bg-[var(--bg-card)] text-[var(--text-main)]"
            }`}
          >
            LIVE PROOF
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("json")}
            className={`px-3 py-1 font-mono text-xs font-black uppercase cursor-pointer ${
              activeTab === "json"
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "bg-[var(--bg-card)] text-[var(--text-main)]"
            }`}
          >
            JSON DOC
          </button>
        </div>
      </div>

      {/* Main TipTap Editing / Preview Canvas */}
      {activeTab === "edit" && (
        <TipTapEditor
          initialContent={contentJson}
          onChange={handleEditorChange}
        />
      )}

      {activeTab === "split" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col">
            <div className="font-mono text-xs font-black uppercase text-[var(--text-muted)] mb-2 flex items-center justify-between">
              <span>WYSIWYG TIPTAP COMPOSER</span>
              <span>LIVE EDIT</span>
            </div>
            <TipTapEditor
              initialContent={contentJson}
              onChange={handleEditorChange}
            />
          </div>

          <div className="flex flex-col">
            <div className="font-mono text-xs font-black uppercase text-[var(--text-muted)] mb-2 flex items-center justify-between">
              <span>LIVE BROADSHEET PROOF PREVIEW</span>
              <span>SYNCHRONIZED</span>
            </div>
            <div className="max-h-[850px] overflow-y-auto">
              <TipTapPreview
                title={title}
                category={category}
                readTime={readTime}
                thumbnail={thumbnail}
                excerpt={excerpt}
                tags={tags.split(",").map((t) => t.trim()).filter(Boolean)}
                status={status}
                contentJson={contentJson}
                rawContent={contentText}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "preview" && (
        <TipTapPreview
          title={title}
          category={category}
          readTime={readTime}
          thumbnail={thumbnail}
          excerpt={excerpt}
          tags={tags.split(",").map((t) => t.trim()).filter(Boolean)}
          status={status}
          contentJson={contentJson}
          rawContent={contentText}
        />
      )}

      {activeTab === "json" && (
        <TipTapJsonViewer
          jsonDoc={contentJson}
          blogTitle={title}
        />
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center font-mono text-sm uppercase">
          LOADING DEDICATED BROADSHEET EDITOR...
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
