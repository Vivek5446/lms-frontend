"use client";

import CourseContentSection from "@/app/(main)/course/component/CourseContentSection";
import CourseDetailsTabs, { CourseDetailsTab, CourseDetailsTabId } from "@/app/(main)/course/component/CourseDetailsTabs";
import CourseHeroSection from "@/app/(main)/course/component/CourseHeroSection";
import CourseMaterialsSection, { buildCourseMaterialGroups, countCourseMaterials } from "@/app/(main)/course/component/CourseMaterialSection";
import CourseOverviewSection from "@/app/(main)/course/component/CourseOverviewSection";
import CourseQuizReviewSection from "@/app/(main)/course/component/CourseQuizReviewSection";
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
import { Award, BookOpen, FileText, Layers3 } from "lucide-react";
import type { CSSProperties } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

// import CourseContentSection from "./components/CourseContentSection";
// import CourseDetailsTabs from "./components/CourseDetailsTabs";
// import type {
//   CourseDetailsTab,
//   CourseDetailsTabId,
// } from "./components/CourseDetailsTabs";
// import CourseHeroSection from "./components/CourseHeroSection";
// import CourseMaterialsSection, {
//   buildCourseMaterialGroups,
//   countCourseMaterials,
// } from "./components/CourseMaterialsSection";
// import CourseOverviewSection from "./components/CourseOverviewSection";
// import CourseQuizReviewSection from "./components/CourseQuizReviewSection";

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
      return "Rewatch Video";
    }

    if (launchSection.contentKind === "document") {
      return "Reopen Document";
    }

    return "Review Lesson";
  }

  if (state === "in_progress") {
    if (launchSection.contentKind === "video") {
      return "Resume Video";
    }

    if (launchSection.contentKind === "document") {
      return "Continue Document";
    }

    return "Continue Lesson";
  }

  if (launchSection.contentKind === "video") {
    return "Start Video";
  }

  if (launchSection.contentKind === "document") {
    return "Open Document";
  }

  return "Start Lesson";
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
  const learningOutcomes:any = useMemo(
    () => getLearningOutcomes(courseWithLoadedModules),
    [courseWithLoadedModules]
  );
  const materialGroups:any = useMemo(
    () => buildCourseMaterialGroups(courseWithLoadedModules),
    [courseWithLoadedModules]
  );
  const totalMaterialCount:any = useMemo(
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
  const ratingLabel = Number.isFinite(
    Number(course?.metrics?.averageRating)
  )
    ? Number(course.metrics.averageRating).toFixed(1)
    : "0.0";
  const reviewCountLabel = formatCompactNumber(
    course?.metrics?.reviewCount
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
  const categories = Array.isArray(
    course?.taxonomy?.categories
  )
    ? course.taxonomy.categories
    : [];
  const levelLabel = String(
    course?.taxonomy?.level || "Beginner"
  );
  const visibilityLabel =
    course?.visibility?.type === "public"
      ? "Public Course"
      : course?.visibility?.type
        ? "Private Course"
        : "";

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
    }, [loadSectionsForModule, modules]
  );

  const courseDetailTabs = useMemo<CourseDetailsTab[]>(
    () => [
      {
        id: "overview",
        label: "Overview",
        mobileLabel: "Overview",
        description:
          "Outcomes and important course information",
        icon: BookOpen,
        badge: learningOutcomes.length || undefined,
        content: (
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
        ),
      },
      {
        id: "content",
        label: "Course Content",
        mobileLabel: "Content",
        description: `${totalModuleCount} modules and ${totalLessonCount} lessons`,
        icon: Layers3,
        badge: totalLessonCount || undefined,
        content: (
          <CourseContentSection
            modules={modules}
            courseQuizzes={courseQuizzes}
            isAssignedCourseView={
              isAssignedCourseView
            }
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
            totalModuleCount={totalModuleCount}
            totalLessonCount={totalLessonCount}
            durationLabel={durationLabel}
            onLoadSections={loadSectionsForModule}
            onLoadMoreModules={loadMoreModules}
            onLaunchSection={onLaunchSection}
            onWarmLaunchSection={warmLaunchSection}
            onEnrollCourse={onEnrollCourse}
            onTakeQuiz={onTakeQuiz}
          />
        ),
      },
      {
        id: "materials",
        label: "Study Materials",
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
          "Quiz attempts, submitted answers and results",
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
      canSelfEnroll,
      certificateReason,
      course,
      courseId,
      courseQuizzes,
      durationLabel,
      hasMoreModules,
      instructor,
      isAssignedCourseView,
      isCertificateDownloading,
      isCourseQuizzesLoading,
      isLearnerAnswersLoading,
      isLoadingModules,
      learnerAnswers,
      learningOutcomes,
      loadMoreModules,
      loadSectionsForModule,
      materialGroups,
      moduleProgressMap,
      modules,
      onDownloadCertificate,
      onEnrollCourse,
      onLaunchSection,
      onTakeQuiz,
      sectionErrorByModule,
      sectionLoadingByModule,
      sectionProgressMap,
      sectionsCompleted,
      showQuizReview,
      totalLessonCount,
      totalMaterialCount,
      totalModuleCount,
      totalSections,
      unlockedSectionIds,
      warmLaunchSection,
      progressLabel,
    ]
  );

  return (
    <div
      className="min-h-screen px-8 w-full max-w-full overflow-x-hidden bg-background text-foreground"
      data-theme={colorMode}
      style={courseThemeStyle}
    >
      <CourseHeroSection
        course={course}
        instructor={instructor}
        isAssignedCourseView={isAssignedCourseView}
        canSelfEnroll={canSelfEnroll}
        isEnrolling={isEnrolling}
        nextLaunchSection={nextLaunchSection}
        previewLaunchSection={previewLaunchSection}
        progressPercent={progressLabel}
        sectionsCompleted={sectionsCompleted}
        totalSections={sectionSummary.total}
        totalModuleCount={totalModuleCount}
        totalLessonCount={totalLessonCount}
        totalMaterialCount={totalMaterialCount}
        durationLabel={durationLabel}
        priceLabel={priceLabel}
        ratingLabel={ratingLabel}
        reviewCountLabel={reviewCountLabel}
        learnersLabel={learnersLabel}
        levelLabel={levelLabel}
        categories={categories}
        visibilityLabel={visibilityLabel}
        primaryActionLabel={
          isAssignedCourseView
            ? nextLaunchLabel
            : getStartLearningLabel(
                firstPlayableLaunchSection,
                course?.scormFilePath
              )
        }
        onBack={onBack}
        onEditCourse={onEditCourse}
        onAssignCourse={onAssignCourse}
        onLaunchSection={onLaunchSection}
        onWarmLaunchSection={warmLaunchSection}
        onEnrollCourse={onEnrollCourse}
      />

      <main className="mx-auto w-full max-w-8xl px-1 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-4 sm:pb-20 lg:px-6">
        <CourseDetailsTabs
          tabs={courseDetailTabs}
          defaultTab="content"
          stickyOnMobile
          onTabChange={handleTabChange}
        />
      </main>
    </div>
  );
}