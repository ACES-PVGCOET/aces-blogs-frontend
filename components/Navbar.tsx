"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentTheme =
      (document.documentElement.getAttribute("data-theme") as "light" | "dark") ||
      (localStorage.getItem("aces_theme") as "light" | "dark") ||
      "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    setTimeout(() => {
      setTheme(currentTheme);
    }, 0);

    // Global '/' key listener to focus search input
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("aces_theme", nextTheme);
    } catch {}
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/feed?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/feed");
    }
  };

  const navLinks = [
    { label: "OVERVIEW", href: "/" },
    { label: "GLOBAL FEED", href: "/feed" },
    { label: "WRITER PROFILE", href: "/profile" },
    { label: "CAMPUS RANKINGS", href: "/ranking" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-card)] border-b-4 border-[var(--border-black)]">
      {/* Folio ticker banner */}
      <div className="bg-[var(--text-main)] text-[var(--bg-canvas)] py-1.5 px-4 text-[11px] font-mono font-bold tracking-widest text-center uppercase border-b border-[var(--border-black)] flex items-center justify-between">
        <span className="hidden sm:inline">PUNE, MH · PVGCOET CAMPUS</span>
        <span>ACES BLOGS · THE OFFICIAL TECHNICAL BLOGGING ENGINE &amp; EDITORIAL GAZETTE</span>
        <span className="hidden sm:inline">DUAL-PROOF INK · LATENCY &lt; 4MS</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Shield & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 bg-[var(--text-main)] text-[var(--bg-canvas)] flex items-center justify-center font-heading text-2xl font-black border-2 border-[var(--border-black)] hover:opacity-90 select-none cursor-pointer"
            aria-label="ACES Blog Home"
          >
            A
          </Link>
          <Link href="/" className="flex flex-col cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl sm:text-2xl font-black tracking-wide uppercase text-[var(--text-main)]">
                Blog Aces
              </span>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 border border-[var(--border-black)] uppercase bg-[var(--bg-card)] text-[var(--text-main)]">
                PVGCOET
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] -mt-1 hidden sm:inline">
              Broadsheet Technical Chronicle
            </span>
          </Link>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-1 font-mono text-xs font-black uppercase">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[var(--text-main)] text-[var(--bg-canvas)] border border-[var(--border-black)]"
                    : "text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar - Desktop */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center relative flex-1 max-w-xs"
        >
          <span className="absolute left-2.5 font-mono text-sm pointer-events-none text-[var(--text-muted)]">
            ☛
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH STORIES, TAGS..."
            aria-label="Search dispatches"
            className="w-full h-9 pl-7 pr-7 font-mono text-xs font-bold uppercase bg-[var(--bg-card)] border-2 border-[var(--border-black)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          <kbd
            className="absolute right-2 text-[10px] font-mono font-bold px-1 border border-[var(--border-black)] text-[var(--text-muted)] pointer-events-none"
            title="Press / to search"
          >
            /
          </kbd>
        </form>

        {/* Actions: Feed Link, Theme Toggle & Write Blog */}
        <div className="flex items-center gap-2">
          <Link
            href="/feed"
            className="hidden sm:inline-flex items-center h-9 px-3 border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] font-mono text-xs font-black uppercase hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] transition-colors cursor-pointer"
            title="Browse all dispatches in Global Feed"
          >
            EXPLORE FEED ➔
          </Link>

          <button
            onClick={toggleTheme}
            className="h-9 px-3 border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] font-mono text-xs font-black uppercase hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] transition-colors cursor-pointer"
            title="Toggle Broadsheet Ink Mode"
          >
            {theme === "light" ? "✦ DARK" : "✦ LIGHT"}
          </button>

          <Link
            href="/editor"
            className="h-9 px-3.5 bg-[var(--text-main)] text-[var(--bg-canvas)] font-mono text-xs font-black uppercase tracking-wider border-2 border-[var(--border-black)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <span>➔</span>
            <span>WRITE BLOG</span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-9 w-9 flex items-center justify-center border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] font-mono text-lg font-black cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-[var(--border-black)] bg-[var(--bg-card)] p-4 flex flex-col gap-3 font-mono text-xs font-bold uppercase">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-2">
            <span className="absolute left-2.5 text-sm pointer-events-none text-[var(--text-muted)]">
              ☛
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH DISPATCHES..."
              className="w-full h-9 pl-7 pr-3 font-mono text-xs font-bold uppercase bg-[var(--bg-card)] border-2 border-[var(--border-black)] text-[var(--text-main)]"
            />
          </form>

          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 border border-[var(--border-black)] ${
                  isActive
                    ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                    : "text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
