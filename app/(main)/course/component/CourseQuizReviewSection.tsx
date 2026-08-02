"use client";

import ScormQuizReviewContent from "@/app/dashboard/course/scorm/ScormQuizReviewContent";
import {
  ScormAnswerSectionRecord,
  summarizeAnswerSections,
} from "@/app/dashboard/course/scorm/quizReviewTypes";
import { CourseQuizForLearner } from "@/app/store/courseStore/courseStore";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock,
  FileQuestion,
  Layers,
  LoaderCircle,
  Lock,
  PlayCircle,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type QuizReviewView = "overview" | "scorm" | "course";

interface CourseQuizReviewSectionProps {
  learnerAnswers?: ScormAnswerSectionRecord[];
  isLearnerAnswersLoading?: boolean;
  courseQuizzes?: CourseQuizForLearner[];
  isCourseQuizzesLoading?: boolean;
  courseProgress?: number;
  sectionsCompleted?: number;
  totalSections?: number;
  onTakeQuiz?: (quiz: CourseQuizForLearner) => void;
  defaultView?: QuizReviewView;
}

interface ReviewNavigationItem {
  id: QuizReviewView;
  label: string;
  mobileLabel: string;
  count?: number;
  icon: typeof ClipboardCheck;
  hidden?: boolean;
}

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clampPercentage(value: unknown) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return 0;

  return Math.min(100, Math.max(0, Math.round(numericValue)));
}

function getQuizScopeLabel(quiz: CourseQuizForLearner) {
  if (quiz.scope === "final") return "Final quiz";
  if (quiz.scope === "module") return "Module quiz";

  return "Course quiz";
}

function QuizReviewSkeleton() {
  return (
    <div className="space-y-3 p-3 sm:p-5">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-border bg-background p-3.5"
          >
            <div className="h-8 w-8 rounded-xl bg-muted" />
            <div className="mt-4 h-5 w-14 rounded-full bg-muted" />
            <div className="mt-2 h-3 w-20 rounded-full bg-muted" />
          </div>
        ))}
      </div>

      <div className="animate-pulse rounded-2xl border border-border bg-background p-4">
        <div className="h-4 w-36 rounded-full bg-muted" />
        <div className="mt-4 h-24 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  icon: typeof ClipboardCheck;
  tone?: "primary" | "success" | "warning" | "neutral";
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "neutral",
}: MetricCardProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-background p-3 sm:p-3.5">
      <div className="flex items-start justify-between gap-2">
        <span
          className={joinClasses(
            "grid h-8 w-8 shrink-0 place-items-center rounded-xl",
            tone === "primary" && "bg-primary/10 text-primary",
            tone === "success" &&
              "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
            tone === "warning" &&
              "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
            tone === "neutral" && "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>

        <span className="truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px]">
          {label}
        </span>
      </div>

      <p className="mt-3 truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">
        {value}
      </p>
      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground sm:text-[11px]">
        {helper}
      </p>
    </div>
  );
}

interface CourseQuizCardProps {
  quiz: CourseQuizForLearner;
  onTakeQuiz?: (quiz: CourseQuizForLearner) => void;
}

