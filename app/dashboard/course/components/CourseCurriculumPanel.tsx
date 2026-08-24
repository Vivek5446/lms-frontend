"use client";

import {
  getLearningProgressState,
  getLearningStatusMeta,
} from "@/app/dashboard/course/scorm/progressPresentation";
import {
  buildLaunchSection,
  type CourseLaunchSection,
  deriveModuleId,
  deriveSectionId,
} from "@/app/dashboard/course/scorm/sectionTracking";
import type { CourseQuizForLearner } from "@/app/store/courseStore/courseStore";
import {
  Award,
  CheckCircle2,
  ChevronDown,
  FileBox,
  FileText,
  LoaderCircle,
  Lock,
  PlayCircle,
  RotateCcw,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface CourseCurriculumPanelProps {
  className?: string;
  courseTitle: string;
  overallProgress: number;
  modules: any[];
  courseQuizzes?: CourseQuizForLearner[];
  isAssignedCourseView: boolean;
  canSelfEnroll?: boolean;
  hidePreviewAvailableBadge?: boolean;
  isLoadingModules?: boolean;
  hasMoreModules?: boolean;
  moduleProgressMap: ReadonlyMap<string, any>;
  sectionProgressMap: ReadonlyMap<string, any>;
  unlockedSectionIds: ReadonlySet<string>;
  sectionLoadingByModule: Record<string, boolean>;
  sectionErrorByModule: Record<string, string | null | undefined>;
  activeSectionId?: string | null;
  totalModuleCount?: number;
  totalLessonCount?: number;
  onLoadSections: (
    moduleId: string,
    force?: boolean
  ) => Promise<void> | void;
  onLoadMoreModules?: () => Promise<void> | void;
  onSelectSection: (launchSection: CourseLaunchSection) => void;
  onTakeQuiz?: (quiz: CourseQuizForLearner) => void;
}

function joinClasses(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ");
}

function getSectionTypeLabel(contentKind?: string | null, sourceType?: string | null) {
  const normalizedKind = String(contentKind || "")
    .trim()
    .toLowerCase();
  const normalizedSourceType = String(sourceType || "").trim().toLowerCase();

  if (normalizedKind === "video" && normalizedSourceType === "url") return "Video URL";
  if (normalizedKind === "video") return "Video";
  if (normalizedKind === "document") return "Document";
  if (normalizedKind === "scorm" || normalizedKind === "zip") {
    return "SCORM";
  }

  return normalizedKind ? normalizedKind.toUpperCase() : "Lesson";
}

function getSectionIcon(
  kind: string,
  completed: boolean,
  hasLaunch: boolean
) {
  if (completed) return CheckCircle2;
  if (kind === "video") return Video;
  if (kind === "document") return FileText;
  if (hasLaunch) return PlayCircle;

  return FileBox;
}

function getModuleSectionCount(
  moduleRecord: any,
  moduleTracking?: any
) {
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

function CurriculumQuizRow({
  quiz,
  onTakeQuiz,
}: {
  quiz: CourseQuizForLearner;
  onTakeQuiz?: (quiz: CourseQuizForLearner) => void;
}) {
  const completed = Boolean(quiz.attempt);
  const locked = !completed && quiz.isUnlocked === false;
  const percentage = Math.round(
    Number(quiz.attempt?.percentage || 0)
  );

  return (
    <button
      type="button"
      disabled={!onTakeQuiz || locked}
      onClick={() => {
        if (!locked) {
          onTakeQuiz?.(quiz);
        }
      }}
      className={joinClasses(
        "flex w-full items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        locked &&
          "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
        completed &&
          "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20",
        !locked &&
          !completed &&
          "border-amber-200 bg-amber-50/70 hover:border-amber-300 dark:border-amber-900/50 dark:bg-amber-950/20"
      )}
    >
      <span
        className={joinClasses(
          "grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white",
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

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-semibold text-foreground">
            {quiz.title}
          </span>
          <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
            {locked
              ? "Locked"
              : completed
                ? `${percentage}%`
                : "Start Quiz"}
          </span>
        </span>
        <span className="mt-0.5 block text-[10px] text-muted-foreground">
          {quiz.questionCount} question
          {quiz.questionCount === 1 ? "" : "s"}
        </span>
      </span>
    </button>
  );
}

export default function CourseCurriculumPanel({
  className,
  courseTitle,
  overallProgress,
  modules,
  courseQuizzes = [],
  isAssignedCourseView,
  canSelfEnroll = false,
  hidePreviewAvailableBadge = false,
  isLoadingModules = false,
  hasMoreModules = false,
  moduleProgressMap,
  sectionProgressMap,
  unlockedSectionIds,
  sectionLoadingByModule,
  sectionErrorByModule,
  activeSectionId,
  totalModuleCount = 0,
  totalLessonCount = 0,
  onLoadSections,
  onLoadMoreModules,
  onSelectSection,
  onTakeQuiz,
}: CourseCurriculumPanelProps) {
  const activeRowRefs = useRef<
    Record<string, HTMLButtonElement | null>
  >({});
  const [openModuleIds, setOpenModuleIds] = useState<
    Set<string>
  >(() => new Set());

  useEffect(() => {
    if (!activeSectionId) {
      return;
    }

    for (const moduleRecord of modules) {
      const moduleId = deriveModuleId(moduleRecord);
      const containsActiveSection = (
        moduleRecord.sections || []
      ).some(
        (sectionRecord: any) =>
          deriveSectionId(moduleRecord, sectionRecord) ===
          activeSectionId
      );

      if (containsActiveSection) {
        setOpenModuleIds((current) => {
          if (current.has(moduleId)) {
            return current;
          }

          const next = new Set(current);
          next.add(moduleId);
          return next;
        });
        void onLoadSections(moduleId);
        break;
      }
    }
  }, [activeSectionId, modules, onLoadSections]);

  useEffect(() => {
    if (!activeSectionId) {
      return;
    }

    activeRowRefs.current[activeSectionId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeSectionId]);

  const finalQuizzes = useMemo(
    () =>
      courseQuizzes.filter((quiz) => quiz.scope === "final"),
    [courseQuizzes]
  );

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

  return (
    <aside
      className={joinClasses(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card/95 shadow-sm",
        className
      )}
    >
      <div className="border-b border-border/75 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              Curriculum
            </p>
            <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
              {courseTitle}
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
            {Math.round(overallProgress)}%
          </span>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{totalModuleCount} modules</span>
          <span>{totalLessonCount} lessons</span>
        </div>
      </div>

      <div className="course-curriculum-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-2.5">
          {isLoadingModules && modules.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-border bg-background p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-muted" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-20 rounded-full bg-muted" />
                      <div className="h-4 w-3/4 rounded-full bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {modules.map((moduleRecord: any, moduleIndex: number) => {
            const moduleId = deriveModuleId(moduleRecord);
            const isOpen = openModuleIds.has(moduleId);
            const moduleTracking = moduleProgressMap.get(moduleId);
            const moduleSections = Array.isArray(
              moduleRecord?.sections
            )
              ? moduleRecord.sections
              : [];
            const sectionCount = getModuleSectionCount(
              moduleRecord,
              moduleTracking
            );
            const moduleQuizzes = courseQuizzes.filter(
              (quiz) =>
                quiz.scope === "module" &&
                quiz.moduleId === moduleId
            );
            const completedCount = moduleSections.filter(
              (sectionRecord: any) =>
                getLearningProgressState(
                  sectionProgressMap.get(
                    deriveSectionId(moduleRecord, sectionRecord)
                  )?.lessonStatus,
                  sectionProgressMap.get(
                    deriveSectionId(moduleRecord, sectionRecord)
                  )?.progress
                ) === "completed"
            ).length;
            const moduleProgressPercent = Number.isFinite(
              Number(moduleTracking?.progress)
            )
              ? Math.round(Number(moduleTracking.progress))
              : sectionCount
                ? Math.round(
                    (completedCount / sectionCount) * 100
                  )
                : 0;

            return (
              <article
                key={moduleId || moduleIndex}
                className={joinClasses(
                  "overflow-hidden rounded-[1.35rem] border bg-background transition",
                  isOpen
                    ? "border-primary/25"
                    : "border-border"
                )}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`curriculum-module-${moduleId}`}
                  onClick={() => toggleModule(moduleId)}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-[11px] font-bold text-primary">
                    {String(moduleIndex + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-foreground">
                        {moduleRecord?.title ||
                          `Module ${moduleIndex + 1}`}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {moduleProgressPercent}%
                      </span>
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>
                        {sectionCount} lesson
                        {sectionCount === 1 ? "" : "s"}
                      </span>
                      {moduleRecord?.isFreePreview &&
                      !hidePreviewAvailableBadge ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Preview available
                        </span>
                      ) : null}
                      {moduleQuizzes.length > 0 ? (
                        <span>
                          {moduleQuizzes.length} quiz
                          {moduleQuizzes.length === 1 ? "" : "zes"}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-2 block h-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{
                          width: `${moduleProgressPercent}%`,
                        }}
                      />
                    </span>
                  </span>

                  <ChevronDown
                    className={joinClasses(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180 text-primary"
                    )}
                  />
                </button>

                {isOpen ? (
                  <div
                    id={`curriculum-module-${moduleId}`}
                    className="space-y-2 border-t border-border/70 bg-muted/[0.14] px-2.5 py-2.5"
                  >
                    {sectionErrorByModule[moduleId] ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[11px] text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                        <div className="flex items-center justify-between gap-2">
                          <span className="min-w-0 flex-1">
                            {sectionErrorByModule[moduleId]}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              void onLoadSections(moduleId, true)
                            }
                            className="inline-flex h-8 items-center gap-1 rounded-full border border-red-300 px-3 text-[10px] font-semibold"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Retry
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {sectionLoadingByModule[moduleId] &&
                    moduleSections.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-4 text-[11px] text-muted-foreground">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Loading lessons...
                      </div>
                    ) : null}

                    {moduleSections.map(
                      (sectionRecord: any, sectionIndex: number) => {
                        const sectionId = deriveSectionId(
                          moduleRecord,
                          sectionRecord
                        );
                        const launchSection = buildLaunchSection(
                          moduleRecord,
                          sectionRecord
                        );
                        const trackingRecord =
                          sectionProgressMap.get(sectionId);
                        const progressMeta = getLearningStatusMeta(
                          trackingRecord?.lessonStatus,
                          trackingRecord?.progress
                        );
                        const locked = Boolean(
                          isAssignedCourseView &&
                            !unlockedSectionIds.has(sectionId)
                        );
                        const previewLocked = Boolean(
                          canSelfEnroll && !moduleRecord?.isFreePreview
                        );
                        const sectionLocked = locked || previewLocked;
                        const kind = String(
                          sectionRecord?.content?.kind || ""
                        )
                          .trim()
                          .toLowerCase();
                        const sourceType = String(
                          sectionRecord?.content?.sourceType || ""
                        )
                          .trim()
                          .toLowerCase();
                        const SectionIcon = getSectionIcon(
                          kind,
                          progressMeta.state === "completed",
                          Boolean(launchSection)
                        );
                        const isActive =
                          sectionId === activeSectionId;

                        return (
                          <button
                            key={sectionId || sectionIndex}
                            ref={(element) => {
                              activeRowRefs.current[sectionId] =
                                element;
                            }}
                            type="button"
                            disabled={
                              !launchSection ||
                              sectionLocked
                            }
                            onClick={() => {
                              if (
                                !launchSection ||
                                sectionLocked
                              ) {
                                return;
                              }

                              onSelectSection(launchSection);
                            }}
                            className={joinClasses(
                              "flex w-full items-start gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition",
                              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              isActive &&
                                "border-primary bg-primary/[0.08] shadow-sm",
                              !isActive &&
                                "border-border bg-background hover:border-primary/25 hover:bg-primary/[0.03]",
                              sectionLocked &&
                                "cursor-not-allowed border-slate-200 bg-slate-50 opacity-75 dark:border-slate-800 dark:bg-slate-900/30",
                              (!launchSection || previewLocked) &&
                                "cursor-not-allowed opacity-70"
                            )}
                          >
                            <span
                              className={joinClasses(
                                "grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                                isActive &&
                                  "bg-primary text-primary-foreground",
                                !isActive &&
                                  progressMeta.state ===
                                    "completed" &&
                                  "bg-emerald-500 text-white",
                                !isActive &&
                                  progressMeta.state !==
                                    "completed" &&
                                  "bg-muted text-muted-foreground",
                                sectionLocked &&
                                  "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
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
                                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                  {moduleIndex + 1}.{sectionIndex + 1}
                                </span>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">
                                  {getSectionTypeLabel(kind, sourceType)}
                                </span>
                                <span
                                  className={joinClasses(
                                    "rounded-full px-2 py-0.5 text-[9px] font-semibold",
                                    sectionLocked &&
                                      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                                    !sectionLocked &&
                                      progressMeta.state ===
                                        "completed" &&
                                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                                    !sectionLocked &&
                                      progressMeta.state ===
                                        "in_progress" &&
                                      "bg-primary/10 text-primary",
                                    !sectionLocked &&
                                      progressMeta.state ===
                                        "not_started" &&
                                      "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {sectionLocked
                                    ? "Locked"
                                    : progressMeta.label}
                                </span>
                              </span>

                              <span className="mt-1 block break-words text-xs font-medium leading-5 text-foreground">
                                {sectionRecord?.title ||
                                  `Lesson ${moduleIndex + 1}.${sectionIndex + 1}`}
                              </span>
                            </span>
                          </button>
                        );
                      }
                    )}

                    {moduleQuizzes.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {moduleQuizzes.map((quiz) => (
                          <CurriculumQuizRow
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

          {hasMoreModules && onLoadMoreModules ? (
            <button
              type="button"
              disabled={isLoadingModules}
              onClick={() => void onLoadMoreModules()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
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
            <section className="rounded-[1.35rem] border border-border bg-background p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Final quiz
              </p>
              <div className="space-y-2">
                {finalQuizzes.map((quiz) => (
                  <CurriculumQuizRow
                    key={quiz.quizId}
                    quiz={quiz}
                    onTakeQuiz={onTakeQuiz}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <style jsx global>{`
        .course-curriculum-scroll {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--border)) transparent;
        }

        .course-curriculum-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .course-curriculum-scroll::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 999px;
        }
      `}</style>
    </aside>
  );
}
