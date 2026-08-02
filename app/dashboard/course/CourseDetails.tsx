"use client";

import CourseDetailsTabs, {
  CourseDetailsTab,
  CourseDetailsTabId,
} from "@/app/(main)/course/component/CourseDetailsTabs";
import CourseMaterialsSection, {
  buildCourseMaterialGroups,
  countCourseMaterials,
} from "@/app/(main)/course/component/CourseMaterialSection";
import CourseOverviewSection from "@/app/(main)/course/component/CourseOverviewSection";
import CourseQuizReviewSection from "@/app/(main)/course/component/CourseQuizReviewSection";
import ResponsiveDrawer from "@/app/component/common/Drawer/ResponsiveDrawer";
import BackButton from "@/app/dashboard/course/components/BackButton";
import CourseCurriculumPanel from "@/app/dashboard/course/components/CourseCurriculumPanel";
import CourseAssetModal from "@/app/dashboard/course/scorm/CourseAssetModal";
import CoursePlayer from "@/app/dashboard/course/scorm/CoursePlayer";
import {
  clampLearningProgress,
  getLearningProgressState,
} from "@/app/dashboard/course/scorm/progressPresentation";
import type { ScormAnswerSectionRecord } from "@/app/dashboard/course/scorm/quizReviewTypes";
import {
  estimateCompletedSections,
  summarizeAnswerSections,
} from "@/app/dashboard/course/scorm/quizReviewTypes";
import type { CourseLaunchSection } from "@/app/dashboard/course/scorm/sectionTracking";
import {
  buildCourseAssetUrl,
  buildLaunchSection,
  deriveModuleId,
  deriveSectionId,
  getFirstPlayableLaunchSection,
  isScormLaunchSection,
  preloadCourseAsset,
} from "@/app/dashboard/course/scorm/sectionTracking";
import type { CourseQuizForLearner } from "@/app/store/courseStore/courseStore";
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
  ChevronLeft,
  ChevronRight,
  FileText,
  PanelRightOpen,
  PlayCircle
} from "lucide-react";
import type { CSSProperties } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type InlineVideoProgressPayload = {
  currentTime?: number;
  duration?: number;
  progress?: number;
  reason?: "interval" | "pause" | "exit";
  startOver?: boolean;
};

function hexToHslTriplet(hexColor: string) {
  const normalizedHex = String(hexColor || "")
    .trim()
    .replace("#", "");

  const expandedHex =
    normalizedHex.length === 3
      ? normalizedHex
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalizedHex;

  const safeHex = /^[0-9a-fA-F]{6}$/.test(expandedHex)
    ? expandedHex
    : "2563EB";

  const red = Number.parseInt(safeHex.slice(0, 2), 16) / 255;
  const green = Number.parseInt(safeHex.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(safeHex.slice(4, 6), 16) / 255;

  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const lightness = (maximum + minimum) / 2;
  const delta = maximum - minimum;

  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation =
      lightness > 0.5
        ? delta / (2 - maximum - minimum)
        : delta / (maximum + minimum);

    switch (maximum) {
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

  return `${Math.round(hue * 360)} ${Math.round(
    saturation * 100
  )}% ${Math.round(lightness * 100)}%`;
}

function joinClasses(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ");
}

function getStartLearningLabel(
  launchSection: CourseLaunchSection | null,
  fallbackPath?: string | null
) {
  if (launchSection?.contentKind === "video") {
    return "Watch Lesson";
  }

  if (launchSection?.contentKind === "document") {
    return "Open Lesson";
  }

  if (launchSection && isScormLaunchSection(launchSection)) {
    return "Start SCORM";
  }

  if (fallbackPath) {
    return "Start Learning";
  }

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
    if (launchSection.contentKind === "video") {
      return "Rewatch lesson";
    }

    if (launchSection.contentKind === "document") {
      return "Reopen lesson";
    }

    return "Review lesson";
  }

  if (state === "in_progress") {
    if (launchSection.contentKind === "video") {
      return "Resume video";
    }

    if (launchSection.contentKind === "document") {
      return "Continue document";
    }

    return "Continue lesson";
  }

  if (launchSection.contentKind === "video") {
    return "Start video";
  }

  if (launchSection.contentKind === "document") {
    return "Open document";
  }

  return "Start lesson";
}

function formatCompactNumber(value: unknown, fallback = "0") {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return fallback;
  }

  return numericValue.toLocaleString();
}

function getInstructor(course: any) {
  return {
    name:
      String(course?.instructor?.name || "").trim() ||
      "Course Instructor",
    designation: String(
      course?.instructor?.designation || ""
    ).trim(),
    companyName: String(
      course?.instructor?.companyName || ""
    ).trim(),
    avatarUrl: String(
      course?.instructor?.avatarUrl || ""
    ).trim(),
  };
}

