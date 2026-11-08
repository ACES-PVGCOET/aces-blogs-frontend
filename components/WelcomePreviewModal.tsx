"use client";

import React, { useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";

export default function WelcomePreviewModal() {
  const [isOpen, setIsOpen] = useState(false);

  const fireConfetti = useCallback(() => {
    try {
      // Primary burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 99999,
      });

      // Side cannons for rich celebration
      const count = 150;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 99999,
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } catch (err) {
      console.warn("Confetti animation failed:", err);
    }
  }, []);

  useEffect(() => {
    try {
      const isVisited = localStorage.getItem("isVisited");
      const acknowledged = localStorage.getItem("aces_welcome_acknowledged");

      if (!isVisited || !acknowledged) {
        requestAnimationFrame(() => {
          setIsOpen(true);
          fireConfetti();
        });
      }
    } catch {
      // LocalStorage access may fail in rare sandboxed environments
    }
  }, [fireConfetti]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem("isVisited", "true");
      localStorage.setItem("aces_welcome_acknowledged", "true");
    } catch {}
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-lg border-4 border-[var(--border-black)] bg-[var(--bg-card)] shadow-[10px_10px_0px_var(--border-black)] animate-in fade-in zoom-in-95 duration-150">
        {/* Folio Masthead Bar */}
        <div className="flex items-center justify-between border-b-3 border-[var(--border-black)] bg-[var(--bg-muted)] px-4 py-2.5 font-mono text-xs font-black uppercase text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="bg-[var(--text-main)] px-1.5 py-0.5 text-[var(--bg-canvas)]">
              PREVIEW DESK
            </span>
            <span className="text-[var(--text-main)]">EARLY ACCESS DISPATCH</span>
          </div>
          <button
            onClick={handleClose}
            className="text-base font-bold text-[var(--text-main)] hover:opacity-70 cursor-pointer"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b-2 border-[var(--border-black)] bg-[var(--bg-card)]">
          <div className="inline-flex items-center gap-1.5 mb-2 font-mono text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-[var(--border-black)] bg-amber-400 text-black">
            ★ PREVIEW RELEASE
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--text-main)] leading-tight">
            Welcome to ACES Blogs! 👋
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 font-serif text-sm leading-relaxed text-[var(--text-body)]">
          <p>
            Thanks for stopping by! You’re getting an early look at our preview release.
            Since we’re still actively building and fine-tuning things, you might run
            into a few bugs, rough edges, or missing features along the way.
          </p>
          <p>
            If you spot something broken or have ideas for features you’d love to see,
            let us know at{" "}
            <a
              href="mailto:aces@pvgcoet.ac.in"
              className="font-mono font-bold underline decoration-2 underline-offset-2 hover:opacity-80 text-[var(--text-main)]"
            >
              aces@pvgcoet.ac.in
            </a>
            . Your feedback makes a huge difference!
          </p>
          <div className="pt-3 font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] border-t border-[var(--border-black)]/30">
            <div>Happy reading,</div>
            <div className="text-[var(--text-main)] font-black text-sm mt-0.5">
              The Dev Team
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 pt-0 flex items-center justify-end">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2.5 border-2 border-[var(--border-black)] bg-[var(--text-main)] text-[var(--bg-canvas)] font-mono text-xs font-black uppercase tracking-wider hover:opacity-90 cursor-pointer shadow-[3px_3px_0px_var(--border-black)]"
          >
            [ ☛ EXPLORE ACES BLOGS ]
          </button>
        </div>
      </div>
    </div>
  );
}
