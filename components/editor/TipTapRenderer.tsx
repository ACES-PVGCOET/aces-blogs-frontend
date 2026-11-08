"use client";

import React from "react";
import { JSONContent } from "@tiptap/react";
import { safeParseTipTapJson } from "@/lib/tiptap-utils";

interface TipTapRendererProps {
  content: string | JSONContent | null | undefined;
  className?: string;
  enableDropCap?: boolean;
}

/**
 * Render a single TipTap text node with its associated marks (bold, italic, underline, link, etc.)
 */
function renderTextNodeWithMarks(node: JSONContent, key: React.Key): React.ReactNode {
  if (!node.text) return null;

  let element: React.ReactNode = node.text;

  if (node.marks && Array.isArray(node.marks)) {
    // Wrap marks in reverse order or standard order
    for (const mark of node.marks) {
      switch (mark.type) {
        case "bold":
          element = <strong key={mark.type} className="font-black">{element}</strong>;
          break;
        case "italic":
          element = <em key={mark.type} className="italic">{element}</em>;
          break;
        case "underline":
          element = <u key={mark.type} className="underline underline-offset-3">{element}</u>;
          break;
        case "strike":
          element = <s key={mark.type} className="line-through">{element}</s>;
          break;
        case "code":
          element = (
            <code
              key={mark.type}
              className="font-mono text-xs px-1.5 py-0.5 border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-main)]"
            >
              {element}
            </code>
          );
          break;
        case "highlight":
          element = (
            <mark
              key={mark.type}
              className="bg-yellow-200 dark:bg-yellow-800 text-[var(--text-main)] px-1 py-0.5"
            >
              {element}
            </mark>
          );
          break;
        case "link":
          element = (
            <a
              key={mark.type}
              href={typeof mark.attrs?.href === "string" ? mark.attrs.href : "#"}
              target={typeof mark.attrs?.target === "string" ? mark.attrs.target : "_blank"}
              rel="noopener noreferrer"
              className="font-bold underline underline-offset-3 hover:opacity-75 transition-opacity"
            >
              {element}
            </a>
          );
          break;
        default:
          break;
      }
    }
  }

  return <React.Fragment key={key}>{element}</React.Fragment>;
}

/**
 * Render child content of any block node
 */
function renderChildren(children?: JSONContent[]): React.ReactNode {
  if (!children || children.length === 0) return null;
  return children.map((child, idx) => {
    if (child.type === "text") {
      return renderTextNodeWithMarks(child, idx);
    }
    return <NodeRenderer key={idx} node={child} index={idx} isFirstChild={idx === 0} />;
  });
}

/**
 * Get CSS style object for alignment
 */
function getAlignmentStyle(attrs?: Record<string, unknown>): React.CSSProperties {
  if (!attrs?.textAlign || typeof attrs.textAlign !== "string") return {};
  return { textAlign: attrs.textAlign as React.CSSProperties["textAlign"] };
}

/**
 * Recursive Node Renderer for TipTap Schema
 */
