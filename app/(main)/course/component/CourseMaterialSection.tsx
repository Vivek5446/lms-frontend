"use client";

import { buildCourseAssetUrl } from "@/app/dashboard/course/scorm/sectionTracking";
import {
  Archive,
  ChevronDown,
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  [key: string]: unknown;
}

export interface CourseMaterialSectionGroup {
  id: string;
  title: string;
  label: string;
  materials: CourseMaterialRecord[];
}

export interface CourseMaterialGroup {
  id: string;
  index: number;
  title: string;
  sections: CourseMaterialSectionGroup[];
}

interface CourseMaterialsSectionProps {
  course?: any;
  materialGroups?: CourseMaterialGroup[];
  className?: string;
  initiallyExpandedModules?: number;
}

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function normalizeMaterials(materials: unknown): CourseMaterialRecord[] {
  return Array.isArray(materials)
    ? materials.filter(Boolean) as CourseMaterialRecord[]
    : [];
}

export function buildCourseMaterialGroups(course: any): CourseMaterialGroup[] {
  const modules = Array.isArray(course?.curriculum?.modules)
    ? course.curriculum.modules
    : [];

  return modules
    .map((moduleRecord: any, moduleIndex: number) => {
      const sections = (Array.isArray(moduleRecord?.sections)
        ? moduleRecord.sections
        : []
      )
        .map((sectionRecord: any, sectionIndex: number) => ({
          id: `${moduleIndex + 1}-${sectionIndex + 1}`,
          title: String(sectionRecord?.title || `Section ${sectionIndex + 1}`),
          label: `Section ${moduleIndex + 1}.${sectionIndex + 1}`,
          materials: normalizeMaterials(sectionRecord?.studyMaterial),
        }))
        .filter(
          (sectionRecord: CourseMaterialSectionGroup) =>
            sectionRecord.materials.length > 0
        );

      if (!sections.length) {
        return null;
      }

      return {
        id: String(
          moduleRecord?.moduleId ||
            moduleRecord?.id ||
            moduleRecord?._id ||
            moduleIndex + 1
        ),
        index: moduleIndex + 1,
        title: String(moduleRecord?.title || `Module ${moduleIndex + 1}`),
        sections,
      } satisfies CourseMaterialGroup;
    })
    .filter(Boolean) as CourseMaterialGroup[];
}

export function countCourseMaterials(groups: CourseMaterialGroup[]) {
  return groups.reduce(
    (total, group) =>
      total +
      group.sections.reduce(
        (sectionTotal, section) => sectionTotal + section.materials.length,
        0
      ),
    0
  );
}

function getRawMaterialPath(material: CourseMaterialRecord) {
  return String(
    material?.previewUrl ||
      material?.assetPath ||
      material?.path ||
      material?.url ||
      material?.file ||
      ""
  ).trim();
}

function getMaterialUrl(material: CourseMaterialRecord) {
  const rawPath = getRawMaterialPath(material);
  return rawPath ? buildCourseAssetUrl(rawPath) : "";
}

function getMaterialName(material: CourseMaterialRecord) {
  const explicitName = String(
    material?.name || material?.title || material?.fileName || ""
  ).trim();

  if (explicitName) return explicitName;

  const rawPath = getRawMaterialPath(material);
  const pathWithoutQuery = rawPath.split("?")[0];
  const fileName = pathWithoutQuery.split("/").filter(Boolean).pop();

  return fileName ? decodeURIComponent(fileName) : "Study material";
}

function getMaterialExtension(material: CourseMaterialRecord) {
  const materialName = getMaterialName(material);
  const cleanName = materialName.split("?")[0];
  const extension = cleanName.includes(".")
    ? cleanName.split(".").pop()?.toLowerCase()
    : "";

  return extension || "file";
}