function CourseQuizCard({ quiz, onTakeQuiz }: CourseQuizCardProps) {
  const completed = Boolean(quiz.attempt);
  const locked = !completed && quiz.isUnlocked === false;
  const percentage = clampPercentage(quiz.attempt?.percentage);
  const score = Number(quiz.attempt?.score || 0);
  const maximumScore = Number(quiz.attempt?.maxScore || quiz.totalMarks || 0);

  return (
    <article
      className={joinClasses(
        "group min-w-0 overflow-hidden rounded-2xl border p-3.5 transition sm:p-4",
        completed &&
          "border-emerald-200 bg-emerald-50/55 dark:border-emerald-900/50 dark:bg-emerald-950/20",
        locked &&
          "border-slate-200 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-900/30",
        !completed &&
          !locked &&
          "border-amber-200 bg-amber-50/55 dark:border-amber-900/50 dark:bg-amber-950/20"
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={joinClasses(
            "grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-white shadow-sm",
            completed && "bg-emerald-500",
            locked && "bg-slate-400",
            !completed && !locked && "bg-amber-500"
          )}
        >
          {completed ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : locked ? (
            <Lock className="h-4.5 w-4.5" />
          ) : (
            <FileQuestion className="h-5 w-5" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-background/80 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground ring-1 ring-border/70 sm:text-[10px]">
                {getQuizScopeLabel(quiz)}
              </span>

              <h3 className="mt-2 break-words text-xs font-semibold leading-5 text-foreground sm:text-sm">
                {quiz.title}
              </h3>
            </div>

            <span
              className={joinClasses(
                "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-[11px]",
                completed &&
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                locked &&
                  "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                !completed &&
                  !locked &&
                  "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              )}
            >
              {completed ? `${percentage}%` : locked ? "Locked" : "Ready"}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground sm:text-[11px]">
            <span className="inline-flex items-center gap-1">
              <CircleHelp className="h-3.5 w-3.5" />
              {quiz.questionCount} question{quiz.questionCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              {quiz.totalMarks} point{quiz.totalMarks === 1 ? "" : "s"}
            </span>
          </div>

          {completed ? (
            <div className="mt-3">
              <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px]">
                <span className="font-medium text-emerald-700 dark:text-emerald-300">
                  Score {score}/{maximumScore}
                </span>
                <span className="text-muted-foreground">Submitted</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ) : (
            <p
              className={joinClasses(
                "mt-3 text-[11px] leading-5 sm:text-xs",
                locked
                  ? "text-slate-600 dark:text-slate-300"
                  : "text-amber-700 dark:text-amber-300"
              )}
            >
              {locked
                ? quiz.unlockReason ||
                  "Complete the required course progress to unlock this quiz."
                : "This quiz is available and ready to begin."}
            </p>
          )}

          {onTakeQuiz ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => {
                if (!locked) onTakeQuiz(quiz);
              }}
              className={joinClasses(
                "mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl px-3 text-[11px] font-semibold transition sm:w-auto sm:rounded-full sm:px-4 sm:text-xs",
                completed &&
                  "bg-emerald-600 text-white hover:bg-emerald-700",
                locked &&
                  "cursor-not-allowed bg-slate-300 text-white opacity-75 dark:bg-slate-700",
                !completed &&
                  !locked &&
                  "bg-amber-500 text-white hover:bg-amber-600"
              )}
            >
              {completed ? (
                <ClipboardCheck className="h-3.5 w-3.5" />
              ) : locked ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <PlayCircle className="h-3.5 w-3.5" />
              )}
              {completed ? "View result" : locked ? "Locked" : "Take quiz"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function EmptyReviewState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-4 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <ClipboardCheck className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-foreground sm:text-base">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
        {description}
      </p>
    </div>
  );
}

export default function CourseQuizReviewSection({
  learnerAnswers = [],
  isLearnerAnswersLoading = false,
  courseQuizzes = [],
  isCourseQuizzesLoading = false,
  courseProgress = 0,
  sectionsCompleted = 0,
  totalSections = 0,
  onTakeQuiz,
  defaultView = "overview",
}: CourseQuizReviewSectionProps) {
  const answerSummary = useMemo(
    () => summarizeAnswerSections(learnerAnswers),
    [learnerAnswers]
  );

  const completedCourseQuizzes = useMemo(
    () => courseQuizzes.filter((quiz) => Boolean(quiz.attempt)),
    [courseQuizzes]
  );

  const pendingCourseQuizzes = useMemo(
    () => courseQuizzes.filter((quiz) => !quiz.attempt),
    [courseQuizzes]
  );

  const unlockedPendingQuizzes = useMemo(
    () => pendingCourseQuizzes.filter((quiz) => quiz.isUnlocked !== false),
    [pendingCourseQuizzes]
  );

  const totalScormQuestions = Number(answerSummary.totalQuestions || 0);
  const correctScormQuestions = Number(answerSummary.correctCount || 0);
  const pendingScormQuestions = Number(answerSummary.pending || 0);
  const reviewedScormQuestions = Math.max(
    totalScormQuestions - pendingScormQuestions,
    0
  );
  const scormPercentage = totalScormQuestions
    ? Math.round((correctScormQuestions / totalScormQuestions) * 100)
    : 0;

  const navigationItems = useMemo<ReviewNavigationItem[]>(
    () => [
      {
        id: "overview",
        label: "Review Overview",
        mobileLabel: "Overview",
        icon: ClipboardCheck,
      },
      {
        id: "scorm",
        label: "SCORM Answers",
        mobileLabel: "SCORM",
        count: totalScormQuestions,
        icon: Layers,
        hidden:
          !isLearnerAnswersLoading &&
          learnerAnswers.length === 0 &&
          totalScormQuestions === 0,
      },
      {
        id: "course",
        label: "Course Quizzes",
        mobileLabel: "Quizzes",
        count: courseQuizzes.length,
        icon: FileQuestion,
        hidden: !isCourseQuizzesLoading && courseQuizzes.length === 0,
      },
    ],
    [
      courseQuizzes.length,
      isCourseQuizzesLoading,
      isLearnerAnswersLoading,
      learnerAnswers.length,
      totalScormQuestions,
    ]
  );

  const visibleNavigationItems = navigationItems.filter(
    (item) => !item.hidden
  );
  const [activeView, setActiveView] = useState<QuizReviewView>(defaultView);

  useEffect(() => {
    if (!visibleNavigationItems.some((item) => item.id === activeView)) {
      setActiveView(visibleNavigationItems[0]?.id || "overview");
    }
  }, [activeView, visibleNavigationItems]);

  const isInitialLoading =
    (isLearnerAnswersLoading && learnerAnswers.length === 0) ||
    (isCourseQuizzesLoading && courseQuizzes.length === 0);

  const hasAnyReviewData =
    learnerAnswers.length > 0 ||
    totalScormQuestions > 0 ||
    courseQuizzes.length > 0;

  const nextCourseQuiz =
    unlockedPendingQuizzes[0] || pendingCourseQuizzes[0] || courseQuizzes[0];

  if (isInitialLoading && !hasAnyReviewData) {
    return <QuizReviewSkeleton />;
  }

  return (
    <div className="min-w-0 max-w-full">
      {/* Inner review navigation */}
      {visibleNavigationItems.length > 1 ? (
        <div className="border-b border-border bg-muted/35 px-2.5 py-2.5 sm:px-4 sm:py-3">
          <div
            className="quiz-review-scrollbar flex snap-x gap-1.5 overflow-x-auto rounded-2xl bg-muted/70 p-1"
            role="tablist"
            aria-label="Quiz review views"
          >
            {visibleNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveView(item.id)}
                  className={joinClasses(
                    "flex min-w-[116px] snap-center items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold outline-none transition sm:min-w-0 sm:flex-1 sm:text-xs",
                    "focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? "bg-card text-foreground shadow-sm ring-1 ring-border/70"
                      : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                  )}
                >
                  <Icon
                    className={joinClasses(
                      "h-3.5 w-3.5 shrink-0",
                      isActive && "text-primary"
                    )}
                  />
                  <span className="sm:hidden">{item.mobileLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.count !== undefined ? (
                    <span
                      className={joinClasses(
                        "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-background text-muted-foreground"
                      )}
                    >
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="quiz-review-panel min-w-0 max-w-full">
        {activeView === "overview" ? (
          <div className="space-y-3 p-2.5 sm:space-y-4 sm:p-5">
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              <MetricCard
                label="SCORM score"
                value={
                  totalScormQuestions
                    ? `${correctScormQuestions}/${totalScormQuestions}`
                    : "—"
                }
                helper={
                  totalScormQuestions
                    ? `${scormPercentage}% answers correct`
                    : "No SCORM answers yet"
                }
                icon={Trophy}
                tone="primary"
              />

              <MetricCard
                label="Reviewed"
                value={
                  totalScormQuestions
                    ? `${reviewedScormQuestions}/${totalScormQuestions}`
                    : "—"
                }
                helper={
                  pendingScormQuestions
                    ? `${pendingScormQuestions} awaiting review`
                    : totalScormQuestions
                    ? "All answers reviewed"
                    : "No review activity"
                }
                icon={CheckCircle2}
                tone={pendingScormQuestions ? "warning" : "success"}
              />

              <MetricCard
                label="Course quizzes"
                value={`${completedCourseQuizzes.length}/${courseQuizzes.length}`}
                helper={
                  pendingCourseQuizzes.length
                    ? `${pendingCourseQuizzes.length} still pending`
                    : courseQuizzes.length
                    ? "All quizzes submitted"
                    : "No course quizzes"
                }
                icon={FileQuestion}
                tone={
                  courseQuizzes.length && pendingCourseQuizzes.length === 0
                    ? "success"
                    : "warning"
                }
              />

              <MetricCard
                label="Course progress"
                value={`${clampPercentage(courseProgress)}%`}
                helper={
                  totalSections
                    ? `${sectionsCompleted} of ${totalSections} lessons completed`
                    : "Progress updates as lessons finish"
                }
                icon={Layers}
                tone="neutral"
              />
            </div>

            {!hasAnyReviewData ? (
              <EmptyReviewState
                title="No quiz activity yet"
                description="SCORM answers and course quiz results will appear here after the learner submits an attempt."
              />
            ) : (
              <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
                <div className="min-w-0 rounded-2xl border border-border bg-background p-3.5 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground sm:text-sm">
                        SCORM answer progress
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-[11px]">
                        Correct answers from submitted SCORM interactions
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-primary sm:text-base">
                      {scormPercentage}%
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-500"
                      style={{ width: `${scormPercentage}%` }}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-emerald-50 px-2 py-2.5 dark:bg-emerald-950/20">
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        {correctScormQuestions}
                      </p>
                      <p className="text-[9px] uppercase tracking-wide text-emerald-700/75 dark:text-emerald-300/75">
                        Correct
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted px-2 py-2.5">
                      <p className="text-sm font-bold text-foreground">
                        {Math.max(
                          reviewedScormQuestions - correctScormQuestions,
                          0
                        )}
                      </p>
                      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                        Incorrect
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 px-2 py-2.5 dark:bg-amber-950/20">
                      <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                        {pendingScormQuestions}
                      </p>
                      <p className="text-[9px] uppercase tracking-wide text-amber-700/75 dark:text-amber-300/75">
                        Pending
                      </p>
                    </div>
                  </div>

                  {totalScormQuestions > 0 ? (
                    <button
                      type="button"
                      onClick={() => setActiveView("scorm")}
                      className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 text-[11px] font-semibold text-foreground transition hover:bg-muted sm:w-auto sm:rounded-full sm:px-4 sm:text-xs"
                    >
                      Review SCORM answers
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>

                <div className="min-w-0 rounded-2xl border border-border bg-background p-3.5 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground sm:text-sm">
                        Next quiz action
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-[11px]">
                        Continue from the next available assessment
                      </p>
                    </div>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      <Clock className="h-4 w-4" />
                    </span>
                  </div>

                  {nextCourseQuiz ? (
                    <div className="mt-4">
                      <p className="line-clamp-2 text-xs font-semibold leading-5 text-foreground sm:text-sm">
                        {nextCourseQuiz.title}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground sm:text-[11px]">
                        {nextCourseQuiz.attempt
                          ? "A completed result is available to review."
                          : nextCourseQuiz.isUnlocked === false
                          ? nextCourseQuiz.unlockReason ||
                            "Complete the required lessons to unlock it."
                          : "This quiz is unlocked and ready to take."}
                      </p>

                      {onTakeQuiz ? (
                        <button
                          type="button"
                          disabled={
                            !nextCourseQuiz.attempt &&
                            nextCourseQuiz.isUnlocked === false
                          }
                          onClick={() => {
                            if (
                              nextCourseQuiz.attempt ||
                              nextCourseQuiz.isUnlocked !== false
                            ) {
                              onTakeQuiz(nextCourseQuiz);
                            }
                          }}
                          className={joinClasses(
                            "mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl px-3 text-[11px] font-semibold text-white transition sm:rounded-full sm:text-xs",
                            !nextCourseQuiz.attempt &&
                              nextCourseQuiz.isUnlocked === false
                              ? "cursor-not-allowed bg-slate-400 opacity-75"
                              : nextCourseQuiz.attempt
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-amber-500 hover:bg-amber-600"
                          )}
                        >
                          {nextCourseQuiz.attempt ? (
                            <ClipboardCheck className="h-3.5 w-3.5" />
                          ) : nextCourseQuiz.isUnlocked === false ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <PlayCircle className="h-3.5 w-3.5" />
                          )}
                          {nextCourseQuiz.attempt
                            ? "View result"
                            : nextCourseQuiz.isUnlocked === false
                            ? "Quiz locked"
                            : "Take next quiz"}
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-4 text-xs leading-5 text-muted-foreground">
                      No course quiz has been assigned.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {activeView === "scorm" ? (
          <div className="min-w-0 max-w-full px-2.5 py-3 sm:px-5 sm:py-5">
            <div className="-mx-0.5 max-w-full overflow-x-auto px-0.5 [overflow-wrap:anywhere]">
              <ScormQuizReviewContent
                sections={learnerAnswers}
                isLoading={isLearnerAnswersLoading}
                progressSummary={{
                  progressPercent: Number(courseProgress || 0),
                  sectionsCompleted,
                  totalSections,
                }}
                emptyState="Your SCORM quiz answers will appear here after an attempt is submitted."
              />
            </div>
          </div>
        ) : null}

        {activeView === "course" ? (
          <div className="p-2.5 sm:p-5">
            {isCourseQuizzesLoading && courseQuizzes.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading course quizzes...
              </div>
            ) : courseQuizzes.length > 0 ? (
              <div className="grid min-w-0 gap-2.5 lg:grid-cols-2">
                {courseQuizzes.map((quiz) => (
                  <CourseQuizCard
                    key={quiz.quizId}
                    quiz={quiz}
                    onTakeQuiz={onTakeQuiz}
                  />
                ))}
              </div>
            ) : (
              <EmptyReviewState
                title="No course quizzes"
                description="There are no manual course quizzes available for this course yet."
              />
            )}
          </div>
        ) : null}
      </div>

      <style jsx global>{`
        .quiz-review-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .quiz-review-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .quiz-review-panel {
          animation: quiz-review-enter 200ms ease-out both;
        }

        @keyframes quiz-review-enter {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .quiz-review-panel {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}