function getLearningOutcomes(course: any) {
  const storedItems = Array.isArray(
    course?.highlights?.learningOutcomes
  )
    ? course.highlights.learningOutcomes
        .map((item: unknown) => String(item || "").trim())
        .filter(Boolean)
    : [];

  if (storedItems.length > 0) {
    return storedItems;
  }

  if (!Array.isArray(course?.curriculum?.modules)) {
    return [];
  }

  return course.curriculum.modules
    .flatMap((moduleRecord: any) => [
      moduleRecord?.summary,
      moduleRecord?.title,
    ])
    .map((item: unknown) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

function getPriceLabel(course: any) {
  const amount = Number(course?.commerce?.amountInRupees);

  if (
    course?.commerce?.pricingModel === "paid" &&
    Number.isFinite(amount) &&
    amount > 0
  ) {
    return `INR ${amount.toLocaleString()}`;
  }

  return "Free";
}

function getInstructorInitials(name?: string) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "CI";
  }

  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function resolveSectionResumeTime(
  progressRecord?: {
    currentTime?: number | null;
    duration?: number | null;
  } | null
) {
  if (!progressRecord) {
    return 0;
  }

  const resumeTime = Math.max(
    Number(progressRecord.currentTime || 0),
    0
  );
  const duration = Math.max(
    Number(progressRecord.duration || 0),
    0
  );

  if (duration > 0) {
    return Math.min(resumeTime, Math.max(duration - 1, 0));
  }

  return resumeTime;
}

function buildPlayableSections(
  modules: any[],
  unlockedSectionIds: ReadonlySet<string>,
  enforceSequentialProgress: boolean
) {
  const items: Array<{
    launchSection: CourseLaunchSection;
    moduleRecord: any;
    sectionRecord: any;
  }> = [];

  modules.forEach((moduleRecord: any) => {
    (moduleRecord.sections || []).forEach((sectionRecord: any) => {
      const launchSection = buildLaunchSection(
        moduleRecord,
        sectionRecord
      );

      if (!launchSection) {
        return;
      }

      if (
        enforceSequentialProgress &&
        !unlockedSectionIds.has(launchSection.sectionId)
      ) {
        return;
      }

      items.push({
        launchSection,
        moduleRecord,
        sectionRecord,
      });
    });
  });

  return items;
}

interface CourseDetailsProps {
  course: any;
  onBack: () => void;
  onLaunchSection: (
    launchSection: CourseLaunchSection
  ) => void;
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
  activeSectionProgress?: any;
  onRefreshProgress?: () => void | Promise<void>;
  onRefreshAnswers?: () => void | Promise<void>;
  onNonScormOpened?: () => void | Promise<void>;
  onNonScormCompleted?: () => void | Promise<void>;
  onNonScormProgressUpdate?: (
    data: InlineVideoProgressPayload
  ) => void;
  onNonScormStartOver?: () => void;
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
  activeSectionProgress,
  onRefreshProgress,
  onRefreshAnswers,
  onNonScormOpened,
  onNonScormCompleted,
  onNonScormProgressUpdate,
  onNonScormStartOver,
}: CourseDetailsProps) {
  const { colorMode } = useColorMode();
  const theme = useTheme();

  const {
    auth: { user },
    themeStore: { themeConfig },
    courseStore,
  } = stores;

  const isAssignedCourseView = Array.isArray(course?.sources);
  const canSelfEnroll = Boolean(
    !isAssignedCourseView && onEnrollCourse
  );
  const courseId = String(
    course?._id || course?.courseId || ""
  ).trim();
  const totalSections = Number(
    course?.curriculum?.totalSections || 0
  );
  const progressModules = Array.isArray(course?.progressModules)
    ? course.progressModules
    : [];

  const [moduleRecords, setModuleRecords] = useState<any[]>(
    Array.isArray(course?.curriculum?.modules)
      ? course.curriculum.modules
      : []
  );
  const [hasMoreModules, setHasMoreModules] =
    useState(false);
  const [isLoadingModules, setIsLoadingModules] =
    useState(false);
  const [sectionLoadingByModule, setSectionLoadingByModule] =
    useState<Record<string, boolean>>({});
  const [sectionLoadedByModule, setSectionLoadedByModule] =
    useState<Record<string, boolean>>({});
  const [sectionErrorByModule, setSectionErrorByModule] =
    useState<Record<string, string | null>>({});
  const [selectedLaunchSection, setSelectedLaunchSection] =
    useState<CourseLaunchSection | null>(null);
  const [
    isMobileCurriculumOpen,
    setIsMobileCurriculumOpen,
  ] = useState(false);

  const modules = moduleRecords;

  const courseWithLoadedModules = useMemo(
    () => ({
      ...course,
      curriculum: {
        ...(course?.curriculum || {}),
        modules: moduleRecords,
      },
    }),
    [course, moduleRecords]
  );

  const firstPlayableLaunchSection = useMemo(
    () => getFirstPlayableLaunchSection(courseWithLoadedModules),
    [courseWithLoadedModules]
  );

  const certificateReason =
    course?.certificate?.reason ||
    "Certificate will be available after eligibility is confirmed.";
  const certificateStatus = String(
    course?.certificate?.status || ""
  )
    .trim()
    .toLowerCase();

  const canDownloadCertificate = Boolean(
    isAssignedCourseView &&
      course?.progression?.certificateEnabled !== false &&
      course?.certificate?.enabled !== false &&
      course?.certificate &&
      (certificateStatus === "issued" ||
        course.certificate.canIssue)
  );

  const enforceSequentialProgress = Boolean(
    isAssignedCourseView &&
      course?.progression?.mandatoryModules !== false
  );

  useEffect(() => {
    let isMounted = true;

    const initialModules = Array.isArray(
      course?.curriculum?.modules
    )
      ? course.curriculum.modules
      : [];

    setModuleRecords(initialModules);
    setHasMoreModules(false);
    setSectionLoadingByModule({});
    setSectionLoadedByModule({});
    setSectionErrorByModule({});
    setSelectedLaunchSection(null);
    setIsMobileCurriculumOpen(false);

    if (!courseId) {
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingModules(true);

    courseStore
      .fetchCourseModules(courseId, {
        reset: true,
        limit: 5,
      })
      .then((loadedModules) => {
        if (!isMounted) {
          return;
        }

        setModuleRecords(loadedModules);
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
  }, [courseId, courseStore]);

  useEffect(() => {
    if (!courseId) {
      return;
    }

    // Opening a course can preserve the previous catalog scroll position.
    // Reset to the top so the course title/header is visible immediately.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [courseId]);

  const loadMoreModules = useCallback(async () => {
    if (
      !courseId ||
      isLoadingModules ||
      !hasMoreModules
    ) {
      return;
    }

    setIsLoadingModules(true);

    try {
      const loadedModules =
        await courseStore.fetchCourseModules(courseId, {
          limit: 5,
        });

      setModuleRecords(loadedModules);
      setHasMoreModules(courseStore.hasMoreModules);
    } finally {
      setIsLoadingModules(false);
    }
  }, [
    courseId,
    courseStore,
    hasMoreModules,
    isLoadingModules,
  ]);

  const loadSectionsForModule = useCallback(
    async (moduleId: string, force = false) => {
      if (
        !courseId ||
        (!force && sectionLoadedByModule[moduleId]) ||
        sectionLoadingByModule[moduleId]
      ) {
        return;
      }

      setSectionLoadingByModule((current) => ({
        ...current,
        [moduleId]: true,
      }));
      setSectionErrorByModule((current) => ({
        ...current,
        [moduleId]: null,
      }));

      try {
        const sections =
          await courseStore.fetchCourseSections(
            courseId,
            moduleId,
            { force }
          );

        setModuleRecords((currentModules) =>
          currentModules.map((moduleRecord) =>
            deriveModuleId(moduleRecord) === moduleId
              ? { ...moduleRecord, sections }
              : moduleRecord
          )
        );

        setSectionLoadedByModule((current) => ({
          ...current,
          [moduleId]: true,
        }));
      } catch (error: any) {
        setSectionErrorByModule((current) => ({
          ...current,
          [moduleId]:
            error?.message ||
            error?.error ||
            "Failed to load sections",
        }));
      } finally {
        setSectionLoadingByModule((current) => ({
          ...current,
          [moduleId]: false,
        }));
      }
    },
    [
      courseId,
      courseStore,
      sectionLoadedByModule,
      sectionLoadingByModule,
    ]
  );

  useEffect(() => {
    modules.slice(0, 2).forEach((moduleRecord: any) => {
      const moduleId = deriveModuleId(moduleRecord);

      if (
        moduleId &&
        !sectionLoadedByModule[moduleId] &&
        !sectionLoadingByModule[moduleId]
      ) {
        void loadSectionsForModule(moduleId);
      }
    });
  }, [
    loadSectionsForModule,
    modules,
    sectionLoadedByModule,
    sectionLoadingByModule,
  ]);

  const warmLaunchSection = useCallback(
    (launchSection?: CourseLaunchSection | null) => {
      if (
        launchSection &&
        isScormLaunchSection(launchSection)
      ) {
        void preloadCourseAsset(
          launchSection.assetPath
        ).catch(() => undefined);
      }
    },
    []
  );

  const moduleProgressMap = useMemo(
    () =>
      new Map<string, any>(
        progressModules.map((moduleRecord: any) => [
          moduleRecord.moduleId,
          moduleRecord,
        ])
      ),
    [progressModules]
  );

  const sectionProgressMap = useMemo(() => {
    const nextMap = new Map<string, any>();

    progressModules.forEach((moduleRecord: any) => {
      (moduleRecord.sections || []).forEach(
        (sectionRecord: any) => {
          nextMap.set(
            sectionRecord.sectionId,
            sectionRecord
          );
        }
      );
    });

    return nextMap;
  }, [progressModules]);

  const sectionSummary = useMemo(() => {
    let computedTotal = 0;
    let completed = 0;
    let inProgress = 0;

    modules.forEach((moduleRecord: any) => {
      (moduleRecord.sections || []).forEach(
        (sectionRecord: any) => {
          computedTotal += 1;

          const trackingRecord = sectionProgressMap.get(
            deriveSectionId(moduleRecord, sectionRecord)
          );
          const state = getLearningProgressState(
            trackingRecord?.lessonStatus,
            trackingRecord?.progress
          );

          if (state === "completed") {
            completed += 1;
            return;
          }

          if (state === "in_progress") {
            inProgress += 1;
          }
        }
      );
    });

    const resolvedTotal = computedTotal || totalSections;

    return {
      total: resolvedTotal,
      completed,
      inProgress,
      notStarted: Math.max(
        resolvedTotal - completed - inProgress,
        0
      ),
    };
  }, [modules, sectionProgressMap, totalSections]);

  const unlockedSectionIds = useMemo(() => {
    const unlockedIds = new Set<string>();

    if (!enforceSequentialProgress) {
      modules.forEach((moduleRecord: any) => {
        (moduleRecord.sections || []).forEach(
          (sectionRecord: any) => {
            unlockedIds.add(
              deriveSectionId(moduleRecord, sectionRecord)
            );
          }
        );
      });

      return unlockedIds;
    }

    let reachedFirstIncomplete = false;

    modules.forEach((moduleRecord: any) => {
      (moduleRecord.sections || []).forEach(
        (sectionRecord: any) => {
          const sectionId = deriveSectionId(
            moduleRecord,
            sectionRecord
          );
          const trackingRecord =
            sectionProgressMap.get(sectionId);
          const state = getLearningProgressState(
            trackingRecord?.lessonStatus,
            trackingRecord?.progress
          );

          if (!reachedFirstIncomplete) {
            unlockedIds.add(sectionId);
          }

          if (state !== "completed") {
            reachedFirstIncomplete = true;
          }
        }
      );
    });

    return unlockedIds;
  }, [
    enforceSequentialProgress,
    modules,
    sectionProgressMap,
  ]);

  const sectionsCompleted = isAssignedCourseView
    ? sectionSummary.completed
    : estimateCompletedSections(
        course?.progress,
        totalSections
      );

  const nextLaunchSection = useMemo(() => {
    let firstIncompleteLaunchSection: CourseLaunchSection | null =
      null;

    for (const moduleRecord of modules) {
      for (const sectionRecord of
        moduleRecord.sections || []) {
        const launchSection = buildLaunchSection(
          moduleRecord,
          sectionRecord
        );

        if (!launchSection) {
          continue;
        }

        if (
          enforceSequentialProgress &&
          !unlockedSectionIds.has(launchSection.sectionId)
        ) {
          continue;
        }

        const trackingRecord = sectionProgressMap.get(
          launchSection.sectionId
        );
        const state = getLearningProgressState(
          trackingRecord?.lessonStatus,
          trackingRecord?.progress
        );

        if (state === "in_progress") {
          return launchSection;
        }

        if (
          !firstIncompleteLaunchSection &&
          state !== "completed"
        ) {
          firstIncompleteLaunchSection = launchSection;
        }
      }
    }

    return (
      firstIncompleteLaunchSection ||
      firstPlayableLaunchSection
    );
  }, [
    enforceSequentialProgress,
    firstPlayableLaunchSection,
    modules,
    sectionProgressMap,
    unlockedSectionIds,
  ]);

  const nextLaunchTracking = nextLaunchSection
    ? sectionProgressMap.get(nextLaunchSection.sectionId)
    : null;

  const nextLaunchLabel = getSectionActionLabel(
    nextLaunchSection,
    nextLaunchTracking?.lessonStatus,
    nextLaunchTracking?.progress
  );

  const instructor = useMemo(
    () => getInstructor(course),
    [course]
  );
  const learningOutcomes = useMemo(
    () => getLearningOutcomes(courseWithLoadedModules),
    [courseWithLoadedModules]
  );
  const materialGroups = useMemo(
    () => buildCourseMaterialGroups(courseWithLoadedModules),
    [courseWithLoadedModules]
  );
  const totalMaterialCount = useMemo(
    () => countCourseMaterials(materialGroups),
    [materialGroups]
  );

  const totalModuleCount = Number(
    course?.curriculum?.totalModules || modules.length || 0
  );
  const totalLessonCount = Number(
    course?.curriculum?.totalSections ||
      sectionSummary.total ||
      0
  );
  const learnersLabel = formatCompactNumber(
    course?.metrics?.totalEnrollments
  );
  const durationLabel =
    String(
      course?.estimatedDuration ||
        course?.durationLabel ||
        ""
    ).trim() || "Self-paced";
  const progressLabel = clampLearningProgress(
    course?.progress
  );
  const priceLabel = getPriceLabel(course);

  const answerSummary = useMemo(
    () => summarizeAnswerSections(learnerAnswers),
    [learnerAnswers]
  );
  const showQuizReview = Boolean(
    isAssignedCourseView ||
      learnerAnswers.length > 0 ||
      courseQuizzes.length > 0
  );
  const previewLaunchSection =
    firstPlayableLaunchSection || nextLaunchSection;

  const playableSections = useMemo(
    () =>
      buildPlayableSections(
        modules,
        unlockedSectionIds,
        enforceSequentialProgress
      ),
    [
      enforceSequentialProgress,
      modules,
      unlockedSectionIds,
    ]
  );

  useEffect(() => {
    if (!selectedLaunchSection) {
      return;
    }

    const stillExists = playableSections.some(
      ({ launchSection }) =>
        launchSection.sectionId ===
        selectedLaunchSection.sectionId
    );

    if (!stillExists) {
      setSelectedLaunchSection(null);
    }
  }, [playableSections, selectedLaunchSection]);

  const activeLaunchSection = selectedLaunchSection;
  const activeSectionTracking =
    activeSectionProgress ||
    (activeLaunchSection
      ? sectionProgressMap.get(activeLaunchSection.sectionId)
      : null);

  const activeSectionIndex = useMemo(
    () =>
      activeLaunchSection
        ? playableSections.findIndex(
            ({ launchSection }) =>
              launchSection.sectionId ===
              activeLaunchSection.sectionId
          )
        : -1,
    [activeLaunchSection, playableSections]
  );

  const previousLaunchSection =
    activeSectionIndex > 0
      ? playableSections[activeSectionIndex - 1]
          ?.launchSection
      : null;
  const followingLaunchSection =
    activeSectionIndex >= 0 &&
    activeSectionIndex < playableSections.length - 1
      ? playableSections[activeSectionIndex + 1]
          ?.launchSection
      : null;

  const currentLaunchSection =
    activeLaunchSection || nextLaunchSection;

  const currentModuleLabel =
    currentLaunchSection?.moduleTitle || "Ready to learn";
  const currentSectionLabel =
    currentLaunchSection?.sectionTitle ||
    "Choose a lesson to begin";

  const courseThemeStyle = useMemo(() => {
    const brandScale = (theme.colors?.brand || {}) as Record<
      number,
      string
    >;
    const accentScale = (theme.colors?.purple || {}) as Record<
      number,
      string
    >;
    const isDark = colorMode === "dark";

    const companyPrimaryColor = normalizeHexColor(
      user?.companyDetails?.primaryThemeColor ||
        themeConfig?.colors?.custom?.light?.primary,
      DEFAULT_LEARNER_PRIMARY_COLOR
    );

    const primary =
      companyPrimaryColor ||
      brandScale[isDark ? 400 : 500] ||
      DEFAULT_LEARNER_PRIMARY_COLOR;
    const accent =
      mixHexColors(
        primary,
        isDark ? "#A855F7" : "#312E81",
        isDark ? 0.22 : 0.18
      ) ||
      accentScale[isDark ? 300 : 500] ||
      brandScale[isDark ? 300 : 400] ||
      primary;

    const background = isDark ? "#0F172A" : "#FFFFFF";
    const foreground = isDark ? "#F8FAFC" : "#0F172A";
    const card = isDark ? "#111827" : "#FFFFFF";
    const secondary = isDark ? "#172033" : "#F8FAFC";
    const muted = isDark ? "#1E293B" : "#F1F5F9";
    const mutedForeground = isDark
      ? "#CBD5E1"
      : "#475569";
    const border = isDark ? "#334155" : "#E2E8F0";

    return {
      "--background": hexToHslTriplet(background),
      "--foreground": hexToHslTriplet(foreground),
      "--card": hexToHslTriplet(card),
      "--card-foreground": hexToHslTriplet(foreground),
      "--primary": hexToHslTriplet(primary),
      "--primary-foreground": hexToHslTriplet("#FFFFFF"),
      "--secondary": hexToHslTriplet(secondary),
      "--secondary-foreground": hexToHslTriplet(foreground),
      "--muted": hexToHslTriplet(muted),
      "--muted-foreground": hexToHslTriplet(
        mutedForeground
      ),
      "--accent": hexToHslTriplet(accent),
      "--accent-foreground": hexToHslTriplet("#FFFFFF"),
      "--border": hexToHslTriplet(border),
      "--input": hexToHslTriplet(border),
      "--ring": hexToHslTriplet(primary),
    } as CSSProperties;
  }, [
    colorMode,
    theme,
    themeConfig?.colors?.custom?.light?.primary,
    user?.companyDetails?.primaryThemeColor,
  ]);

  const handleTabChange = useCallback(
    (tabId: CourseDetailsTabId) => {
      if (tabId !== "materials") {
        return;
      }

      modules.forEach((moduleRecord: any) => {
        const moduleId = deriveModuleId(moduleRecord);

        if (moduleId) {
          void loadSectionsForModule(moduleId);
        }
      });
    },
    [loadSectionsForModule, modules]
  );

  const handleSelectSection = useCallback(
    (launchSection: CourseLaunchSection) => {
      setSelectedLaunchSection(launchSection);
      setIsMobileCurriculumOpen(false);
      warmLaunchSection(launchSection);
      onLaunchSection(launchSection);
    },
    [onLaunchSection, warmLaunchSection]
  );

  const handleMobileTakeQuiz = useCallback(
    (quiz: CourseQuizForLearner) => {
      setIsMobileCurriculumOpen(false);
      onTakeQuiz?.(quiz);
    },
    [onTakeQuiz]
  );

  const handlePrimaryAction = useCallback(() => {
    if (canSelfEnroll) {
      onEnrollCourse?.();
      return;
    }

    if (currentLaunchSection) {
      handleSelectSection(currentLaunchSection);
    }
  }, [
    canSelfEnroll,
    currentLaunchSection,
    handleSelectSection,
    onEnrollCourse,
  ]);

  const courseDetailTabs = useMemo<CourseDetailsTab[]>(
    () => [
      {
        id: "about",
        label: "About",
        mobileLabel: "About",
        description:
          "Description, outcomes, instructor and course details",
        icon: BookOpen,
        badge: learningOutcomes.length || undefined,
        content: (
          <div className="space-y-4 p-3 sm:p-5">
            <section className="overflow-hidden rounded-[1.35rem] border border-border bg-background/75">
              <header className="border-b border-border/75 bg-gradient-to-r from-primary/[0.07] to-transparent px-4 py-4">
                <h3 className="text-sm font-semibold text-foreground sm:text-base">
                  Course description
                </h3>
                <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
                  The complete overview is kept here so the player layout stays compact.
                </p>
              </header>
              <div
                className="course-description-richtext prose max-w-none break-words px-4 py-4 text-[12px] text-foreground prose-headings:break-words prose-headings:text-foreground prose-p:break-words prose-p:text-muted-foreground prose-strong:text-foreground prose-a:break-all prose-a:text-primary prose-li:break-words dark:prose-invert sm:prose-sm sm:text-base [&_*]:max-w-full [&_*]:break-words"
                dangerouslySetInnerHTML={{
                  __html:
                    course?.description?.html ||
                    course?.description?.text ||
                    "<p>No course description has been provided.</p>",
                }}
              />
            </section>
          </div>
        ),
      },
      {
        id: "overview",
        label: "Overview",
        mobileLabel: "Overview",
        description:
          "Course progress, learning outcomes, instructor and course details",
        icon: BookOpen,
        badge: learningOutcomes.length || undefined,
        content: (
          <div>
            <CourseOverviewSection
              course={course}
              learningOutcomes={learningOutcomes}
              instructor={instructor}
              isAssignedCourseView={isAssignedCourseView}
              totalModuleCount={totalModuleCount}
              totalLessonCount={totalLessonCount}
              totalMaterialCount={totalMaterialCount}
              durationLabel={durationLabel}
              progressPercent={progressLabel}
              sectionsCompleted={sectionsCompleted}
              courseId={courseId}
              canDownloadCertificate={
                canDownloadCertificate
              }
              certificateReason={certificateReason}
              isCertificateDownloading={
                isCertificateDownloading
              }
              onDownloadCertificate={
                onDownloadCertificate
              }
            />
          </div>
        ),
      },
      {
        id: "materials",
        label: "Materials",
        mobileLabel: "Materials",
        description:
          "Files and resources grouped by lesson",
        icon: FileText,
        badge: totalMaterialCount || undefined,
        content: (
          <CourseMaterialsSection
            materialGroups={materialGroups}
            initiallyExpandedModules={1}
          />
        ),
      },
      {
        id: "quiz-review",
        label: "Quiz Review",
        mobileLabel: "Quiz",
        description:
          "Attempts, scores and submitted answers",
        icon: Award,
        badge:
          answerSummary.totalQuestions ||
          courseQuizzes.length ||
          undefined,
        hidden: !showQuizReview,
        content: (
          <CourseQuizReviewSection
            learnerAnswers={learnerAnswers}
            isLearnerAnswersLoading={
              isLearnerAnswersLoading
            }
            courseQuizzes={courseQuizzes}
            isCourseQuizzesLoading={
              isCourseQuizzesLoading
            }
            courseProgress={progressLabel}
            sectionsCompleted={sectionsCompleted}
            totalSections={totalSections}
            onTakeQuiz={onTakeQuiz}
            defaultView="overview"
          />
        ),
      },
    ],
    [
      answerSummary.totalQuestions,
      canDownloadCertificate,
      certificateReason,
      course,
      courseId,
      courseQuizzes,
      durationLabel,
      instructor,
      isAssignedCourseView,
      isCertificateDownloading,
      isCourseQuizzesLoading,
      isLearnerAnswersLoading,
      learnerAnswers,
      learningOutcomes,
      materialGroups,
      onDownloadCertificate,
      onTakeQuiz,
      progressLabel,
      sectionsCompleted,
      showQuizReview,
      totalMaterialCount,
      totalModuleCount,
      totalLessonCount,
      totalSections,
    ]
  );

  return (
    <div
      className="min-h-screen w-full max-w-full bg-background text-foreground"
      data-theme={colorMode}
      style={courseThemeStyle}
    >
      <main className="w-full pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-4 sm:pb-20 sm:pt-2 lg:px-6">

        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-6">
          <div className="min-w-0 flex-1">
            <div className="mt-6 flex flex-wrap items-center gap-2">
        <BackButton onBack={onBack} />
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                Learning workspace
              </span>
              <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                {totalModuleCount} modules
              </span>
              <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                {totalLessonCount} lessons
              </span>
              <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                {canSelfEnroll ? priceLabel : `${progressLabel}% complete`}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {course?.title || "Untitled course"}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex min-w-0 items-center gap-2">
                {instructor.avatarUrl ? (
                  <img
                    src={instructor.avatarUrl}
                    alt={instructor.name}
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {getInstructorInitials(instructor.name)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {instructor.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {instructor.designation ||
                      instructor.companyName ||
                      "Instructor"}
                  </p>
                </div>
              </div>

              <span className="hidden h-4 w-px bg-border sm:block" />
              <span>{learnersLabel} learners</span>
              <span className="hidden h-4 w-px bg-border sm:block" />
              <span>{durationLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onEditCourse ? (
              <button
                type="button"
                onClick={() => onEditCourse(course)}
                className="inline-flex h-10 items-center justify-center rounded-full border border-primary/20 bg-card px-4 text-sm font-semibold text-primary transition hover:bg-primary/5"
              >
                Edit
              </button>
            ) : null}

            {onAssignCourse ? (
              <button
                type="button"
                onClick={() => onAssignCourse(course)}
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Assign
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(320px,0.9fr)]">
          <div className="min-w-0 space-y-5">
            <section className="overflow-hidden rounded-[1.8rem] border border-border bg-card shadow-sm">
              <div className="border-b border-border/75 px-3 py-3 sm:px-5 sm:py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      {currentModuleLabel}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-foreground sm:text-xl">
                      {currentSectionLabel}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {currentLaunchSection ? (
                        <>
                          <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
                            {String(
                              currentLaunchSection.contentKind ||
                                "lesson"
                            ).toUpperCase()}
                          </span>
                          <span>
                            {Math.round(
                              Number(
                                activeSectionTracking?.progress || 0
                              )
                            )}
                            % lesson progress
                          </span>
                        </>
                      ) : (
                        <span>
                          Choose a lesson from the curriculum or continue from your recommended lesson.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrimaryAction}
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:opacity-90 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
                    >
                      <PlayCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {canSelfEnroll
                        ? isEnrolling
                          ? "Enrolling..."
                          : "Enroll Now"
                        : currentLaunchSection
                          ? activeLaunchSection
                            ? "Playing now"
                            : getSectionActionLabel(
                                currentLaunchSection,
                                activeSectionTracking?.lessonStatus,
                                activeSectionTracking?.progress
                              )
                          : getStartLearningLabel(
                              firstPlayableLaunchSection,
                              course?.scormFilePath
                            )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setIsMobileCurriculumOpen(true)
                      }
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-muted sm:h-10 sm:gap-2 sm:px-4 sm:text-sm lg:hidden"
                    >
                      <PanelRightOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Curriculum
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-b border-border/75 bg-muted/25 sm:p-4">
                <div className="overflow-hidden rounded-[1.4rem] border border-border bg-background shadow-inner">
                  <div className="aspect-video w-full">
                    {!activeLaunchSection ? (
                      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 text-center">
                        {course?.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt={String(course?.title || "Course")}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
                        )}
                        <div className="absolute inset-0 bg-slate-950/50" />
                        <div className="relative z-10 max-w-xl">
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                            Ready when you are
                          </p>
                          <h3 className="mt-3 text-xl font-bold text-white sm:text-3xl">
                            {course?.title || "Start your course"}
                          </h3>
                          {/* <p className="mt-3 text-sm leading-6 text-white/80">
                            Pick a lesson from the curriculum or continue directly from your next recommended section.
                          </p> */}
                          <button
                            type="button"
                            onClick={handlePrimaryAction}
                            className="mt-5 inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-slate-900 transition hover:bg-white/90 sm:mt-6 sm:h-12 sm:gap-2 sm:px-6 sm:text-sm"
                          >
                            <PlayCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {canSelfEnroll
                              ? isEnrolling
                                ? "Enrolling..."
                                : "Enroll to Start"
                              : nextLaunchLabel}
                          </button>
                        </div>
                      </div>
                    ) : isScormLaunchSection(
                        activeLaunchSection
                      ) ? (
                      <CoursePlayer
                        key={activeLaunchSection.sectionId}
                        displayMode="inline"
                        showHeader={false}
                        showCloseButton={false}
                        courseId={courseId}
                        userId={user?._id}
                        learnerName={
                          user?.name ||
                          user?.username ||
                          user?.email ||
                          "Learner"
                        }
                        courseTitle={
                          activeLaunchSection.sectionTitle
                        }
                        courseUrl={buildCourseAssetUrl(
                          activeLaunchSection.assetPath
                        )}
                        moduleId={
                          activeLaunchSection.moduleId
                        }
                        sectionId={
                          activeLaunchSection.sectionId
                        }
                        initialProgress={
                          activeSectionProgress
                        }
                        answerSections={learnerAnswers}
                        isAnswerSectionsLoading={
                          isLearnerAnswersLoading
                        }
                        onRefreshAnswerSections={
                          onRefreshAnswers
                        }
                        onRefreshProgress={onRefreshProgress}
                        onBack={() => undefined}
                      />
                    ) : (
                      <CourseAssetModal
                        key={activeLaunchSection.sectionId}
                        displayMode="inline"
                        showHeader={false}
                        showCloseButton={false}
                        assetKind={
                          activeLaunchSection.contentKind
                        }
                        assetUrl={buildCourseAssetUrl(
                          activeLaunchSection.assetPath
                        )}
                        title={
                          activeLaunchSection.sectionTitle
                        }
                        initialTime={resolveSectionResumeTime(
                          activeSectionTracking
                        )}
                        initialProgress={Number(
                          activeSectionTracking?.progress || 0
                        )}
                        onOpened={
                          activeLaunchSection.contentKind ===
                          "video"
                            ? onNonScormOpened
                            : undefined
                        }
                        onProgressUpdate={
                          onNonScormProgressUpdate
                        }
                        onCompleted={
                          onNonScormCompleted
                        }
                        onStartOver={
                          onNonScormStartOver
                        }
                        onBack={() => undefined}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Current lesson
                  </p>
                  <div className="mt-1 flex min-w-0 items-center gap-2 text-sm">
                    <span className="truncate font-semibold text-foreground">
                      {currentSectionLabel}
                    </span>
                    {currentLaunchSection ? (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                        {currentModuleLabel}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!previousLaunchSection}
                    onClick={() => {
                      if (previousLaunchSection) {
                        handleSelectSection(
                          previousLaunchSection
                        );
                      }
                    }}
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={!followingLaunchSection}
                    onClick={() => {
                      if (followingLaunchSection) {
                        handleSelectSection(
                          followingLaunchSection
                        );
                      }
                    }}
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
            </section>

            <CourseDetailsTabs
              tabs={courseDetailTabs}
              defaultTab="about"
              stickyOnMobile
              onTabChange={handleTabChange}
            />
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-20 max-h-[calc(100dvh-6rem)] flex flex-col">
              <CourseCurriculumPanel
                courseTitle={
                  String(course?.title || "Course")
                }
                overallProgress={progressLabel}
                modules={modules}
                courseQuizzes={courseQuizzes}
                isAssignedCourseView={isAssignedCourseView}
                canSelfEnroll={canSelfEnroll}
                isLoadingModules={isLoadingModules}
                hasMoreModules={hasMoreModules}
                moduleProgressMap={moduleProgressMap}
                sectionProgressMap={sectionProgressMap}
                unlockedSectionIds={unlockedSectionIds}
                sectionLoadingByModule={
                  sectionLoadingByModule
                }
                sectionErrorByModule={
                  sectionErrorByModule
                }
                activeSectionId={
                  activeLaunchSection?.sectionId || null
                }
                totalModuleCount={totalModuleCount}
                totalLessonCount={totalLessonCount}
                onLoadSections={loadSectionsForModule}
                onLoadMoreModules={loadMoreModules}
                onSelectSection={handleSelectSection}
                onTakeQuiz={onTakeQuiz}
              />
            </div>
          </div>
        </div>
      </main>

      <button
        type="button"
        onClick={() => setIsMobileCurriculumOpen(true)}
        className="fixed bottom-4 right-4 z-40 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-90 lg:hidden"
      >
        <PanelRightOpen className="h-4 w-4" />
        Curriculum
      </button>

      <ResponsiveDrawer
        open={isMobileCurriculumOpen}
        onClose={() => setIsMobileCurriculumOpen(false)}
        title={
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              Course curriculum
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Select a lesson without leaving the player.
            </p>
          </div>
        }
        desktopWidth="min(420px, 100vw)"
        bodyClassName="overflow-hidden p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      >
        <CourseCurriculumPanel
          className="h-full rounded-none border-0 shadow-none"
          courseTitle={String(course?.title || "Course")}
          overallProgress={progressLabel}
          modules={modules}
          courseQuizzes={courseQuizzes}
          isAssignedCourseView={isAssignedCourseView}
          canSelfEnroll={canSelfEnroll}
          isLoadingModules={isLoadingModules}
          hasMoreModules={hasMoreModules}
          moduleProgressMap={moduleProgressMap}
          sectionProgressMap={sectionProgressMap}
          unlockedSectionIds={unlockedSectionIds}
          sectionLoadingByModule={sectionLoadingByModule}
          sectionErrorByModule={sectionErrorByModule}
          activeSectionId={activeLaunchSection?.sectionId || null}
          totalModuleCount={totalModuleCount}
          totalLessonCount={totalLessonCount}
          onLoadSections={loadSectionsForModule}
          onLoadMoreModules={loadMoreModules}
          onSelectSection={handleSelectSection}
          onTakeQuiz={handleMobileTakeQuiz}
        />
      </ResponsiveDrawer>

      <style jsx global>{`
        .course-description-richtext {
          color: hsl(var(--foreground));
        }

        [data-theme="dark"] .course-description-richtext :is(
            p,
            span,
            div,
            li,
            ul,
            ol,
            strong,
            em,
            blockquote,
            h1,
            h2,
            h3,
            h4,
            h5,
            h6
          ) {
          color: hsl(var(--foreground)) !important;
        }

        [data-theme="dark"] .course-description-richtext a {
          color: hsl(var(--primary)) !important;
        }

        @media (prefers-reduced-motion: reduce) {
          html:focus-within {
            scroll-behavior: auto;
          }
        }
      `}</style>
    </div>
  );
}
