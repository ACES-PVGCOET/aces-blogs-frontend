"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface BlogItem {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  author: string;
  status: "DRAFT" | "PUBLISHED" | "UNDER_REVIEW" | "REVISION_DRAFT" | "ARCHIVED" | "REJECT";
  category: string;
  tags: string[];
  readsCount: number;
  readTime: string;
  rejectionReason: string | null;
  latestRevisionVersion: number;
  latestPublishedVersion: number;
  createdAt: string;
  modifiedAt: string;
  content?: string;
  excerpt?: string;
}

const CATEGORIES = [
  "Kernel & OS",
  "Systems & Memory",
  "Distributed Consensus",
  "Applied Cryptography",
  "Web Infrastructure",
  "Emerging Tech",
  "Compiler Architectures",
  "Campus Engineering"
];

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams?.get("id");

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Kernel & OS");
  const [coverUrl, setCoverUrl] = useState("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("systems, kernel, performance");
  const [bodyText, setBodyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState<"edit" | "split" | "preview">("edit");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync theme with writer-profile
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("aces_theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      }
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("aces_theme", next);
    } catch (e) {}
  };

  // Load existing blog if editing
  useEffect(() => {
    if (!blogId) {
      setBodyText(
        `# Introduction\n\nDeploying high-throughput distributed microservices requires observability mechanisms that operate with near-zero overhead. Traditional instrumentation libraries incur severe context-switching penalties.\n\n## Core Architecture\n\nWith extended Berkeley Packet Filters (eBPF), the Linux kernel becomes fully programmable in safety-verified sandboxes, enabling kernel-space probe attachment without recompilation.\n\n> "In high-throughput microservices, telemetry without kernel-level tracing is akin to navigating celestial bodies in broad daylight."\n\n### Key Takeaways\n\n- Compile directly to in-kernel virtual machine bytecode.\n- Measure latency histograms without mutating user-space processes.\n- Zero context-switch penalty on modern production kernels.`
      );
      setExcerpt("High-throughput kernel tracing and zero-overhead observability for distributed cloud microservices.");
      return;
    }

    setIsEditing(true);

    try {
      const savedBlogsRaw = localStorage.getItem("aces_editor_blogs");
      if (savedBlogsRaw) {
        const blogs: BlogItem[] = JSON.parse(savedBlogsRaw);
        const match = blogs.find((b) => b.id === blogId);
        if (match) {
          setTitle(match.title || "");
          setCategory(match.category || "Kernel & OS");
          setCoverUrl(match.thumbnail || "");
          setExcerpt(match.excerpt || "");
          setTags((match.tags || []).join(", "));
          if (match.content) setBodyText(match.content);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not read local editor storage", e);
    }

    if (blogId.startsWith("11111111")) {
      setTitle("Deep Dive into Linux eBPF Tracing for Cloud-Native Observability");
      setExcerpt("High-throughput kernel tracing and zero-overhead observability for distributed cloud microservices.");
    } else if (blogId.startsWith("22222222")) {
      setTitle("Memory Safety Without Garbage Collection: How Rust Rewrote the Rules");
      setCategory("Systems & Memory");
      setCoverUrl("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80");
      setExcerpt("How lifetime bounds, affine type systems, and ownership semantics eliminated data races without garbage collection.");
    } else {
      setTitle("Technical Dispatch: Systems Research Paper");
    }
  }, [blogId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const wordCount = bodyText.trim().split(/\s+/).filter(Boolean).length;
  const readTimeEst = Math.max(1, Math.ceil(wordCount / 180)) + " min read";

  const handleSave = (publish: boolean) => {
    if (!title.trim()) {
      showToast("Please enter an article title first!");
      return;
    }

    const currentId = blogId || "blog-" + Date.now();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const blogRecord: BlogItem = {
      id: currentId,
      slug: slug || "technical-dispatch",
      title: title.trim(),
      thumbnail: coverUrl.trim() || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      author: "writer-101",
      status: publish ? "PUBLISHED" : "DRAFT",
      category: category,
      tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      readsCount: publish ? 1 : 0,
      readTime: readTimeEst,
      rejectionReason: null,
      latestRevisionVersion: 1,
      latestPublishedVersion: publish ? 1 : 0,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      content: bodyText,
      excerpt: excerpt.trim()
    };

    try {
      const raw = localStorage.getItem("aces_editor_blogs");
      let list: BlogItem[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((b) => b.id === currentId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...blogRecord };
      } else {
        list.unshift(blogRecord);
      }
      localStorage.setItem("aces_editor_blogs", JSON.stringify(list));
    } catch (e) {
      console.error("Local storage error:", e);
    }

    showToast(publish ? "Dispatched! Published to live gazette." : "Draft saved to your desk.");

    setTimeout(() => {
      router.push("/writer-profile.html");
    }, 1000);
  };

  const insertFormatting = (prefix: string, suffix = "") => {
    const textarea = document.getElementById("editorTextarea") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = bodyText.substring(start, end);
    const replacement = prefix + (selected || "text") + suffix;

    const newText = bodyText.substring(0, start) + replacement + bodyText.substring(end);
    setBodyText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 50);
  };

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen font-serif flex flex-col transition-colors duration-150 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-white text-black"}`}>
      {/* Editorial Top Navigation Header */}
      <header className={`border-b-4 sticky top-0 z-50 px-6 py-3 transition-colors ${isDark ? "border-white bg-[#0a0a0a]" : "border-black bg-white"}`}>
        <div className="max-w-[1240px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/writer-profile.html"
              className={`inline-flex items-center gap-2 border-2 px-3 py-1 font-mono text-xs font-bold uppercase transition-colors ${
                isDark ? "border-white hover:bg-white hover:text-black" : "border-black hover:bg-black hover:text-white"
              }`}
            >
              <span>← RETURN TO DESK</span>
            </Link>
            <div className={`border-l-2 pl-4 ${isDark ? "border-white" : "border-black"}`}>
              <span className="font-mono text-xs font-black uppercase tracking-wider block">
                ACES BROADSHEET GAZETTE
              </span>
              <span className={`font-mono text-[10px] uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {isEditing ? `EDITING RECORD: ${blogId}` : "NEW BLOG DISPATCH"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden md:flex items-center gap-3 font-mono text-xs border-r-2 pr-4 ${isDark ? "border-white text-gray-300" : "border-black text-gray-700"}`}>
              <span>WORDS: <strong>{wordCount}</strong></span>
              <span>•</span>
              <span>READ TIME: <strong>{readTimeEst}</strong></span>
            </div>

            {/* Dark / Light Mode Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`border-2 px-3 py-1.5 font-mono text-xs font-bold uppercase transition-colors cursor-pointer ${
                isDark ? "border-white bg-black text-white hover:bg-white hover:text-black" : "border-black bg-white text-black hover:bg-black hover:text-white"
              }`}
              title="Toggle theme mode"
            >
              <span>{isDark ? "✦ LIGHT" : "✦ DARK"}</span>
            </button>

            <button
              onClick={() => handleSave(false)}
              className={`border-2 border-dashed px-4 py-1.5 font-mono text-xs font-black uppercase transition-colors cursor-pointer ${
                isDark ? "border-white hover:bg-white hover:text-black" : "border-black hover:bg-black hover:text-white"
              }`}
            >
              [ ✂ SAVE DRAFT ]
            </button>

            <button
              onClick={() => handleSave(true)}
              className={`border-2 px-5 py-1.5 font-mono text-xs font-black uppercase transition-colors cursor-pointer ${
                isDark ? "border-white bg-white text-black hover:bg-black hover:text-white" : "border-black bg-black text-white hover:bg-white hover:text-black"
              }`}
            >
              ➔ PUBLISH BLOG
            </button>
          </div>
        </div>
      </header>

      {/* Main Composer Canvas */}
      <main className="max-w-[1240px] mx-auto w-full px-6 py-8 flex-1 flex flex-col gap-6">
        {/* Toast Notification */}
        {toastMsg && (
          <div className={`fixed bottom-6 right-6 z-50 border-4 px-6 py-3 font-mono text-sm font-bold uppercase ${
            isDark ? "border-white bg-white text-black shadow-[4px_4px_0px_#ffffff]" : "border-black bg-black text-white shadow-[4px_4px_0px_#000000]"
          }`}>
            {toastMsg}
          </div>
        )}

        {/* Title & Metadata Box */}
        <section className={`border-4 p-6 transition-colors flex flex-col gap-5 ${
          isDark ? "border-white bg-[#0e0e0e] shadow-[4px_4px_0px_rgba(255,255,255,0.1)]" : "border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
        }`}>
          <div>
            <label className={`font-mono text-xs font-black uppercase tracking-wider block mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              DISPATCH HEADLINE (ANTON DISPLAY)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ENTER POWERFUL TECHNICAL HEADLINE..."
              className={`w-full border-2 p-3 font-sans font-black text-2xl md:text-3xl uppercase tracking-tight focus:outline-none ${
                isDark ? "border-white bg-black text-white placeholder-gray-600 focus:ring-2 focus:ring-white" : "border-black bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-black"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`font-mono text-xs font-bold uppercase tracking-wider block mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                TOPIC CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full border-2 p-2 font-mono text-xs font-bold uppercase focus:outline-none ${
                  isDark ? "border-white bg-black text-white" : "border-black bg-white text-black"
                }`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className={isDark ? "bg-black text-white" : "bg-white text-black"}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={`font-mono text-xs font-bold uppercase tracking-wider block mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                THUMBNAIL COVER IMAGE URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className={`flex-1 border-2 p-2 font-mono text-xs focus:outline-none ${
                    isDark ? "border-white bg-black text-white placeholder-gray-600" : "border-black bg-white text-black placeholder-gray-400"
                  }`}
                />
                {coverUrl && (
                  <div className={`w-14 h-10 border-2 overflow-hidden shrink-0 ${isDark ? "border-white" : "border-black"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className={`font-mono text-xs font-bold uppercase tracking-wider block mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              EDITORIAL EXCERPT / HOOK (1-2 SENTENCE TEASER)
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Deep architectural breakdown on zero-overhead tracing and compiler safety..."
              className={`w-full border-2 p-2.5 font-serif text-sm italic focus:outline-none ${
                isDark ? "border-white bg-black text-white placeholder-gray-600" : "border-black bg-white text-black placeholder-gray-400"
              }`}
            />
          </div>
        </section>

        {/* Toolbar & View Modes */}
        <div className={`border-4 p-3 flex items-center justify-between flex-wrap gap-3 ${
          isDark ? "border-white bg-[#0e0e0e]" : "border-black bg-white"
        }`}>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-mono text-xs font-bold uppercase pr-2 border-r-2 mr-1 hidden sm:inline ${
              isDark ? "border-white text-gray-300" : "border-black text-gray-700"
            }`}>
              TYPESET:
            </span>
            {[
              { label: "[ B ]", prefix: "**", suffix: "**" },
              { label: "[ I ]", prefix: "*", suffix: "*" },
              { label: "[ H2 ]", prefix: "\n## ", suffix: "\n" },
              { label: "[ H3 ]", prefix: "\n### ", suffix: "\n" },
              { label: '[ "QUOTE" ]', prefix: '\n> "', suffix: '"\n' },
              { label: "[ CODE ]", prefix: "\n```bash\n", suffix: "\n```\n" },
              { label: "[ • LIST ]", prefix: "\n- ", suffix: "\n" }
            ].map((btn, i) => (
              <button
                key={i}
                type="button"
                onClick={() => insertFormatting(btn.prefix, btn.suffix)}
                className={`border-2 px-2.5 py-1 font-mono text-xs font-bold transition-colors cursor-pointer ${
                  isDark ? "border-white hover:bg-white hover:text-black" : "border-black hover:bg-black hover:text-white"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode(previewMode === "split" ? "edit" : "split")}
              className={`border-2 px-3 py-1 font-mono text-xs font-bold uppercase transition-colors cursor-pointer ${
                previewMode === "split"
                  ? isDark ? "bg-white text-black border-white" : "bg-black text-white border-black"
                  : isDark ? "border-white hover:bg-white hover:text-black" : "border-black hover:bg-black hover:text-white"
              }`}
            >
              ✦ {previewMode === "split" ? "CLOSE SPLIT" : "SPLIT PREVIEW"}
            </button>
          </div>
        </div>

        {/* Text Area & Split Preview */}
        <section
          className={`grid gap-6 flex-1 ${
            previewMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {/* Editor Textarea */}
          <div className={`border-4 p-5 flex flex-col ${
            isDark ? "border-white bg-[#0e0e0e] shadow-[4px_4px_0px_rgba(255,255,255,0.1)]" : "border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
          }`}>
            <span className={`font-mono text-xs font-bold uppercase mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              MARKDOWN MANUSCRIPT
            </span>
            <textarea
              id="editorTextarea"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Begin writing technical paper or investigation dispatch..."
              className={`w-full flex-1 min-h-[480px] font-mono text-sm leading-relaxed p-4 border-2 focus:outline-none resize-y ${
                isDark ? "border-white bg-black text-white focus:ring-1 focus:ring-white" : "border-black bg-white text-black focus:ring-1 focus:ring-black"
              }`}
            />
          </div>

          {/* Live Broadsheet Preview */}
          {previewMode === "split" && (
            <div className={`border-4 p-6 flex flex-col overflow-y-auto max-h-[600px] ${
              isDark ? "border-white bg-[#0e0e0e] shadow-[4px_4px_0px_rgba(255,255,255,0.1)]" : "border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
            }`}>
              <span className={`font-mono text-xs font-bold uppercase mb-3 pb-2 border-b-2 ${
                isDark ? "border-white text-gray-400" : "border-black text-gray-500"
              }`}>
                BROADSHEET INK PROOF (LIVE PREVIEW)
              </span>

              {coverUrl && (
                <div className={`w-full h-48 border-2 mb-4 overflow-hidden ${isDark ? "border-white" : "border-black"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}

              <span className={`font-mono text-xs font-bold uppercase block mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                [{category.toUpperCase()}] • {readTimeEst.toUpperCase()}
              </span>

              <h1 className="font-sans font-black text-2xl uppercase tracking-tight mb-3">
                {title || "UNTITLED DISPATCH"}
              </h1>

              {excerpt && (
                <p className={`font-serif italic text-sm border-l-4 pl-3 py-1 mb-4 ${
                  isDark ? "border-white text-gray-300" : "border-black text-gray-700"
                }`}>
                  &ldquo;{excerpt}&rdquo;
                </p>
              )}

              <div className={`font-serif text-sm leading-relaxed space-y-4 whitespace-pre-line border-t-2 pt-4 ${
                isDark ? "border-white text-gray-200" : "border-black text-gray-800"
              }`}>
                {bodyText || "No manuscript content yet."}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Editor Footer */}
      <footer className={`border-t-4 p-4 font-mono text-xs text-center ${
        isDark ? "border-white bg-[#0a0a0a] text-gray-400" : "border-black bg-white text-gray-600"
      }`}>
        ACES PVGCOET EDITORIAL WORKBENCH • DISPATCH SYSTEM v2.4 • CONNECTED TO LIVE AUTHOR PROFILE
      </footer>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-mono font-bold">
          LOADING EDITORIAL COMPOSER...
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