function NodeRenderer({
  node,
  index,
  isFirstChild,
  enableDropCap,
}: {
  node: JSONContent;
  index: number;
  isFirstChild?: boolean;
  enableDropCap?: boolean;
}) {
  const alignStyle = getAlignmentStyle(node.attrs);

  switch (node.type) {
    case "heading": {
      const level = Number(node.attrs?.level) || 1;
      if (level === 1) {
        return (
          <h1
            style={alignStyle}
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[var(--text-main)] my-6 leading-tight"
          >
            {renderChildren(node.content)}
          </h1>
        );
      }
      if (level === 2) {
        return (
          <h2
            style={alignStyle}
            className="font-heading text-2xl sm:text-3xl font-black uppercase text-[var(--text-main)] mt-8 mb-4 border-b-2 border-[var(--border-black)] pb-1"
          >
            {renderChildren(node.content)}
          </h2>
        );
      }
      return (
        <h3
          style={alignStyle}
          className="font-heading text-xl sm:text-2xl font-black uppercase text-[var(--text-main)] mt-6 mb-3"
        >
          {renderChildren(node.content)}
        </h3>
      );
    }

    case "paragraph": {
      const isDrop = isFirstChild && enableDropCap;
      return (
        <p
          style={alignStyle}
          className={`font-serif text-base sm:text-lg leading-relaxed text-[var(--text-body)] mb-4 ${
            isDrop ? "drop-cap" : ""
          }`}
        >
          {renderChildren(node.content)}
        </p>
      );
    }

    case "blockquote":
      return (
        <blockquote
          style={alignStyle}
          className="border-l-4 border-[var(--border-black)] bg-[var(--bg-muted)] p-4 my-6 font-serif text-base sm:text-lg italic text-[var(--text-main)]"
        >
          {renderChildren(node.content)}
        </blockquote>
      );

    case "bulletList":
      return (
        <ul className="list-disc list-outside pl-6 space-y-2 font-serif text-base text-[var(--text-body)] my-4">
          {renderChildren(node.content)}
        </ul>
      );

    case "orderedList":
      return (
        <ol className="list-decimal list-outside pl-6 space-y-2 font-serif text-base text-[var(--text-body)] my-4">
          {renderChildren(node.content)}
        </ol>
      );

    case "listItem":
      return <li className="leading-relaxed">{renderChildren(node.content)}</li>;

    case "codeBlock":
      return (
        <div className="my-6 border-2 border-[var(--border-black)] bg-[var(--bg-card)]">
          <div className="flex items-center justify-between px-3 py-1 bg-[var(--bg-muted)] border-b border-[var(--border-black)] font-mono text-[10px] font-bold uppercase text-[var(--text-muted)]">
            <span>{typeof node.attrs?.language === "string" ? node.attrs.language : "TELEMETRY CODE TRACE"}</span>
            <span>READ-ONLY PROTOCOL</span>
          </div>
          <pre className="p-4 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto text-[var(--text-main)] bg-[var(--bg-subtle)]">
            <code>{node.content?.[0]?.text || ""}</code>
          </pre>
        </div>
      );

    case "horizontalRule":
      return <hr className="double-rule-thick my-8" />;

    case "image":
      return (
        <figure className="my-6 border-3 border-[var(--border-black)] bg-[var(--bg-card)] p-2">
          <div className="overflow-hidden bg-[var(--bg-muted)]">
            <img
              src={typeof node.attrs?.src === "string" ? node.attrs.src : ""}
              alt={(typeof node.attrs?.alt === "string" ? node.attrs.alt : null) || "Broadsheet Figure"}
              className="w-full max-h-[500px] object-cover filter grayscale contrast-125 mx-auto"
            />
          </div>
          {(node.attrs?.title || node.attrs?.alt) && (
            <figcaption className="mt-2 text-center font-mono text-xs font-bold uppercase text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-1.5">
              FIGURE: {String(node.attrs?.title || node.attrs?.alt)}
            </figcaption>
          )}
        </figure>
      );

    default:
      if (node.content) {
        return <div key={index}>{renderChildren(node.content)}</div>;
      }
      return null;
  }
}

/**
 * Fallback renderer for plain text or markdown formatted content
 */
function LegacyContentRenderer({ text, enableDropCap }: { text: string; enableDropCap?: boolean }) {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="space-y-4 font-serif text-base sm:text-lg leading-relaxed text-[var(--text-body)]">
      {paragraphs.map((para, idx) => {
        const trimmed = para.trim();

        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={idx}
              className="font-heading text-xl sm:text-2xl font-black uppercase text-[var(--text-main)] mt-6 mb-2"
            >
              {trimmed.slice(4)}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="font-heading text-2xl sm:text-3xl font-black uppercase text-[var(--text-main)] mt-8 mb-3 border-b-2 border-[var(--border-black)] pb-1"
            >
              {trimmed.slice(3)}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1
              key={idx}
              className="font-heading text-3xl sm:text-4xl font-black uppercase text-[var(--text-main)] my-6"
            >
              {trimmed.slice(2)}
            </h1>
          );
        }
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-[var(--border-black)] bg-[var(--bg-muted)] p-4 my-4 italic"
            >
              {trimmed.slice(2)}
            </blockquote>
          );
        }

        return (
          <p
            key={idx}
            className={`whitespace-pre-line leading-relaxed ${
              idx === 0 && enableDropCap ? "drop-cap" : ""
            }`}
          >
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Main TipTap Renderer Component
 * Renders both TipTap JSON output and legacy content cleanly.
 */
export default function TipTapRenderer({
  content,
  className = "",
  enableDropCap = false,
}: TipTapRendererProps) {
  const parsedDoc = safeParseTipTapJson(content);

  if (parsedDoc && Array.isArray(parsedDoc.content)) {
    return (
      <div className={`broadsheet-tiptap-content ${className}`}>
        {parsedDoc.content.map((child, idx) => (
          <NodeRenderer
            key={idx}
            node={child}
            index={idx}
            isFirstChild={idx === 0}
            enableDropCap={enableDropCap}
          />
        ))}
      </div>
    );
  }

  // Fallback to legacy text rendering if not TipTap JSON
  return (
    <div className={`broadsheet-tiptap-content ${className}`}>
      <LegacyContentRenderer
        text={typeof content === "string" ? content : ""}
        enableDropCap={enableDropCap}
      />
    </div>
  );
}
