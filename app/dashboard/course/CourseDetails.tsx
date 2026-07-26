"use client";

import ScormQuizReviewContent from "@/app/dashboard/course/scorm/ScormQuizReviewContent";
import {
  clampLearningProgress,
  getLearningProgressState,
  getLearningStatusMeta,
} from "@/app/dashboard/course/scorm/progressPresentation";
import {
  estimateCompletedSections,
  ScormAnswerSectionRecord,
  summarizeAnswerSections,
} from "@/app/dashboard/course/scorm/quizReviewTypes";
import {
  buildCourseAssetUrl,
  buildLaunchSection,
  CourseLaunchSection,
  deriveModuleId,
  deriveSectionId,
  getFirstPlayableLaunchSection,
  isScormLaunchSection,
  preloadCourseAsset,
} from "@/app/dashboard/course/scorm/sectionTracking";
import { CourseQuizForLearner } from "@/app/store/courseStore/courseStore";
import stores from "@/app/store/stores";
import {
  DEFAULT_LEARNER_PRIMARY_COLOR,
  mixHexColors,
  normalizeHexColor,
} from "@/app/theme/theme";
import { useColorMode, useTheme } from "@chakra-ui/react";
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Clock,
  Download,
  ExternalLink,
  FileBox,
  FileText,
  GraduationCap,
  Layers,
  Lock,
  PlayCircle,
  Rocket,
  Star,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function hexToHslTriplet(hexColor: string) {
  const normalizedHex = String(hexColor || "")
    .trim()
    .replace("#", "");
  const expandedHex =
    normalizedHex.length === 3
      ? normalizedHex
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalizedHex;

  const safeHex = /^[0-9a-fA-F]{6}$/.test(expandedHex) ? expandedHex : "2563EB";
  const red = Number.parseInt(safeHex.slice(0, 2), 16) / 255;
  const green = Number.parseInt(safeHex.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(safeHex.slice(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta !== 0) {
    saturation =
      lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }

    hue /= 6;
  }

  return `${Math.round(hue * 360)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

function normalizeMaterials(materials: any) {
  return Array.isArray(materials) ? materials.filter(Boolean) : [];
}

function getStartLearningLabel(
  launchSection: CourseLaunchSection | null,
  fallbackPath?: string | null
) {
  if (launchSection?.contentKind === "video") return "Watch Lesson";
  if (launchSection?.contentKind === "document") return "Open Lesson";
  if (launchSection && isScormLaunchSection(launchSection)) return "Start SCORM";
  if (fallbackPath) return "Start Learning";
  return "No lesson asset";
}

function getSectionActionLabel(
  launchSection: CourseLaunchSection | null,
  status?: string | null,
  progress?: number | null
) {
  if (!launchSection) {
    return "Lesson unavailable";
  }

  const state = getLearningProgressState(status, progress);
  if (state === "completed") {
    if (launchSection.contentKind === "video") return "Rewatch video";
    if (launchSection.contentKind === "document") return "Reopen document";
    return "Review lesson";
  }

  if (state === "in_progress") {
    if (launchSection.contentKind === "video") return "Resume video";
    if (launchSection.contentKind === "document") return "Continue document";
    return "Continue lesson";
  }

  if (launchSection.contentKind === "video") return "Start video";
  if (launchSection.contentKind === "document") return "Open document";
  return "Start lesson";
}

function getSectionTypeLabel(contentKind?: string | null) {
  const normalizedKind = String(contentKind || "").trim().toLowerCase();
  if (normalizedKind === "video") return "VIDEO";
  if (normalizedKind === "document") return "DOCUMENT";
  if (normalizedKind === "scorm" || normalizedKind === "zip") return "SCORM";
  return normalizedKind ? normalizedKind.toUpperCase() : "";
}

function formatAccessLabel(value?: string | null) {
  if (!value) return "No expiry";
  const accessDate = new Date(value);
  if (Number.isNaN(accessDate.getTime())) return "No expiry";
  return accessDate.toLocaleDateString();
}

function formatCompactNumber(value: unknown, fallback: string) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return numericValue.toLocaleString();
}

function getInstructor(course: any) {
  return {
    name: String(course?.instructor?.name || "").trim() || "Course Instructor",
    designation: String(course?.instructor?.designation || "").trim(),
    companyName: String(course?.instructor?.companyName || "").trim(),
    avatarUrl: String(course?.instructor?.avatarUrl || "").trim(),
  };
}

function getInstructorMeta(instructor: ReturnType<typeof getInstructor>) {
  return [instructor.designation, instructor.companyName].filter(Boolean).join(" - ");
}

function getInstructorInitials(name: string) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "CI";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function getLearningOutcomes(course: any) {
  const storedItems = Array.isArray(course?.highlights?.learningOutcomes)
    ? course.highlights.learningOutcomes
        .map((item: any) => String(item || "").trim())
        .filter(Boolean)
    : [];

  if (storedItems.length > 0) {
    return storedItems;
  }

  return Array.isArray(course?.curriculum?.modules)
    ? course.curriculum.modules
        .flatMap((moduleRecord: any) => [moduleRecord?.summary, moduleRecord?.title])
        .map((item: any) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];
}

function getMaterialGroups(course: any) {
  const modules = Array.isArray(course?.curriculum?.modules) ? course.curriculum.modules : [];

  return modules
    .map((moduleRecord: any, moduleIndex: number) => {
      const moduleMaterials = normalizeMaterials(moduleRecord?.studyMaterial);
      const sections = (moduleRecord?.sections || [])
        .map((sectionRecord: any, sectionIndex: number) => ({
          id: `${moduleIndex + 1}-${sectionIndex + 1}`,
          title: String(sectionRecord?.title || `Section ${sectionIndex + 1}`),
          label: `Section ${moduleIndex + 1}.${sectionIndex + 1}`,
          materials: normalizeMaterials(sectionRecord?.studyMaterial),
        }))
        .filter((sectionRecord: any) => sectionRecord.materials.length > 0);

      if (!moduleMaterials.length && !sections.length) {
        return null;
      }

      return {
        id: String(moduleRecord?.moduleId || moduleRecord?.id || moduleIndex + 1),
        index: moduleIndex + 1,
        title: String(moduleRecord?.title || `Module ${moduleIndex + 1}`),
        moduleMaterials,
        sections,
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    index: number;
    title: string;
    moduleMaterials: any[];
    sections: Array<{ id: string; title: string; label: string; materials: any[] }>;
  }>;
}

function getSectionIcon(kind: string, completed: boolean, hasLaunch: boolean) {
  if (completed) return CheckCircle;
  if (kind === "video") return Video;
  if (kind === "document") return FileText;
  if (hasLaunch) return PlayCircle;
  return BookOpen;
}

function getMaterialUrl(material: any) {
  const rawPath = String(
    material?.previewUrl ||
      material?.assetPath ||
      material?.path ||
      material?.url ||
      material?.file ||
      ""
  ).trim();

  return rawPath ? buildCourseAssetUrl(rawPath) : "";
}

function getPriceLabel(course: any) {
  if (course?.commerce?.pricingModel === "paid" && Number(course?.commerce?.amountInRupees) > 0) {
    return `INR ${Number(course.commerce.amountInRupees).toLocaleString()}`;
  }

  return "Free";
}

interface CourseDetailsProps {
  course: any;
  onBack: () => void;
  onLaunchSection: (launchSection: CourseLaunchSection) => void;
  onEditCourse?: (course: any) => void;
  onAssignCourse?: (course: any) => void;
  learnerAnswers?: ScormAnswerSectionRecord[];
  isLearnerAnswersLoading?: boolean;
  courseQuizzes?: CourseQuizForLearner[];
  isCourseQuizzesLoading?: boolean;
  onTakeQuiz?: (quiz: CourseQuizForLearner) => void;
  onDownloadCertificate?: (courseId: string) => void;
  isCertificateDownloading?: boolean;
  onEnrollCourse?: () => void;
  isEnrolling?: boolean;
}


export default function CourseDetails({
  course,
  onBack,
  onLaunchSection,
  onEditCourse,
  onAssignCourse,
  learnerAnswers = [],
  isLearnerAnswersLoading = false,
  courseQuizzes = [],
  isCourseQuizzesLoading = false,
  onTakeQuiz,
  onDownloadCertificate,
  isCertificateDownloading = false,
  onEnrollCourse,
  isEnrolling = false,
}: CourseDetailsProps) {
  const { colorMode } = useColorMode();
  const theme = useTheme();
  const {
    auth: { user },
    themeStore: { themeConfig },
    courseStore,
  } = stores;
  const isAssignedCourseView = Array.isArray(course.sources);
  const canSelfEnroll = Boolean(!isAssignedCourseView && onEnrollCourse);
  const answerSummary = summarizeAnswerSections(learnerAnswers);
  const totalSections = Number(course.curriculum?.totalSections || 0);
  const progressModules = Array.isArray(course.progressModules) ? course.progressModules : [];
  const courseId = String(course._id || course.courseId || "").trim();
  const [moduleRecords, setModuleRecords] = useState<any[]>(
    Array.isArray(course.curriculum?.modules) ? course.curriculum.modules : []
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreModules, setHasMoreModules] = useState(false);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [sectionLoadingByModule, setSectionLoadingByModule] = useState<Record<string, boolean>>({});
  const [sectionLoadedByModule, setSectionLoadedByModule] = useState<Record<string, boolean>>({});
  const [sectionErrorByModule, setSectionErrorByModule] = useState<Record<string, string | null>>({});
  const courseWithLoadedModules = useMemo(
    () => ({
      ...course,
      curriculum: {
        ...(course.curriculum || {}),
        modules: moduleRecords,
      },
    }),
    [course, moduleRecords]
  );
  const firstPlayableLaunchSection = getFirstPlayableLaunchSection(courseWithLoadedModules);
  const certificateReason =
    course.certificate?.reason || "Certificate will be available after eligibility is confirmed.";
  const certificateStatus = String(course.certificate?.status || "").trim().toLowerCase();
  const canDownloadCertificate = Boolean(
    isAssignedCourseView &&
    course.progression?.certificateEnabled !== false &&
    course.certificate?.enabled !== false &&
    course.certificate &&
    (certificateStatus === "issued" || course.certificate.canIssue)
  );
  const modules = moduleRecords;
  const enforceSequentialProgress = Boolean(isAssignedCourseView && course.progression?.mandatoryModules !== false);

  useEffect(() => {
    let isMounted = true;
    const initialModules = Array.isArray(course.curriculum?.modules) ? course.curriculum.modules : [];
    setModuleRecords(initialModules);
    setNextCursor(null);
    setHasMoreModules(false);
    setSectionLoadingByModule({});
    setSectionLoadedByModule({});
    setSectionErrorByModule({});

    if (!courseId) {
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingModules(true);
    courseStore
      .fetchCourseModules(courseId, { reset: true, limit: 5 })
      .then((loadedModules) => {
        if (!isMounted) return;
        setModuleRecords(loadedModules);
        setNextCursor(courseStore.nextModuleCursor);
        setHasMoreModules(courseStore.hasMoreModules);
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setIsLoadingModules(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [course._id, course.courseId]);

  const loadMoreModules = async () => {
    if (!courseId || isLoadingModules || !hasMoreModules) {
      return;
    }

    setIsLoadingModules(true);
    try {
      const loadedModules = await courseStore.fetchCourseModules(courseId, { limit: 5 });
      setModuleRecords(loadedModules);
      setNextCursor(courseStore.nextModuleCursor);
      setHasMoreModules(courseStore.hasMoreModules);
    } finally {
      setIsLoadingModules(false);
    }
  };

  const loadSectionsForModule = async (moduleId: string, force = false) => {
    if (!courseId || (!force && sectionLoadedByModule[moduleId]) || sectionLoadingByModule[moduleId]) {
      return;
    }

    setSectionLoadingByModule((current) => ({ ...current, [moduleId]: true }));
    setSectionErrorByModule((current) => ({ ...current, [moduleId]: null }));

    try {
      const sections = await courseStore.fetchCourseSections(courseId, moduleId, { force });
      setModuleRecords((currentModules) =>
        currentModules.map((moduleRecord) =>
          deriveModuleId(moduleRecord) === moduleId ? { ...moduleRecord, sections } : moduleRecord
        )
      );
      setSectionLoadedByModule((current) => ({ ...current, [moduleId]: true }));
    } catch (error: any) {
      setSectionErrorByModule((current) => ({
        ...current,
        [moduleId]: error?.message || error?.error || "Failed to load sections",
      }));
    } finally {
      setSectionLoadingByModule((current) => ({ ...current, [moduleId]: false }));
    }
  };

  useEffect(() => {
    modules.slice(0, 2).forEach((moduleRecord: any) => {
      const moduleId = deriveModuleId(moduleRecord);
      if (moduleId && !sectionLoadedByModule[moduleId] && !sectionLoadingByModule[moduleId]) {
        void loadSectionsForModule(moduleId);
      }
    });
  }, [modules]);

  const warmLaunchSection = (launchSection?: CourseLaunchSection | null) => {
    if (launchSection && isScormLaunchSection(launchSection)) {
      void preloadCourseAsset(launchSection.assetPath).catch(() => undefined);
    }
  };

  const moduleProgressMap = useMemo(
    () => new Map<string, any>(progressModules.map((moduleRecord: any) => [moduleRecord.moduleId, moduleRecord])),
    [progressModules]
  );

  const sectionProgressMap = useMemo(() => {
    const nextMap = new Map<string, any>();

    progressModules.forEach((moduleRecord: any) => {
      (moduleRecord.sections || []).forEach((sectionRecord: any) => {
        nextMap.set(sectionRecord.sectionId, sectionRecord);
      });
    });

    return nextMap;
  }, [progressModules]);

  const sectionSummary = useMemo(() => {
    let computedTotal = 0;
    let completed = 0;
    let inProgress = 0;

    modules.forEach((moduleRecord: any) => {
      (moduleRecord.sections || []).forEach((sectionRecord: any) => {
        computedTotal += 1;
        const trackingRecord = sectionProgressMap.get(deriveSectionId(moduleRecord, sectionRecord));
        const state = getLearningProgressState(trackingRecord?.lessonStatus, trackingRecord?.progress);

        if (state === "completed") {
          completed += 1;
          return;
        }

        if (state === "in_progress") {
          inProgress += 1;
        }
      });
    });

    return {
      total: computedTotal || totalSections,
      completed,
      inProgress,
      notStarted: Math.max((computedTotal || totalSections) - completed - inProgress, 0),
    };
  }, [modules, sectionProgressMap, totalSections]);

  const unlockedSectionIds = useMemo(() => {
    const unlockedIds = new Set<string>();

    if (!enforceSequentialProgress) {
      modules.forEach((moduleRecord: any) => {
        (moduleRecord.sections || []).forEach((sectionRecord: any) => {
          unlockedIds.add(deriveSectionId(moduleRecord, sectionRecord));
        });
      });
      return unlockedIds;
    }

    let hasReachedFirstIncomplete = false;
    modules.forEach((moduleRecord: any) => {
      (moduleRecord.sections || []).forEach((sectionRecord: any) => {
        const sectionId = deriveSectionId(moduleRecord, sectionRecord);
        const trackingRecord = sectionProgressMap.get(sectionId);
        const state = getLearningProgressState(trackingRecord?.lessonStatus, trackingRecord?.progress);

        if (!hasReachedFirstIncomplete) {
          unlockedIds.add(sectionId);
        }

        if (state !== "completed") {
          hasReachedFirstIncomplete = true;
        }
      });
    });

    return unlockedIds;
  }, [enforceSequentialProgress, modules, sectionProgressMap]);

  const sectionsCompleted = isAssignedCourseView
    ? sectionSummary.completed
    : estimateCompletedSections(course.progress, totalSections);

  const nextLaunchSection = useMemo(() => {
    let firstIncompleteLaunchSection: CourseLaunchSection | null = null;

    for (const moduleRecord of modules) {
      for (const sectionRecord of moduleRecord.sections || []) {
        const launchSection = buildLaunchSection(moduleRecord, sectionRecord);
        if (!launchSection) {
          continue;
        }

        if (enforceSequentialProgress && !unlockedSectionIds.has(launchSection.sectionId)) {
          continue;
        }

        const trackingRecord = sectionProgressMap.get(launchSection.sectionId);
        const state = getLearningProgressState(trackingRecord?.lessonStatus, trackingRecord?.progress);

        if (state === "in_progress") {
          return launchSection;
        }

        if (!firstIncompleteLaunchSection && state !== "completed") {
          firstIncompleteLaunchSection = launchSection;
        }
      }
    }

    return firstIncompleteLaunchSection || firstPlayableLaunchSection;
  }, [enforceSequentialProgress, firstPlayableLaunchSection, modules, sectionProgressMap, unlockedSectionIds]);

  const nextLaunchTracking = nextLaunchSection ? sectionProgressMap.get(nextLaunchSection.sectionId) : null;
  const nextLaunchLabel = getSectionActionLabel(
    nextLaunchSection,
    nextLaunchTracking?.lessonStatus,
    nextLaunchTracking?.progress
  );

  const pendingQuizzes = courseQuizzes.filter((quiz) => !quiz.attempt);
  const completedQuizzes = courseQuizzes.filter((quiz) => quiz.attempt);
  const nextQuiz = pendingQuizzes.find((quiz) => quiz.isUnlocked !== false) || courseQuizzes[0] || null;
  const instructor = useMemo(() => getInstructor(course), [course]);
  const instructorMeta = getInstructorMeta(instructor);
  const learningOutcomes = useMemo(() => getLearningOutcomes(course), [course]);
  const materialGroups = useMemo(() => getMaterialGroups(course), [course]);
  const totalMaterialCount = materialGroups.reduce(
    (count, group) =>
      count +
      group.moduleMaterials.length +
      group.sections.reduce((sectionTotal, sectionGroup) => sectionTotal + sectionGroup.materials.length, 0),
    0
  );
  const totalModuleCount = Number(course.curriculum?.totalModules || modules.length || 0);
  const totalLessonCount = Number(course.curriculum?.totalSections || sectionSummary.total || 0);
  const ratingLabel = Number.isFinite(Number(course?.metrics?.averageRating))
    ? Number(course.metrics.averageRating).toFixed(1)
    : "4.9";
  const reviewCountLabel = formatCompactNumber(course?.metrics?.reviewCount, "1,284");
  const learnersLabel = formatCompactNumber(course?.metrics?.totalEnrollments, "18,420");
  const durationLabel = String(course?.estimatedDuration || course?.durationLabel || "").trim() || "8h 42m";
  const progressLabel = clampLearningProgress(course.progress);
  const priceLabel = getPriceLabel(course);
  const categories = Array.isArray(course.taxonomy?.categories) ? course.taxonomy.categories : [];
  const levelLabel = String(course.taxonomy?.level || "Beginner");
  const visibilityLabel =
    course.visibility?.type === "public" ? "Public Course" : course.visibility?.type ? "Private Course" : "";
  const nextCardLabel = isAssignedCourseView
    ? `${sectionSummary.completed} of ${sectionSummary.total} lessons completed`
    : `${totalModuleCount} modules - ${totalLessonCount} lessons`;
  const heroSnapshotLabel = isAssignedCourseView ? `${progressLabel}%` : `${totalModuleCount} modules`;
  const finalQuizzes = courseQuizzes.filter((quiz) => quiz.scope === "final");
  const showQuizReview = isAssignedCourseView || learnerAnswers.length > 0 || courseQuizzes.length > 0;
  const previewLaunchSection = firstPlayableLaunchSection || nextLaunchSection;
  const courseThemeStyle = useMemo(() => {
    const brandScale = (theme.colors?.brand || {}) as Record<number, string>;
    const accentScale = (theme.colors?.purple || {}) as Record<number, string>;
    const isDark = colorMode === "dark";
    const companyPrimaryColor = normalizeHexColor(
      user?.companyDetails?.primaryThemeColor ||
        themeConfig?.colors?.custom?.light?.primary,
      DEFAULT_LEARNER_PRIMARY_COLOR
    );
    const primary = companyPrimaryColor || brandScale[isDark ? 400 : 500] || DEFAULT_LEARNER_PRIMARY_COLOR;
    const primaryForeground = "#FFFFFF";
    const accent =
      mixHexColors(primary, isDark ? "#A855F7" : "#312E81", isDark ? 0.22 : 0.18) ||
      accentScale[isDark ? 300 : 500] ||
      brandScale[isDark ? 300 : 400] ||
      primary;
    const accentForeground = "#FFFFFF";
    const background = isDark ? "#0F172A" : "#FFFFFA";
    const foreground = isDark ? "#F8FAFC" : "#0F172A";
    const card = isDark ? "#111827" : "#FFFFFF";
    const cardForeground = foreground;
    const secondary = isDark ? "#172033" : "#F8FAFC";
    const secondaryForeground = foreground;
    const muted = isDark ? "#1E293B" : "#F1F5F9";
    const mutedForeground = isDark ? "#CBD5E1" : "#475569";
    const border = isDark ? "#334155" : "#E2E8F0";
    const input = border;
    const ring = primary;

    return {
      "--background": hexToHslTriplet(background),
      "--foreground": hexToHslTriplet(foreground),
      "--card": hexToHslTriplet(card),
      "--card-foreground": hexToHslTriplet(cardForeground),
      "--primary": hexToHslTriplet(primary),
      "--primary-foreground": hexToHslTriplet(primaryForeground),
      "--secondary": hexToHslTriplet(secondary),
      "--secondary-foreground": hexToHslTriplet(secondaryForeground),
      "--muted": hexToHslTriplet(muted),
      "--muted-foreground": hexToHslTriplet(mutedForeground),
      "--accent": hexToHslTriplet(accent),
      "--accent-foreground": hexToHslTriplet(accentForeground),
      "--border": hexToHslTriplet(border),
      "--input": hexToHslTriplet(input),
      "--ring": hexToHslTriplet(ring),
    } as React.CSSProperties;
  }, [colorMode, theme, themeConfig?.colors?.custom?.light?.primary, user?.companyDetails?.primaryThemeColor]);

  const renderQuizCard = (quiz: CourseQuizForLearner) => {
    const completed = Boolean(quiz.attempt);
    const locked = !completed && quiz.isUnlocked === false;

    return (
      <div
        key={quiz.quizId}
        className={`mt-3 rounded-2xl border p-3.5 sm:p-4 ${
          locked
            ? "border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/30"
            : completed
            ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20"
            : "border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20"
        }`}
      >
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-white sm:h-11 sm:w-11 ${
                locked ? "bg-slate-400" : completed ? "bg-emerald-500" : "bg-amber-500"
              }`}
            >
              {locked ? <Lock className="h-4 w-4 sm:h-5 sm:w-5" /> : <Award className="h-4 w-4 sm:h-5 sm:w-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground sm:text-sm">{quiz.title}</p>
              <p className="text-[11px] text-muted-foreground sm:text-xs">
                {quiz.questionCount} question{quiz.questionCount === 1 ? "" : "s"} - {quiz.totalMarks} marks
              </p>
              <p className={`mt-1 text-xs sm:text-sm ${locked ? "text-slate-600 dark:text-slate-300" : completed ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
                {locked
                  ? quiz.unlockReason || "Complete the required course progress to unlock this quiz."
                  : completed
                  ? `Score ${quiz.attempt?.score}/${quiz.attempt?.maxScore} (${Math.round(
                      Number(quiz.attempt?.percentage || 0)
                    )}%)`
                  : "Required quiz waiting for you"}
              </p>
            </div>
          </div>
          {onTakeQuiz ? (
            <button
              type="button"
              disabled={locked}
              onClick={(event) => {
                event.stopPropagation();
                if (!locked) {
                  onTakeQuiz(quiz);
                }
              }}
              className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-xs font-medium transition sm:h-10 sm:text-sm ${
                locked
                  ? "cursor-not-allowed bg-slate-400 text-white opacity-80"
                  : completed
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
            >
              {locked ? "Locked" : completed ? "View Result" : "Take Quiz"}
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  const renderMaterialLink = (material: any, helperText: string, key: string) => {
    const materialUrl = getMaterialUrl(material);
    const hasUrl = Boolean(materialUrl);

    return (
      <div
        key={key}
        className="flex min-w-0 max-w-full flex-col gap-2.5 overflow-hidden rounded-2xl border border-border bg-background/80 p-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3"
      >
        <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-10 sm:w-10">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground sm:text-sm">
              {material?.name || "Study material"}
            </p>
            <p className="break-words text-[11px] text-muted-foreground sm:text-xs">{helperText}</p>
          </div>
        </div>
        <div className="flex gap-2 sm:justify-end">
          {hasUrl ? (
            <>
              <a
                href={materialUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground transition hover:bg-muted sm:h-9 sm:flex-none sm:text-sm"
              >
                <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Open
              </a>
              <a
                href={materialUrl}
                download
                className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium text-primary transition hover:bg-primary/10 sm:h-9 sm:flex-none sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Download
              </a>
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground sm:text-xs">Material link unavailable</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground" data-theme={colorMode} style={courseThemeStyle}>
      <section className="relative w-full max-w-full overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(56% 56% at 100% 0%, hsl(var(--primary) / 0.18), transparent 55%), radial-gradient(42% 42% at 0% 36%, hsl(var(--accent) / 0.14), transparent 62%)",
          }}
        />

        <div className="mx-auto w-full max-w-8xl px-1 pb-6 pt-4 sm:px-4 sm:pb-10 sm:pt-8 lg:px-6 lg:pb-14">
          <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted sm:h-11 sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Back
                </button>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {onEditCourse ? (
                    <button
                      type="button"
                      onClick={() => onEditCourse(course)}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-3 text-xs font-medium text-primary transition hover:bg-primary/15 sm:h-11 sm:px-4 sm:text-sm"
                    >
                      Edit Course
                    </button>
                  ) : null}
                  {onAssignCourse ? (
                    <button
                      type="button"
                      onClick={() => onAssignCourse(course)}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-3 text-xs font-medium text-primary transition hover:bg-primary/10 sm:h-11 sm:px-4 sm:text-sm"
                    >
                      Assign Course
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:mt-5 sm:gap-2">
                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary sm:px-3 sm:text-[11px]">
                  {levelLabel}
                </span>
                {categories.slice(0, 2).map((category: string, index: number) => (
                  <span
                    key={`${category}-${index}`}
                    className="inline-flex rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground sm:px-3 sm:text-[11px]"
                  >
                    {category}
                  </span>
                ))}
                {visibilityLabel ? (
                  <span className="inline-flex rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground sm:px-3 sm:text-[11px]">
                    {visibilityLabel}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:mt-4 sm:text-3xl lg:text-4xl xl:text-[2.7rem]">
                {course.title}
              </h1>

              <div
                className="prose prose-sm mt-3 max-w-none text-muted-foreground prose-headings:text-foreground prose-p:leading-6 prose-p:text-sm prose-strong:text-foreground prose-a:text-primary dark:prose-invert dark:prose-headings:text-foreground dark:prose-p:text-muted-foreground dark:prose-strong:text-foreground dark:prose-li:text-muted-foreground dark:prose-a:text-primary sm:mt-4 sm:prose-p:leading-7"
                dangerouslySetInnerHTML={{
                  __html: course.description?.html || course.description?.text || "<p>No description provided.</p>",
                }}
              />

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground sm:mt-5 sm:gap-x-5 sm:gap-y-2 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4" />
                  <span className="font-semibold text-foreground">{ratingLabel}</span>
                  <span>({reviewCountLabel})</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {learnersLabel} learners
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {durationLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {totalLessonCount} lessons
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2.5 sm:mt-5 sm:gap-3">
                {instructor.avatarUrl ? (
                  <img
                    src={instructor.avatarUrl}
                    alt={instructor.name}
                    className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-background shadow-sm sm:h-11 sm:w-11"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary sm:h-11 sm:w-11 sm:text-sm">
                    {getInstructorInitials(instructor.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground sm:text-sm">{instructor.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                    {instructorMeta || "Instructor details will appear here"}
                  </p>
                </div>
              </div>

              {canSelfEnroll ? (
                <div className="mt-5 rounded-2xl border border-border bg-card p-3.5 shadow-sm sm:mt-6 sm:rounded-[1.6rem] sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px]">
                        Enrollment price
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        <span className="text-lg font-semibold text-foreground sm:text-xl">{priceLabel}</span>
                        <span className="ml-2">- {totalMaterialCount} materials</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onEnrollCourse}
                      disabled={isEnrolling}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60 sm:h-11 sm:px-5 sm:text-sm"
                    >
                      <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {isEnrolling ? "Enrolling..." : "Self Enroll Now"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-border bg-card p-3.5 shadow-sm sm:mt-6 sm:rounded-[1.6rem] sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px]">
                        {isAssignedCourseView ? "Your progress" : "Course snapshot"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        <span className="text-lg font-semibold text-foreground sm:text-xl">{heroSnapshotLabel}</span>
                        <span className="ml-2">
                          {isAssignedCourseView
                            ? `- ${sectionSummary.completed}/${sectionSummary.total} lessons`
                            : `- ${totalMaterialCount} materials`}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onMouseEnter={() => warmLaunchSection(nextLaunchSection)}
                      onFocus={() => warmLaunchSection(nextLaunchSection)}
                      onClick={() => {
                        if (nextLaunchSection) {
                          onLaunchSection(nextLaunchSection);
                          return;
                        }

                        if (course.scormFilePath) {
                          onLaunchSection({
                            assetPath: course.scormFilePath,
                            contentKind: "scorm",
                            moduleId: "",
                            moduleTitle: "",
                            sectionId: "",
                            sectionTitle: course.title || "Course",
                          });
                        }
                      }}
                      disabled={!nextLaunchSection && !course.scormFilePath}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:px-5 sm:text-sm"
                    >
                      <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {isAssignedCourseView
                        ? nextLaunchLabel
                        : getStartLearningLabel(firstPlayableLaunchSection, course.scormFilePath)}
                    </button>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted sm:mt-4 sm:h-2">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-500"
                      style={{
                        width: `${isAssignedCourseView ? progressLabel : Math.min(totalModuleCount * 12, 100)}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground sm:mt-3 sm:text-xs">
                    <span>{nextCardLabel}</span>
                    <span>{durationLabel}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="order-first lg:order-last">
              <div className="group relative w-full max-w-full overflow-hidden rounded-[1.8rem] border border-border bg-muted shadow-xl shadow-black/5 dark:shadow-black/30">
                <div className="aspect-video w-full">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/5 to-accent">
                      <GraduationCap className="h-12 w-12 text-primary" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <button
                  type="button"
                  onClick={() => {
                    if (previewLaunchSection) {
                      onLaunchSection(previewLaunchSection);
                    }
                  }}
                  disabled={!previewLaunchSection}
                  className="absolute inset-0 flex items-center justify-center"
                  aria-label="Play preview"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-background/90 text-foreground shadow-lg transition group-hover:scale-110 sm:h-16 sm:w-16">
                    <PlayCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                  </span>
                </button>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white/90 sm:bottom-3 sm:left-3 sm:right-3 sm:text-xs">
                  <span className="rounded-full bg-black/45 px-2.5 py-1 backdrop-blur sm:px-3">
                    Preview course
                  </span>
                  <span className="rounded-full bg-black/45 px-2.5 py-1 backdrop-blur sm:px-3">
                    {durationLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-8xl min-w-0 grid-cols-1 gap-5 overflow-x-hidden pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:gap-6 sm:px-4 sm:pb-20 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-10 lg:px-6">
        <div className="min-w-0 max-w-full space-y-5 sm:space-y-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-10 sm:w-10">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">Course content</h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {totalModuleCount} modules - {totalLessonCount} lessons - {durationLabel}
              </p>
            </div>
          </div>

          <div className="w-full max-w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:rounded-[1.7rem]">
            {modules.length > 0 ? (
              <div className="divide-y divide-border/70">
                {modules.map((mod: any, moduleIndex: number) => {
                  const moduleId = deriveModuleId(mod);
                  const moduleTracking = moduleProgressMap.get(moduleId);
                  const moduleProgressMeta = getLearningStatusMeta(
                    moduleTracking?.lessonStatus,
                    moduleTracking?.progress
                  );
                  const moduleSections = Array.isArray(mod.sections) ? mod.sections : [];
                  const isSectionLoading = Boolean(sectionLoadingByModule[moduleId]);
                  const sectionLoadError = sectionErrorByModule[moduleId];
                  const moduleCompletedCount = moduleSections.filter((sec: any) => {
                    const trackingRecord = sectionProgressMap.get(deriveSectionId(mod, sec));
                    return getLearningProgressState(trackingRecord?.lessonStatus, trackingRecord?.progress) === "completed";
                  }).length;
                  const moduleProgressPercent = moduleSections.length
                    ? Math.round((moduleCompletedCount / moduleSections.length) * 100)
                    : 0;
                  const moduleQuizzes = courseQuizzes.filter(
                    (quiz) => quiz.scope === "module" && quiz.moduleId === moduleId
                  );

                  return (
                    <details
                      key={moduleId}
                      open={moduleIndex < 2}
                      onToggle={(event) => {
                        if ((event.currentTarget as HTMLDetailsElement).open) {
                          void loadSectionsForModule(moduleId);
                        }
                      }}
                      className="min-w-0 max-w-full [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="cursor-pointer list-none px-2.5 py-3 sm:px-5 sm:py-4">
                        <div className="flex w-full min-w-0 items-center gap-2.5 sm:gap-3">
                          <div
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[10px] font-semibold sm:h-11 sm:w-11 sm:rounded-2xl sm:text-[11px] ${
                              isAssignedCourseView && moduleProgressMeta.state === "completed"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {isAssignedCourseView && moduleProgressMeta.state === "completed" ? (
                              <CheckCircle2 className="h-14 w-14" />
                            ) : (
                              <span className="flex flex-col items-center leading-none">
                                <span className="text-[9px] uppercase tracking-[0.16em] opacity-70">Mod</span>
                                <span className="mt-1 text-xs font-bold">{String(moduleIndex + 1).padStart(2, "0")}</span>
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary/80 sm:text-[10px]">
                              Module {moduleIndex + 1}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-foreground sm:truncate sm:text-[15px]">
                              {mod.title}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground sm:gap-x-3 sm:text-xs">
                              <span>
                                {moduleSections.length} section{moduleSections.length === 1 ? "" : "s"}
                              </span>
                              {isAssignedCourseView && moduleTracking ? (
                                <span>
                                  {moduleTracking.sectionsCompleted}/{moduleTracking.sectionCount} complete
                                </span>
                              ) : null}
                              {isAssignedCourseView ? <span>{moduleProgressPercent}% done</span> : null}
                            </div>
                          </div>

                          <div className="hidden items-center gap-3 sm:flex">
                            {isAssignedCourseView ? (
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                                  moduleProgressMeta.state === "completed"
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                                    : moduleProgressMeta.state === "in_progress"
                                      ? "bg-primary/10 text-primary"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {moduleProgressMeta.label}
                              </span>
                            ) : null}
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-[width] duration-500"
                                style={{ width: `${moduleProgressPercent}%` }}
                              />
                            </div>
                            <span className="w-9 text-right text-xs font-medium text-muted-foreground">
                              {moduleProgressPercent}%
                            </span>
                          </div>

                          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground sm:h-5 sm:w-5" />
                        </div>
                      </summary>

                      <div className="border-t border-border/70 px-1.5 pb-3 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
                        {mod.summary ? (
                          <p className="pb-4 text-xs leading-6 text-muted-foreground sm:text-sm">{mod.summary}</p>
                        ) : null}

                        <ul className="relative max-w-full space-y-2 border-l border-dashed border-border pl-2.5 sm:pl-5">
                          {isSectionLoading && !moduleSections.length ? (
                            <li className="rounded-xl border border-border bg-background px-3 py-4 text-xs text-muted-foreground">
                              Loading sections...
                            </li>
                          ) : null}
                          {sectionLoadError ? (
                            <li className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span>{sectionLoadError}</span>
                                <button
                                  type="button"
                                  className="rounded-lg border border-red-200 px-2.5 py-1 font-medium dark:border-red-800"
                                  onClick={() => void loadSectionsForModule(moduleId, true)}
                                >
                                  Retry
                                </button>
                              </div>
                            </li>
                          ) : null}
                          {moduleSections.map((sec: any, index: number) => {
                            const sectionId = deriveSectionId(mod, sec);
                            const launchSection = buildLaunchSection(mod, sec);
                            const isSectionLocked = Boolean(isAssignedCourseView && !unlockedSectionIds.has(sectionId));
                            const sectionTracking = sectionProgressMap.get(sectionId);
                            const sectionProgressMeta = getLearningStatusMeta(
                              sectionTracking?.lessonStatus,
                              sectionTracking?.progress
                            );
                            const sectionStudyMaterials = normalizeMaterials(sec.studyMaterial);
                            const contentKind = String(sec.content?.kind || "").trim().toLowerCase();
                            const contentTagLabel = getSectionTypeLabel(contentKind);
                            const SectionIcon = getSectionIcon(
                              contentKind,
                              sectionProgressMeta.state === "completed",
                              Boolean(launchSection)
                            );

                            return (
                              <li key={sectionId} className="relative min-w-0 max-w-full">
                                {/* <span className="absolute -left-[13px] top-8 h-2 w-2 rounded-full bg-border sm:-left-[19px]" /> */}
                                <button
                                  type="button"
                                  disabled={!launchSection || isSectionLocked}
                                  onMouseEnter={() => warmLaunchSection(launchSection)}
                                  onFocus={() => warmLaunchSection(launchSection)}
                                  onClick={() => {
                                    if (isSectionLocked) {
                                      return;
                                    }
                                    if (canSelfEnroll) {
                                      onEnrollCourse?.();
                                      return;
                                    }
                                    if (launchSection) {
                                      onLaunchSection(launchSection);
                                    }
                                  }}
                                  className={`group flex w-full min-w-0 max-w-full items-start gap-2 rounded-xl border px-2 py-3 text-left transition sm:gap-3 sm:rounded-2xl sm:px-4 ${
                                    isSectionLocked
                                      ? "cursor-not-allowed border-slate-200 bg-slate-50/80 opacity-80 dark:border-slate-800 dark:bg-slate-900/30"
                                      : sectionProgressMeta.state === "completed"
                                      ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/15"
                                      : "border-border bg-background hover:border-primary/30 hover:bg-muted/40"
                                  } ${!launchSection ? "cursor-not-allowed opacity-70" : ""}`}
                                >
                                  <span
                                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl ${
                                    isSectionLocked
                                      ? "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                                      : sectionProgressMeta.state === "completed"
                                        ? "bg-emerald-500 text-white"
                                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                    }`}
                                  >
                                    {isSectionLocked ? <Lock className="h-4 w-4" /> : <SectionIcon className="h-4 w-4" />}
                                  </span>

                                  <span className="min-w-0 flex-1 overflow-hidden">
                                    <span className="flex flex-wrap items-center gap-2">
                                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        Section {moduleIndex + 1}.{index + 1}
                                      </span>
                                      {contentTagLabel ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                          <FileBox className="h-3 w-3" />
                                          {contentTagLabel}
                                        </span>
                                      ) : null}
                                      {isAssignedCourseView ? (
                                        <span
                                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${
                                            isSectionLocked
                                              ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                              : sectionProgressMeta.state === "completed"
                                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                                              : sectionProgressMeta.state === "in_progress"
                                                ? "bg-primary/10 text-primary"
                                                : "bg-muted text-muted-foreground"
                                          }`}
                                        >
                                          {isSectionLocked ? "Locked" : sectionProgressMeta.label}
                                        </span>
                                      ) : null}
                                    </span>

                                    <span className="mt-1 block break-words text-xs font-semibold leading-5 text-foreground sm:text-sm">
                                      {sec.title}
                                    </span>

                                    {sec.description ? (
                                      <span className="mt-1 block break-words text-xs leading-6 text-muted-foreground sm:text-sm">
                                        {sec.description}
                                      </span>
                                    ) : null}

                                    <span className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground sm:gap-x-3 sm:text-xs">
                                      {isAssignedCourseView ? (
                                        <span>{sectionProgressMeta.progress}% progress</span>
                                      ) : null}
                                      {sectionStudyMaterials.length > 0 ? (
                                        <span>
                                          {sectionStudyMaterials.length} study material
                                          {sectionStudyMaterials.length === 1 ? "" : "s"}
                                        </span>
                                      ) : null}
                                      <span>
                                        {isSectionLocked
                                          ? "Complete the previous lesson first"
                                          : launchSection
                                          ? getSectionActionLabel(
                                              launchSection,
                                              sectionTracking?.lessonStatus,
                                              sectionTracking?.progress
                                            )
                                          : "Lesson unavailable"}
                                      </span>
                                    </span>
                                  </span>

                                  {isSectionLocked ? (
                                    <Lock className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                                  ) : (
                                    <PlayCircle className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                                  )}
                                </button>
                              </li>
                            );
                          })}
                        </ul>

                        {moduleQuizzes.map(renderQuizCard)}
                      </div>
                    </details>
                  );
                })}

                {hasMoreModules ? (
                  <div className="px-3.5 py-3.5 sm:px-5 sm:py-4">
                    <button
                      type="button"
                      disabled={isLoadingModules}
                      onClick={() => void loadMoreModules()}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoadingModules ? "Loading modules..." : "Show more"}
                    </button>
                  </div>
                ) : null}

                {finalQuizzes.length > 0 ? (
                  <div className="px-3.5 py-3.5 sm:px-5 sm:py-4">
                    <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-background p-3.5 sm:p-4">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-10 sm:w-10">
                          <Award className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground sm:text-sm">Final quizzes</p>
                          <p className="text-[11px] text-muted-foreground sm:text-xs">
                            Course-level quizzes that appear after module work.
                          </p>
                        </div>
                      </div>
                      {finalQuizzes.map(renderQuizCard)}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="p-4 text-xs text-muted-foreground sm:p-5 sm:text-sm">No curriculum has been added to this course yet.</div>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-10 sm:w-10">
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">What you&apos;ll learn</h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Clear takeaways learners can expect from this course.
              </p>
            </div>
          </div>

          <div className="grid min-w-0 max-w-full grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
            {learningOutcomes.length > 0 ? (
              learningOutcomes.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex min-w-0 max-w-full items-start gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-7 sm:w-7">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <p className="min-w-0 break-words text-xs leading-6 text-foreground sm:text-sm">{item}</p>
                </div>
              ))
            ) : (
              <div className="min-w-0 max-w-full rounded-2xl border border-dashed border-border bg-card p-4 text-xs text-muted-foreground sm:col-span-2 sm:p-5 sm:text-sm">
                Learning outcomes have not been added for this course yet.
              </div>
            )}
          </div>

          {showQuizReview ? (
            <div className="min-w-0 max-w-full overflow-hidden rounded-[1.15rem] border border-border bg-card shadow-sm sm:rounded-[1.7rem]">
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border px-3 py-3.5 sm:gap-3 sm:px-5 sm:py-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-10 sm:w-10">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground sm:text-lg">Quiz Review</h2>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Review SCORM answers and course quiz progress in one place.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary sm:px-3 sm:text-xs">
                    Score {answerSummary.correctCount}/{answerSummary.totalQuestions}
                  </span>
                  {courseQuizzes.length > 0 ? (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 sm:px-3 sm:text-xs">
                      {completedQuizzes.length}/{courseQuizzes.length} course quizzes
                    </span>
                  ) : null}
                  {answerSummary.pending > 0 ? (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 sm:px-3 sm:text-xs">
                      {answerSummary.pending} pending review
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="min-w-0 max-w-full px-2.5 py-3 sm:px-5 sm:py-5">
                <div className="-mx-1 max-w-full overflow-x-auto px-1 [overflow-wrap:anywhere]">
                  <ScormQuizReviewContent
                    sections={learnerAnswers}
                    isLoading={isLearnerAnswersLoading}
                    progressSummary={{
                      progressPercent: Number(course.progress || 0),
                      sectionsCompleted,
                      totalSections,
                    }}
                    emptyState="Your quiz answers will appear here after a SCORM quiz or course quiz is submitted."
                  />
                </div>
              </div>
            </div>
          ) : null}

          {canSelfEnroll ? (
            <div className="min-w-0 max-w-full overflow-hidden rounded-[1.7rem] border border-border bg-card shadow-sm">
              <div className="border-b border-border px-3.5 py-3.5 sm:px-5 sm:py-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-10 sm:w-10">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground sm:text-lg">Batch Delivery</h2>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Courses are assigned through the batch workspace without changing course setup.
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-3.5 py-3.5 sm:px-5 sm:py-5">
                <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-background p-3.5 sm:p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground sm:text-sm">Standalone batch management</p>
                      <p className="mt-1 text-xs leading-6 text-muted-foreground sm:text-sm">
                        Use the batch screens to group users, attach multiple courses, define dates, and track learner
                        progress without mixing batch logic into course setup.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="min-w-0 max-w-full space-y-5 sm:space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:rounded-[1.7rem] sm:p-5">
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px]">
                {isAssignedCourseView ? "Your progress" : "Enrollment price"}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {isAssignedCourseView ? `${progressLabel}%` : priceLabel}
              </p>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{nextCardLabel}</p>
            </div>

            {isAssignedCourseView ? (
              <div className="mt-4 rounded-2xl border border-border bg-background p-3.5 sm:mt-5 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-foreground sm:text-sm">Course progress</p>
                  <p className="text-xs font-semibold text-foreground sm:text-sm">{progressLabel}%</p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted sm:h-2">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{ width: `${progressLabel}%` }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center sm:gap-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px]">Done</p>
                    <p className="mt-1 text-base font-semibold text-emerald-600 dark:text-emerald-300 sm:text-lg">
                      {sectionSummary.completed}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px]">Active</p>
                    <p className="mt-1 text-base font-semibold text-primary sm:text-lg">{sectionSummary.inProgress}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px]">Left</p>
                    <p className="mt-1 text-base font-semibold text-foreground sm:text-lg">{sectionSummary.notStarted}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {isAssignedCourseView && courseQuizzes.length > 0 ? (
              <div className="mt-4 min-w-0 max-w-full overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/20 sm:mt-5 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground sm:text-sm">Required quizzes</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium sm:px-3 sm:text-[11px] ${
                      pendingQuizzes.length
                        ? "bg-amber-200 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                    }`}
                  >
                    {pendingQuizzes.length ? `${pendingQuizzes.length} left` : "Done"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                  {isCourseQuizzesLoading
                    ? "Loading quiz status..."
                    : `${completedQuizzes.length} of ${courseQuizzes.length} submitted`}
                </p>
                {nextQuiz && onTakeQuiz ? (
                  <button
                    type="button"
                    disabled={!nextQuiz.attempt && nextQuiz.isUnlocked === false}
                    onClick={() => {
                      if (nextQuiz.attempt || nextQuiz.isUnlocked !== false) {
                        onTakeQuiz(nextQuiz);
                      }
                    }}
                    className={`mt-4 inline-flex h-9 w-full items-center justify-center rounded-full px-4 text-xs font-medium text-white transition sm:h-10 sm:text-sm ${
                      !nextQuiz.attempt && nextQuiz.isUnlocked === false
                        ? "cursor-not-allowed bg-slate-400 opacity-80"
                        : pendingQuizzes.length ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {!nextQuiz.attempt && nextQuiz.isUnlocked === false ? "Quiz locked" : nextQuiz.attempt ? "View quiz result" : "Take next quiz"}
                  </button>
                ) : null}
              </div>
            ) : null}

            {canSelfEnroll ? (
              <button
                type="button"
                onClick={onEnrollCourse}
                disabled={isEnrolling}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-md transition hover:opacity-90 disabled:opacity-60 sm:mt-5 sm:h-12 sm:text-sm"
              >
                <Rocket className="h-4 w-4" />
                {isEnrolling ? "Enrolling..." : "Self Enroll Now"}
              </button>
            ) : (
              <button
                type="button"
                onMouseEnter={() => {
                  if (nextLaunchSection) {
                    warmLaunchSection(nextLaunchSection);
                  } else if (course.scormFilePath) {
                    void preloadCourseAsset(course.scormFilePath).catch(() => undefined);
                  }
                }}
                onFocus={() => {
                  if (nextLaunchSection) {
                    warmLaunchSection(nextLaunchSection);
                  } else if (course.scormFilePath) {
                    void preloadCourseAsset(course.scormFilePath).catch(() => undefined);
                  }
                }}
                onClick={() => {
                  if (nextLaunchSection) {
                    onLaunchSection(nextLaunchSection);
                    return;
                  }

                  if (course.scormFilePath) {
                    onLaunchSection({
                      assetPath: course.scormFilePath,
                      contentKind: "scorm",
                      moduleId: "",
                      moduleTitle: "",
                      sectionId: "",
                      sectionTitle: course.title || "Course",
                    });
                  }
                }}
                disabled={!nextLaunchSection && !course.scormFilePath}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-5 sm:h-12 sm:text-sm"
              >
                <Rocket className="h-4 w-4" />
                {isAssignedCourseView
                  ? nextLaunchLabel
                  : getStartLearningLabel(firstPlayableLaunchSection, course.scormFilePath)}
              </button>
            )}

            {isAssignedCourseView ? (
              <div className="mt-3.5 sm:mt-4">
                <button
                  type="button"
                  disabled={!canDownloadCertificate}
                  title={canDownloadCertificate ? "Download certificate" : certificateReason}
                  onClick={() => {
                    if (canDownloadCertificate && courseId) {
                      onDownloadCertificate?.(courseId);
                    }
                  }}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300 sm:h-11 sm:text-sm"
                >
                  <Award className="h-4 w-4" />
                  {isCertificateDownloading ? "Downloading..." : "Download Certificate"}
                  <Download className="h-4 w-4" />
                </button>
                {!canDownloadCertificate ? (
                  <p className="mt-2 break-words text-center text-[11px] text-muted-foreground sm:text-xs">{certificateReason}</p>
                ) : null}
              </div>
            ) : null}

            {isAssignedCourseView && nextLaunchSection ? (
              <div className="mt-3.5 min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-background p-3.5 sm:mt-4 sm:p-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-[10px]">Next up</p>
                <p className="mt-2 break-words text-xs font-semibold text-foreground sm:text-sm">{nextLaunchSection.sectionTitle}</p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {nextLaunchTracking
                    ? getLearningStatusMeta(nextLaunchTracking.lessonStatus, nextLaunchTracking.progress).label
                    : "Ready to start"}
                </p>
              </div>
            ) : null}

            <div className="mt-4 space-y-2.5 border-t border-border pt-4 sm:mt-5 sm:space-y-3 sm:pt-5">
              {isAssignedCourseView ? (
                <>
                  <div className="flex items-center gap-2.5 text-xs text-foreground sm:gap-3 sm:text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                    {sectionSummary.completed} lesson{sectionSummary.completed === 1 ? "" : "s"} completed
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-foreground sm:gap-3 sm:text-sm">
                    <Layers className="h-4 w-4 shrink-0 text-primary" />
                    {totalModuleCount} modules, {totalLessonCount} lessons
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-foreground sm:gap-3 sm:text-sm">
                    <Calendar className="h-4 w-4 shrink-0 text-amber-500" />
                    Access ends: {formatAccessLabel(course.validTill)}
                  </div>
                  {course.progression?.certificateEnabled ? (
                    <div className="flex items-center gap-2.5 text-xs text-foreground sm:gap-3 sm:text-sm">
                      <Award className="h-4 w-4 shrink-0 text-primary" />
                      Certificate available after completion
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 text-xs text-foreground sm:gap-3 sm:text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                    Full lifetime access
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-foreground sm:gap-3 sm:text-sm">
                    <Layers className="h-4 w-4 shrink-0 text-primary" />
                    {totalLessonCount} lessons across {totalModuleCount} modules
                  </div>
                  {course.progression?.certificateEnabled ? (
                    <div className="flex items-center gap-2.5 text-xs text-foreground sm:gap-3 sm:text-sm">
                      <Award className="h-4 w-4 shrink-0 text-primary" />
                      Certificate of completion
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2.5 text-xs text-foreground sm:gap-3 sm:text-sm">
                    <Star className="h-4 w-4 shrink-0 text-yellow-500" />
                    Guided learning path
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:rounded-[1.7rem] sm:p-5">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-10 sm:w-10">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground sm:text-lg">Materials</h2>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Grouped by module and section so learners can quickly spot the right resource.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 sm:space-y-3">
              {materialGroups.length > 0 ? (
                materialGroups.map((group) => (
                  <div key={group.id} className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-background/80 p-3.5 sm:p-4">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xs font-semibold text-primary sm:h-10 sm:w-10 sm:text-sm">
                        {group.index}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-[10px]">
                          Module {group.index}
                        </p>
                        <p className="break-words text-xs font-semibold text-foreground sm:text-sm">{group.title}</p>
                      </div>
                    </div>

                    <div className="mt-3.5 space-y-2.5 sm:mt-4 sm:space-y-3">
                      {group.moduleMaterials.length > 0 ? (
                        <div className="space-y-2.5 sm:space-y-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">
                            Module files
                          </p>
                          {group.moduleMaterials.map((material, materialIndex) =>
                            renderMaterialLink(
                              material,
                              `Module material - ${group.title}`,
                              `${group.id}-module-${materialIndex}`
                            )
                          )}
                        </div>
                      ) : null}

                      {group.sections.map((sectionGroup) => (
                        <div key={sectionGroup.id} className="min-w-0 max-w-full space-y-2.5 overflow-hidden rounded-2xl border border-dashed border-border p-2.5 sm:space-y-3 sm:p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-muted px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px]">
                              {sectionGroup.label}
                            </span>
                            <span className="min-w-0 break-words text-xs font-semibold text-foreground sm:text-sm">{sectionGroup.title}</span>
                          </div>
                          {sectionGroup.materials.map((material, materialIndex) =>
                            renderMaterialLink(
                              material,
                              `Section material - ${sectionGroup.title}`,
                              `${sectionGroup.id}-${materialIndex}`
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-background/70 p-4 text-xs text-muted-foreground sm:text-sm">
                  No study materials are attached to this course yet.
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground shadow-sm sm:rounded-[1.7rem] sm:p-5">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/80 sm:text-[11px]">
              <Award className="h-4 w-4 shrink-0" />
              Certificate
            </div>
            <p className="mt-3 text-xs leading-6 text-primary-foreground/90 sm:text-sm">
              Finish all lessons to unlock your verified certificate of completion.
            </p>
            <div className="mt-4 inline-flex max-w-full items-start gap-2 rounded-2xl bg-white/15 px-3.5 py-2.5 text-[11px] font-medium leading-5 backdrop-blur [overflow-wrap:anywhere] dark:bg-white/10 sm:items-center sm:rounded-full sm:px-4 sm:py-2 sm:text-sm sm:leading-normal">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" />
              Instructor company is auto-linked from the course owner profile
            </div>
          </div>
        </aside>
      </main>

      {canSelfEnroll ? (
        <div className="fixed inset-x-0 bottom-0 z-40 max-w-full border-t border-border bg-background/95 px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.15)] dark:shadow-[0_-10px_30px_-14px_rgba(0,0,0,0.65)] sm:hidden">
          <button
            type="button"
            onClick={onEnrollCourse}
            disabled={isEnrolling}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            <Rocket className="h-4 w-4" />
            {isEnrolling ? "Enrolling..." : `Self Enroll - ${priceLabel}`}
          </button>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-40 max-w-full border-t border-border bg-background/95 px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.15)] dark:shadow-[0_-10px_30px_-14px_rgba(0,0,0,0.65)] sm:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] text-muted-foreground">Progress</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{
                      width: `${isAssignedCourseView ? progressLabel : Math.min(totalModuleCount * 12, 100)}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-medium text-foreground">
                  {isAssignedCourseView ? `${progressLabel}%` : `${totalModuleCount}M`}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (nextLaunchSection) {
                  onLaunchSection(nextLaunchSection);
                  return;
                }

                if (course.scormFilePath) {
                  onLaunchSection({
                    assetPath: course.scormFilePath,
                    contentKind: "scorm",
                    moduleId: "",
                    moduleTitle: "",
                    sectionId: "",
                    sectionTitle: course.title || "Course",
                  });
                }
              }}
              disabled={!nextLaunchSection && !course.scormFilePath}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
