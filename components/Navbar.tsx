"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[var(--bg-card)] border-b-4 border-[var(--border-black)]">
        {/* Folio ticker banner */}
        <div className="bg-[var(--text-main)] text-[var(--bg-canvas)] py-1.5 px-4 text-[11px] font-mono font-bold tracking-widest text-center uppercase border-b border-[var(--border-black)] flex items-center justify-between">
          <span className="hidden sm:inline">PVGCOET CAMPUS</span>
          <span>ACES BLOGS · TECHNICAL PUBLISHING &amp; EDITORIAL GAZETTE</span>
          <span className="hidden sm:inline">PEER-REVIEWED</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand Shield & Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 flex items-center justify-center font-heading text-2xl font-black border-2 border-[var(--border-black)] hover:opacity-90 select-none cursor-pointer"
              style={{
                backgroundColor: "var(--text-main)",
                color: "var(--bg-canvas)",
              }}
              aria-label="ACES Blog Home"
            >
              <span style={{ color: "var(--bg-canvas)" }}>A</span>
            </Link>
            <Link href="/" className="flex flex-col cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="font-heading text-xl sm:text-2xl font-black tracking-wide uppercase text-[var(--text-main)]">
                  Blog Aces
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 border border-[var(--border-black)] uppercase bg-[var(--bg-card)] text-[var(--text-main)]">
                  PVGCOET
                </span>
                <span className="font-mono text-[10px] font-black px-1.5 py-0.5 border border-[var(--border-black)] uppercase bg-amber-400 text-black tracking-wider">
                  PREVIEW
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
                  className={`nav-link-broadsheet ${isActive ? "active" : ""}`}
                  style={
                    isActive
                      ? {
                          backgroundColor: "var(--text-main)",
                          color: "var(--bg-canvas)",
                          borderColor: "var(--border-black)",
                        }
                      : {
                          color: "var(--text-main)",
                        }
                  }
                >
                  <span
                    style={{
                      color: isActive ? "var(--bg-canvas)" : "inherit",
                    }}
                  >
                    {link.label}
                  </span>
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

          {/* Actions: Profile / Login, Theme Toggle */}
          <div className="flex items-center gap-2">
            {/* If user logged in: profile button opens /profile; else show log in button instead */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="h-9 px-2.5 border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] font-mono text-xs font-black uppercase hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Writer Profile"
                  aria-label="Writer Profile"
                >
                  {user.profileImg ? (
                    <img
                      src={user.profileImg}
                      alt={user.name}
                      className="w-4 h-4 object-cover border border-[var(--border-black)]"
                    />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5" />
                  )}
                  <span className="truncate max-w-[100px] hidden sm:inline">{user.name.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="h-9 px-2 border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-red-600 hover:text-white hover:border-red-600 font-mono text-xs font-black uppercase transition-colors cursor-pointer"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3 border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] font-mono text-xs font-black uppercase hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] transition-colors cursor-pointer"
                title="Log in"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>[ ☛ LOGIN ]</span>
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="h-9 px-3 border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] font-mono text-xs font-black uppercase hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] transition-colors cursor-pointer"
              title="Toggle Broadsheet Ink Mode"
            >
              {theme === "light" ? "✦ DARK" : "✦ LIGHT"}
            </button>

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

            {user ? (
              <div className="p-2 border-2 border-[var(--border-black)] bg-[var(--bg-muted)] flex items-center justify-between">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 hover:underline cursor-pointer"
                >
                  {user.profileImg ? (
                    <img
                      src={user.profileImg}
                      alt={user.name}
                      className="w-4 h-4 object-cover border border-[var(--border-black)]"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4" />
                  )}
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-red-600 dark:text-red-400 font-black cursor-pointer hover:underline"
                >
                  [LOGOUT]
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-3 border-2 border-[var(--border-black)] text-center font-black cursor-pointer flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: "var(--text-main)",
                  color: "var(--bg-canvas)",
                }}
              >
                <LogIn className="w-3.5 h-3.5" style={{ color: "var(--bg-canvas)" }} />
                <span style={{ color: "var(--bg-canvas)" }}>[ ☛ LOGIN ]</span>
              </button>
            )}

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
                  className={`nav-link-broadsheet w-full justify-start text-left border border-[var(--border-black)] ${
                    isActive ? "active" : ""
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: "var(--text-main)",
                          color: "var(--bg-canvas)",
                          borderColor: "var(--border-black)",
                        }
                      : {
                          color: "var(--text-main)",
                        }
                  }
                >
                  <span
                    style={{
                      color: isActive ? "var(--bg-canvas)" : "inherit",
                    }}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Login Dialog Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
