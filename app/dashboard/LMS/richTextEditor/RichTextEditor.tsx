"use client";

import { useRef, useState } from "react";

const HEADING_OPTIONS = [
  { label: "Normal", tag: "p" },
  { label: "H1",     tag: "h1" },
  { label: "H2",     tag: "h2" },
  { label: "H3",     tag: "h3" },
] as const;

const FORMAT_BTNS = [
  { cmd: "bold",          icon: "B",  style: { fontWeight: 700 },                    title: "Bold" },
  { cmd: "italic",        icon: "I",  style: { fontStyle: "italic" },                title: "Italic" },
  { cmd: "underline",     icon: "U",  style: { textDecoration: "underline" },        title: "Underline" },
  { cmd: "strikeThrough", icon: "S",  style: { textDecoration: "line-through" },     title: "Strikethrough" },
] as const;

const LIST_BTNS = [
  { cmd: "insertUnorderedList", icon: "• List",  title: "Bullet List" },
  { cmd: "insertOrderedList",   icon: "1. List", title: "Numbered List" },
] as const;

const ALIGN_BTNS = [
  { cmd: "justifyLeft",   icon: "≡", title: "Align Left" },
  { cmd: "justifyCenter", icon: "⊟", title: "Align Center" },
  { cmd: "justifyRight",  icon: "⊞", title: "Align Right" },
] as const;

interface RichTextEditorProps {
  placeholder?: string;
  minHeight?: number;
  onChange?: (html: string) => void;
}

export default function RichTextEditor({
  placeholder = "Start writing...",
  minHeight = 140,
  onChange,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty]   = useState(true);
  const [focused, setFocused]   = useState(false);

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    const text = editorRef.current?.innerText.trim() ?? "";
    setIsEmpty(text === "");
    onChange?.(editorRef.current?.innerHTML ?? "");
  };

  /* ── style helpers ── */
  const wrap: React.CSSProperties = {
    border: `1.5px solid ${focused ? "#6B21A8" : "#E5E7EB"}`,
    borderRadius: 10,
    overflow: "hidden",
    transition: "border-color 0.15s",
    background: "#FFFFFF",
  };

  const toolbar: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 2,
    padding: "8px 10px",
    borderBottom: "1.5px solid #E5E7EB",
    background: "#F9FAFB",
  };

  const btn = (extraStyle?: React.CSSProperties): React.CSSProperties => ({
    padding: "4px 9px",
    borderRadius: 6,
    border: "1px solid transparent",
    background: "transparent",
    color: "#374151",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    lineHeight: 1.4,
    transition: "background 0.1s",
    ...extraStyle,
  });

  const divider: React.CSSProperties = {
    width: 1,
    height: 20,
    background: "#E5E7EB",
    margin: "0 4px",
    flexShrink: 0,
  };

  return (
    <div style={wrap}>
      {/* ── Toolbar ── */}
      <div style={toolbar}>

        {/* Heading */}
        <select
          defaultValue="p"
          onChange={(e) => exec("formatBlock", e.target.value)}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid #E5E7EB",
            fontSize: 12,
            color: "#374151",
            background: "#FFFFFF",
            cursor: "pointer",
            fontFamily: "inherit",
            marginRight: 4,
          }}
        >
          {HEADING_OPTIONS.map((h) => (
            <option key={h.tag} value={h.tag}>{h.label}</option>
          ))}
        </select>

        <div style={divider} />

        {/* Bold / Italic / Underline / Strike */}
        {FORMAT_BTNS.map((b) => (
          <button
            key={b.cmd}
            title={b.title}
            onMouseDown={(e) => { e.preventDefault(); exec(b.cmd); }}
            style={btn(b.style)}
          >
            {b.icon}
          </button>
        ))}

        <div style={divider} />

        {/* Lists */}
        {LIST_BTNS.map((b) => (
          <button
            key={b.cmd}
            title={b.title}
            onMouseDown={(e) => { e.preventDefault(); exec(b.cmd); }}
            style={btn()}
          >
            {b.icon}
          </button>
        ))}

        <div style={divider} />

        {/* Alignment */}
        {ALIGN_BTNS.map((b) => (
          <button
            key={b.cmd}
            title={b.title}
            onMouseDown={(e) => { e.preventDefault(); exec(b.cmd); }}
            style={btn({ fontSize: 15 })}
          >
            {b.icon}
          </button>
        ))}

        <div style={divider} />

        {/* Link */}
        <button
          title="Insert Link"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = prompt("Enter URL:");
            if (url) exec("createLink", url);
          }}
          style={btn()}
        >
          🔗
        </button>

        {/* Unlink */}
        <button
          title="Remove Link"
          onMouseDown={(e) => { e.preventDefault(); exec("unlink"); }}
          style={btn({ fontSize: 11, color: "#9CA3AF" })}
        >
          Unlink
        </button>

        <div style={divider} />

        {/* Clear formatting */}
        <button
          title="Clear Formatting"
          onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }}
          style={btn({ fontSize: 11, color: "#9CA3AF" })}
        >
          T✕
        </button>
      </div>

      {/* ── Editable area ── */}
      <div style={{ position: "relative" }}>
        {isEmpty && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 14,
              fontSize: 14,
              color: "#9CA3AF",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            minHeight,
            padding: "12px 14px",
            fontSize: 14,
            color: "#111827",
            outline: "none",
            lineHeight: 1.7,
            fontFamily: "inherit",
          }}
        />
      </div>
    </div>
  );
}