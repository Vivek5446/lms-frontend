"use client";

export const LANGUAGES = ["English", "Spanish", "French", "German", "Hindi", "Arabic", "Chinese"];
export const CATEGORIES = ["Technology", "Business", "Design", "Marketing", "HR", "Compliance", "Leadership"];
export const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export type QuizMode = "per-module" | "final";
export type StoredFileKind = "image" | "video" | "document" | "scorm" | "zip" | "spreadsheet" | "other";

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  kind: StoredFileKind;
  previewUrl?: string;
  file: File;
}

export interface CourseBasicInfo {
  courseCode: string;
  courseName: string;
  slug: string;
  descriptionHtml: string;
  descriptionText: string;
  thumbnail: StoredFile | null;
  languages: string[];
  categories: string[];
  level: string;
  visibilityType: "private" | "public";
  totalMarks: string;
}

export interface CourseModuleSectionInput {
  id: string;
  title: string;
  description: string;
  contentFile: StoredFile | null;
  studyMaterials: StoredFile[];
}

export interface CourseModuleInput {
  id: string;
  name: string;
  description: string;
  sections: CourseModuleSectionInput[];
  studyMaterials: StoredFile[];
  hasQuiz: boolean;
  hasTest: boolean;
}

export interface CourseStructureState {
  quizMode: QuizMode;
  modules: CourseModuleInput[];
}

export interface CourseProgressState {
  completionDays: string;
  dripEnabled: boolean;
  certificateEnabled: boolean;
  mandatoryModules: boolean;
}

export interface CoursePricingState {
  isPaid: boolean;
  amount: string;
  currency: "INR";
  accessDurationDays: string;
}

export interface CourseFormState {
  basicInfo: CourseBasicInfo;
  structure: CourseStructureState;
  progress: CourseProgressState;
  pricing: CoursePricingState;
}

function createClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getFileExtension(fileName: string) {
  return fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() ?? "" : "";
}

