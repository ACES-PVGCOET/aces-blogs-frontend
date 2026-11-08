import { JSONContent } from "@tiptap/react";

export const EMPTY_DISPATCH_JSON: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

/**
 * Type guard for checking if an object is a TipTap doc JSON
 */
export function isTipTapDoc(obj: unknown): obj is JSONContent {
  if (!obj || typeof obj !== "object") return false;
  const candidate = obj as Record<string, unknown>;
  return candidate.type === "doc" && Array.isArray(candidate.content);
}

/**
 * Safely parse a raw string or object into a TipTap JSON document.
 * Returns null if the input is not valid TipTap JSON.
 */
export function safeParseTipTapJson(raw: unknown): JSONContent | null {
  if (!raw) return null;

  if (isTipTapDoc(raw)) {
    return raw;
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (isTipTapDoc(parsed)) {
          return parsed;
        }
      } catch {
        // Not valid JSON
      }
    }
  }

  return null;
}

/**
 * Convert legacy plain text or Markdown into a clean TipTap JSON document.
 */
export function convertTextOrMarkdownToTipTap(rawText: string): JSONContent {
  const parsed = safeParseTipTapJson(rawText);
  if (parsed) return parsed;

  const text = (rawText || "").trim();
  if (!text) {
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
        },
      ],
    };
  }

  const lines = text.split("\n");
  const contentNodes: JSONContent[] = [];
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code fences
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        contentNodes.push({
          type: "codeBlock",
          attrs: { language: codeBlockLang || "text" },
          content: [
            {
              type: "text",
              text: codeBlockBuffer.join("\n"),
            },
          ],
        });
        codeBlockBuffer = [];
        inCodeBlock = false;
        codeBlockLang = "";
      } else {
        inCodeBlock = true;
        codeBlockLang = line.trim().replace(/^```/, "").trim();
        codeBlockBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    // Headings
    if (trimmed.startsWith("### ")) {
      contentNodes.push({
        type: "heading",
        attrs: { level: 3, textAlign: "left" },
        content: [{ type: "text", text: trimmed.slice(4).trim() }],
      });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      contentNodes.push({
        type: "heading",
        attrs: { level: 2, textAlign: "left" },
        content: [{ type: "text", text: trimmed.slice(3).trim() }],
      });
      continue;
    }

    if (trimmed.startsWith("# ")) {
      contentNodes.push({
        type: "heading",
        attrs: { level: 1, textAlign: "left" },
        content: [{ type: "text", text: trimmed.slice(2).trim() }],
      });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      contentNodes.push({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            attrs: { textAlign: "left" },
            content: [{ type: "text", text: trimmed.slice(2).trim() }],
          },
        ],
      });
      continue;
    }

    // Horizontal Rule
    if (trimmed === "---" || trimmed === "***") {
      contentNodes.push({ type: "horizontalRule" });
      continue;
    }

    // Simple paragraph (preserve basic text)
    contentNodes.push({
      type: "paragraph",
      attrs: { textAlign: "left" },
      content: [{ type: "text", text: trimmed }],
    });
  }

  // Close unclosed code block if any
  if (inCodeBlock && codeBlockBuffer.length > 0) {
    contentNodes.push({
      type: "codeBlock",
      attrs: { language: codeBlockLang || "text" },
      content: [{ type: "text", text: codeBlockBuffer.join("\n") }],
    });
  }

  if (contentNodes.length === 0) {
    contentNodes.push({
      type: "paragraph",
    });
  }

  return {
    type: "doc",
    content: contentNodes,
  };
}

/**
 * Extract plain text string recursively from a TipTap document node.
 */
export function extractPlainTextFromDoc(node: JSONContent | null | undefined): string {
  if (!node) return "";
  let text = "";

  if (node.text) {
    text += node.text;
  }

  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      text += " " + extractPlainTextFromDoc(child);
    }
  }

  return text.trim();
}

/**
 * Calculate editorial manuscript metrics: words, characters, and estimated read time.
 */
export function calculateDocStats(doc: JSONContent | null | undefined) {
  const plainText = extractPlainTextFromDoc(doc);
  const words = plainText.split(/\s+/).filter(Boolean).length;
  const characters = plainText.length;
  const wpm = 200; // Average reading speed for technical papers
  const readTimeMinutes = Math.max(1, Math.ceil(words / wpm));

  const nodeCount = doc?.content?.length || 0;
  const readTimeString = `${readTimeMinutes} min read`;
  return {
    words,
    wordCount: words,
    characters,
    charCount: characters,
    readTimeMinutes,
    readTimeString,
    readTime: readTimeString,
    nodeCount,
  };
}

/**
 * Serialize a TipTap JSON document to a clean string suitable for DB storage.
 */
export function serializeTipTapForDb(doc: JSONContent): string {
  return JSON.stringify(doc, null, 2);
}
