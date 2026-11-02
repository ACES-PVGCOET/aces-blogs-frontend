"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/core";
import AdminHeader from "@/components/blogs/AdminHeader";
import BlogEditor from "@/components/blogs/Blogeditor";
import DraftLoading from "@/components/blogs/DraftLoading";
import {
  EMPTY_CONTENT,
  createSlug,
  readDraft,
  writeDraft,
} from "@/lib/blogDraft";
import { useIsClient } from "@/lib/useIsClient";

export default function CreateBlogPage() {
  const isClient = useIsClient();

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 transition-colors duration-200 dark:bg-stone-950 dark:text-stone-100">
      <AdminHeader />

      <div className="mx-auto max-w-4xl px-5 py-8">
        <div className="mb-8 border-b border-stone-300 pb-5 dark:border-stone-800">
          <p className="font-editorial text-[11px] font-bold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
            Manuscript Ingestion • Stage I
          </p>

          <h2 className="mt-1 font-headline text-3xl font-extrabold uppercase tracking-wider text-stone-950 sm:text-4xl dark:text-stone-100">
            Create New Blog
          </h2>

          <p className="mt-2 font-editorial text-base italic text-stone-600 dark:text-stone-400">
            Compose your headline and article body. Taxonomy, cover visuals, and publishing options follow.
          </p>
        </div>

        {isClient ? <CreateBlogForm /> : <DraftLoading />}
      </div>
    </main>
  );
}

function CreateBlogForm() {
  const router = useRouter();

  const [initialDraft] = useState(() => readDraft());
  const [title, setTitle] = useState(initialDraft?.title ?? "");
  const [content, setContent] = useState<JSONContent>(
    initialDraft?.content ?? EMPTY_CONTENT,
  );
  const [message, setMessage] = useState("");

  function handleProceed() {
    const existing = readDraft();
    const cleanTitle = title.trim();

    const saved = writeDraft({
      title: cleanTitle,
      slug: createSlug(cleanTitle),
      excerpt: existing?.excerpt ?? "",
      category: existing?.category ?? "",
      tags: existing?.tags ?? [],
      thumbnail: existing?.thumbnail ?? "",
      content,
      status: "draft",
    });

    if (!saved) {
      setMessage("Could not save your draft in this browser.");
      return;
    }

    router.push("/admin/blogs/new/details");
  }

  return (
    <>
      <section className="space-y-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-stone-800 dark:bg-stone-900/60">
        <div>
          <label
            htmlFor="blog-title"
            className="mb-2 block font-headline text-xs font-bold uppercase tracking-[0.16em] text-stone-900 dark:text-stone-200"
          >
            Article Headline
          </label>

          <input
            id="blog-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setMessage("");
            }}
            placeholder="Enter an authoritative headline..."
            className="w-full rounded-lg border border-stone-300 bg-white p-3 font-headline text-xl font-bold tracking-tight text-stone-950 placeholder:font-editorial placeholder:text-base placeholder:font-normal placeholder:italic placeholder:text-stone-400 outline-none transition-colors duration-200 focus:border-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-stone-400"
          />
        </div>

        <div>
          <label className="mb-2 block font-headline text-xs font-bold uppercase tracking-[0.16em] text-stone-900 dark:text-stone-200">
            Article Copy &amp; Body
          </label>

          <BlogEditor
            initialContent={content}
            onChange={setContent}
          />
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-5 dark:border-stone-800">
        <p role="status" className="font-editorial text-xs italic text-stone-600 dark:text-stone-400">
          {message ||
            "Your headline and copy are saved in this browser session upon proceeding."}
        </p>

        <button
          type="button"
          onClick={handleProceed}
          className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 font-editorial text-xs font-bold uppercase tracking-[0.18em] text-stone-50 transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
        >
          Proceed to Details
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" y1="12" x2="20" y2="12" />
            <polyline points="13 5 20 12 13 19" />
          </svg>
        </button>
      </div>
    </>
  );
}
