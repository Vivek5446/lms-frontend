"use client";

import React from "react";

export default function CourseDetailsSkeleton() {
  return (
    <div className="min-h-screen w-full bg-background pb-16 pt-4 text-foreground animate-in fade-in duration-300">
      {/* Top Header / Breadcrumb Bar Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-3">
          <div className="h-8 w-24 rounded-full bg-muted/60 animate-pulse" />
          <div className="h-4 w-4 rounded-full bg-muted/40 animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted/40 animate-pulse" />
        </div>

        {/* Hero Section Banner Skeleton */}
        <div className="mt-4 rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="flex-1 space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-6 w-16 rounded-full bg-muted/60 animate-pulse" />
                <div className="h-6 w-20 rounded-full bg-muted/60 animate-pulse" />
                <div className="h-6 w-24 rounded-full bg-muted/60 animate-pulse" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <div className="h-8 w-3/4 max-w-xl rounded-lg bg-muted/80 animate-pulse sm:h-10" />
                <div className="h-4 w-full max-w-2xl rounded bg-muted/50 animate-pulse" />
                <div className="h-4 w-2/3 max-w-lg rounded bg-muted/40 animate-pulse" />
              </div>

              {/* Stat Pill Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4 sm:gap-4">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-muted/20 p-3">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-muted/60 animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-3 w-12 rounded bg-muted/50 animate-pulse" />
                      <div className="h-4 w-16 rounded bg-muted/70 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
              <div className="h-11 w-36 rounded-full bg-primary/30 animate-pulse sm:w-44" />
              <div className="h-11 w-28 rounded-full bg-muted/60 animate-pulse" />
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
            <div className="overflow-hidden rounded-[1.6rem] border border-border/60 bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 p-4">
                <div className="space-y-1.5">
                  <div className="h-5 w-48 rounded bg-muted/70 animate-pulse" />
                  <div className="h-3 w-32 rounded bg-muted/40 animate-pulse" />
                </div>
                <div className="h-9 w-28 rounded-full bg-muted/60 animate-pulse" />
              </div>
              <div className="aspect-video w-full bg-muted/30 p-6 flex flex-col items-center justify-center animate-pulse">
                <div className="h-14 w-14 rounded-full bg-muted/60 mb-4" />
                <div className="h-5 w-40 rounded bg-muted/50" />
              </div>
            </div>

            {/* Content Tabs Bar Skeleton */}
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <div className="h-9 w-24 rounded-lg bg-primary/20 animate-pulse" />
              <div className="h-9 w-28 rounded-lg bg-muted/40 animate-pulse" />
              <div className="h-9 w-24 rounded-lg bg-muted/40 animate-pulse" />
              <div className="h-9 w-32 rounded-lg bg-muted/40 animate-pulse" />
            </div>

            {/* Content Card Skeleton */}
            <div className="rounded-3xl border border-border/60 bg-card p-6 space-y-4 shadow-sm">
              <div className="h-6 w-40 rounded bg-muted/70 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted/50 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-muted/50 animate-pulse" />
                <div className="h-4 w-4/6 rounded bg-muted/40 animate-pulse" />
              </div>

              {/* Module List Skeletons */}
              <div className="mt-6 space-y-3">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="rounded-2xl border border-border/50 bg-muted/10 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-1/3 rounded bg-muted/70 animate-pulse" />
                      <div className="h-4 w-16 rounded-full bg-muted/40 animate-pulse" />
                    </div>
                    <div className="h-3 w-1/4 rounded bg-muted/40 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Curriculum Panel Sidebar Skeleton */}
          <div className="hidden lg:block">
            <div className="sticky top-20 rounded-3xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="space-y-1">
                  <div className="h-5 w-36 rounded bg-muted/70 animate-pulse" />
                  <div className="h-3 w-24 rounded bg-muted/40 animate-pulse" />
                </div>
                <div className="h-8 w-16 rounded-full bg-primary/20 animate-pulse" />
              </div>

              {/* Module Accordion Skeletons */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} className="rounded-2xl border border-border/40 bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-48 rounded bg-muted/70 animate-pulse" />
                      <div className="h-4 w-4 rounded-full bg-muted/40 animate-pulse" />
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/30" />
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
