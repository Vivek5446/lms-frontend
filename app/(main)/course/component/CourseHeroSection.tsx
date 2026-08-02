"use client";

import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock3,
    Edit3,
    GraduationCap,
    MoreHorizontal,
    Play,
    Rocket,
    Star,
    UserPlus,
    UsersRound,
} from "lucide-react";
import { useState } from "react";

import type { CourseLaunchSection } from "@/app/dashboard/course/scorm/sectionTracking";

export interface CourseHeroInstructor {
  name?: string;
  designation?: string;
  companyName?: string;
  avatarUrl?: string;
}

interface CourseHeroSectionProps {
  course: any;
  instructor?: CourseHeroInstructor;

  isAssignedCourseView?: boolean;
  canSelfEnroll?: boolean;
  isEnrolling?: boolean;

  nextLaunchSection?: CourseLaunchSection | null;
  previewLaunchSection?: CourseLaunchSection | null;

  progressPercent?: number;
  sectionsCompleted?: number;
  totalSections?: number;
  totalModuleCount?: number;
  totalLessonCount?: number;
  totalMaterialCount?: number;

  durationLabel?: string;
  priceLabel?: string;
  ratingLabel?: string;
  reviewCountLabel?: string;
  learnersLabel?: string;
  levelLabel?: string;
  categories?: string[];
  visibilityLabel?: string;
  primaryActionLabel?: string;

  onBack: () => void;
  onLaunchSection: (launchSection: CourseLaunchSection) => void;
  onWarmLaunchSection?: (
    launchSection?: CourseLaunchSection | null
  ) => void;
  onEnrollCourse?: () => void;
  onEditCourse?: (course: any) => void;
  onAssignCourse?: (course: any) => void;

  showMobileActionBar?: boolean;
  mobileActionBottomClassName?: string;
}

function joinClasses(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ");
}

function clampPercentage(value: unknown) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(numericValue), 0), 100);
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

function getInstructorMeta(instructor?: CourseHeroInstructor) {
  return [instructor?.designation, instructor?.companyName]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join(" · ");
}

function buildFallbackLaunchSection(
  course: any
): CourseLaunchSection | null {
  const assetPath = String(course?.scormFilePath || "").trim();

  if (!assetPath) {
    return null;
  }

  return {
    assetPath,
    contentKind: "scorm",
    moduleId: "",
    moduleTitle: "",
    sectionId: "",
    sectionTitle:
      String(course?.title || "").trim() || "Course",
  };
}

function formatCompactCount(value: unknown, fallback = "0") {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return fallback;
  }

  return numericValue.toLocaleString();
}

