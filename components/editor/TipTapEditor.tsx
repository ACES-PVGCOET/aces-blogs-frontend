"use client";

import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

import TipTapToolbar from "./TipTapToolbar";

interface TipTapEditorProps {
  initialContent: JSONContent;
  onChange: (json: JSONContent, text: string) => void;
  className?: string;
}

export default function TipTapEditor({
  initialContent,
  onChange,
  className = "",
}: TipTapEditorProps) {
  const isLocalChangeRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "font-bold underline underline-offset-3 cursor-pointer text-[var(--text-main)]",
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "editor-image border-3 border-[var(--border-black)] my-4 max-w-full h-auto mx-auto",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: "Write your technical analysis, proof, or architecture dispatch here...",
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      isLocalChangeRef.current = true;
      const json = editor.getJSON();
      const text = editor.getText();
      onChange(json, text);
      setTimeout(() => {
        isLocalChangeRef.current = false;
      }, 50);
    },
    editorProps: {
      attributes: {
        class:
          "tiptap prose-editor min-h-[420px] p-4 sm:p-6 focus:outline-none font-serif text-base sm:text-lg leading-relaxed text-[var(--text-body)]",
      },
    },
  });

  // When initialContent changes from an external source (e.g. switching between articles)
  useEffect(() => {
    if (editor && initialContent && !isLocalChangeRef.current && !editor.isFocused) {
      const currentJson = editor.getJSON();
      // Only set if different
      if (JSON.stringify(currentJson) !== JSON.stringify(initialContent)) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [initialContent, editor]);

  const wordCount = editor ? editor.getText().split(/\s+/).filter(Boolean).length : 0;
  const characterCount = editor ? editor.getText().length : 0;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      className={`border-4 border-[var(--border-black)] bg-[var(--bg-card)] flex flex-col ${className}`}
    >
      {/* 1. Broadsheet Folio Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-muted)] border-b-2 border-[var(--border-black)] font-mono text-[11px] font-black uppercase text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <span className="bg-[var(--text-main)] text-[var(--bg-canvas)] px-1.5 py-0.5">
            TIPTAP ENGINE
          </span>
          <span className="text-[var(--text-main)]">RICH BROADSHEET COMPOSER</span>
        </div>
        <div className="flex items-center gap-3">
          <span>WYSIWYG MODE</span>
          <span className="text-[var(--text-main)] font-black">● LIVE SYNC</span>
        </div>
      </div>

      {/* 2. Rich Editing Toolbar */}
      <TipTapToolbar editor={editor} />

      {/* 3. Editor Content Canvas */}
      <div className="flex-1 overflow-y-auto bg-[var(--bg-card)] max-h-[750px]">
        <EditorContent editor={editor} />
      </div>

      {/* 4. Bottom Editorial Telemetry Status Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[var(--bg-muted)] border-t-2 border-[var(--border-black)] font-mono text-[11px] font-bold uppercase text-[var(--text-muted)] gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[var(--text-main)] font-black">{wordCount} WORDS</span>
          <span>•</span>
          <span>{characterCount} CHARACTERS</span>
          <span>•</span>
          <span>~{estimatedReadTime} MIN READ TIME</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-1 border border-[var(--border-black)] bg-[var(--bg-card)] text-[var(--text-main)] text-[10px]">
            JSON STORAGE READY
          </span>
          <span className="text-[10px]">ACES BROADSHEET FORMAT</span>
        </div>
      </div>
    </div>
  );
}
