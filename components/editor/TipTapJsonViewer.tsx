"use client";

import React, { useState } from "react";
import { JSONContent } from "@tiptap/react";
import { Copy, Check, Download, Database, FileCode } from "lucide-react";

interface TipTapJsonViewerProps {
  jsonDoc: JSONContent | null;
  blogTitle?: string;
}

export default function TipTapJsonViewer({ jsonDoc, blogTitle = "manuscript" }: TipTapJsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const formattedJson = jsonDoc
    ? JSON.stringify(jsonDoc, null, isCompact ? 0 : 2)
    : "{}";

  const payloadSizeKb = (new Blob([formattedJson]).size / 1024).toFixed(2);
  const nodeCount = jsonDoc?.content?.length || 0;

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const filename = `${blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "blog"}-tiptap-doc.json`;
    const blob = new Blob([formattedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] flex flex-col h-full font-mono text-xs">
      {/* Top Folio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[var(--bg-muted)] border-b-2 border-[var(--border-black)]">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[var(--text-main)]" />
          <span className="font-heading text-sm font-black uppercase text-[var(--text-main)]">
            DATABASE JSON OUTPUT ENGINE
          </span>
          <span className="px-1.5 py-0.5 bg-[var(--text-main)] text-[var(--bg-canvas)] text-[10px] font-bold">
            TYPE: DOC
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCompact(!isCompact)}
            className="px-2 py-1 border border-[var(--border-black)] bg-[var(--bg-card)] hover:bg-[var(--text-main)] hover:text-[var(--bg-canvas)] font-bold cursor-pointer transition-colors"
          >
            {isCompact ? "[ PRETTY INDENT ]" : "[ COMPACT JSON ]"}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="btn-broadsheet text-xs py-1 px-2.5 flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span>COPIED TO CLIPBOARD</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY DATABASE JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="btn-broadsheet btn-broadsheet-primary text-xs py-1 px-2.5 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT .JSON</span>
          </button>
        </div>
      </div>

      {/* Payload Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] text-[11px] font-bold uppercase">
        <div>
          <span className="text-[var(--text-muted)] block text-[10px]">PAYLOAD SIZE:</span>
          <span className="text-[var(--text-main)] font-black">{payloadSizeKb} KB</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block text-[10px]">TOP-LEVEL NODES:</span>
          <span className="text-[var(--text-main)] font-black">{nodeCount} NODES</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block text-[10px]">DOCUMENT SCHEMA:</span>
          <span className="text-[var(--text-main)] font-black">TIPTAP DOC v3</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block text-[10px]">DATABASE TARGET:</span>
          <span className="text-[var(--text-main)] font-black">POSTGRES / JSONB</span>
        </div>
      </div>

      {/* JSON Code Viewer */}
      <div className="flex-1 overflow-auto p-4 bg-[var(--bg-canvas)] max-h-[600px]">
        <pre className="font-mono text-xs leading-relaxed text-[var(--text-main)]">
          <code>{formattedJson}</code>
        </pre>
      </div>

      {/* Colophon Foot */}
      <div className="p-2.5 bg-[var(--bg-muted)] border-t border-[var(--border-black)] flex items-center justify-between text-[10px] text-[var(--text-muted)] font-bold uppercase">
        <span className="flex items-center gap-1">
          <FileCode className="w-3 h-3" /> READY FOR DIRECT PRISMA / REST / GRAPHQL MUTATION
        </span>
        <span>CONTENT-TYPE: APPLICATION/JSON</span>
      </div>
    </div>
  );
}
