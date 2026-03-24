"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import RichTextEditor from "../richTextEditor/RichTextEditor";

const LANGUAGES = ["English", "Spanish", "French", "German", "Hindi", "Arabic", "Chinese"];
const CATEGORIES = ["Technology", "Business", "Design", "Marketing", "HR", "Compliance", "Leadership"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

interface Step1Props {
  onProgressChange?: (progress: number) => void;
}

export default function Step1BasicInfo({ onProgressChange }: Step1Props) {
  const [courseName, setCourseName]     = useState("");
  const [thumbnail, setThumbnail]       = useState<string | null>(null);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["English"]);
  const [selectedCats, setSelectedCats]   = useState<string[]>([]);
  const [level, setLevel]               = useState("Beginner");
  const [description, setDescription]   = useState("");

  // Calculate progress: 5 fields, each worth 20%
  // courseName, description (via RichTextEditor), thumbnail, category, level (always set)
  React.useEffect(() => {
    let filled = 0;
    if (courseName.trim())          filled++;
    if (description.trim())         filled++;
    if (thumbnail)                  filled++;
    if (selectedCats.length > 0)    filled++;
    filled++; // level always selected
    const progress = Math.round((filled / 5) * 100);
    onProgressChange?.(progress);
  }, [courseName, description, thumbnail, selectedCats, level]);

  const slug = courseName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) setThumbnail(URL.createObjectURL(files[0]));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  /* ── shared styles ── */
  const card: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: "32px 36px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    boxSizing: "border-box",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 8,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid #E5E7EB",
    fontSize: 14,
    color: "#111827",
    outline: "none",
    background: "#FAFAFA",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div style={card}>

      {/* ── Heading ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          📝
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
            Basic Course Info
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#6B7280", marginTop: 2 }}>
            Let&apos;s start with the essentials ✨
          </p>
        </div>
      </div>

      {/* ── Course Name + Slug ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div>
          <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 4 }}>
            Course Name <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Introduction to React"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#6B21A8")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </div>
        <div>
          <label style={labelStyle}>Pretty URL Slug</label>
          <input
            type="text"
            value={slug || "introduction-to-react"}
            readOnly
            style={{ ...inputStyle, background: "#F3F4F6", color: "#6B7280", cursor: "default" }}
          />
          <p style={{ margin: "5px 0 0 2px", fontSize: 12, color: "#9CA3AF" }}>
            Auto-generated from course name
          </p>
        </div>
      </div>

      {/* ── Description — Rich Text ── */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Description</label>
        <RichTextEditor
          placeholder="Describe what learners will gain from this course..."
          minHeight={140}
          onChange={(html) => { const text = html.replace(/<[^>]*>/g,"").trim(); setDescription(text); }}
        />
      </div>

      {/* ── Thumbnail ── */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Thumbnail</label>
        <p style={{ margin: "-4px 0 8px", fontSize: 12, color: "#9CA3AF" }}>
          Recommended: 1280×720px, JPG or PNG
        </p>
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? "#6B21A8" : "#E5E7EB"}`,
            borderRadius: 16,
            padding: 32,
            textAlign: "center",
            cursor: "pointer",
            background: isDragActive ? "#F5F3FF" : "#FAFAFA",
            transition: "all 0.2s",
          }}
        >
          <input {...getInputProps()} />
          {thumbnail ? (
            <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
              <img src={thumbnail} alt="Thumbnail" style={{ width: "100%", maxHeight: 192, objectFit: "cover", borderRadius: 12 }} />
              <button
                onClick={(e) => { e.stopPropagation(); setThumbnail(null); }}
                style={{ position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#374151" }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                {isDragActive ? "🎯" : "🖼️"}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: "#374151", fontSize: 14 }}>
                  {isDragActive ? "Drop it here!" : "Drag & drop your thumbnail"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9CA3AF" }}>or click to browse</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Languages + Categories ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div>
          <label style={labelStyle}>Languages</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LANGUAGES.map((lang) => {
              const active = selectedLangs.includes(lang);
              return (
                <button
                  key={lang}
                  onClick={() => toggleItem(selectedLangs, lang, setSelectedLangs)}
                  style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: "pointer", border: active ? "none" : "1.5px solid #E5E7EB", background: active ? "#6B21A8" : "#FFFFFF", color: active ? "#FFFFFF" : "#6B7280", fontFamily: "inherit", transition: "all 0.15s" }}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Categories</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map((cat) => {
              const active = selectedCats.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleItem(selectedCats, cat, setSelectedCats)}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "#8B5CF6"; e.currentTarget.style.color = "#FFFFFF"; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#6B7280"; } }}
                  style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: "pointer", border: active ? "none" : "1.5px solid #E5E7EB", background: active ? "#22C55E" : "#FFFFFF", color: active ? "#FFFFFF" : "#6B7280", fontFamily: "inherit", transition: "all 0.2s ease" }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Course Level ── */}
      <div>
        <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 4 }}>
          Course Level <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {LEVELS.map((l) => {
            const active = level === l;
            return (
              <button
                key={l}
                onClick={() => setLevel(l)}
                style={{ padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", border: active ? "2px solid #6B21A8" : "2px solid #E5E7EB", background: active ? "#F5F3FF" : "#FFFFFF", color: active ? "#6B21A8" : "#6B7280", fontFamily: "inherit", transition: "all 0.15s" }}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}