function getMaterialIcon(material: CourseMaterialRecord) {
  const extension = getMaterialExtension(material);
  const mimeType = String(material?.mimeType || material?.type || "").toLowerCase();

  if (
    ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extension) ||
    mimeType.startsWith("image/")
  ) {
    return FileImage;
  }

  if (
    ["xls", "xlsx", "csv"].includes(extension) ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel")
  ) {
    return FileSpreadsheet;
  }

  if (
    ["zip", "rar", "7z", "tar", "gz"].includes(extension) ||
    mimeType.includes("zip") ||
    mimeType.includes("archive")
  ) {
    return FileArchive;
  }

  if (
    ["pdf", "doc", "docx", "txt", "rtf", "ppt", "pptx"].includes(
      extension
    ) ||
    mimeType.includes("document") ||
    mimeType.includes("pdf") ||
    mimeType.includes("presentation")
  ) {
    return FileText;
  }

  return File;
}

function formatMaterialSize(material: CourseMaterialRecord) {
  const rawValue =
    material?.sizeBytes ?? material?.size ?? material?.fileSize ?? null;
  const numericValue = Number(rawValue);

  if (!Number.isFinite(numericValue) || numericValue <= 0) return "";

  const units = ["B", "KB", "MB", "GB"];
  let value = numericValue;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? Math.round(value) : value.toFixed(1)} ${
    units[unitIndex]
  }`;
}

interface MaterialCardProps {
  material: CourseMaterialRecord;
  helperText: string;
}

function MaterialCard({ material, helperText }: MaterialCardProps) {
  const materialUrl = getMaterialUrl(material);
  const materialName = getMaterialName(material);
  const extension = getMaterialExtension(material).toUpperCase();
  const formattedSize = formatMaterialSize(material);
  const MaterialIcon = getMaterialIcon(material);

  return (
    <article className="group min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-card p-2.5 transition duration-200 hover:border-primary/25 hover:shadow-sm sm:p-3">
      <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground sm:h-11 sm:w-11">
          <MaterialIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="break-words text-xs font-semibold leading-5 text-foreground sm:text-sm">
                {materialName}
              </h4>
              <p className="mt-0.5 break-words text-[10px] leading-4 text-muted-foreground sm:text-[11px]">
                {helperText}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[10px]">
              {extension}
            </span>
          </div>

          {formattedSize ? (
            <p className="mt-1.5 text-[10px] font-medium text-muted-foreground sm:text-[11px]">
              {formattedSize}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:ml-[3.5rem] sm:flex sm:justify-end">
        {materialUrl ? (
          <>
            <a
              href={materialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 text-[11px] font-semibold text-foreground transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary sm:h-9 sm:flex-none sm:rounded-full sm:text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span>Open</span>
            </a>

            <a
              href={materialUrl}
              download
              className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-[11px] font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 sm:h-9 sm:flex-none sm:rounded-full sm:text-xs"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              <span>Download</span>
            </a>
          </>
        ) : (
          <span className="col-span-2 rounded-xl bg-muted px-3 py-2 text-center text-[10px] text-muted-foreground sm:ml-auto sm:text-[11px]">
            Material link unavailable
          </span>
        )}
      </div>
    </article>
  );
}

function groupMatchesSearch(group: CourseMaterialGroup, normalizedQuery: string) {
  if (!normalizedQuery) return true;

  if (group.title.toLowerCase().includes(normalizedQuery)) return true;

  return group.sections.some(
    (section) =>
      section.title.toLowerCase().includes(normalizedQuery) ||
      section.materials.some((material) =>
        getMaterialName(material).toLowerCase().includes(normalizedQuery)
      )
  );
}

export default function CourseMaterialsSection({
  course,
  materialGroups,
  className,
  initiallyExpandedModules = 1,
}: CourseMaterialsSectionProps) {
  const groups = useMemo(
    () => materialGroups ?? buildCourseMaterialGroups(course),
    [course, materialGroups]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<string>>(
    () => new Set(groups.slice(0, initiallyExpandedModules).map((group) => group.id))
  );

  useEffect(() => {
    if (!groups.length || expandedModuleIds.size > 0) return;

    setExpandedModuleIds(
      new Set(groups.slice(0, initiallyExpandedModules).map((group) => group.id))
    );
  }, [expandedModuleIds.size, groups, initiallyExpandedModules]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredGroups = useMemo(
    () => groups.filter((group) => groupMatchesSearch(group, normalizedQuery)),
    [groups, normalizedQuery]
  );

  const totalMaterialCount = useMemo(() => countCourseMaterials(groups), [groups]);
  const visibleMaterialCount = useMemo(
    () => countCourseMaterials(filteredGroups),
    [filteredGroups]
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModuleIds((current) => {
      const next = new Set(current);

      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }

      return next;
    });
  };

  if (!groups.length) {
    return (
      <div className={joinClasses("p-3.5 sm:p-5", className)}>
        <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/25 px-5 py-10 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Archive className="h-5 w-5" />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            No materials yet
          </h3>
          <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground sm:text-sm">
            No study materials are attached to this course yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={joinClasses("min-w-0 max-w-full p-2.5 sm:p-5", className)}>
      <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <FolderOpen className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground sm:text-sm">
              {totalMaterialCount} resource{totalMaterialCount === 1 ? "" : "s"}
            </p>
            <p className="text-[10px] text-muted-foreground sm:text-[11px]">
              Grouped by module and lesson
            </p>
          </div>
        </div>

        <label className="relative block w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search materials"
            className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/10 sm:rounded-full sm:text-sm"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Clear material search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </label>
      </div>

      {normalizedQuery ? (
        <p className="px-1 pb-1 pt-3 text-[11px] text-muted-foreground sm:text-xs">
          Showing {visibleMaterialCount} of {totalMaterialCount} resources
        </p>
      ) : null}

      <div className="mt-3 space-y-2.5 sm:space-y-3">
        {filteredGroups.length ? (
          filteredGroups.map((group) => {
            const moduleMaterialCount =
              group.sections.reduce(
                (total, section) => total + section.materials.length,
                0
              );
            const isExpanded =
              normalizedQuery.length > 0 || expandedModuleIds.has(group.id);

            return (
              <section
                key={group.id}
                className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleModule(group.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`course-material-module-${group.id}`}
                  className="flex w-full min-w-0 items-center gap-2.5 px-3 py-3 text-left transition hover:bg-muted/35 sm:gap-3 sm:px-4 sm:py-3.5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-bold text-primary sm:h-10 sm:w-10 sm:text-sm">
                    {String(group.index).padStart(2, "0")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.17em] text-primary/80 sm:text-[10px]">
                      Module {group.index}
                    </span>
                    <span className="mt-0.5 block truncate text-xs font-semibold text-foreground sm:text-sm">
                      {group.title}
                    </span>
                  </span>

                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground sm:text-[11px]">
                    {moduleMaterialCount}
                  </span>

                  <ChevronDown
                    className={joinClasses(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                <div
                  id={`course-material-module-${group.id}`}
                  className={joinClasses(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="space-y-4 border-t border-border/75 p-2.5 sm:p-4">
                      {group.sections.map((sectionGroup) => (
                        <div
                          key={sectionGroup.id}
                          className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-dashed border-border bg-muted/20 p-2.5 sm:p-3"
                        >
                          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 px-0.5 pb-2.5">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-primary sm:text-[10px]">
                                {sectionGroup.label}
                              </span>
                              <h4 className="min-w-0 break-words text-xs font-semibold text-foreground sm:text-sm">
                                {sectionGroup.title}
                              </h4>
                            </div>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {sectionGroup.materials.length} file
                              {sectionGroup.materials.length === 1 ? "" : "s"}
                            </span>
                          </div>

                          <div className="grid min-w-0 grid-cols-1 gap-2 lg:grid-cols-2">
                            {sectionGroup.materials.map((material, materialIndex) => (
                              <MaterialCard
                                key={`${sectionGroup.id}-${materialIndex}`}
                                material={material}
                                helperText={`Lesson material · ${sectionGroup.title}`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          })
        ) : (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-8 text-center">
            <Search className="h-5 w-5 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">
              No matching materials
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different file, module, or lesson name.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
