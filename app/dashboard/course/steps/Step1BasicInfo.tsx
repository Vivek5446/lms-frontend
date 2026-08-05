"use client";

import stores from "@/app/store/stores";
import { ChevronDown, FileText, ImagePlus, Images, Plus, Sparkles, Trash2, UserRound, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  CourseBasicInfo,
  LANGUAGES,
  LEVELS,
  createCourseSlug,
  createStoredFile,
  extractPlainTextFromHtml,
  normalizeTaxonomyValue,
} from "../courseForm";
import RichTextEditor from "../richTextEditor/RichTextEditor";
import { StepWrapper } from "./component/StepWrapper";

interface Step1Props {
  value: CourseBasicInfo;
  onChange: (value: CourseBasicInfo) => void;
  onProgressChange?: (progress: number) => void;
  companies?: Array<{ _id: string; company_name: string }>;
  isCompanySelectionDisabled?: boolean;
}

export default function Step1BasicInfo({
  value,
  onChange,
  onProgressChange,
  companies = [],
  isCompanySelectionDisabled = false,
}: Step1Props) {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const updateBasicInfo = (patch: Partial<CourseBasicInfo>) => {
    onChange({ ...value, ...patch });
  };

  const updateLearningOutcome = (index: number, nextValue: string) => {
    updateBasicInfo({
      learningOutcomes: value.learningOutcomes.map((item, itemIndex) =>
        itemIndex === index ? nextValue : item
      ),
    });
  };

  const addLearningOutcome = () => {
    updateBasicInfo({
      learningOutcomes: [...value.learningOutcomes, ""],
    });
  };

  const removeLearningOutcome = (index: number) => {
    const nextOutcomes = value.learningOutcomes.filter((_, itemIndex) => itemIndex !== index);
    updateBasicInfo({
      learningOutcomes: nextOutcomes.length ? nextOutcomes : [""],
    });
  };

  const toggleCategory = (categoryName: string) => {
    const categoryValue = normalizeTaxonomyValue(categoryName);
    const active = value.categories.map(normalizeTaxonomyValue).includes(categoryValue);
    updateBasicInfo({
      categories: active
        ? value.categories.filter((item) => normalizeTaxonomyValue(item) !== categoryValue)
        : [...value.categories, categoryValue],
    });
  };

  useEffect(() => {
    let filled = 0;

    if (value.courseName.trim()) filled++;
    if (value.descriptionText.trim()) filled++;
    if (value.learningOutcomes.some((item) => item.trim())) filled++;
    if (value.instructorName.trim()) filled++;
    if (value.instructorDesignation.trim()) filled++;
    if (value.thumbnail) filled++;
    if (value.categories.length > 0) filled++;
    if (value.languages.length > 0) filled++;
    if (value.companyId.trim()) filled++;

    onProgressChange?.(Math.round((filled / 9) * 100));
  }, [value, onProgressChange]);

  useEffect(() => {
    if (!stores.courseStore.masterCategories?.length) {
      stores.courseStore.fetchMasterCategories().catch(() => undefined);
    }
  }, []);

  // Handle clicking outside the category dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const masterCategories = stores.courseStore.masterCategories || [];
  const filteredCategories = masterCategories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

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
            <label style={labelStyle}>Course ID</label>
            <input
              type="text"
              value={value.courseCode || "Generating..."}
              readOnly
              style={{
                ...inputStyle,
                background: "#F3F4F6",
                color: "#6B7280",
                cursor: "default",
              }}
            />
            <p style={{ margin: "5px 0 0 2px", fontSize: 12, color: "#9CA3AF" }}>
              Auto-generated unique course ID
            </p>
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <label style={{ ...labelStyle, marginBottom: 4 }}>What you&apos;ll learn</label>
              <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>
                Add the key benefits or skills learners should expect from this course.
              </p>
            </div>
            <button
              type="button"
              onClick={addLearningOutcome}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 14px",
                borderRadius: 999,
                border: "1px solid #DBEAFE",
                background: "#EFF6FF",
                color: "#1D4ED8",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={14} />
              Add Benefit
            </button>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {value.learningOutcomes.map((item, index) => (
              <div
                key={`learning-outcome-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1.5px solid #E5E7EB",
                  background: "#FAFAFA",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#DBEAFE",
                    color: "#1D4ED8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>
                <input
                  type="text"
                  placeholder="e.g., Build production-ready dashboards with confidence"
                  value={item}
                  onChange={(event) => updateLearningOutcome(index, event.target.value)}
                  style={inputStyle}
                  onFocus={(event) => (event.currentTarget.style.borderColor = "#2563EB")}
                  onBlur={(event) => (event.currentTarget.style.borderColor = "#E5E7EB")}
                />
                <button
                  type="button"
                  onClick={() => removeLearningOutcome(index)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    background: "#FEE2E2",
                    color: "#DC2626",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  aria-label={`Remove learning outcome ${index + 1}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <UserRound className="h-4 w-4" color="#2563EB" />
            <label style={{ ...labelStyle, marginBottom: 0 }}>Teacher Details</label>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}
          >
            <div>
              <label style={labelStyle}>Teacher Name</label>
              <input
                type="text"
                placeholder="e.g., Maya Okafor"
                value={value.instructorName}
                onChange={(event) => updateBasicInfo({ instructorName: event.target.value })}
                style={inputStyle}
                onFocus={(event) => (event.currentTarget.style.borderColor = "#2563EB")}
                onBlur={(event) => (event.currentTarget.style.borderColor = "#E5E7EB")}
              />
            </div>
            <div>
              <label style={labelStyle}>Designation</label>
              <input
                type="text"
                placeholder="e.g., Staff Engineer"
                value={value.instructorDesignation}
                onChange={(event) => updateBasicInfo({ instructorDesignation: event.target.value })}
                style={inputStyle}
                onFocus={(event) => (event.currentTarget.style.borderColor = "#2563EB")}
                onBlur={(event) => (event.currentTarget.style.borderColor = "#E5E7EB")}
              />
            </div>
          </div>
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
                const languageValue = normalizeTaxonomyValue(language);
                const active = value.languages.map(normalizeTaxonomyValue).includes(languageValue);

                return (
                  <button
                    key={language}
                    onClick={() =>
                      updateBasicInfo({
                        languages: active
                          ? value.languages.filter((item) => normalizeTaxonomyValue(item) !== languageValue)
                          : [...value.languages, languageValue],
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
            <div style={{ position: "relative" }} ref={categoryDropdownRef}>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="Search and select categories..."
                  value={categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setIsCategoryDropdownOpen(true);
                  }}
                  onFocus={() => setIsCategoryDropdownOpen(true)}
                  style={{ ...inputStyle, paddingRight: 36 }}
                />
                <ChevronDown
                  size={18}
                  style={{
                    position: "absolute",
                    right: 12,
                    color: "#9CA3AF",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {isCategoryDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    background: "#FFFFFF",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 10,
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    maxHeight: 220,
                    overflowY: "auto",
                    zIndex: 10,
                  }}
                >
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => {
                      const categoryValue = normalizeTaxonomyValue(cat.name);
                      const active = value.categories.map(normalizeTaxonomyValue).includes(categoryValue);

                      return (
                        <div
                          key={cat._id || cat.name}
                          onClick={() => toggleCategory(cat.name)}
                          style={{
                            padding: "10px 14px",
                            cursor: "pointer",
                            background: active ? "#EFF6FF" : "#FFFFFF",
                            color: active ? "#1D4ED8" : "#374151",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: 14,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => !active && (e.currentTarget.style.background = "#F9FAFB")}
                          onMouseLeave={(e) => !active && (e.currentTarget.style.background = "#FFFFFF")}
                        >
                          <span style={{ fontWeight: active ? 600 : 400 }}>📁 {cat.name}</span>
                          {active && (
                            <span style={{ color: "#2563EB", fontSize: 14, fontWeight: "bold" }}>
                              ✓
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: "12px 14px", color: "#9CA3AF", fontSize: 13, textAlign: "center" }}>
                      {masterCategories.length === 0
                        ? "No master categories configured yet."
                        : "No matching categories found."}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {value.categories.length > 0 ? (
                value.categories.map((category) => (
                  <span
                    key={category}
                    style={{
                      padding: "6px 10px 6px 14px",
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      background: "#EFF6FF",
                      color: "#2563EB",
                      border: "1px solid #BFDBFE",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    📁 {category}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      style={{
                        background: "rgba(37, 99, 235, 0.1)",
                        border: "none",
                        color: "#1D4ED8",
                        cursor: "pointer",
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "50%",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(37, 99, 235, 0.2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(37, 99, 235, 0.1)")}
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                ))
              ) : (
                <span style={{ fontSize: 13, color: "#9CA3AF" }}>No category selected</span>
              )}
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
              const levelValue = normalizeTaxonomyValue(level);
              const active = normalizeTaxonomyValue(value.level) === levelValue;

              return (
                <button
                  key={level}
                  onClick={() => updateBasicInfo({ level: levelValue })}
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

        <div style={{ marginTop: 24 }}>
          <label style={labelStyle}>
            Course Company{value.visibilityType === "public" ? " *" : ""}
          </label>
          <select
            value={value.companyId}
            onChange={(event) => updateBasicInfo({ companyId: event.target.value })}
            disabled={isCompanySelectionDisabled}
            style={{
              ...inputStyle,
              cursor: isCompanySelectionDisabled ? "not-allowed" : "pointer",
              background: isCompanySelectionDisabled ? "#F3F4F6" : "#FFFFFF",
            }}
          >
            <option value="">Select company</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.company_name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 24 }}>
          <label style={{ ...labelStyle, marginBottom: 12 }}>Course Visibility Type</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            {[
              {
                key: "private",
                title: "Private Course",
                description: "Only users assigned by the Super Admin can access this course.",
                accent: "#2563EB",
                bg: "#EFF6FF",
              },
              {
                key: "public",
                title: "Public Course",
                description: "Visible to everyone and ready for self-enrollment or purchase.",
                accent: "#059669",
                bg: "#ECFDF5",
              },
            ].map((option) => {
              const active = value.visibilityType === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => updateBasicInfo({ visibilityType: option.key as CourseBasicInfo["visibilityType"] })}
                  style={{
                    textAlign: "left",
                    padding: "18px 18px 16px",
                    borderRadius: 16,
                    border: active ? `2px solid ${option.accent}` : "1.5px solid #E5E7EB",
                    background: active ? option.bg : "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: active ? option.accent : "#F3F4F6",
                      color: active ? "#FFFFFF" : "#6B7280",
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 12,
                    }}
                  >
                    {active ? "ON" : "OFF"}
                  </div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>{option.title}</p>
                  <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5, color: "#6B7280" }}>
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </StepWrapper>
  );
}