export default function CourseHeroSection({
  course,
  instructor,

  isAssignedCourseView = false,
  canSelfEnroll = false,
  isEnrolling = false,

  nextLaunchSection,
  previewLaunchSection,

  progressPercent = 0,
  sectionsCompleted = 0,
  totalSections = 0,
  totalModuleCount = 0,
  totalLessonCount = 0,
  totalMaterialCount = 0,

  durationLabel = "Self-paced",
  priceLabel = "Free",
  ratingLabel = "0.0",
  reviewCountLabel = "0",
  learnersLabel,
  levelLabel = "All levels",
  categories = [],
  visibilityLabel,
  primaryActionLabel = "Start Learning",

  onBack,
  onLaunchSection,
  onWarmLaunchSection,
  onEnrollCourse,
  onEditCourse,
  onAssignCourse,

  showMobileActionBar = true,
  mobileActionBottomClassName = "bottom-0",
}: CourseHeroSectionProps) {
  const [showFullDescription, setShowFullDescription] =
    useState(false);
  const [showMobileAdminActions, setShowMobileAdminActions] =
    useState(false);

  const safeProgress = clampPercentage(progressPercent);
  const fallbackLaunchSection = buildFallbackLaunchSection(course);
  const primaryLaunchSection =
    nextLaunchSection || fallbackLaunchSection;
  const previewSection =
    previewLaunchSection || primaryLaunchSection;

  const instructorName =
    String(instructor?.name || "").trim() || "Course Instructor";
  const instructorMeta = getInstructorMeta(instructor);

  const normalizedCategories = categories
    .map((category) => String(category || "").trim())
    .filter(Boolean)
    .slice(0, 2);

  const hasAdminActions = Boolean(
    onEditCourse || onAssignCourse
  );

  const totalSectionsValue =
    Number(totalSections) || Number(totalLessonCount) || 0;

  const snapshotMainValue = canSelfEnroll
    ? priceLabel
    : isAssignedCourseView
      ? `${safeProgress}%`
      : `${totalModuleCount} modules`;

  const snapshotSupportingValue = canSelfEnroll
    ? `${totalMaterialCount} resource${
        totalMaterialCount === 1 ? "" : "s"
      } included`
    : isAssignedCourseView
      ? `${sectionsCompleted}/${totalSectionsValue} lessons completed`
      : `${totalLessonCount} lessons · ${totalMaterialCount} resources`;

  const handlePrimaryAction = () => {
    if (canSelfEnroll) {
      onEnrollCourse?.();
      return;
    }

    if (primaryLaunchSection) {
      onLaunchSection(primaryLaunchSection);
    }
  };

  const handlePreview = () => {
    if (previewSection) {
      onLaunchSection(previewSection);
    }
  };

  const warmPrimaryAsset = () => {
    if (primaryLaunchSection) {
      onWarmLaunchSection?.(primaryLaunchSection);
    }
  };

  return (
    <>
      <section className="relative w-full max-w-full overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(55% 65% at 100% 0%, hsl(var(--primary) / 0.17), transparent 62%), radial-gradient(50% 55% at 0% 45%, hsl(var(--accent) / 0.11), transparent 68%)",
          }}
        />

        <div className="mx-auto w-full max-w-8xl px-2 pb-5 pt-3 sm:px-4 sm:pb-8 sm:pt-6 lg:px-6 lg:pb-10">
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 text-xs font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-10 sm:px-4 sm:text-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Back
            </button>

            {hasAdminActions ? (
              <>
                <div className="hidden items-center gap-2 sm:flex">
                  {onEditCourse ? (
                    <button
                      type="button"
                      onClick={() => onEditCourse(course)}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/20 bg-card px-4 text-sm font-medium text-primary shadow-sm transition hover:bg-primary/10"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                  ) : null}

                  {onAssignCourse ? (
                    <button
                      type="button"
                      onClick={() => onAssignCourse(course)}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                    >
                      <UserPlus className="h-4 w-4" />
                      Assign
                    </button>
                  ) : null}
                </div>

                <div className="relative sm:hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setShowMobileAdminActions((current) => !current)
                    }
                    className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm"
                    aria-label="Course actions"
                    aria-expanded={showMobileAdminActions}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {showMobileAdminActions ? (
                    <div className="absolute right-0 top-11 z-30 w-40 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-xl">
                      {onEditCourse ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMobileAdminActions(false);
                            onEditCourse(course);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-foreground hover:bg-muted"
                        >
                          <Edit3 className="h-4 w-4 text-primary" />
                          Edit course
                        </button>
                      ) : null}

                      {onAssignCourse ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMobileAdminActions(false);
                            onAssignCourse(course);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-foreground hover:bg-muted"
                        >
                          <UserPlus className="h-4 w-4 text-primary" />
                          Assign course
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.8fr)] lg:items-start lg:gap-8">
            <div className="order-1 min-w-0 lg:order-2">
              <div className="group relative overflow-hidden rounded-[1.4rem] border border-border bg-muted shadow-lg shadow-black/5 sm:rounded-[1.8rem] dark:shadow-black/25">
                <div className="aspect-video w-full">
                  {course?.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={String(course?.title || "Course")}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/5 to-accent/20">
                      <GraduationCap className="h-11 w-11 text-primary sm:h-14 sm:w-14" />
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                <button
                  type="button"
                  onClick={handlePreview}
                  onMouseEnter={() =>
                    onWarmLaunchSection?.(previewSection)
                  }
                  onFocus={() =>
                    onWarmLaunchSection?.(previewSection)
                  }
                  disabled={!previewSection}
                  className="absolute inset-0 flex items-center justify-center disabled:cursor-not-allowed"
                  aria-label="Preview course"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white/92 text-slate-900 shadow-xl backdrop-blur transition group-hover:scale-110 sm:h-14 sm:w-14">
                    <Play className="ml-0.5 h-5 w-5 fill-current sm:h-6 sm:w-6" />
                  </span>
                </button>

                <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur sm:text-xs">
                      Course preview
                    </span>
                  </div>

                  <span className="shrink-0 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur sm:text-xs">
                    {durationLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Course information */}
            <div className="order-2 min-w-0 lg:order-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-primary sm:px-3 sm:text-[10px]">
                  {levelLabel}
                </span>

                {normalizedCategories.map((category, index) => (
                  <span
                    key={`${category}-${index}`}
                    className="inline-flex max-w-[150px] truncate rounded-full border border-border bg-card px-2.5 py-1 text-[9px] font-medium text-muted-foreground sm:max-w-[190px] sm:px-3 sm:text-[10px]"
                  >
                    {category}
                  </span>
                ))}

                {visibilityLabel ? (
                  <span className="inline-flex rounded-full border border-border bg-card px-2.5 py-1 text-[9px] font-medium text-muted-foreground sm:px-3 sm:text-[10px]">
                    {visibilityLabel}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-3 break-words text-[1.55rem] font-bold leading-[1.15] tracking-tight text-foreground sm:mt-4 sm:text-3xl lg:text-[2.45rem]">
                {course?.title || "Untitled course"}
              </h1>

              <div
                className={joinClasses(
                  "course-hero-description prose prose-sm mt-2.5 max-w-none text-muted-foreground",
                  "prose-headings:text-foreground prose-p:my-1 prose-p:text-xs prose-p:leading-5 prose-strong:text-foreground prose-a:text-primary",
                  "dark:prose-invert dark:prose-p:text-muted-foreground sm:mt-3 sm:prose-p:text-sm sm:prose-p:leading-6",
                  !showFullDescription &&
                    "line-clamp-3 sm:line-clamp-4 lg:line-clamp-none"
                )}
                dangerouslySetInnerHTML={{
                  __html:
                    course?.description?.html ||
                    course?.description?.text ||
                    "<p>No course description has been provided.</p>",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowFullDescription((current) => !current)
                }
                className="mt-1 text-[11px] font-semibold text-primary lg:hidden"
              >
                {showFullDescription ? "Show less" : "Read more"}
              </button>

              {/* Compact metadata */}
              <div className="mt-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[11px] text-muted-foreground sm:mt-4 sm:gap-x-5 sm:text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <strong className="font-semibold text-foreground">
                    {ratingLabel}
                  </strong>
                  <span>({reviewCountLabel})</span>
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <UsersRound className="h-3.5 w-3.5" />
                  {learnersLabel ||
                    formatCompactCount(
                      course?.metrics?.totalEnrollments
                    )}{" "}
                  learners
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {durationLabel}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  {totalLessonCount} lessons
                </span>
              </div>

              {/* Instructor remains compact; full details are in Overview */}
              <div className="mt-3.5 flex min-w-0 items-center gap-2.5 sm:mt-4">
                {instructor?.avatarUrl ? (
                  <img
                    src={instructor.avatarUrl}
                    alt={instructorName}
                    className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-background shadow-sm sm:h-9 sm:w-9"
                  />
                ) : (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary sm:h-9 sm:w-9 sm:text-xs">
                    {getInstructorInitials(instructorName)}
                  </span>
                )}

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {instructorName}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground sm:text-[11px]">
                    {instructorMeta || "Course instructor"}
                  </p>
                </div>
              </div>

              {/* Primary action card */}
              <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-sm sm:mt-5 sm:rounded-[1.55rem]">
                <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:text-[10px]">
                      {canSelfEnroll
                        ? "Enrollment"
                        : isAssignedCourseView
                          ? "Your progress"
                          : "Course snapshot"}
                    </p>

                    <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                        {snapshotMainValue}
                      </span>
                      <span className="min-w-0 text-[11px] text-muted-foreground sm:text-xs">
                        {snapshotSupportingValue}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    onMouseEnter={warmPrimaryAsset}
                    onFocus={warmPrimaryAsset}
                    disabled={
                      canSelfEnroll
                        ? isEnrolling || !onEnrollCourse
                        : !primaryLaunchSection
                    }
                    className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-36 sm:rounded-full sm:px-5 sm:text-sm"
                  >
                    {canSelfEnroll ? (
                      <Rocket className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}

                    {canSelfEnroll
                      ? isEnrolling
                        ? "Enrolling..."
                        : "Enroll Now"
                      : primaryActionLabel}
                  </button>
                </div>

                {!canSelfEnroll ? (
                  <div className="border-t border-border/70 px-3.5 py-3 sm:px-4">
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-label="Course progress"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={
                        isAssignedCourseView
                          ? safeProgress
                          : Math.min(totalModuleCount * 12, 100)
                      }
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500"
                        style={{
                          width: `${
                            isAssignedCourseView
                              ? safeProgress
                              : Math.min(
                                  totalModuleCount * 12,
                                  100
                                )
                          }%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex min-w-0 items-center justify-between gap-3 text-[10px] text-muted-foreground sm:text-[11px]">
                      <span className="truncate">
                        {nextLaunchSection?.sectionTitle ||
                          (isAssignedCourseView
                            ? "Continue your learning journey"
                            : `${totalModuleCount} modules available`)}
                      </span>
                      <span className="shrink-0">
                        {durationLabel}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Native-style mobile action bar */}
      {showMobileActionBar ? (
        <div
          className={joinClasses(
            "fixed inset-x-0 z-40 border-t border-border bg-background/95 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-10px_28px_-16px_rgba(15,23,42,0.3)] backdrop-blur-xl sm:hidden",
            mobileActionBottomClassName
          )}
        >
          <div className="mx-auto flex max-w-xl min-w-0 items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <p className="truncate text-[10px] font-medium text-muted-foreground">
                  {canSelfEnroll
                    ? "Course price"
                    : isAssignedCourseView
                      ? "Your progress"
                      : "Course content"}
                </p>

                <span className="shrink-0 text-[10px] font-semibold text-foreground">
                  {canSelfEnroll
                    ? priceLabel
                    : isAssignedCourseView
                      ? `${safeProgress}%`
                      : `${totalModuleCount} modules`}
                </span>
              </div>

              {!canSelfEnroll ? (
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{
                      width: `${
                        isAssignedCourseView
                          ? safeProgress
                          : Math.min(totalModuleCount * 12, 100)
                      }%`,
                    }}
                  />
                </div>
              ) : (
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                  {totalLessonCount} lessons included
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handlePrimaryAction}
              onTouchStart={warmPrimaryAsset}
              disabled={
                canSelfEnroll
                  ? isEnrolling || !onEnrollCourse
                  : !primaryLaunchSection
              }
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {canSelfEnroll ? (
                <Rocket className="h-3.5 w-3.5" />
              ) : isAssignedCourseView &&
                safeProgress >= 100 ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}

              {canSelfEnroll
                ? isEnrolling
                  ? "Enrolling..."
                  : "Enroll"
                : primaryActionLabel}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}