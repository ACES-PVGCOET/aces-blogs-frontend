"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import TiptapImage from "@tiptap/extension-image";
import { fileToDataUrl } from "@/lib/imageUtils";

type BlogEditorProps = {
  initialContent: JSONContent;
  onChange?: (content: JSONContent) => void;
  readOnly?: boolean;
};

type ToolbarButtonProps = {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
};

function ToolbarButton({
  label,
  onClick,
  active = false,
  disabled = false,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
        active
          ? "bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px bg-stone-200 dark:bg-stone-800" />;
}

const svgProps = {
  className: "h-4 w-4",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const BoldIcon = (
  <svg {...svgProps}>
    <path d="M6 4h8a4 4 0 0 1 0 8H6z" />
    <path d="M6 12h9a4 4 0 0 1 0 8H6z" />
  </svg>
);

const ItalicIcon = (
  <svg {...svgProps}>
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const UnderlineIcon = (
  <svg {...svgProps}>
    <path d="M6 4v6a6 6 0 0 0 12 0V4" />
    <line x1="4" y1="20" x2="20" y2="20" />
  </svg>
);

const StrikeIcon = (
  <svg {...svgProps}>
    <path d="M16 4H9a3 3 0 0 0-2.83 4" />
    <path d="M14 12a4 4 0 0 1 0 8H6" />
    <line x1="4" y1="12" x2="20" y2="12" />
  </svg>
);

const HeadingIcon = ({ level }: { level: 2 | 3 }) => (
  <svg {...svgProps}>
    <path d="M4 5v14" />
    <path d="M12 5v14" />
    <path d="M4 12h8" />
    <text
      x="15"
      y="18"
      fontSize="9"
      fontFamily="inherit"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      {level}
    </text>
  </svg>
);

const BulletListIcon = (
  <svg {...svgProps}>
    <line x1="9" y1="6" x2="20" y2="6" />
    <line x1="9" y1="12" x2="20" y2="12" />
    <line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const OrderedListIcon = (
  <svg {...svgProps}>
    <line x1="10" y1="6" x2="20" y2="6" />
    <line x1="10" y1="12" x2="20" y2="12" />
    <line x1="10" y1="18" x2="20" y2="18" />
    <text
      x="3.5"
      y="8"
      fontSize="7"
      fontFamily="inherit"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      1
    </text>
    <text
      x="3.5"
      y="14"
      fontSize="7"
      fontFamily="inherit"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      2
    </text>
    <text
      x="3.5"
      y="20"
      fontSize="7"
      fontFamily="inherit"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      3
    </text>
  </svg>
);

const QuoteIcon = (
  <svg {...svgProps}>
    <path d="M5 4v16" />
    <path d="M10 7h9" />
    <path d="M10 12h9" />
    <path d="M10 17h6" />
  </svg>
);

const ParagraphIcon = (
  <svg {...svgProps}>
    <path d="M13 4v16" />
    <path d="M17 4v16" />
    <path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13" />
  </svg>
);

const InlineCodeIcon = (
  <svg {...svgProps}>
    <polyline points="9 8 5 12 9 16" />
    <polyline points="15 8 19 12 15 16" />
    <line x1="13" y1="6" x2="11" y2="18" />
  </svg>
);

const HighlightIcon = (
  <svg {...svgProps}>
    <path d="m9 11-6 6v3h9l3-3" />
    <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
  </svg>
);

const CodeBlockIcon = (
  <svg {...svgProps}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <polyline points="10 10 7 12 10 14" />
    <polyline points="14 10 17 12 14 14" />
  </svg>
);

const HorizontalRuleIcon = (
  <svg {...svgProps}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="7" x2="3" y2="17" />
    <line x1="21" y1="7" x2="21" y2="17" />
  </svg>
);

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize.replace(/['"]+/g, "") || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

const AlignLeftIcon = (
  <svg {...svgProps}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="13" y2="12" />
    <line x1="3" y1="18" x2="17" y2="18" />
  </svg>
);

const AlignCenterIcon = (
  <svg {...svgProps}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="7" y1="12" x2="17" y2="12" />
    <line x1="5" y1="18" x2="19" y2="18" />
  </svg>
);

const AlignRightIcon = (
  <svg {...svgProps}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="11" y1="12" x2="21" y2="12" />
    <line x1="7" y1="18" x2="21" y2="18" />
  </svg>
);

const AlignJustifyIcon = (
  <svg {...svgProps}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const ClearFormattingIcon = (
  <svg {...svgProps}>
    <path d="M4 7V4h16v3" />
    <path d="M5 20h6" />
    <path d="M13 4 8 20" />
    <path d="m15 15 5 5" />
    <path d="m20 15-5 5" />
  </svg>
);

const FontSizeIcon = (
  <svg {...svgProps}>
    <path d="M4 8V6h7v2" />
    <path d="M7 6v12" />
    <path d="M4 18h6" />
    <path d="M14 10v2" />
    <path d="M17 10v10" />
    <path d="M14 20h6" />
  </svg>
);

const LinkIcon = (
  <svg {...svgProps}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const ImageIcon = (
  <svg {...svgProps}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const UndoIcon = (
  <svg {...svgProps}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);

const RedoIcon = (
  <svg {...svgProps}>
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
  </svg>
);

export default function BlogEditor({
  initialContent,
  onChange,
  readOnly = false,
}: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
      TextStyle,
      FontSize,
      TiptapImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg border border-stone-200 shadow-sm max-w-full h-auto my-4 dark:border-stone-800",
        },
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    immediatelyRender: false,
    // Tiptap v3 skips re-renders on transactions by default, which
    // would leave the active toolbar icons out of date.
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: readOnly
          ? "tiptap min-h-32 p-5 outline-none"
          : "tiptap min-h-80 p-5 outline-none",
      },
      handleDrop: (view, event) => {
        if (!readOnly && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            fileToDataUrl(file)
              .then((src) => {
                const { schema } = view.state;
                const coordinates = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                });
                if (coordinates) {
                  const node = schema.nodes.image.create({ src });
                  const transaction = view.state.tr.insert(
                    coordinates.pos,
                    node,
                  );
                  view.dispatch(transaction);
                }
              })
              .catch(() => {});
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (!readOnly && event.clipboardData?.files?.length) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            fileToDataUrl(file)
              .then((src) => {
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              })
              .catch(() => {});
            return true;
          }
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
    },
  });

  const [fontSizeMenuOpen, setFontSizeMenuOpen] = useState(false);
  const fontSizeMenuRef = useRef<HTMLDivElement>(null);

  const FONT_SIZES = [
    "10px",
    "12px",
    "14px",
    "16px",
    "18px",
    "20px",
    "22px",
    "24px",
    "26px",
    "28px",
    "32px",
    "36px",
    "48px",
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        fontSizeMenuRef.current &&
        !fontSizeMenuRef.current.contains(event.target as Node)
      ) {
        setFontSizeMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageTab, setImageTab] = useState<"file" | "url">("file");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageFileLoading, setImageFileLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageFile(file: File) {
    setImageFileLoading(true);
    setImageError("");
    try {
      const dataUrl = await fileToDataUrl(file);
      editor?.chain().focus().setImage({ src: dataUrl, alt: file.name }).run();
      setImageModalOpen(false);
      setImageUrlInput("");
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "Failed to load image file",
      );
    } finally {
      setImageFileLoading(false);
    }
  }

  function handleInsertImageUrl() {
    const url = imageUrlInput.trim();
    if (!url) {
      setImageError("Please enter an image URL");
      return;
    }
    editor?.chain().focus().setImage({ src: url }).run();
    setImageUrlInput("");
    setImageModalOpen(false);
  }

  function applyFontSize(size: string) {
    if (!editor) {
      return;
    }

    if (size === "") {
      editor.chain().focus().unsetFontSize().run();
    } else {
      editor.chain().focus().setFontSize(size).run();
    }
    setFontSizeMenuOpen(false);
  }

  if (!editor) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-5 font-editorial text-xs uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
        Initializing manuscript editor...
      </div>
    );
  }

  function setLink() {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as
      | string
      | undefined;

    const url = window.prompt("Link URL", previousUrl ?? "https://");

    if (url === null) {
      return;
    }

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-stone-300 bg-white shadow-sm transition-colors duration-200 focus-within:border-stone-900 dark:border-stone-800 dark:bg-stone-900/60 dark:focus-within:border-stone-600">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-stone-200 bg-stone-50/80 p-2 dark:border-stone-800 dark:bg-stone-900/90">
          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            {BoldIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            {ItalicIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            {UnderlineIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Strikethrough"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            {StrikeIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Inline code"
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            {InlineCodeIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Highlight"
            active={editor.isActive("highlight")}
            onClick={() =>
              editor.chain().focus().toggleHighlight().run()
            }
          >
            {HighlightIcon}
          </ToolbarButton>

          <div className="relative" ref={fontSizeMenuRef}>
            <ToolbarButton
              label="Font size"
              active={Boolean(editor.getAttributes("textStyle").fontSize)}
              onClick={() => setFontSizeMenuOpen((open) => !open)}
            >
              {FontSizeIcon}
            </ToolbarButton>
            {fontSizeMenuOpen && (
              <div className="absolute left-0 top-9 z-50 max-h-56 w-32 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-xl dark:border-stone-700 dark:bg-stone-900">
                <button
                  type="button"
                  onClick={() => applyFontSize("")}
                  className="w-full px-3 py-1.5 text-left font-editorial text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Default Size
                </button>
                {FONT_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => applyFontSize(size)}
                    className={`w-full px-3 py-1.5 text-left font-editorial text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 ${
                      editor.getAttributes("textStyle").fontSize === size
                        ? "bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950"
                        : "text-stone-800 dark:text-stone-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ToolbarDivider />

          <ToolbarButton
            label="Paragraph"
            onClick={() =>
              editor.chain().focus().setParagraph().run()
            }
          >
            {ParagraphIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <HeadingIcon level={2} />
          </ToolbarButton>

          <ToolbarButton
            label="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <HeadingIcon level={3} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            label="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() =>
              editor.chain().focus().toggleBulletList().run()
            }
          >
            {BulletListIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
          >
            {OrderedListIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Blockquote"
            active={editor.isActive("blockquote")}
            onClick={() =>
              editor.chain().focus().toggleBlockquote().run()
            }
          >
            {QuoteIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Code block"
            active={editor.isActive("codeBlock")}
            onClick={() =>
              editor.chain().focus().toggleCodeBlock().run()
            }
          >
            {CodeBlockIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Horizontal rule"
            onClick={() =>
              editor.chain().focus().setHorizontalRule().run()
            }
          >
            {HorizontalRuleIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Link"
            active={editor.isActive("link")}
            onClick={setLink}
          >
            {LinkIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Insert image"
            active={editor.isActive("image")}
            onClick={() => {
              setImageError("");
              setImageModalOpen(true);
            }}
          >
            {ImageIcon}
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            label="Align left"
            active={editor.isActive({ textAlign: "left" })}
            onClick={() =>
              editor.chain().focus().setTextAlign("left").run()
            }
          >
            {AlignLeftIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Align center"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() =>
              editor.chain().focus().setTextAlign("center").run()
            }
          >
            {AlignCenterIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Align right"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() =>
              editor.chain().focus().setTextAlign("right").run()
            }
          >
            {AlignRightIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Justify"
            active={editor.isActive({ textAlign: "justify" })}
            onClick={() =>
              editor.chain().focus().setTextAlign("justify").run()
            }
          >
            {AlignJustifyIcon}
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            label="Clear formatting"
            onClick={() =>
              editor.chain().focus().unsetAllMarks().clearNodes().run()
            }
          >
            {ClearFormattingIcon}
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            label="Undo"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            {UndoIcon}
          </ToolbarButton>

          <ToolbarButton
            label="Redo"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            {RedoIcon}
          </ToolbarButton>
        </div>
      )}

      <EditorContent editor={editor} />

      {imageModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Insert image"
          onClick={() => setImageModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/60 p-4 backdrop-blur-sm dark:bg-black/80"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-xl border border-stone-300 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5 dark:border-stone-800">
              <h3 className="font-headline text-sm font-bold uppercase tracking-[0.16em] text-stone-900 dark:text-stone-100">
                Insert Article Image
              </h3>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              <div className="mb-4 flex border-b border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setImageTab("file");
                    setImageError("");
                  }}
                  className={`pb-2.5 font-editorial text-xs font-bold uppercase tracking-[0.14em] transition ${
                    imageTab === "file"
                      ? "border-b-2 border-stone-900 text-stone-950 dark:border-stone-100 dark:text-stone-100"
                      : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageTab("url");
                    setImageError("");
                  }}
                  className={`ml-5 pb-2.5 font-editorial text-xs font-bold uppercase tracking-[0.14em] transition ${
                    imageTab === "url"
                      ? "border-b-2 border-stone-900 text-stone-950 dark:border-stone-100 dark:text-stone-100"
                      : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                  }`}
                >
                  Image URL
                </button>
              </div>

              {imageTab === "file" ? (
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleImageFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 p-6 text-center transition hover:border-stone-500 dark:border-stone-700 dark:hover:border-stone-500"
                  >
                    <svg
                      className="mb-2 h-8 w-8 text-stone-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p className="font-editorial text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Click to choose or drop any image file
                    </p>
                    <p className="mt-1 font-editorial text-[11px] text-stone-400">
                      PNG, JPG, WebP, GIF, SVG accepted
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFile(file);
                      }}
                      className="hidden"
                    />
                  </div>
                  {imageFileLoading && (
                    <p className="font-editorial text-xs text-stone-500 animate-pulse text-center">
                      Processing and optimizing image...
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block font-headline text-xs font-bold uppercase tracking-[0.14em] text-stone-700 dark:text-stone-300">
                    Web Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleInsertImageUrl();
                      }
                    }}
                    placeholder="https://example.com/illustration.jpg"
                    className="w-full rounded-lg border border-stone-300 bg-white p-2.5 font-editorial text-sm outline-none transition focus:border-stone-900 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-stone-400"
                  />
                  <button
                    type="button"
                    onClick={handleInsertImageUrl}
                    className="w-full rounded-lg bg-stone-900 py-2.5 font-editorial text-xs font-bold uppercase tracking-[0.16em] text-stone-50 transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
                  >
                    Insert Image
                  </button>
                </div>
              )}

              {imageError && (
                <p className="mt-3 font-editorial text-xs text-red-600 dark:text-red-400">
                  {imageError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
