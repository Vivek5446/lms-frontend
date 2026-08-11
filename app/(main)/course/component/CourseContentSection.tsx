"use client";

import {
  getLearningProgressState,
  getLearningStatusMeta,
} from "@/app/dashboard/course/scorm/progressPresentation";
import {
  buildLaunchSection,
  CourseLaunchSection,
  deriveModuleId,
  deriveSectionId,
} from "@/app/dashboard/course/scorm/sectionTracking";
import { CourseQuizForLearner } from "@/app/store/courseStore/courseStore";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileBox,
  FileText,
  Layers3,
  LoaderCircle,
  Lock,
  PlayCircle,
  RotateCcw,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";

interface CourseContentSectionProps {
  modules: any[];
  courseQuizzes?: CourseQuizForLearner[];
  isAssignedCourseView: boolean;
  canSelfEnroll?: boolean;
  isLoadingModules?: boolean;
  hasMoreModules?: boolean;
  moduleProgressMap: ReadonlyMap<string, any>;
  sectionProgressMap: ReadonlyMap<string, any>;
  unlockedSectionIds: ReadonlySet<string>;
  sectionLoadingByModule: Record<string, boolean>;
  sectionErrorByModule: Record<string, string | null | undefined>;
  totalModuleCount?: number;
  totalLessonCount?: number;
  durationLabel?: string;
  onLoadSections: (moduleId: string, force?: boolean) => Promise<void> | void;
  onLoadMoreModules?: () => Promise<void> | void;
  onLaunchSection: (launchSection: CourseLaunchSection) => void;
  onWarmLaunchSection?: (launchSection?: CourseLaunchSection | null) => void;
  onEnrollCourse?: () => void;
  onTakeQuiz?: (quiz: CourseQuizForLearner) => void;
}

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function normalizeMaterials(materials: unknown) {
  return Array.isArray(materials) ? materials.filter(Boolean) : [];
}

function getSectionTypeLabel(contentKind?: string | null, sourceType?: string | null) {
  const normalizedKind = String(contentKind || "").trim().toLowerCase();
  const normalizedSourceType = String(sourceType || "").trim().toLowerCase();

  if (normalizedKind === "video" && normalizedSourceType === "url") return "Video URL";
  if (normalizedKind === "video") return "Video";
  if (normalizedKind === "document") return "Document";
  if (normalizedKind === "scorm" || normalizedKind === "zip") return "SCORM";

  return normalizedKind ? normalizedKind.toUpperCase() : "Lesson";
}

function getSectionIcon(kind: string, completed: boolean, hasLaunch: boolean) {
  if (completed) return CheckCircle2;
  if (kind === "video") return Video;
  if (kind === "document") return FileText;
  if (hasLaunch) return PlayCircle;

  return BookOpen;
}

function getSectionActionLabel(
  launchSection: CourseLaunchSection | null,
  status?: string | null,
  progress?: number | null
) {
  if (!launchSection) return "Lesson unavailable";

  const state = getLearningProgressState(status, progress);

  if (state === "completed") {
    if (launchSection.contentKind === "video") return "Rewatch";
    if (launchSection.contentKind === "document") return "Reopen";
    return "Review";
  }

  if (state === "in_progress") {
    if (launchSection.contentKind === "video") return "Resume video";
    if (launchSection.contentKind === "document") return "Continue document";
    return "Continue lesson";
  }

  if (launchSection.contentKind === "video") return "Watch video";
  if (launchSection.contentKind === "document") return "Open document";

  return "Start lesson";
}

function getModuleSectionCount(moduleRecord: any, moduleTracking?: any) {
  const loadedSections = Array.isArray(moduleRecord?.sections)
    ? moduleRecord.sections.length
    : 0;

  return Number(
    loadedSections ||
      moduleRecord?.sectionCount ||
      moduleRecord?.totalSections ||
      moduleTracking?.sectionCount ||
      0
  );
}

interface QuizCardProps {
  quiz: CourseQuizForLearner;
  onTakeQuiz?: (quiz: CourseQuizForLearner) => void;
}

