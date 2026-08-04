"use client";

import React from "react";
import { useColorModeValue } from "@chakra-ui/react";

export default function CourseDetailsSkeleton() {
  const containerBg = useColorModeValue("bg-background", "bg-slate-950");
  const cardBg = useColorModeValue("bg-card", "bg-slate-900/90");
  const borderCol = useColorModeValue("border-border/60", "border-slate-800/80");

  // Subtle, soft skeleton blocks tailored for both light & dark modes
  const skelHeavy = "bg-slate-200/80 dark:bg-slate-800/80 animate-pulse";
  const skelMedium = "bg-slate-200/60 dark:bg-slate-800/50 animate-pulse";
  const skelLight = "bg-slate-200/40 dark:bg-slate-800/30 animate-pulse";
  const skelAccent = "bg-primary/20 dark:bg-primary/20 animate-pulse";

  return (
    <div className={`min-h-screen w-full ${containerBg} pb-16 pt-4 text-foreground animate-in fade-in duration-300`}>
      {/* Top Header / Breadcrumb Bar Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-3">
          <div className={`h-8 w-24 rounded-full ${skelMedium}`} />
          <div className={`h-4 w-4 rounded-full ${skelLight}`} />
          <div className={`h-4 w-32 rounded ${skelLight}`} />
        </div>

        {/* Hero Section Banner Skeleton */}
        <div className={`mt-4 rounded-3xl border ${borderCol} ${cardBg} p-6 shadow-sm sm:p-8`}>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="flex-1 space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className={`h-6 w-16 rounded-full ${skelMedium}`} />
                <div className={`h-6 w-20 rounded-full ${skelMedium}`} />
                <div className={`h-6 w-24 rounded-full ${skelMedium}`} />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <div className={`h-8 w-3/4 max-w-xl rounded-lg ${skelHeavy} sm:h-10`} />
                <div className={`h-4 w-full max-w-2xl rounded ${skelMedium}`} />
                <div className={`h-4 w-2/3 max-w-lg rounded ${skelLight}`} />
              </div>

              {/* Stat Pill Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4 sm:gap-4">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} className={`flex items-center gap-3 rounded-2xl border ${borderCol} bg-slate-100/50 dark:bg-slate-800/30 p-3`}>
                    <div className={`h-10 w-10 shrink-0 rounded-xl ${skelMedium}`} />
                    <div className="space-y-1">
                      <div className={`h-3 w-12 rounded ${skelLight}`} />
                      <div className={`h-4 w-16 rounded ${skelHeavy}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
              <div className={`h-11 w-36 rounded-full ${skelAccent} sm:w-44`} />
              <div className={`h-11 w-28 rounded-full ${skelMedium}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content Area Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
          {/* Left Column: Player & Tabs & Module Content */}
          <div className="space-y-8">
            {/* Player Container Skeleton */}
            <div className={`overflow-hidden rounded-[1.6rem] border ${borderCol} ${cardBg} shadow-sm`}>
              <div className={`flex items-center justify-between border-b ${borderCol} p-4`}>
                <div className="space-y-1.5">
                  <div className={`h-5 w-48 rounded ${skelHeavy}`} />
                  <div className={`h-3 w-32 rounded ${skelLight}`} />
                </div>
                <div className={`h-9 w-28 rounded-full ${skelMedium}`} />
              </div>
              <div className="aspect-video w-full bg-slate-100/80 dark:bg-slate-950/80 p-6 flex flex-col items-center justify-center animate-pulse">
                <div className="h-14 w-14 rounded-full bg-slate-300/60 dark:bg-slate-800/80 mb-4" />
                <div className="h-5 w-40 rounded bg-slate-300/50 dark:bg-slate-800/60" />
              </div>
            </div>

            {/* Content Tabs Bar Skeleton */}
            <div className={`flex items-center gap-2 border-b ${borderCol} pb-2`}>
              <div className={`h-9 w-24 rounded-lg ${skelAccent}`} />
              <div className={`h-9 w-28 rounded-lg ${skelLight}`} />
              <div className={`h-9 w-24 rounded-lg ${skelLight}`} />
              <div className={`h-9 w-32 rounded-lg ${skelLight}`} />
            </div>

            {/* Content Card Skeleton */}
            <div className={`rounded-3xl border ${borderCol} ${cardBg} p-6 space-y-4 shadow-sm`}>
              <div className={`h-6 w-40 rounded ${skelHeavy}`} />
              <div className="space-y-2">
                <div className={`h-4 w-full rounded ${skelMedium}`} />
                <div className={`h-4 w-5/6 rounded ${skelMedium}`} />
                <div className={`h-4 w-4/6 rounded ${skelLight}`} />
              </div>

              {/* Module List Skeletons */}
              <div className="mt-6 space-y-3">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className={`rounded-2xl border ${borderCol} bg-slate-100/40 dark:bg-slate-800/20 p-4 space-y-2`}>
                    <div className="flex items-center justify-between">
                      <div className={`h-5 w-1/3 rounded ${skelHeavy}`} />
                      <div className={`h-4 w-16 rounded-full ${skelLight}`} />
                    </div>
                    <div className={`h-3 w-1/4 rounded ${skelLight}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Curriculum Panel Sidebar Skeleton */}
          <div className="hidden lg:block">
            <div className={`sticky top-20 rounded-3xl border ${borderCol} ${cardBg} p-6 shadow-sm space-y-6`}>
              <div className={`flex items-center justify-between border-b ${borderCol} pb-4`}>
                <div className="space-y-1">
                  <div className={`h-5 w-36 rounded ${skelHeavy}`} />
                  <div className={`h-3 w-24 rounded ${skelLight}`} />
                </div>
                <div className={`h-8 w-16 rounded-full ${skelAccent}`} />
              </div>

              {/* Module Accordion Skeletons */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} className={`rounded-2xl border ${borderCol} bg-slate-100/40 dark:bg-slate-800/20 p-4 space-y-3`}>
                    <div className="flex items-center justify-between">
                      <div className={`h-4 w-48 rounded ${skelHeavy}`} />
                      <div className={`h-4 w-4 rounded-full ${skelLight}`} />
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200/50 dark:bg-slate-800/40" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
