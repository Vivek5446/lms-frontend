"use client";

export type LaunchContentKind = "scorm" | "zip" | "video" | "document" | "other";

export type CourseLaunchSection = {
  assetPath: string;
  contentKind: LaunchContentKind;
  moduleId: string;
  moduleTitle: string;
  sectionId: string;
  sectionTitle: string;
};

function normalizeKeySegment(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function deriveModuleId(moduleRecord: any) {
  const moduleOrder = Number(moduleRecord?.order || 0);
  return `module-${moduleOrder}`;
}

export function deriveSectionId(moduleRecord: any, sectionRecord: any) {
  const moduleId = deriveModuleId(moduleRecord);
  const sectionOrder = Number(sectionRecord?.order || 0);
  const previewToken = normalizeKeySegment(sectionRecord?.content?.previewUrl);
  const titleToken = normalizeKeySegment(sectionRecord?.title);
  const suffix = previewToken || titleToken || `section-${sectionOrder}`;

  return `${moduleId}:section-${sectionOrder}-${suffix}`;
}

export function buildLaunchSection(moduleRecord: any, sectionRecord: any) {
  const assetPath = String(sectionRecord?.content?.previewUrl || "").trim();
  if (!assetPath) {
    return null;
  }

  const normalizedKind = String(sectionRecord?.content?.kind || "").trim().toLowerCase();
  const contentKind: LaunchContentKind =
    normalizedKind === "scorm" || normalizedKind === "zip" || normalizedKind === "video" || normalizedKind === "document"
      ? normalizedKind
      : "other";

  return {
    assetPath,
    contentKind,
    moduleId: deriveModuleId(moduleRecord),
    moduleTitle: String(moduleRecord?.title || "").trim() || `Module ${Number(moduleRecord?.order || 0) || 1}`,
    sectionId: deriveSectionId(moduleRecord, sectionRecord),
    sectionTitle: String(sectionRecord?.title || "").trim() || `Section ${Number(sectionRecord?.order || 0) || 1}`,
  } satisfies CourseLaunchSection;
}

export function buildCourseAssetUrl(assetPath: string) {
  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `/courses${normalizedPath}`;
}

export function isScormLaunchSection(section: CourseLaunchSection | null | undefined) {
  return Boolean(section && (section.contentKind === "scorm" || section.contentKind === "zip"));
}

export function getFirstPlayableLaunchSection(course: any) {
  const modules = Array.isArray(course?.curriculum?.modules) ? course.curriculum.modules : [];

  for (const moduleRecord of modules) {
    const sections = Array.isArray(moduleRecord?.sections) ? moduleRecord.sections : [];
    for (const sectionRecord of sections) {
      const launchSection = buildLaunchSection(moduleRecord, sectionRecord);
      if (launchSection) {
        return launchSection;
      }
    }
  }

  return null;
}
