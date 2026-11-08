"use client";

import React, { useState, useRef } from "react";
import { WriterProfile } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { ImageIcon, Loader2, X } from "lucide-react";

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
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image exceeds 5MB limit.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await apiClient.uploads.image(file);
      if (res?.url) {
        setProfileImg(res.url);
        return;
      }
    } catch (err: unknown) {
      console.warn("Backend image upload failed, falling back to local file reader:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }

    // Fallback to local FileReader data URL
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) {
        setProfileImg(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfileImg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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

    // 2. Sync to Backend API
    try {
      await apiClient.users.updateMe({
        bio: updated.bio,
        profileImg: updated.profileImg,
      });
    } catch (err) {
      console.warn("Backend user profile sync notice:", err);
    }

    setIsSaving(false);
    onSave(updated);
    onClose();
  };

  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AC";

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
          <span className="snappy-modal-title">EDIT AUTHOR CREDENTIALS</span>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-sm font-black px-2 py-1 border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] cursor-pointer"
          >
            [ ✕ ]
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="snappy-modal-content space-y-4">
          <div className="flex gap-4 items-center p-3 border-2 border-[var(--border-black)] bg-[var(--bg-muted)]">
            <div className="w-16 h-16 border-2 border-[var(--border-black)] bg-[var(--bg-card)] overflow-hidden flex-shrink-0 relative flex items-center justify-center">
              {profileImg ? (
                <img
                  src={profileImg}
                  alt="Preview"
                  className="w-full h-full object-cover filter grayscale"
                  onError={() => {
                    setProfileImg("");
                  }}
                />
              ) : (
                <span className="font-heading text-xl font-black text-[var(--text-main)] select-none">
                  {initials}
                </span>
              )}
            </div>
            <div className="flex-1 font-mono text-xs space-y-1.5">
              <div className="font-bold uppercase text-[var(--text-main)]">
                AUTHOR PORTRAIT FILE
              </div>
              <div className="text-[var(--text-muted)] text-[11px]">
                Upload image file from device (Max 5MB)
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 border border-[var(--border-black)] bg-[var(--bg-card)] text-[10px] font-bold uppercase hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <ImageIcon className="w-3 h-3" />
                  )}
                  <span>
                    {isUploading
                      ? "UPLOADING..."
                      : profileImg
                      ? "[ ⇪ CHANGE IMAGE ]"
                      : "[ ⇪ UPLOAD PORTRAIT ]"}
                  </span>
                </button>
                {profileImg && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2 py-1 border border-red-500 text-red-600 dark:text-red-400 bg-[var(--bg-card)] text-[10px] font-bold uppercase hover:bg-red-600 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>REMOVE</span>
                  </button>
                )}
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
              Biography &amp; Research Beat:
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your engineering focus, research beat or interests..."
              className="w-full p-3 font-serif text-sm border-2 border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none resize-none"
            />
          </div>

          {/* Foot */}
          <div className="pt-4 flex justify-end gap-3 border-t-2 border-[var(--border-black)]">
            <button
              type="button"
              onClick={onClose}
              className="btn-broadsheet cursor-pointer"
            >
              [ ✕ CANCEL ]
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-broadsheet btn-broadsheet-primary cursor-pointer"
            >
              {isSaving ? "SAVING..." : "[ ✔ UPDATE CREDENTIALS ]"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
