"use client";

import React, { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getBlogByIdOrSlug, saveBlog } from "@/lib/blog-service";
import { Blog } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { ImageIcon, Loader2, X } from "lucide-react";

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
  const [isUploadingBodyImage, setIsUploadingBodyImage] = useState(false);
  const [excerpt, setExcerpt] = useState(() => existing?.excerpt || "");
  const [content, setContent] = useState(() => existing?.content || "");
  const [status, setStatus] = useState<Blog["status"]>(() => existing?.status || "DRAFT");
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "split">("split");
  const [message, setMessage] = useState<string | null>(null);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const bodyImageInputRef = useRef<HTMLInputElement>(null);

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

  const handleBodyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image exceeds 5MB limit.");
      return;
    }

    setIsUploadingBodyImage(true);
    let finalUrl = "";
    try {
      const res = await apiClient.uploads.image(file);
      if (res?.url) {
        finalUrl = res.url;
      }
    } catch (err) {
      console.warn("Backend body image upload failed, falling back to local file reader:", err);
    } finally {
      setIsUploadingBodyImage(false);
      if (bodyImageInputRef.current) bodyImageInputRef.current.value = "";
    }

    if (!finalUrl) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        if (result) {
          insertImageMarkdown(result, file.name.replace(/\.[^.]+$/, ""));
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    insertImageMarkdown(finalUrl, file.name.replace(/\.[^.]+$/, ""));
  };

  const insertImageMarkdown = (url: string, defaultAlt: string) => {
    const textarea = document.getElementById("manuscriptTextarea") as HTMLTextAreaElement;
    const caption = prompt("Enter figure caption / alt text:", defaultAlt) || defaultAlt;
    const imageMarkdown = `\n\n![${caption}](${url})\n*Figure: ${caption}*\n\n`;

    if (!textarea) {
      setContent((prev) => prev + imageMarkdown);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextContent = content.substring(0, start) + imageMarkdown + content.substring(end);
    setContent(nextContent);
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
      content: content.trim() || "Manuscript text under editorial preparation.",
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

  const insertSnippet = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("manuscriptTextarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const nextContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(nextContent);
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
              KEYWORDS / TAGS (COMMA SEPARATED):
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="linux, ebpf, observability"
              className="w-full h-10 px-3 border-2 border-[var(--border-black)] bg-[var(--bg-card)] font-bold uppercase text-[var(--text-main)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold uppercase mb-1 text-[var(--text-muted)]">
              READ TIME ESTIMATE:
            </label>
            <input
              type="text"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              placeholder="7 min read"
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
              STATUS OVERRIDE:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Blog["status"])}
              className="w-full h-12 px-3 border-2 border-[var(--border-black)] bg-[var(--bg-card)] font-bold uppercase text-[var(--text-main)] focus:outline-none cursor-pointer"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
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

      {/* View Mode Switcher and Quick Formatting Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[var(--border-black)] pb-2 font-mono text-xs">
        {/* Quick markdown snippet tools */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold uppercase text-[var(--text-muted)] mr-1">SNIPPETS:</span>
          <button
            type="button"
            onClick={() => insertSnippet("### ")}
            className="px-2 py-1 border border-[var(--border-black)] bg-[var(--bg-card)] font-black hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] cursor-pointer"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("**", "**")}
            className="px-2 py-1 border border-[var(--border-black)] bg-[var(--bg-card)] font-black hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] cursor-pointer"
          >
            BOLD
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("*", "*")}
            className="px-2 py-1 border border-[var(--border-black)] bg-[var(--bg-card)] font-black hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] cursor-pointer"
          >
            ITALIC
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("```rust\n", "\n```")}
            className="px-2 py-1 border border-[var(--border-black)] bg-[var(--bg-card)] font-black hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] cursor-pointer"
          >
            CODE BLOCK
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("> *\"", "\"*")}
            className="px-2 py-1 border border-[var(--border-black)] bg-[var(--bg-card)] font-black hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] cursor-pointer"
          >
            PULL QUOTE
          </button>

          {/* Body Figure Image File Upload Trigger */}
          <input
            type="file"
            ref={bodyImageInputRef}
            accept="image/*"
            onChange={handleBodyImageUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploadingBodyImage}
            onClick={() => bodyImageInputRef.current?.click()}
            className="px-2 py-1 border border-[var(--border-black)] bg-[var(--bg-card)] font-black hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] transition-colors cursor-pointer inline-flex items-center gap-1"
            title="Upload and insert an image file into the manuscript body"
          >
            {isUploadingBodyImage ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <ImageIcon className="w-3 h-3" />
            )}
            <span>{isUploadingBodyImage ? "UPLOADING..." : "[ ⇪ INSERT FIGURE IMAGE ]"}</span>
          </button>
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
            SOURCE
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
        </div>
      </div>

      {/* Main Editing / Preview Canvas */}
      <div className="border-4 border-[var(--border-black)] bg-[var(--bg-card)]">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y-4 md:divide-y-0 md:divide-x-4 divide-[var(--border-black)] min-h-[500px]">
          {/* Left: Source Textarea */}
          {(activeTab === "edit" || activeTab === "split") && (
            <div className={`p-4 flex flex-col ${activeTab === "edit" ? "md:col-span-2" : ""}`}>
              <div className="font-mono text-xs font-bold uppercase text-[var(--text-muted)] pb-2 border-b border-[var(--border-subtle)] mb-2 flex items-center justify-between">
                <span>MANUSCRIPT MARKDOWN BODY</span>
                <span>{content.split(/\s+/).filter(Boolean).length} WORDS</span>
              </div>
              <textarea
                id="manuscriptTextarea"
                rows={20}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your technical analysis, proof, or architecture dispatch here in Markdown..."
                className="w-full flex-1 p-3 font-mono text-sm leading-relaxed border-none bg-transparent text-[var(--text-main)] focus:outline-none resize-none"
              />
            </div>
          )}

          {/* Right: Live Broadsheet Proof Preview */}
          {(activeTab === "preview" || activeTab === "split") && (
            <div
              className={`p-6 bg-[var(--bg-canvas)] overflow-y-auto max-h-[700px] space-y-4 ${
                activeTab === "preview" ? "md:col-span-2" : ""
              }`}
            >
              <div className="font-mono text-xs font-black uppercase text-[var(--text-muted)] pb-2 border-b-2 border-[var(--border-black)] flex items-center justify-between">
                <span>BROADSHEET LETTERPRESS PROOF</span>
                <span>PROOF VER: DRAFT</span>
              </div>

              {title && (
                <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase leading-tight text-[var(--text-main)]">
                  {title}
                </h2>
              )}

              {excerpt && (
                <p className="font-serif text-base italic border-l-3 border-[var(--border-black)] pl-3 text-[var(--text-muted)]">
                  {excerpt}
                </p>
              )}

              {thumbnail && (
                <div className="border-2 border-[var(--border-black)] h-44 overflow-hidden relative">
                  <img
                    src={thumbnail}
                    alt="Preview"
                    className="w-full h-full object-cover filter grayscale"
                  />
                  <span className="absolute bottom-1 right-1 font-mono text-[9px] bg-[var(--bg-card)] px-1 border border-[var(--border-black)]">
                    FIGURE 1.0 PROOF
                  </span>
                </div>
              )}

              <div className="font-serif text-sm leading-relaxed text-[var(--text-body)] space-y-4 whitespace-pre-line pt-2">
                {content ? (
                  content
                ) : (
                  <span className="font-mono text-xs text-[var(--text-muted)] uppercase">
                    No body content written yet...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
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