function ModuleQuizCard({ quiz, onTakeQuiz }: QuizCardProps) {
  const completed = Boolean(quiz.attempt);
  const locked = !completed && quiz.isUnlocked === false;
  const percentage = Math.round(Number(quiz.attempt?.percentage || 0));

  return (
    <div
      className={joinClasses(
        "rounded-2xl border p-3 transition sm:p-3.5",
        locked &&
          "border-slate-200 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-900/30",
        completed &&
          "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20",
        !locked &&
          !completed &&
          "border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20"
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <span
          className={joinClasses(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white",
            locked && "bg-slate-400",
            completed && "bg-emerald-500",
            !locked && !completed && "bg-amber-500"
          )}
        >
          {locked ? (
            <Lock className="h-4 w-4" />
          ) : completed ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Award className="h-4 w-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                {quiz.title}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                {quiz.questionCount} question{quiz.questionCount === 1 ? "" : "s"}
                {" · "}
                {quiz.totalMarks} point{quiz.totalMarks === 1 ? "" : "s"}
              </p>
            </div>

            <span
              className={joinClasses(
                "shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold",
                locked &&
                  "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                completed &&
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                !locked &&
                  !completed &&
                  "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              )}
            >
              {locked ? "Locked" : completed ? `${percentage}%` : "Pending"}
            </span>
          </div>

          <p
            className={joinClasses(
              "mt-2 text-[11px] leading-5 sm:text-xs",
              locked && "text-slate-600 dark:text-slate-300",
              completed && "text-emerald-700 dark:text-emerald-300",
              !locked && !completed && "text-amber-700 dark:text-amber-300"
            )}
          >
            {locked
              ? quiz.unlockReason || "Complete the required lessons to unlock this quiz."
              : completed
              ? `Score ${quiz.attempt?.score}/${quiz.attempt?.maxScore}`
              : "This quiz is ready to take."}
          </p>

          {onTakeQuiz ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => {
                if (!locked) onTakeQuiz(quiz);
              }}
              className={joinClasses(
                "mt-2.5 inline-flex h-8 items-center justify-center rounded-full px-3 text-[11px] font-semibold transition sm:h-9 sm:text-xs",
                locked && "cursor-not-allowed bg-slate-300 text-white opacity-70",
                completed && "bg-emerald-600 text-white hover:bg-emerald-700",
                !locked && !completed && "bg-amber-500 text-white hover:bg-amber-600"
              )}
            >
              {locked ? "Locked" : completed ? "View result" : "Take quiz"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CourseContentSkeleton() {
  return (
    <div className="space-y-2.5 p-2.5 sm:p-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-border bg-background p-3.5 sm:p-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-20 rounded-full bg-muted" />
              <div className="h-4 w-3/5 rounded-full bg-muted" />
            </div>
            <div className="h-8 w-8 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CourseContentSection({
  modules,
  courseQuizzes = [],
  isAssignedCourseView,
  canSelfEnroll = false,
  isLoadingModules = false,
  hasMoreModules = false,
  moduleProgressMap,
  sectionProgressMap,
  unlockedSectionIds,
  sectionLoadingByModule,
  sectionErrorByModule,
  totalModuleCount,
  totalLessonCount,
  durationLabel,
  onLoadSections,
  onLoadMoreModules,
  onLaunchSection,
  onWarmLaunchSection,
  onEnrollCourse,
  onTakeQuiz,
}: CourseContentSectionProps) {
  const [openModuleIds, setOpenModuleIds] = useState<Set<string>>(
    () => new Set()
  );

  const finalQuizzes = useMemo(
    () => courseQuizzes.filter((quiz) => quiz.scope === "final"),
    [courseQuizzes]
  );

  const completedLessonCount = useMemo(() => {
    const trackedCompleted = Array.from(moduleProgressMap.values()).reduce(
      (total, moduleRecord) =>
        total + Math.max(Number(moduleRecord?.sectionsCompleted || 0), 0),
      0
    );

    if (trackedCompleted > 0) {
      return trackedCompleted;
    }

    let completed = 0;

    modules.forEach((moduleRecord) => {
      const sections = Array.isArray(moduleRecord?.sections)
        ? moduleRecord.sections
        : [];

      sections.forEach((sectionRecord: any) => {
        const sectionId = deriveSectionId(moduleRecord, sectionRecord);
        const trackingRecord = sectionProgressMap.get(sectionId);

        if (
          getLearningProgressState(
            trackingRecord?.lessonStatus,
            trackingRecord?.progress
          ) === "completed"
        ) {
          completed += 1;
        }
      });
    });

    return completed;
  }, [moduleProgressMap, modules, sectionProgressMap]);

  const resolvedModuleCount = Number(totalModuleCount || modules.length || 0);
  const resolvedLessonCount = Number(totalLessonCount || 0);
  const overallProgress = resolvedLessonCount
    ? Math.min(Math.round((completedLessonCount / resolvedLessonCount) * 100), 100)
    : 0;

  const toggleModule = (moduleId: string) => {
    const willOpen = !openModuleIds.has(moduleId);

    setOpenModuleIds((current) => {
      const next = new Set(current);

      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }

      return next;
    });

    if (willOpen) {
      void onLoadSections(moduleId);
    }
  };

  if (isLoadingModules && modules.length === 0) {
    return <CourseContentSkeleton />;
  }

  if (modules.length === 0) {
    return (
      <div className="p-3 sm:p-5">
        <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border bg-muted/25 px-5 py-10 text-center">
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Layers3 className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              No course content yet
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground sm:text-sm">
              Modules and lessons will appear here after curriculum content is added.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full p-2 sm:p-4">
      <div className="mb-3 grid grid-cols-3 gap-2 sm:mb-4 sm:gap-3">
        <div className="rounded-2xl border border-border bg-background px-2.5 py-3 text-center sm:px-4">
          <p className="text-base font-bold text-foreground sm:text-xl">
            {resolvedModuleCount}
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs">
            Modules
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background px-2.5 py-3 text-center sm:px-4">
          <p className="text-base font-bold text-foreground sm:text-xl">
            {resolvedLessonCount}
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs">
            Lessons
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background px-2.5 py-3 text-center sm:px-4">
          <p className="truncate text-base font-bold text-foreground sm:text-xl">
            {isAssignedCourseView ? `${overallProgress}%` : durationLabel || "—"}
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs">
            {isAssignedCourseView ? "Completed" : "Duration"}
          </p>
        </div>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {modules.map((moduleRecord: any, moduleIndex: number) => {
          const moduleId = deriveModuleId(moduleRecord);
          const isOpen = openModuleIds.has(moduleId);
          const moduleTracking = moduleProgressMap.get(moduleId);
          const moduleProgressMeta = getLearningStatusMeta(
            moduleTracking?.lessonStatus,
            moduleTracking?.progress
          );
          const moduleSections = Array.isArray(moduleRecord?.sections)
            ? moduleRecord.sections
            : [];
          const sectionCount = getModuleSectionCount(moduleRecord, moduleTracking);
          const isSectionLoading = Boolean(sectionLoadingByModule[moduleId]);
          const sectionLoadError = sectionErrorByModule[moduleId];

          const moduleCompletedCount = moduleSections.filter((sectionRecord: any) => {
            const trackingRecord = sectionProgressMap.get(
              deriveSectionId(moduleRecord, sectionRecord)
            );

            return (
              getLearningProgressState(
                trackingRecord?.lessonStatus,
                trackingRecord?.progress
              ) === "completed"
            );
          }).length;

          const moduleProgressPercent = Number.isFinite(
            Number(moduleTracking?.progress)
          )
            ? Math.round(Number(moduleTracking.progress))
            : sectionCount
            ? Math.round((moduleCompletedCount / sectionCount) * 100)
            : 0;

          const moduleQuizzes = courseQuizzes.filter(
            (quiz) => quiz.scope === "module" && quiz.moduleId === moduleId
          );

          return (
            <article
              key={moduleId || moduleIndex}
              className={joinClasses(
                "overflow-hidden rounded-[1.2rem] border bg-background transition-all duration-200 sm:rounded-[1.5rem]",
                isOpen
                  ? "border-primary/25 shadow-[0_12px_34px_-24px_rgba(15,23,42,0.55)]"
                  : "border-border hover:border-primary/20"
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`course-module-${moduleId}`}
                onClick={() => toggleModule(moduleId)}
                className="flex w-full min-w-0 items-center gap-2.5 px-3 py-3 text-left outline-none transition hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:gap-3 sm:px-4 sm:py-4"
              >
                <span
                  className={joinClasses(
                    "relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-xs font-bold transition sm:h-12 sm:w-12",
                    isAssignedCourseView && moduleProgressMeta.state === "completed"
                      ? "bg-emerald-500 text-white"
                      : isOpen
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {isAssignedCourseView &&
                  moduleProgressMeta.state === "completed" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span>{String(moduleIndex + 1).padStart(2, "0")}</span>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary sm:text-[10px]">
                      Module {moduleIndex + 1}
                    </span>

                    {isAssignedCourseView ? (
                      <span
                        className={joinClasses(
                          "rounded-full px-2 py-0.5 text-[9px] font-semibold sm:text-[10px]",
                          moduleProgressMeta.state === "completed" &&
                            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                          moduleProgressMeta.state === "in_progress" &&
                            "bg-primary/10 text-primary",
                          moduleProgressMeta.state === "not_started" &&
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {moduleProgressMeta.label}
                      </span>
                    ) : null}
                    {moduleRecord?.isFreePreview ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 sm:text-[10px]">
                        Preview available
                      </span>
                    ) : null}
                  </span>

                  <span className="mt-1 block line-clamp-2 text-xs font-semibold leading-5 text-foreground sm:text-sm">
                    {moduleRecord?.title || `Module ${moduleIndex + 1}`}
                  </span>

                  <span className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground sm:text-xs">
                    <span>
                      {sectionCount} lesson{sectionCount === 1 ? "" : "s"}
                    </span>
                    {moduleQuizzes.length > 0 ? (
                      <>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span>
                          {moduleQuizzes.length} quiz{moduleQuizzes.length === 1 ? "" : "zes"}
                        </span>
                      </>
                    ) : null}
                  </span>
                </span>

                <span className="hidden w-24 shrink-0 sm:block">
                  <span className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-semibold text-foreground">
                      {moduleProgressPercent}%
                    </span>
                  </span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary transition-[width] duration-500"
                      style={{ width: `${moduleProgressPercent}%` }}
                    />
                  </span>
                </span>

                <ChevronDown
                  className={joinClasses(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 sm:h-5 sm:w-5",
                    isOpen && "rotate-180 text-primary"
                  )}
                />
              </button>

              {isAssignedCourseView ? (
                <div className="h-1 bg-muted sm:hidden">
                  <div
                    className="h-full bg-primary transition-[width] duration-500"
                    style={{ width: `${moduleProgressPercent}%` }}
                  />
                </div>
              ) : null}

              {isOpen ? (
                <div
                  id={`course-module-${moduleId}`}
                  className="course-module-enter border-t border-border/70 bg-muted/[0.16] px-2 pb-2.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
                >
                  {moduleRecord?.summary ? (
                    <p className="mb-3 rounded-xl bg-background px-3 py-2.5 text-[11px] leading-5 text-muted-foreground sm:text-xs sm:leading-6">
                      {moduleRecord.summary}
                    </p>
                  ) : null}

                  {isSectionLoading && moduleSections.length === 0 ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-5 text-xs text-muted-foreground">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Loading lessons...
                    </div>
                  ) : null}

                  {sectionLoadError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>{sectionLoadError}</span>
                        <button
                          type="button"
                          onClick={() => void onLoadSections(moduleId, true)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-red-300 px-3 text-[11px] font-semibold transition hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950/50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {moduleSections.length > 0 ? (
                    <div className="space-y-2">
                      {moduleSections.map((sectionRecord: any, sectionIndex: number) => {
                        const sectionId = deriveSectionId(
                          moduleRecord,
                          sectionRecord
                        );
                        const launchSection = buildLaunchSection(
                          moduleRecord,
                          sectionRecord
                        );
                        const isSectionLocked = Boolean(
                          isAssignedCourseView &&
                            !unlockedSectionIds.has(sectionId)
                        );
                        const previewLocked = Boolean(
                          canSelfEnroll && !moduleRecord?.isFreePreview
                        );
                        const sectionLocked = isSectionLocked || previewLocked;
                        const sectionTracking = sectionProgressMap.get(sectionId);
                        const sectionProgressMeta = getLearningStatusMeta(
                          sectionTracking?.lessonStatus,
                          sectionTracking?.progress
                        );
                        const materials = normalizeMaterials(
                          sectionRecord?.studyMaterial
                        );
                        const contentKind = String(
                          sectionRecord?.content?.kind || ""
                        )
                          .trim()
                          .toLowerCase();
                        const sourceType = String(
                          sectionRecord?.content?.sourceType || ""
                        )
                          .trim()
                          .toLowerCase();
                        const contentTypeLabel = getSectionTypeLabel(contentKind, sourceType);
                        const SectionIcon = getSectionIcon(
                          contentKind,
                          sectionProgressMeta.state === "completed",
                          Boolean(launchSection)
                        );

                        const actionLabel = previewLocked
                          ? "Locked"
                          : isSectionLocked
                          ? "Complete the previous lesson"
                          : getSectionActionLabel(
                              launchSection,
                              sectionTracking?.lessonStatus,
                              sectionTracking?.progress
                            );

                        return (
                          <button
                            key={sectionId || sectionIndex}
                            type="button"
                            disabled={!launchSection || sectionLocked}
                            onMouseEnter={() =>
                              onWarmLaunchSection?.(launchSection)
                            }
                            onFocus={() => onWarmLaunchSection?.(launchSection)}
                            onClick={() => {
                              if (sectionLocked) return;

                              if (launchSection) {
                                onLaunchSection(launchSection);
                              }
                            }}
                            className={joinClasses(
                              "group flex w-full min-w-0 items-start gap-2.5 rounded-2xl border p-2.5 text-left outline-none transition sm:gap-3 sm:p-3.5",
                              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              sectionLocked &&
                                "cursor-not-allowed border-slate-200 bg-slate-50/80 opacity-75 dark:border-slate-800 dark:bg-slate-900/30",
                              !sectionLocked &&
                                sectionProgressMeta.state === "completed" &&
                                "border-emerald-200 bg-emerald-50/55 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
                              !sectionLocked &&
                                sectionProgressMeta.state !== "completed" &&
                                "border-border bg-background hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm",
                              !launchSection && "cursor-not-allowed opacity-65"
                            )}
                          >
                            <span
                              className={joinClasses(
                                "grid h-9 w-9 shrink-0 place-items-center rounded-xl transition sm:h-10 sm:w-10",
                                sectionLocked &&
                                  "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
                                !sectionLocked &&
                                  sectionProgressMeta.state === "completed" &&
                                  "bg-emerald-500 text-white",
                                !sectionLocked &&
                                  sectionProgressMeta.state !== "completed" &&
                                  "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                              )}
                            >
                              {sectionLocked ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <SectionIcon className="h-4 w-4" />
                              )}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground sm:text-[10px]">
                                  Lesson {moduleIndex + 1}.{sectionIndex + 1}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground sm:text-[10px]">
                                  <FileBox className="h-3 w-3" />
                                  {contentTypeLabel}
                                </span>
                                {isAssignedCourseView ? (
                                  <span
                                    className={joinClasses(
                                      "rounded-full px-2 py-0.5 text-[9px] font-semibold sm:text-[10px]",
                                      sectionLocked &&
                                        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                                      !sectionLocked &&
                                        sectionProgressMeta.state === "completed" &&
                                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                                      !sectionLocked &&
                                        sectionProgressMeta.state === "in_progress" &&
                                        "bg-primary/10 text-primary",
                                      !sectionLocked &&
                                        sectionProgressMeta.state === "not_started" &&
                                        "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    {sectionLocked
                                      ? "Locked"
                                      : sectionProgressMeta.label}
                                  </span>
                                ) : null}
                              </span>

                              <span className="mt-1.5 block break-words text-xs font-semibold leading-5 text-foreground sm:text-sm">
                                {sectionRecord?.title ||
                                  `Lesson ${moduleIndex + 1}.${sectionIndex + 1}`}
                              </span>

                              {sectionRecord?.description ? (
                                <span className="mt-1 hidden line-clamp-2 text-[11px] leading-5 text-muted-foreground sm:block sm:text-xs">
                                  {sectionRecord.description}
                                </span>
                              ) : null}

                              <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground sm:text-xs">
                                {isAssignedCourseView ? (
                                  <span>{sectionProgressMeta.progress}% progress</span>
                                ) : null}
                                {materials.length > 0 ? (
                                  <span>
                                    {materials.length} material
                                    {materials.length === 1 ? "" : "s"}
                                  </span>
                                ) : null}
                                <span className="font-medium text-primary">
                                  {actionLabel}
                                </span>
                              </span>
                            </span>

                            {sectionLocked ? (
                              <Lock className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                            ) : (
                              <PlayCircle className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {moduleQuizzes.length > 0 ? (
                    <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
                      <p className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Module quiz{moduleQuizzes.length === 1 ? "" : "zes"}
                      </p>
                      {moduleQuizzes.map((quiz) => (
                        <ModuleQuizCard
                          key={quiz.quizId}
                          quiz={quiz}
                          onTakeQuiz={onTakeQuiz}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {hasMoreModules && onLoadMoreModules ? (
        <button
          type="button"
          disabled={isLoadingModules}
          onClick={() => void onLoadMoreModules()}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-4 sm:text-sm"
        >
          {isLoadingModules ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading modules...
            </>
          ) : (
            "Show more modules"
          )}
        </button>
      ) : null}

      {finalQuizzes.length > 0 ? (
        <section className="mt-4 rounded-[1.2rem] border border-border bg-gradient-to-br from-primary/[0.06] via-background to-background p-3 sm:rounded-[1.5rem] sm:p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Award className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-xs font-semibold text-foreground sm:text-sm">
                Final assessment
              </h3>
              <p className="text-[10px] text-muted-foreground sm:text-xs">
                Course-level quizzes appear after the required lessons.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {finalQuizzes.map((quiz) => (
              <ModuleQuizCard
                key={quiz.quizId}
                quiz={quiz}
                onTakeQuiz={onTakeQuiz}
              />
            ))}
          </div>
        </section>
      ) : null}

      <style jsx global>{`
        .course-module-enter {
          animation: course-module-enter 180ms ease-out both;
        }

        @keyframes course-module-enter {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .course-module-enter {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
