"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="mt-auto border-t-4 border-[var(--border-black)] bg-[var(--bg-card)] w-full">
      {/* Top Colophon Line */}
      <div className="double-rule-thick my-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Editorial Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-[var(--text-main)] text-[var(--bg-canvas)] font-heading text-xl font-black flex items-center justify-center border-2 border-[var(--border-black)] select-none">
                A
              </span>
              <span className="font-heading text-2xl font-black uppercase tracking-wider text-[var(--text-main)]">
                ACES Gazette
              </span>
            </div>
            <p className="font-serif text-xs leading-relaxed text-[var(--text-muted)]">
              The official academic technical chronicle and editorial publishing platform of the
              Department of Computer Engineering, ACES PVGCOET Pune.
            </p>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--text-main)] pt-2 border-t border-[var(--border-black)]">
              VERIFIED FOLIO · ISSUE XXIV · VOLUME 11
            </div>
          </div>

          {/* Column 2: Sections & Navigation */}
          <div className="space-y-2">
            <h4 className="font-heading text-sm uppercase tracking-wider border-b-2 border-[var(--border-black)] pb-1 mb-2 text-[var(--text-main)]">
              Broadsheet Sections
            </h4>
            <ul className="space-y-1.5 font-mono text-xs uppercase font-bold">
              <li>
                <Link href="/" className="hover:underline text-[var(--text-main)] cursor-pointer">
                  ➔ Front Page (Home)
                </Link>
              </li>
              <li>
                <Link href="/feed" className="hover:underline text-[var(--text-main)] cursor-pointer">
                  ➔ Global Dispatches Feed
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:underline text-[var(--text-main)] cursor-pointer">
                  ➔ Writer Profile & Desk
                </Link>
              </li>
              <li>
                <Link href="/editor" className="hover:underline text-[var(--text-main)] cursor-pointer">
                  ➔ Dedicated Blog Editor
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="hover:underline text-[var(--text-main)] cursor-pointer">
                  ➔ Campus Rankings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Engineering Divisions */}
          <div className="space-y-2">
            <h4 className="font-heading text-sm uppercase tracking-wider border-b-2 border-[var(--border-black)] pb-1 mb-2 text-[var(--text-main)]">
              Technical Beats
            </h4>
            <ul className="space-y-1 font-mono text-xs uppercase text-[var(--text-muted)]">
              <li>• Kernel Architecture & eBPF</li>
              <li>• Systems & Compiler Theory</li>
              <li>• Distributed Consensus & Raft</li>
              <li>• Applied Cryptography & ZKP</li>
              <li>• High-Scale Web Infrastructure</li>
              <li>• Quantum Search & Algorithmic Bounds</li>
            </ul>
          </div>

          {/* Column 4: Press Accreditation */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm uppercase tracking-wider border-b-2 border-[var(--border-black)] pb-1 mb-2 text-[var(--text-main)]">
              Editorial Colophon
            </h4>
            <p className="font-serif text-xs leading-relaxed text-[var(--text-muted)]">
              Printed in dual-proof ink. Set in high-contrast Anton, Merriweather, and Courier Prime.
              Strict zero-radius border rules enforced across all viewports.
            </p>
            <div className="p-2 border-2 border-dashed border-[var(--border-black)] font-mono text-[11px] font-bold text-center uppercase text-[var(--text-main)]">
              ★ PEER REVIEWED & FACULTY ACCREDITED
            </div>
            <button
              onClick={scrollToTop}
              className="btn-broadsheet text-xs py-1 px-3 w-full cursor-pointer"
            >
              [ ⌃ BACK TO TOP OF FOLIO ]
            </button>
          </div>
        </div>

        {/* Bottom Rule and Copyright */}
        <div className="double-rule-thin my-4" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[var(--text-muted)] uppercase">
          <div>
            © 2026 ACES PVGCOET · DEPARTMENT OF COMPUTER ENGINEERING · ALL RIGHTS ACCREDITED
          </div>
          <div className="flex items-center gap-4 font-bold">
            <span className="text-[var(--text-main)]">PROOFS: DUAL-INK CONTRAST</span>
            <span>CIRCULATION: VERIFIED ACADEMIC</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
