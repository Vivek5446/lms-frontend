"use client";

import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  Layers3,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

export interface CourseOverviewInstructor {
  name?: string;
  designation?: string;
  companyName?: string;
  avatarUrl?: string;
}

interface CourseOverviewSectionProps {
  course: any;
  learningOutcomes?: string[];
  instructor?: CourseOverviewInstructor;
  isAssignedCourseView?: boolean;
  totalModuleCount?: number;
  totalLessonCount?: number;
  totalMaterialCount?: number;
  durationLabel?: string;
  progressPercent?: number;
  sectionsCompleted?: number;
  courseId?: string;
  canDownloadCertificate?: boolean;
  certificateReason?: string;
  isCertificateDownloading?: boolean;
  onDownloadCertificate?: (courseId: string) => void;
}

interface FactItem {
  label: string;
  value: string;
  icon: typeof BookOpen;
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

function formatAccessDate(value?: string | null) {
  if (!value) {
    return "No expiry";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No expiry";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

function getInstructorMeta(instructor?: CourseOverviewInstructor) {
  return [instructor?.designation, instructor?.companyName]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join(" · ");
}

function getCertificateStatus(
  course: any,
  canDownloadCertificate: boolean
) {
  const certificateStatus = String(
    course?.certificate?.status || ""
  )
    .trim()
    .toLowerCase();

  if (canDownloadCertificate || certificateStatus === "issued") {
    return {
      label: "Certificate ready",
      description:
        "You have completed the eligibility requirements. Your certificate is ready to download.",
      state: "ready" as const,
    };
  }

  if (
    course?.progression?.certificateEnabled === false ||
    course?.certificate?.enabled === false
  ) {
    return {
      label: "Certificate unavailable",
      description:
        "This course does not currently include a completion certificate.",
      state: "disabled" as const,
    };
  }

  return {
    label: "Certificate in progress",
    description:
      course?.certificate?.reason ||
      "Complete the required lessons and quizzes to unlock your certificate.",
    state: "pending" as const,
  };
}

export default function CourseOverviewSection({
  course,
  learningOutcomes = [],
  instructor,
  isAssignedCourseView = false,
  totalModuleCount = 0,
  totalLessonCount = 0,
  totalMaterialCount = 0,
  durationLabel = "Self-paced",
  progressPercent = 0,
  sectionsCompleted = 0,
  courseId,
  canDownloadCertificate = false,
  certificateReason,
  isCertificateDownloading = false,
  onDownloadCertificate,
}: CourseOverviewSectionProps) {
  const safeProgress = clampPercentage(progressPercent);
  const instructorName =
    String(instructor?.name || "").trim() || "Course Instructor";
  const instructorMeta = getInstructorMeta(instructor);

  const categories = Array.isArray(course?.taxonomy?.categories)
    ? course.taxonomy.categories
        .map((category: unknown) => String(category || "").trim())
        .filter(Boolean)
    : [];

  const levelLabel =
    String(course?.taxonomy?.level || "").trim() || "All levels";

  const languageLabel =
    String(
      course?.language ||
        course?.metadata?.language ||
        course?.taxonomy?.language ||
        ""
    ).trim() || "Not specified";

  const certificate = getCertificateStatus(
    course,
    canDownloadCertificate
  );

  const facts: FactItem[] = [
    {
      label: "Modules",
      value: String(totalModuleCount),
      icon: Layers3,
    },
    {
      label: "Lessons",
      value: String(totalLessonCount),
      icon: BookOpen,
    },
    {
      label: "Duration",
      value: durationLabel,
      icon: Clock3,
    },
    {
      label: "Resources",
      value: String(totalMaterialCount),
      icon: FileText,
    },
  ];

  const includedItems = isAssignedCourseView
    ? [
        {
          icon: CheckCircle2,
          label: `${sectionsCompleted} lesson${
            sectionsCompleted === 1 ? "" : "s"
          } completed`,
          tone: "success" as const,
        },
        {
          icon: CalendarDays,
          label: `Access ends: ${formatAccessDate(course?.validTill)}`,
          tone: "warning" as const,
        },
        {
          icon: ShieldCheck,
          label:
            course?.progression?.mandatoryModules === false
              ? "Flexible lesson order"
              : "Guided learning path",
          tone: "primary" as const,
        },
      ]
    : [
        {
          icon: CheckCircle2,
          label: "Full lifetime access",
          tone: "success" as const,
        },
        {
          icon: ShieldCheck,
          label: "Guided learning path",
          tone: "primary" as const,
        },
        {
          icon: GraduationCap,
          label:
            course?.progression?.certificateEnabled === false
              ? "Certificate not included"
              : "Certificate of completion",
          tone: "primary" as const,
        },
      ];

  return (
    <div className="min-w-0 max-w-full p-3 sm:p-5 lg:p-6">
      {/* Course facts */}
      <section aria-label="Course facts">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
          {facts.map((fact) => {
            const Icon = fact.icon;

            return (
              <div
                key={fact.label}
                className="group min-w-0 overflow-hidden rounded-2xl border border-border bg-background/75 p-3 transition duration-200 hover:border-primary/25 hover:bg-primary/[0.025] sm:p-4"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary sm:h-9 sm:w-9">
                    <Icon
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {fact.label}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-foreground sm:text-base">
                      {fact.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 lg:mt-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)] lg:gap-4">
        <div className="min-w-0 space-y-3 lg:space-y-4">
          {/* Learning outcomes */}
          <section className="overflow-hidden rounded-[1.35rem] border border-border bg-background/75 sm:rounded-[1.6rem]">
            <header className="flex items-start gap-3 border-b border-border/75 bg-gradient-to-r from-primary/[0.07] to-transparent px-3.5 py-3.5 sm:px-5 sm:py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </span>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground sm:text-base">
                  What you&apos;ll learn
                </h3>
                <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground sm:text-xs">
                  Practical outcomes you can expect after completing
                  this course.
                </p>
              </div>
            </header>

            <div className="p-3 sm:p-4">
              {learningOutcomes.length ? (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {learningOutcomes.map((outcome, index) => (
                    <article
                      key={`${outcome}-${index}`}
                      className="flex min-w-0 items-start gap-2.5 rounded-2xl border border-border/80 bg-card p-3 transition duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm sm:p-3.5"
                    >
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <CheckCircle2
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </span>

                      <p className="min-w-0 break-words text-xs leading-5 text-foreground sm:text-[13px] sm:leading-6">
                        {outcome}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/35 px-4 py-8 text-center">
                  <Sparkles className="mx-auto h-6 w-6 text-muted-foreground/60" />
                  <p className="mt-3 text-xs font-medium text-foreground sm:text-sm">
                    Learning outcomes are not available yet
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-muted-foreground sm:text-xs">
                    The course content and lesson titles can still be
                    explored from the Course Content tab.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* About the instructor */}
          <section className="rounded-[1.35rem] border border-border bg-background/75 p-3.5 sm:rounded-[1.6rem] sm:p-5">
            <div className="flex min-w-0 items-start gap-3.5">
              {instructor?.avatarUrl ? (
                <img
                  src={instructor.avatarUrl}
                  alt={instructorName}
                  className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-1 ring-border sm:h-14 sm:w-14"
                />
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-sm font-bold text-primary ring-1 ring-primary/10 sm:h-14 sm:w-14">
                  {getInstructorInitials(instructorName)}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Your instructor
                    </p>
                    <h3 className="mt-1 truncate text-sm font-semibold text-foreground sm:text-base">
                      {instructorName}
                    </h3>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
                      {instructorMeta ||
                        "Instructor information will appear here"}
                    </p>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary sm:text-[11px]">
                    <UserRound className="h-3 w-3" />
                    Instructor
                  </span>
                </div>

                {course?.instructor?.bio ? (
                  <p className="mt-3 line-clamp-3 text-xs leading-5 text-muted-foreground sm:text-[13px] sm:leading-6">
                    {course.instructor.bio}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-3 lg:space-y-4">
          {/* Progress snapshot */}
          {isAssignedCourseView ? (
            <section className="rounded-[1.35rem] border border-primary/15 bg-gradient-to-br from-primary/[0.09] via-card to-card p-4 sm:rounded-[1.6rem] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Learning progress
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                    {safeProgress}%
                  </p>
                </div>

                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <GraduationCap className="h-5 w-5" />
                </span>
              </div>

              <div
                className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Course progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={safeProgress}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${safeProgress}%` }}
                />
              </div>

              <p className="mt-2 text-[11px] leading-5 text-muted-foreground sm:text-xs">
                {sectionsCompleted} of {totalLessonCount} lessons
                completed
              </p>
            </section>
          ) : null}

          {/* Course information */}
          <section className="rounded-[1.35rem] border border-border bg-background/75 p-4 sm:rounded-[1.6rem] sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </span>

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Course information
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Key details at a glance
                </p>
              </div>
            </div>

            <dl className="mt-4 divide-y divide-border/65">
              <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                <dt className="text-xs text-muted-foreground">
                  Level
                </dt>
                <dd className="text-right text-xs font-medium text-foreground">
                  {levelLabel}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-xs text-muted-foreground">
                  Language
                </dt>
                <dd className="text-right text-xs font-medium text-foreground">
                  {languageLabel}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-xs text-muted-foreground">
                  Learning mode
                </dt>
                <dd className="text-right text-xs font-medium text-foreground">
                  Self-paced
                </dd>
              </div>

              <div className="flex items-center justify-between gap-3 py-2.5 last:pb-0">
                <dt className="text-xs text-muted-foreground">
                  Learners
                </dt>
                <dd className="inline-flex items-center gap-1.5 text-right text-xs font-medium text-foreground">
                  <UsersRound className="h-3.5 w-3.5 text-muted-foreground" />
                  {Number(
                    course?.metrics?.totalEnrollments || 0
                  ).toLocaleString()}
                </dd>
              </div>
            </dl>

            {categories.length ? (
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/65 pt-4">
                {categories.slice(0, 4).map(
                  (category: string, index: number) => (
                    <span
                      key={`${category}-${index}`}
                      className="max-w-full truncate rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
                    >
                      {category}
                    </span>
                  )
                )}
              </div>
            ) : null}
          </section>

          {/* Included with course */}
          <section className="rounded-[1.35rem] border border-border bg-background/75 p-4 sm:rounded-[1.6rem] sm:p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Included with this course
            </h3>

            <div className="mt-3 space-y-2.5">
              {includedItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-2.5"
                  >
                    <span
                      className={joinClasses(
                        "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg",
                        item.tone === "success" &&
                          "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300",
                        item.tone === "warning" &&
                          "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300",
                        item.tone === "primary" &&
                          "bg-primary/10 text-primary"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>

                    <p className="min-w-0 break-words text-xs leading-5 text-foreground">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Certificate */}
          <section
            className={joinClasses(
              "overflow-hidden rounded-[1.35rem] border p-4 sm:rounded-[1.6rem] sm:p-5",
              certificate.state === "ready" &&
                "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20",
              certificate.state === "pending" &&
                "border-primary/15 bg-primary/[0.055]",
              certificate.state === "disabled" &&
                "border-border bg-muted/35"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={joinClasses(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-2xl",
                  certificate.state === "ready" &&
                    "bg-emerald-500 text-white",
                  certificate.state === "pending" &&
                    "bg-primary text-primary-foreground",
                  certificate.state === "disabled" &&
                    "bg-muted text-muted-foreground"
                )}
              >
                <Award className="h-4 w-4" />
              </span>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  {certificate.label}
                </h3>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground sm:text-xs">
                  {certificateReason || certificate.description}
                </p>
              </div>
            </div>

            {certificate.state === "ready" &&
            onDownloadCertificate &&
            courseId ? (
              <button
                type="button"
                onClick={() => onDownloadCertificate(courseId)}
                disabled={isCertificateDownloading}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                {isCertificateDownloading
                  ? "Downloading..."
                  : "Download Certificate"}
              </button>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}