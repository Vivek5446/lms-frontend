"use client";

import React, { useCallback } from "react";
import { FileText, ImagePlus, Images, Sparkles, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import RichTextEditor from "../richTextEditor/RichTextEditor";
import { StepWrapper } from "./component/StepWrapper";
import {
  CATEGORIES,
  CourseBasicInfo,
  LANGUAGES,
  LEVELS,
  createCourseSlug,
  createStoredFile,
  extractPlainTextFromHtml,
} from "../courseForm";

interface Step1Props {
  value: CourseBasicInfo;
  onChange: (value: CourseBasicInfo) => void;
  onProgressChange?: (progress: number) => void;
}

export default function Step1BasicInfo({ value, onChange, onProgressChange }: Step1Props) {
  const updateBasicInfo = (patch: Partial<CourseBasicInfo>) => {
    onChange({ ...value, ...patch });
  };

  React.useEffect(() => {
    let filled = 0;

    if (value.courseName.trim()) filled++;
    if (value.descriptionText.trim()) filled++;
    if (value.thumbnail) filled++;
    if (value.categories.length > 0) filled++;
    filled++;

    onProgressChange?.(Math.round((filled / 5) * 100));
  }, [value, onProgressChange]);

  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];

      if (!file) {
        return;
      }

      updateBasicInfo({
        thumbnail: createStoredFile(file, "image", URL.createObjectURL(file)),
      });
    },
    [value, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

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
    <StepWrapper
      stepKey={0}
      title="Basic Course Info"
      subtitle={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Let&apos;s start with the essentials
          <Sparkles className="h-4 w-4" />
        </span>
      }
      icon={<FileText className="w-6 h-6" />}
      accentColor="hsl(var(--step-1))"
    >
      <div style={card}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginBottom: 24,
          }}
        >
          <div>
            <label
              style={{
                ...labelStyle,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Course Name <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Introduction to React"
              value={value.courseName}
              onChange={(event) =>
                updateBasicInfo({
                  courseName: event.target.value,
                  slug: createCourseSlug(event.target.value),
                })
              }
              style={inputStyle}
              onFocus={(event) => (event.currentTarget.style.borderColor = "#6B21A8")}
              onBlur={(event) => (event.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </div>
          <div>
            <label style={labelStyle}>Pretty URL Slug</label>
            <input
              type="text"
              value={value.slug || "course-url-slug"}
              readOnly
              style={{
                ...inputStyle,
                background: "#F3F4F6",
                color: "#6B7280",
                cursor: "default",
              }}
            />
            <p style={{ margin: "5px 0 0 2px", fontSize: 12, color: "#9CA3AF" }}>
              Auto-generated from course name
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Description</label>
          <RichTextEditor
            value={value.descriptionHtml}
            placeholder="Describe what learners will gain from this course..."
            minHeight={140}
            onChange={(html) =>
              updateBasicInfo({
                descriptionHtml: html,
                descriptionText: extractPlainTextFromHtml(html),
              })
            }
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Thumbnail</label>
          <p style={{ margin: "-4px 0 8px", fontSize: 12, color: "#9CA3AF" }}>
            Recommended: 1280x720px, JPG or PNG
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
            {value.thumbnail?.previewUrl ? (
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "100%",
                }}
              >
                <img
                  src={value.thumbnail.previewUrl}
                  alt="Thumbnail"
                  style={{
                    width: "100%",
                    maxHeight: 192,
                    objectFit: "cover",
                    borderRadius: 12,
                  }}
                />
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    updateBasicInfo({ thumbnail: null });
                  }}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.9)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#374151",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "#EEF2FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Images size={28} />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      color: "#374151",
                      fontSize: 14,
                    }}
                  >
                    {isDragActive ? "Drop it here!" : "Drag & drop your thumbnail"}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 13,
                      color: "#9CA3AF",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <ImagePlus size={14} />
                    or click to browse
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginBottom: 24,
          }}
        >
          <div>
            <label style={labelStyle}>Languages</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {LANGUAGES.map((language) => {
                const active = value.languages.includes(language);

                return (
                  <button
                    key={language}
                    onClick={() =>
                      updateBasicInfo({
                        languages: active
                          ? value.languages.filter((item) => item !== language)
                          : [...value.languages, language],
                      })
                    }
                    style={{
                      padding: "5px 14px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      border: active ? "none" : "1.5px solid #E5E7EB",
                      background: active ? "#6B21A8" : "#FFFFFF",
                      color: active ? "#FFFFFF" : "#6B7280",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    {language}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Categories</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map((category) => {
                const active = value.categories.includes(category);

                return (
                  <button
                    key={category}
                    onClick={() =>
                      updateBasicInfo({
                        categories: active
                          ? value.categories.filter((item) => item !== category)
                          : [...value.categories, category],
                      })
                    }
                    onMouseEnter={(event) => {
                      if (!active) {
                        event.currentTarget.style.background = "#8B5CF6";
                        event.currentTarget.style.color = "#FFFFFF";
                      }
                    }}
                    onMouseLeave={(event) => {
                      if (!active) {
                        event.currentTarget.style.background = "#FFFFFF";
                        event.currentTarget.style.color = "#6B7280";
                      }
                    }}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      border: active ? "none" : "1.5px solid #E5E7EB",
                      background: active ? "#22C55E" : "#FFFFFF",
                      color: active ? "#FFFFFF" : "#6B7280",
                      fontFamily: "inherit",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <label
            style={{
              ...labelStyle,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Course Level <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {LEVELS.map((level) => {
              const active = value.level === level;

              return (
                <button
                  key={level}
                  onClick={() => updateBasicInfo({ level })}
                  style={{
                    padding: "12px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: active ? "2px solid #6B21A8" : "2px solid #E5E7EB",
                    background: active ? "#F5F3FF" : "#FFFFFF",
                    color: active ? "#6B21A8" : "#6B7280",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
