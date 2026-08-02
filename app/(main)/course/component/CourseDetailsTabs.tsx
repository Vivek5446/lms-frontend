"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type CourseDetailsTabId =
  | "overview"
  | "content"
  | "materials"
  | "quiz-review";

export interface CourseDetailsTab {
  id: CourseDetailsTabId;
  label: string;
  mobileLabel?: string;
  description?: string;
  icon: LucideIcon;
  badge?: string | number;
  hidden?: boolean;
  content: ReactNode;
}

interface CourseDetailsTabsProps {
  tabs: CourseDetailsTab[];
  defaultTab?: CourseDetailsTabId;
  onTabChange?: (tabId: CourseDetailsTabId) => void;
  className?: string;
  stickyOnMobile?: boolean;
}

function joinClasses(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ");
}

export default function CourseDetailsTabs({
  tabs,
  defaultTab = "content",
  onTabChange,
  className,
  stickyOnMobile = true,
}: CourseDetailsTabsProps) {
  const visibleTabs = useMemo(
    () => tabs.filter((tab) => !tab.hidden),
    [tabs]
  );

  const resolvedDefaultTab = useMemo(() => {
    if (visibleTabs.some((tab) => tab.id === defaultTab)) {
      return defaultTab;
    }

    return visibleTabs[0]?.id;
  }, [defaultTab, visibleTabs]);

  const [activeTabId, setActiveTabId] = useState<
    CourseDetailsTabId | undefined
  >(resolvedDefaultTab);

  const tabButtonRefs = useRef<
    Partial<Record<CourseDetailsTabId, HTMLButtonElement | null>>
  >({});

  useEffect(() => {
    const activeTabStillExists = visibleTabs.some(
      (tab) => tab.id === activeTabId
    );

    if (!activeTabId || !activeTabStillExists) {
      setActiveTabId(resolvedDefaultTab);
    }
  }, [activeTabId, resolvedDefaultTab, visibleTabs]);

  useEffect(() => {
    if (!activeTabId) return;

    tabButtonRefs.current[activeTabId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeTabId]);

  const activeTab =
    visibleTabs.find((tab) => tab.id === activeTabId) ||
    visibleTabs[0];

  const selectTab = (tabId: CourseDetailsTabId) => {
    setActiveTabId(tabId);
    onTabChange?.(tabId);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    if (!visibleTabs.length) return;

    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % visibleTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + visibleTabs.length) %
        visibleTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = visibleTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    const nextTab = visibleTabs[nextIndex];

    selectTab(nextTab.id);
    tabButtonRefs.current[nextTab.id]?.focus();
  };

  if (!activeTab) {
    return null;
  }

  const ActiveIcon = activeTab.icon;

  return (
    <section
      className={joinClasses(
        "w-full min-w-0 max-w-full",
        className
      )}
      aria-label="Course information"
    >
      {/* Mobile sticky and horizontally scrollable tab navigation */}
      <div
        className={joinClasses(
          "z-30 -mx-1 px-1 py-2 sm:mx-0 sm:px-0 sm:py-0",
          stickyOnMobile &&
            "sticky top-0 bg-background/[0.92] backdrop-blur-xl supports-[backdrop-filter]:bg-background/[0.78] sm:static sm:bg-transparent sm:backdrop-blur-none"
        )}
      >
        <div className="relative overflow-hidden rounded-[1.35rem] border border-border/80 bg-muted/55 p-1.5 shadow-sm sm:rounded-[1.65rem] sm:p-2">
          <div
            className="course-tabs-scrollbar flex snap-x snap-mandatory gap-1.5 overflow-x-auto overscroll-x-contain sm:grid sm:grid-cols-[repeat(auto-fit,minmax(135px,1fr))] sm:overflow-visible"
            role="tablist"
            aria-label="Course detail sections"
          >
            {visibleTabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab.id;

              return (
                <button
                  key={tab.id}
                  ref={(element) => {
                    tabButtonRefs.current[tab.id] = element;
                  }}
                  id={`course-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`course-panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectTab(tab.id)}
                  onKeyDown={(event) =>
                    handleKeyDown(event, index)
                  }
                  className={joinClasses(
                    "group relative flex min-h-12 min-w-[132px] snap-center items-center gap-2 rounded-[1rem] px-3 py-2.5 text-left outline-none transition-all duration-200",
                    "sm:min-w-0 sm:rounded-[1.2rem] sm:px-3.5",
                    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "bg-card text-foreground shadow-[0_8px_24px_-14px_rgba(15,23,42,0.45)] ring-1 ring-border/70 dark:shadow-black/40"
                      : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                  )}
                >
                  <span
                    className={joinClasses(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-background/70 text-muted-foreground ring-1 ring-border/70 group-hover:text-primary"
                    )}
                  >
                    <Icon
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold sm:text-[13px]">
                      <span className="sm:hidden">
                        {tab.mobileLabel || tab.label}
                      </span>

                      <span className="hidden sm:inline">
                        {tab.label}
                      </span>
                    </span>

                    {tab.description ? (
                      <span className="mt-0.5 hidden truncate text-[10px] text-muted-foreground lg:block">
                        {tab.description}
                      </span>
                    ) : null}
                  </span>

                  {tab.badge !== undefined &&
                  tab.badge !== null ? (
                    <span
                      className={joinClasses(
                        "inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-background text-muted-foreground ring-1 ring-border/70"
                      )}
                    >
                      {tab.badge}
                    </span>
                  ) : null}

                  {isActive ? (
                    <span className="absolute inset-x-5 -bottom-1 h-1 rounded-full bg-primary shadow-[0_0_16px_hsl(var(--primary)/0.45)] sm:inset-x-8" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active tab content */}
      <div className="mt-3 overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-sm sm:mt-4 sm:rounded-[1.8rem]">
        <header className="flex min-w-0 items-center justify-between gap-3 border-b border-border/75 bg-gradient-to-r from-primary/[0.07] via-card to-card px-3.5 py-3.5 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary sm:h-10 sm:w-10">
              <ActiveIcon
                className="h-4 w-4 sm:h-5 sm:w-5"
                aria-hidden="true"
              />
            </span>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-foreground sm:text-base">
                {activeTab.label}
              </h2>

              {activeTab.description ? (
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground sm:text-xs">
                  {activeTab.description}
                </p>
              ) : null}
            </div>
          </div>

          {activeTab.badge !== undefined &&
          activeTab.badge !== null ? (
            <span className="inline-flex shrink-0 items-center rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary sm:text-xs">
              {activeTab.badge}
            </span>
          ) : null}
        </header>

        <div
          key={activeTab.id}
          id={`course-panel-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`course-tab-${activeTab.id}`}
          tabIndex={0}
          className="course-tab-panel min-w-0 max-w-full focus:outline-none"
        >
          {activeTab.content}
        </div>
      </div>

      <style jsx global>{`
        .course-tabs-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .course-tabs-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .course-tab-panel {
          animation: course-tab-enter 220ms ease-out both;
        }

        @keyframes course-tab-enter {
          from {
            opacity: 0;
            transform: translateY(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .course-tab-panel {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}