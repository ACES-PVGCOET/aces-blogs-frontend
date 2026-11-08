"use client";

import React, { useState, useRef } from "react";
import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  FileCode,
  Minus,
  Link as LinkIcon,
  Unlink,
  ImageIcon,
  Undo,
  Redo,
  RemoveFormatting,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface TipTapToolbarProps {
  editor: Editor | null;
}

export default function TipTapToolbar({ editor }: TipTapToolbarProps) {
  // Modal states for inserting Links and Images
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageFileUrl, setImageFileUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageAlt, setImageAlt] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  // Handle setting a link
  const handleOpenLinkModal = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setShowLinkModal(true);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      let finalUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith("/") && !finalUrl.startsWith("#")) {
        finalUrl = `https://${finalUrl}`;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: finalUrl, target: "_blank" })
        .run();
    }
    setShowLinkModal(false);
    setLinkUrl("");
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  // Handle image file selection
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image exceeds 5MB limit.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const res = await apiClient.uploads.image(file);
      if (res?.url) {
        setImageFileUrl(res.url);
        return;
      }
    } catch (err) {
      console.warn("Backend image upload failed, falling back to local file reader:", err);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }

    // Fallback to local FileReader data URL
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) {
        setImageFileUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle setting an image
  const handleApplyImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFileUrl) {
      editor
        .chain()
        .focus()
        .setImage({
          src: imageFileUrl,
          alt: imageAlt.trim() || "Dispatch Figure",
          title: imageAlt.trim() || "Figure 1.0",
        })
        .run();
    }
    setShowImageModal(false);
    setImageFileUrl("");
    setImageAlt("");
  };

  return (
    <div className="border-b-2 border-[var(--border-black)] bg-[var(--bg-muted)] p-2 select-none">
      {/* Primary Toolbar Row */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Group 1: History (Undo/Redo) */}
        <div className="flex items-center border border-[var(--border-black)] bg-[var(--bg-card)] mr-1">
          <button
            type="button"
            title="Undo (Ctrl+Z)"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
            className="p-1.5 hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit cursor-pointer transition-colors"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
            className="p-1.5 hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit cursor-pointer transition-colors border-l border-[var(--border-subtle)]"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Group 2: Headings & Paragraph Selector */}
        <div className="flex items-center border border-[var(--border-black)] bg-[var(--bg-card)] mr-1">
          <button
            type="button"
            title="Normal Paragraph"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-2 py-1 font-mono text-xs font-black cursor-pointer transition-colors ${
              editor.isActive("paragraph") && !editor.isActive("heading")
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            ¶ P
          </button>
          <button
            type="button"
            title="Headline Level 1 (H1)"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 cursor-pointer border-l border-[var(--border-subtle)] transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Section Headline (H2)"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 cursor-pointer border-l border-[var(--border-subtle)] transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Sub-section Headline (H3)"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 cursor-pointer border-l border-[var(--border-subtle)] transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Group 3: Core Font Formatting Marks */}
        <div className="flex items-center border border-[var(--border-black)] bg-[var(--bg-card)] mr-1">
          <button
            type="button"
            title="Bold (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 cursor-pointer transition-colors ${
              editor.isActive("bold")
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Italics (Ctrl+I)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 cursor-pointer border-l border-[var(--border-subtle)] transition-colors ${
              editor.isActive("italic")
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Underline (Ctrl+U)"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 cursor-pointer border-l border-[var(--border-subtle)] transition-colors ${
              editor.isActive("underline")
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 cursor-pointer border-l border-[var(--border-subtle)] transition-colors ${
              editor.isActive("strike")
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Inline Code"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 cursor-pointer border-l border-[var(--border-subtle)] transition-colors ${
              editor.isActive("code")
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Highlight Text"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 cursor-pointer border-l border-[var(--border-subtle)] transition-colors ${
              editor.isActive("highlight")
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Group 4: Text Alignments */}
        <div className="flex items-center border border-[var(--border-black)] bg-[var(--bg-card)] mr-1">
          <button
            type="button"
            title="Align Left"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-1.5 cursor-pointer transition-colors ${
              editor.isActive({ textAlign: "left" })
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Align Center"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-1.5 cursor-pointer border-l border-[var(--border-subtle)] transition-colors ${
              editor.isActive({ textAlign: "center" })
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Align Right"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-1.5 cursor-pointer border-l border-[var(--border-subtle)] transition-colors ${
              editor.isActive({ textAlign: "right" })
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Align Justify (Broadsheet Column)"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`p-1.5 cursor-pointer border-l border-[var(--border-subtle)] transition-colors ${
              editor.isActive({ textAlign: "justify" })
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Group 5: Lists */}
        <div className="flex items-center border border-[var(--border-black)] bg-[var(--bg-card)] mr-1">
          <button
            type="button"
            title="Bullet List"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 cursor-pointer transition-colors ${
              editor.isActive("bulletList")
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Numbered List"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 cursor-pointer border-l border-[var(--border-subtle)] transition-colors ${
              editor.isActive("orderedList")
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Group 6: Blocks & Inserts */}
        <div className="flex items-center border border-[var(--border-black)] bg-[var(--bg-card)] mr-1">
          <button
            type="button"
            title="Pull Quote / Blockquote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 cursor-pointer transition-colors ${
              editor.isActive("blockquote")
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Syntax Code Block"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 cursor-pointer border-l border-[var(--border-subtle)] transition-colors ${
              editor.isActive("codeBlock")
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Horizontal Broadsheet Divider Rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 cursor-pointer border-l border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] text-[var(--text-main)] transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Group 7: Hyperlinks & Images */}
        <div className="flex items-center border border-[var(--border-black)] bg-[var(--bg-card)] mr-1">
          <button
            type="button"
            title={editor.isActive("link") ? "Edit Hyperlink" : "Insert Hyperlink"}
            onClick={handleOpenLinkModal}
            className={`p-1.5 cursor-pointer transition-colors ${
              editor.isActive("link")
                ? "bg-[var(--text-main)] text-[var(--bg-canvas)]"
                : "hover:bg-[var(--bg-subtle)] text-[var(--text-main)]"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          {editor.isActive("link") && (
            <button
              type="button"
              title="Remove Hyperlink"
              onClick={handleRemoveLink}
              className="p-1.5 cursor-pointer border-l border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] text-[var(--text-main)] transition-colors"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            title="Insert Technical Figure / Image"
            onClick={() => setShowImageModal(true)}
            className="p-1.5 cursor-pointer border-l border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] text-[var(--text-main)] transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Group 8: Format Reset */}
        <div className="flex items-center border border-[var(--border-black)] bg-[var(--bg-card)]">
          <button
            type="button"
            title="Clear All Markings & Reset Formatting"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="p-1.5 cursor-pointer hover:bg-[var(--bg-subtle)] text-[var(--text-main)] transition-colors"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Embedded Link Modal */}
      {showLinkModal && (
        <div className="mt-2 p-3 border-2 border-[var(--border-black)] bg-[var(--bg-card)] animate-fadeIn">
          <form onSubmit={handleApplyLink} className="flex flex-col sm:flex-row items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase text-[var(--text-muted)] whitespace-nowrap">
              LINK URL:
            </span>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com/research-spec"
              autoFocus
              className="flex-1 w-full px-2.5 py-1 text-xs font-mono border border-[var(--border-black)] bg-[var(--bg-canvas)] text-[var(--text-main)] focus:outline-none"
            />
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <button
                type="submit"
                className="btn-broadsheet text-xs py-1 px-2.5 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> APPLY
              </button>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="btn-broadsheet text-xs py-1 px-2 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Embedded Image Upload Modal */}
      {showImageModal && (
        <div className="mt-2 p-4 border-2 border-[var(--border-black)] bg-[var(--bg-card)] space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 font-mono text-xs font-bold uppercase">
            <span>INSERT TECHNICAL FIGURE (IMAGE UPLOAD)</span>
            <button
              type="button"
              onClick={() => {
                setShowImageModal(false);
                setImageFileUrl("");
                setImageAlt("");
              }}
              className="hover:underline cursor-pointer"
            >
              [ ✕ CLOSE ]
            </button>
          </div>

          <form onSubmit={handleApplyImage} className="space-y-3">
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase text-[var(--text-muted)] mb-1">
                UPLOAD FIGURE IMAGE (DEVICE FILE):
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageFileSelect}
                className="hidden"
              />

              {imageFileUrl ? (
                <div className="flex items-center gap-3 p-2.5 border-2 border-[var(--border-black)] bg-[var(--bg-muted)]">
                  <div className="w-16 h-14 border border-[var(--border-black)] bg-white overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img
                      src={imageFileUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 font-mono text-[11px] space-y-1">
                    <div className="text-[var(--text-main)] font-bold uppercase">Image ready to insert</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="btn-broadsheet text-[10px] py-0.5 px-2 cursor-pointer"
                      >
                        [ CHANGE FILE ]
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageFileUrl("")}
                        className="text-[10px] text-red-600 dark:text-red-400 font-bold hover:underline cursor-pointer"
                      >
                        [ REMOVE ]
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-3 border-2 border-dashed border-[var(--border-black)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-subtle)] font-mono text-xs font-bold uppercase text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>UPLOADING IMAGE FILE...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      <span>[ ⇪ CLICK TO UPLOAD IMAGE FILE ]</span>
                      <span className="text-[10px] text-[var(--text-muted)] lowercase font-normal">
                        supports PNG, JPG, GIF, WEBP (max 5MB)
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold uppercase text-[var(--text-muted)] mb-1">
                FIGURE CAPTION / ACCESSIBILITY ALT:
              </label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Figure 1.0 — Architecture Flowchart"
                className="w-full px-3 py-1.5 text-xs font-mono border border-[var(--border-black)] bg-[var(--bg-canvas)] text-[var(--text-main)] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setImageFileUrl("");
                  setImageAlt("");
                }}
                className="btn-broadsheet text-xs py-1 px-3 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={!imageFileUrl || isUploadingImage}
                className="btn-broadsheet btn-broadsheet-primary text-xs py-1 px-3 disabled:opacity-40 cursor-pointer"
              >
                INSERT FIGURE ➔
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
