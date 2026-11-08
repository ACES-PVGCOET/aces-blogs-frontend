"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, ShieldAlert, CheckCircle2 } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
}: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Authentication failed. Check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md border-4 border-[var(--border-black)] bg-[var(--bg-card)] shadow-[10px_10px_0px_var(--border-black)] animate-in fade-in zoom-in-95 duration-150">
        {/* Folio Masthead */}
        <div className="flex items-center justify-between border-b-3 border-[var(--border-black)] bg-[var(--bg-muted)] px-4 py-2.5 font-mono text-xs font-black uppercase text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="bg-[var(--text-main)] px-1.5 py-0.5 text-[var(--bg-canvas)]">
              AUTH DESK
            </span>
            <span className="text-[var(--text-main)]">PRESS PASS ENTRY</span>
          </div>
          <button
            onClick={onClose}
            className="text-base font-bold text-[var(--text-main)] hover:opacity-70 cursor-pointer"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Content Header */}
        <div className="p-6 pb-2 space-y-2">
          <h2 className="font-heading text-3xl font-black uppercase tracking-tight text-[var(--text-main)]">
            Fellow Credentials Login
          </h2>
          <p className="font-serif text-xs text-[var(--text-muted)] leading-relaxed">
            Enter your ACES editorial chronicle credentials to manage
            dispatches, review manuscripts, or file new research papers.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          {error && (
            <div className="border-2 border-red-600 bg-red-100 dark:bg-red-950 dark:border-red-500 p-3 font-mono text-xs font-bold text-red-900 dark:text-red-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block font-mono text-xs font-bold uppercase text-[var(--text-muted)]">
              REGISTERED FELLOW EMAIL:
            </label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="author@aces.org"
                className="w-full h-10 pl-8 pr-3 font-mono text-xs font-bold border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-mono text-xs font-bold uppercase text-[var(--text-muted)]">
              PASSWORD TOKEN:
            </label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 pl-8 pr-3 font-mono text-xs font-bold border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-broadsheet text-xs py-2.5 px-4 cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-broadsheet btn-broadsheet-primary text-xs py-2.5 px-5 flex-1 cursor-pointer flex items-center justify-center gap-2 shadow-[3px_3px_0px_var(--border-black)]"
            >
              {loading ? (
                <span>VERIFYING PASS...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>[ ➔ ENTER WORKBENCH ]</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
