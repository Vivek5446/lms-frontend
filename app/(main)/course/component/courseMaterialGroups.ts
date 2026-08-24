export interface CourseMaterialRecord {
  name?: string;
  title?: string;
  fileName?: string;
  previewUrl?: string;
  assetPath?: string;
  path?: string;
  url?: string;
  file?: string;
  mimeType?: string;
  type?: string;
  size?: number | string;
  sizeBytes?: number;
  fileSize?: number | string;
  sourceType?: "upload" | "url";
  isUrl?: boolean;
  [key: string]: unknown;
}

export interface CourseMaterialSectionGroup {
  id: string;
  title: string;
  label: string;
  scope: "module" | "section";
  moduleId?: string;
  sectionId?: string;
  materials: CourseMaterialRecord[];
}

export interface CourseMaterialGroup {
  id: string;
  index: number;
  title: string;
  sections: CourseMaterialSectionGroup[];
}

function normalizeKeySegment(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function deriveMaterialModuleId(moduleRecord: any) {
  return String(moduleRecord?.moduleId || moduleRecord?._id || moduleRecord?.id || "").trim()
    || `module-${Number(moduleRecord?.order || 0)}`;
}

function deriveMaterialSectionId(moduleRecord: any, sectionRecord: any) {
  const explicitId = String(sectionRecord?.sectionId || sectionRecord?._id || sectionRecord?.id || "").trim();
  if (explicitId) return explicitId;

  const moduleId = deriveMaterialModuleId(moduleRecord);
  const sectionOrder = Number(sectionRecord?.order || 0);
  const suffix = normalizeKeySegment(sectionRecord?.content?.previewUrl)
    || normalizeKeySegment(sectionRecord?.title)
    || `section-${sectionOrder}`;
  return `${moduleId}:section-${sectionOrder}-${suffix}`;
}

function normalizeMaterials(materials: unknown): CourseMaterialRecord[] {
  return Array.isArray(materials)
    ? materials.filter(Boolean) as CourseMaterialRecord[]
    : [];
}

export function buildCourseMaterialGroups(course: any): CourseMaterialGroup[] {
  const modules = Array.isArray(course?.curriculum?.modules) ? course.curriculum.modules : [];

  return modules
    .map((moduleRecord: any, moduleIndex: number) => {
      const moduleId = deriveMaterialModuleId(moduleRecord);
      const sections: CourseMaterialSectionGroup[] = [];
      const moduleMaterials = normalizeMaterials(moduleRecord?.studyMaterial);

      if (moduleMaterials.length > 0) {
        sections.push({
          id: `${moduleIndex + 1}-module-materials`,
          title: "Module Materials",
          label: "Module Materials",
          scope: "module",
          moduleId,
          materials: moduleMaterials,
        });
      }

      sections.push(...(Array.isArray(moduleRecord?.sections) ? moduleRecord.sections : [])
        .map((sectionRecord: any, sectionIndex: number) => ({
          id: `${moduleIndex + 1}-${sectionIndex + 1}`,
          title: String(sectionRecord?.title || `Section ${sectionIndex + 1}`),
          label: `Section ${moduleIndex + 1}.${sectionIndex + 1}`,
          scope: "section" as const,
          moduleId,
          sectionId: deriveMaterialSectionId(moduleRecord, sectionRecord),
          materials: normalizeMaterials(sectionRecord?.studyMaterial),
        }))
        .filter((sectionRecord: CourseMaterialSectionGroup) => sectionRecord.materials.length > 0));

      if (!sections.length) return null;

      return {
        id: String(moduleRecord?.moduleId || moduleRecord?.id || moduleRecord?._id || moduleIndex + 1),
        index: moduleIndex + 1,
        title: String(moduleRecord?.title || `Module ${moduleIndex + 1}`),
        sections,
      } satisfies CourseMaterialGroup;
    })
    .filter(Boolean) as CourseMaterialGroup[];
}

export function countCourseMaterials(groups: CourseMaterialGroup[]) {
  return groups.reduce(
    (total, group) => total + group.sections.reduce(
      (sectionTotal, section) => sectionTotal + section.materials.length,
      0
    ),
    0
  );
}

export function hasCourseMaterials(course: any) {
  return countCourseMaterials(buildCourseMaterialGroups(course)) > 0;
}
