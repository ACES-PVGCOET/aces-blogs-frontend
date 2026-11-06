"use client";

import React, { useState } from "react";
import { WriterProfile } from "@/lib/types";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: WriterProfile;
  onSave: (updated: WriterProfile) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [profileImg, setProfileImg] = useState(profile.profileImg);
  const [bio, setBio] = useState(profile.bio);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const cleanUsername = username.replace(/^@/, "").trim();
    const updated: WriterProfile = {
      ...profile,
      name: name.trim(),
      username: cleanUsername,
      profileImg: profileImg.trim(),
      bio: bio.trim(),
    };

    // 1. Save to LocalStorage
    try {
      localStorage.setItem("aces_user_profile", JSON.stringify(updated));
    } catch {}

    // 2. Sync to API if available
    try {
      await fetch(`/api/profile/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updated.name,
          username: updated.username,
          avatarUrl: updated.profileImg,
          bio: updated.bio,
        }),
      });
    } catch (err) {
      console.warn("Backend sync failed, stored in localStorage:", err);
    }

    setIsSaving(false);
    onSave(updated);
    onClose();
  };

  return (
    <div
      className="snappy-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="snappy-modal-pane" style={{ maxWidth: "580px" }}>
        {/* Head */}
        <div className="snappy-modal-head">
          <span className="snappy-modal-title">AUTHOR CREDENTIALS DESK</span>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-sm font-black px-2 py-1 border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)]"
          >
            [ ✕ ]
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="snappy-modal-content space-y-4">
          <div className="flex gap-4 items-center p-3 border-2 border-[var(--border-black)] bg-[var(--bg-muted)]">
            <div className="w-16 h-16 border-2 border-[var(--border-black)] bg-[var(--bg-card)] overflow-hidden flex-shrink-0">
              {profileImg ? (
                <img
                  src={profileImg}
                  alt="Preview"
                  className="w-full h-full object-cover filter grayscale"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
                  }}
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center font-heading text-xl">
                  {name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 font-mono text-xs">
              <div className="font-bold uppercase text-[var(--text-main)]">
                HALFTONE PRESS PORTRAIT PREVIEW
              </div>
              <div className="text-[var(--text-muted)] text-[11px]">
                133-LPI letterpress screen applied to author credentials
              </div>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-1 text-[var(--text-main)]">
              Full Author Name:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 font-mono text-sm border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-1 text-[var(--text-main)]">
              Handle Slug (@username):
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-10 px-3 font-mono text-sm border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-1 text-[var(--text-main)]">
              Photo URL (Halftone Portrait):
            </label>
            <input
              type="url"
              required
              value={profileImg}
              onChange={(e) => setProfileImg(e.target.value)}
              placeholder="https://..."
              className="w-full h-10 px-3 font-mono text-sm border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-1 text-[var(--text-main)]">
              Investigative Beat & Biography:
            </label>
            <textarea
              rows={4}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 font-serif text-sm border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none resize-none"
            />
          </div>

          {/* Foot */}
          <div className="pt-4 flex justify-end gap-3 border-t-2 border-[var(--border-black)]">
            <button
              type="button"
              onClick={onClose}
              className="btn-broadsheet"
            >
              [ ✕ CANCEL ]
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-broadsheet btn-broadsheet-primary"
            >
              {isSaving ? "SAVING..." : "[ ✔ UPDATE CREDENTIALS ]"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