function parseNumericValue(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function createCourseSlug(courseName: string) {
  return courseName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractPlainTextFromHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function inferModuleUploadKind(file: File): StoredFileKind {
  const extension = getFileExtension(file.name);
  const normalizedName = file.name.toLowerCase();

  if (extension === "scorm" || normalizedName.includes("scorm")) {
    return "scorm";
  }

  if (extension === "zip" || file.type.includes("zip")) {
    return "zip";
  }

  if (file.type.startsWith("video/")) {
    return "video";
  }

  if (file.type === "application/pdf" || extension === "pdf") {
    return "document";
  }

  return "other";
}

export function createStoredFile(file: File, kind: StoredFileKind, previewUrl?: string): StoredFile {
  return {
    id: createClientId(),
    name: file.name,
    size: file.size,
    type: file.type,
    extension: getFileExtension(file.name),
    kind,
    previewUrl,
    file,
  };
}

export function createEmptyModuleSection(): CourseModuleSectionInput {
  return {
    id: createClientId(),
    title: "",
    description: "",
    contentFile: null,
    studyMaterials: [],
  };
}

export function createEmptyModule(): CourseModuleInput {
  return {
    id: createClientId(),
    name: "",
    description: "",
    sections: [createEmptyModuleSection()],
    studyMaterials: [],
    hasQuiz: false,
    hasTest: false,
  };
}

export const initialCourseFormState: CourseFormState = {
  basicInfo: {
    courseCode: "",
    courseName: "",
    slug: "",
    descriptionHtml: "",
    descriptionText: "",
    thumbnail: null,
    languages: ["English"],
    categories: [],
    level: "Beginner",
    visibilityType: "private",
    totalMarks: "",
  },
  structure: {
    quizMode: "per-module",
    modules: [],
  },
  progress: {
    completionDays: "",
    dripEnabled: false,
    certificateEnabled: true,
    mandatoryModules: true,
  },
  pricing: {
    isPaid: false,
    amount: "",
    currency: "INR",
    accessDurationDays: "",
  },
};

function summarizeFile(file: StoredFile | null) {
  if (!file) {
    return null;
  }

  return {
    name: file.name,
    kind: file.kind,
    mimeType: file.type || "unknown",
    extension: file.extension || null,
    sizeInBytes: file.size,
    previewUrl: file.previewUrl ?? null,
  };
}

export function formatInr(value: string | number | null | undefined) {
  const numericValue = typeof value === "number" ? value : parseNumericValue(String(value ?? ""));

  if (numericValue === null) {
    return "Free";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function getFileKindLabel(kind: StoredFileKind) {
  switch (kind) {
    case "scorm":
      return "SCORM";
    case "zip":
      return "ZIP";
    case "video":
      return "Video";
    case "document":
      return "PDF";
    case "spreadsheet":
      return "CSV";
    case "image":
      return "Image";
    default:
      return "File";
  }
}

export function createStudyMaterialFiles(fileList: FileList | File[]) {
  return Array.from(fileList || []).map((file) => createStoredFile(file, "document"));
}

export function collectCourseUploadFiles(courseForm: CourseFormState) {
  const scormFiles: File[] = [];
  const contentFiles: File[] = [];
  const studyMaterialFiles: File[] = [];

  courseForm.structure.modules.forEach((module) => {
    module.studyMaterials.forEach((material) => {
      studyMaterialFiles.push(material.file);
    });

    module.sections.forEach((section) => {
      if (section.contentFile) {
        if (section.contentFile.kind === "scorm" || section.contentFile.kind === "zip") {
          scormFiles.push(section.contentFile.file);
        } else {
          contentFiles.push(section.contentFile.file);
        }
      }

      section.studyMaterials.forEach((material) => {
        studyMaterialFiles.push(material.file);
      });
    });
  });

  return {
    scormFiles,
    contentFiles,
    studyMaterialFiles,
    totalFileCount:
      scormFiles.length +
      contentFiles.length +
      studyMaterialFiles.length +
      (courseForm.basicInfo.thumbnail?.file ? 1 : 0),
  };
}

export function buildCoursePayload(courseForm: CourseFormState, action: "draft" | "publish") {
  const amount = courseForm.pricing.isPaid ? parseNumericValue(courseForm.pricing.amount) : null;
  const accessDurationDays = parseNumericValue(courseForm.pricing.accessDurationDays);
  const completionDays = parseNumericValue(courseForm.progress.completionDays);
  const totalMarks = parseNumericValue(courseForm.basicInfo.totalMarks);
  const totalSections = courseForm.structure.modules.reduce((count, module) => count + module.sections.length, 0);

  return {
    action,
    generatedAt: new Date().toISOString(),
    course: {
      courseCode: courseForm.basicInfo.courseCode,
      title: courseForm.basicInfo.courseName.trim(),
      slug: courseForm.basicInfo.slug,
      description: {
        text: courseForm.basicInfo.descriptionText,
        html: courseForm.basicInfo.descriptionHtml,
      },
      taxonomy: {
        languages: courseForm.basicInfo.languages,
        categories: courseForm.basicInfo.categories,
        level: courseForm.basicInfo.level,
      },
      visibility: {
        type: courseForm.basicInfo.visibilityType,
      },
      assessment: {
        totalMarks,
      },
      media: {
        thumbnail: summarizeFile(courseForm.basicInfo.thumbnail),
      },
    },
    curriculum: {
      quizStrategy: courseForm.structure.quizMode,
      totalModules: courseForm.structure.modules.length,
      totalSections,
      modules: courseForm.structure.modules.map((module, index) => ({
        order: index + 1,
        title: module.name.trim(),
        summary: module.description.trim(),
        sectionCount: module.sections.length,
        studyMaterial: module.studyMaterials.map((material) => summarizeFile(material)),
        sections: module.sections.map((section, sectionIndex) => ({
          order: sectionIndex + 1,
          title: section.title.trim(),
          description: section.description.trim(),
          content: summarizeFile(section.contentFile),
          studyMaterial: section.studyMaterials.map((material) => summarizeFile(material)),
        })),
        assessments: {
          quizEnabled: module.hasQuiz,
          testEnabled: module.hasTest,
        },
      })),
    },
    progression: {
      completionWindowDays: completionDays,
      dripEnabled: courseForm.progress.dripEnabled,
      certificateEnabled: courseForm.progress.certificateEnabled,
      mandatoryModules: courseForm.progress.mandatoryModules,
    },
    commerce: {
      pricingModel: courseForm.pricing.isPaid ? "paid" : "free",
      currency: courseForm.pricing.currency,
      amountInRupees: amount,
      accessDurationDays,
    },
    meta: {
      moduleCount: courseForm.structure.modules.length,
      sectionCount: totalSections,
    },
  };
}
