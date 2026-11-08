"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchPublicBlogs } from "@/lib/blog-service";
import { Blog } from "@/lib/types";

export default function HomePage() {
  const [sampleBlogs, setSampleBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPublicBlogs({ limit: 6 })
      .then((blogs) => {
        if (blogs && blogs.length > 0) {
          setSampleBlogs(blogs.slice(0, 3));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-16 py-2">
      {/* 1. Hero Section: Project Overview & Main CTAs */}
      <section className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-[8px_8px_0px_var(--border-black)]">
        <div className="max-w-4xl space-y-6">
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-none tracking-tight text-[var(--text-main)]">
            The Technical Chronicle &amp; Engineering Dispatches of PVGCOET
          </h1>

          <p className="font-serif text-base sm:text-xl text-[var(--text-body)] leading-relaxed max-w-3xl">
            <strong>Blog Aces</strong> is the peer-reviewed publishing platform and creator workbench
            crafted by the Association of Computer Engineering Students (ACES). Devoted to deep systems
            breakdowns, Linux kernel tracing, compiler truths, distributed consensus, and technical research.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/feed"
              className="btn-broadsheet btn-broadsheet-primary text-sm sm:text-base py-3 px-6 cursor-pointer flex items-center gap-2 shadow-[4px_4px_0px_var(--border-black)]"
            >
              <span>➔</span>
              <span>EXPLORE GLOBAL FEED</span>
            </Link>

            <Link
              href="/profile"
              className="btn-broadsheet text-sm sm:text-base py-3 px-6 cursor-pointer flex items-center gap-2"
            >
              <span>✎</span>
              <span>AUTHOR PROFILE &amp; DESK</span>
            </Link>

            <Link
              href="/editor"
              className="btn-broadsheet text-sm sm:text-base py-3 px-6 cursor-pointer flex items-center gap-2"
            >
              <span>[ ➔ WRITE DISPATCH ]</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Visual Platform Showcase: The Broadsheet Reading Experience */}
      <section className="space-y-6">
        <div className="border-b-3 border-[var(--border-black)] pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              WHAT READERS EXPLORE
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase text-[var(--text-main)] leading-none">
              Featured Dispatches on the Global Feed
            </h2>
          </div>
          <Link
            href="/feed"
            className="font-mono text-xs font-black uppercase hover:underline flex items-center gap-1 text-[var(--text-main)] cursor-pointer"
          >
            <span>GO TO GLOBAL FEED ➔</span>
          </Link>
        </div>

        {/* Featured Visual Showcase Cards */}
        {loading && sampleBlogs.length === 0 ? (
          <div className="border-2 border-dashed border-[var(--border-black)] p-12 text-center bg-[var(--bg-muted)] font-mono text-xs uppercase">
            LOADING FEATURED DISPATCHES...
          </div>
        ) : sampleBlogs.length === 0 ? (
          <div className="border-2 border-dashed border-[var(--border-black)] p-12 text-center bg-[var(--bg-muted)] space-y-3 font-mono text-xs uppercase">
            <div className="font-bold text-base">NO DISPATCHES PUBLISHED YET</div>
            <p className="text-[var(--text-muted)] font-serif lowercase">
              be the first author to publish a technical dispatch on the gazette.
            </p>
            <Link href="/editor" className="btn-broadsheet btn-broadsheet-primary mt-2 inline-block">
              ➔ COMPOSE FIRST DISPATCH
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleBlogs.map((b) => (
              <div
                key={b.id}
                className="border-3 border-[var(--border-black)] bg-[var(--bg-card)] flex flex-col justify-between hover:shadow-[6px_6px_0px_var(--border-black)] transition-all"
              >
                {/* Thumbnail */}
                <div className="h-44 border-b-3 border-[var(--border-black)] bg-[var(--bg-muted)] relative overflow-hidden flex items-center justify-center">
                  {b.thumbnail ? (
                    <img
                      src={b.thumbnail}
                      alt={b.title}
                      className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="font-mono text-xs font-bold uppercase text-[var(--text-muted)]">
                      [{b.category}]
                    </span>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-canvas)] font-mono text-[10px] font-bold uppercase">
                    {b.category}
                  </span>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-[var(--bg-card)] font-mono text-[10px] font-bold border border-[var(--border-black)] text-[var(--text-main)] uppercase">
                    {b.readTime}
                  </span>
                </div>

                {/* Title & Excerpt */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <Link
                      href={`/blog/${b.slug || b.id}`}
                      className="font-heading text-xl font-black uppercase leading-tight hover:underline text-[var(--text-main)] block line-clamp-2"
                    >
                      {b.title}
                    </Link>
                    {b.excerpt && (
                      <p className="font-serif text-xs text-[var(--text-muted)] line-clamp-3">
                        {b.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t-2 border-[var(--border-black)] flex items-center justify-between font-mono text-xs uppercase font-bold">
                    <span className="text-[var(--text-muted)] text-[11px] truncate max-w-[160px]">
                      BY {b.authorName?.toUpperCase() || "ACES CONTRIBUTOR"}
                    </span>
                    <Link
                      href={`/blog/${b.slug || b.id}`}
                      className="text-[var(--text-main)] font-black hover:underline"
                    >
                      [ READ ➔ ]
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global Feed Redirection Banner */}
        <div className="border-3 border-[var(--border-black)] bg-[var(--bg-muted)] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-heading text-2xl font-black uppercase text-[var(--text-main)]">
              Looking for Kernel, Systems, and Distributed Articles?
            </h3>
            <p className="font-serif text-xs text-[var(--text-muted)]">
              Filter by research category, search by technical keywords, and explore dispatches in our comprehensive feed.
            </p>
          </div>
          <Link
            href="/feed"
            className="btn-broadsheet btn-broadsheet-primary whitespace-nowrap cursor-pointer text-xs py-2.5 px-5"
          >
            ➔ VIEW ALL IN GLOBAL FEED
          </Link>
        </div>
      </section>

      {/* 3. What Makes the Platform Unique: 4 Core Pillars */}
      <section className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] p-6 sm:p-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="font-mono text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
            ENGINEERING SCHOLARSHIP BY DESIGN
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-black uppercase text-[var(--text-main)] leading-none">
            An Academic Publishing Engine
          </h2>
          <p className="font-serif text-xs sm:text-sm text-[var(--text-muted)]">
            Built specifically for high-signal technical writing with peer review and letterpress craftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* Pillar 1 */}
          <div className="border-2 border-[var(--border-black)] p-5 bg-[var(--bg-muted)] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="font-mono text-2xl font-black text-[var(--text-main)]">01 /</span>
              <h3 className="font-heading text-xl font-black uppercase text-[var(--text-main)]">
                Global Research Feed
              </h3>
              <p className="font-serif text-xs leading-relaxed text-[var(--text-muted)]">
                Chronological and category-indexed stream of peer-reviewed engineering dispatches, systems audits, and benchmarks.
              </p>
            </div>
            <Link
              href="/feed"
              className="font-mono text-xs font-black uppercase hover:underline text-[var(--text-main)] pt-2 border-t border-[var(--border-black)] block"
            >
              Open Feed ➔
            </Link>
          </div>

          {/* Pillar 2 */}
          <div className="border-2 border-[var(--border-black)] p-5 bg-[var(--bg-muted)] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="font-mono text-2xl font-black text-[var(--text-main)]">02 /</span>
              <h3 className="font-heading text-xl font-black uppercase text-[var(--text-main)]">
                Author Workspaces
              </h3>
              <p className="font-serif text-xs leading-relaxed text-[var(--text-muted)]">
                Individual profile workspaces for student fellows, featuring biographical beats, dispatches ledger, and editorial pipeline.
              </p>
            </div>
            <Link
              href="/profile"
              className="font-mono text-xs font-black uppercase hover:underline text-[var(--text-main)] pt-2 border-t border-[var(--border-black)] block"
            >
              Visit Profile Desk ➔
            </Link>
          </div>

          {/* Pillar 3 */}
          <div className="border-2 border-[var(--border-black)] p-5 bg-[var(--bg-muted)] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="font-mono text-2xl font-black text-[var(--text-main)]">03 /</span>
              <h3 className="font-heading text-xl font-black uppercase text-[var(--text-main)]">
                Peer Review
              </h3>
              <p className="font-serif text-xs leading-relaxed text-[var(--text-muted)]">
                Every technical dispatch is evaluated by editorial committee members before being certified for public release.
              </p>
            </div>
            <Link
              href="/feed"
              className="font-mono text-xs font-black uppercase hover:underline text-[var(--text-main)] pt-2 border-t border-[var(--border-black)] block"
            >
              Review Pipeline ➔
            </Link>
          </div>

          {/* Pillar 4 */}
          <div className="border-2 border-[var(--border-black)] p-5 bg-[var(--bg-muted)] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="font-mono text-2xl font-black text-[var(--text-main)]">04 /</span>
              <h3 className="font-heading text-xl font-black uppercase text-[var(--text-main)]">
                Dedicated Editor
              </h3>
              <p className="font-serif text-xs leading-relaxed text-[var(--text-muted)]">
                Split-pane Markdown creator workbench with live broadsheet letterpress proofing, revision tracking, and instant drafts.
              </p>
            </div>
            <Link
              href="/editor"
              className="font-mono text-xs font-black uppercase hover:underline text-[var(--text-main)] pt-2 border-t border-[var(--border-black)] block"
            >
              Open Editor ➔
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Campus Rankings Spotlight Banner */}
      <section className="border-3 border-[var(--border-black)] bg-[var(--bg-card)] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="font-mono text-xs font-black uppercase text-[var(--text-muted)]">
            CAMPUS TECHNICAL LEADERBOARD
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-[var(--text-main)]">
            Track Engineering Pod Points &amp; Research Standings
          </h2>
          <p className="font-serif text-xs text-[var(--text-muted)] leading-relaxed">
            Engineering pods earn points for verified code reviews, publication streaks, and technical dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/ranking" className="btn-broadsheet whitespace-nowrap cursor-pointer">
            VIEW FULL STANDINGS ➔
          </Link>
        </div>
      </section>

      {/* 5. Final Bottom Call To Action: Redirect to Global Feed */}
      <section className="border-4 border-[var(--border-black)] bg-[var(--text-main)] text-[var(--bg-canvas)] p-8 sm:p-12 text-center space-y-5 shadow-[10px_10px_0px_var(--border-black)]">
        <span className="font-mono text-xs font-black uppercase tracking-widest text-[var(--bg-canvas)] opacity-80">
          ACES PVGCOET · DEPARTMENT OF COMPUTER ENGINEERING
        </span>

        <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black uppercase leading-none max-w-3xl mx-auto">
          Start Exploring Verified Engineering Research Now
        </h2>

        <p className="font-serif text-sm sm:text-base opacity-90 max-w-xl mx-auto leading-relaxed">
          Dive straight into the global archive of dispatches, filter by systems beats, or join our author community.
        </p>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/feed"
            className="px-6 py-3 bg-[var(--bg-canvas)] text-[var(--text-main)] font-mono text-sm font-black uppercase tracking-wider border-2 border-[var(--bg-canvas)] hover:bg-transparent hover:text-[var(--bg-canvas)] transition-colors cursor-pointer"
          >
            ➔ GO TO GLOBAL FEED
          </Link>

          <Link
            href="/profile"
            className="px-6 py-3 bg-transparent text-[var(--bg-canvas)] font-mono text-sm font-black uppercase tracking-wider border-2 border-[var(--bg-canvas)] hover:bg-[var(--bg-canvas)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
          >
            VIEW AUTHOR DESK ➔
          </Link>
        </div>
      </section>
    </div>
  );
}
