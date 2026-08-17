"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";

export type LaunchContentKind = "scorm" | "zip" | "video" | "document" | "other";

export type CourseLaunchSection = {
  assetPath: string;
  contentKind: LaunchContentKind;
  moduleId: string;
  moduleTitle: string;
  sectionId: string;
  sectionTitle: string;
  sourceType?: "upload" | "url";
};

const courseAssetWarmups = new Map<string, Promise<void>>();
const protectedCourseAssetUrlCache = new Map<string, Promise<string>>();

type ProtectedCourseAssetRequestOptions = {
  courseId?: string | null;
  moduleId?: string | null;
  sectionId?: string | null;
};

function normalizeKeySegment(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function deriveModuleId(moduleRecord: any) {
  const explicitId = String(moduleRecord?.moduleId || moduleRecord?._id || moduleRecord?.id || "").trim();
  if (explicitId) {
    return explicitId;
  }

  const moduleOrder = Number(moduleRecord?.order || 0);
  return `module-${moduleOrder}`;
}

export function deriveSectionId(moduleRecord: any, sectionRecord: any) {
  const explicitId = String(sectionRecord?.sectionId || sectionRecord?._id || sectionRecord?.id || "").trim();
  if (explicitId) {
    return explicitId;
  }

  const moduleId = deriveModuleId(moduleRecord);
  const sectionOrder = Number(sectionRecord?.order || 0);
  const previewToken = normalizeKeySegment(sectionRecord?.content?.previewUrl);
  const titleToken = normalizeKeySegment(sectionRecord?.title);
  const suffix = previewToken || titleToken || `section-${sectionOrder}`;

  return `${moduleId}:section-${sectionOrder}-${suffix}`;
}

function toBrowserCourseAssetUrl(assetUrl: string) {
  if (/^(https?:|data:|blob:)/i.test(assetUrl)) {
    return assetUrl;
  }

  const normalizedAssetUrl = assetUrl.startsWith("/") ? assetUrl : `/${assetUrl}`;
  if (process.env.NEXT_PUBLIC_MOBILE_BUNDLE === "true") {
    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL || "")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    if (backendUrl && normalizedAssetUrl.startsWith("/courses/")) {
      return `${backendUrl}${normalizedAssetUrl}`;
    }
  }

  return normalizedAssetUrl;
}

export function buildLaunchSection(moduleRecord: any, sectionRecord: any) {
  const assetPath = String(sectionRecord?.content?.previewUrl || "").trim();
  if (!assetPath) {
    return null;
  }

  const normalizedKind = String(sectionRecord?.content?.kind || "").trim().toLowerCase();
  const contentKind: LaunchContentKind =
    normalizedKind === "scorm" || normalizedKind === "zip" || normalizedKind === "video" || normalizedKind === "document"
      ? normalizedKind
      : "other";

  return {
    assetPath,
    contentKind,
    moduleId: deriveModuleId(moduleRecord),
    moduleTitle: String(moduleRecord?.title || "").trim() || `Module ${Number(moduleRecord?.order || 0) || 1}`,
    sectionId: deriveSectionId(moduleRecord, sectionRecord),
    sectionTitle: String(sectionRecord?.title || "").trim() || `Section ${Number(sectionRecord?.order || 0) || 1}`,
    sourceType: sectionRecord?.content?.sourceType === "url" ? "url" : "upload",
  } satisfies CourseLaunchSection;
}

export function buildCourseAssetUrl(assetPath: string) {
  if (/^(https?:|data:|blob:)/i.test(assetPath)) {
    return assetPath;
  }

  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return toBrowserCourseAssetUrl(`/courses${normalizedPath}`);
}

function buildProtectedCourseAssetCacheKey(
  assetPath: string,
  options?: ProtectedCourseAssetRequestOptions
) {
  return [
    String(options?.courseId || "").trim(),
    String(options?.moduleId || "").trim(),
    String(options?.sectionId || "").trim(),
    String(assetPath || "").trim(),
  ].join("::");
}

export async function getProtectedCourseAssetUrl(
  assetPathOrUrl: string,
  options?: ProtectedCourseAssetRequestOptions
) {
  const normalizedAssetPathOrUrl = String(assetPathOrUrl || "").trim();
  if (!normalizedAssetPathOrUrl) {
    return "";
  }

  if (/^(https?:|data:|blob:)/i.test(normalizedAssetPathOrUrl)) {
    return normalizedAssetPathOrUrl;
  }

  const normalizedCourseId = String(options?.courseId || "").trim();
  if (!normalizedCourseId) {
    return buildCourseAssetUrl(normalizedAssetPathOrUrl);
  }

  const cacheKey = buildProtectedCourseAssetCacheKey(normalizedAssetPathOrUrl, options);
  const cachedResult = protectedCourseAssetUrlCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const requestPromise = axios
    .post(`/course/${encodeURIComponent(normalizedCourseId)}/asset-access`, {
      assetPath: normalizedAssetPathOrUrl,
      moduleId: String(options?.moduleId || "").trim() || undefined,
      sectionId: String(options?.sectionId || "").trim() || undefined,
    })
    .then((response) => {
      const protectedUrl = String(
        response?.data?.data?.url ||
          response?.data?.url ||
          ""
      ).trim();
      if (!protectedUrl) {
        throw new Error("Protected course asset URL was not returned");
      }

      return toBrowserCourseAssetUrl(protectedUrl);
    })
    .catch((error) => {
      protectedCourseAssetUrlCache.delete(cacheKey);
      throw error;
    });

  protectedCourseAssetUrlCache.set(cacheKey, requestPromise);
  return requestPromise;
}

export function useProtectedCourseAssetUrl(
  assetPathOrUrl: string,
  options?: ProtectedCourseAssetRequestOptions
) {
  const requestKey = useMemo(
    () => buildProtectedCourseAssetCacheKey(assetPathOrUrl, options),
    [assetPathOrUrl, options?.courseId, options?.moduleId, options?.sectionId]
  );
  const [assetUrl, setAssetUrl] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(String(assetPathOrUrl || "").trim()));
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    protectedCourseAssetUrlCache.delete(requestKey);
    setReloadToken((currentValue) => currentValue + 1);
  }, [requestKey]);

  useEffect(() => {
    let isActive = true;
    const normalizedValue = String(assetPathOrUrl || "").trim();

    if (!normalizedValue) {
      setAssetUrl("");
      setIsLoading(false);
      setError(null);
      return () => {
        isActive = false;
      };
    }

    setIsLoading(true);
    setError(null);

    getProtectedCourseAssetUrl(assetPathOrUrl, options)
      .then((resolvedUrl) => {
        if (!isActive) {
          return;
        }

        setAssetUrl(resolvedUrl);
        setIsLoading(false);
      })
      .catch((requestError: any) => {
        if (!isActive) {
          return;
        }

        setAssetUrl("");
        setIsLoading(false);
        setError(
          requestError?.response?.data?.error ||
            requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to authorize this lesson asset"
        );
      });

    return () => {
      isActive = false;
    };
  }, [assetPathOrUrl, options?.courseId, options?.moduleId, options?.sectionId, reloadToken]);

  return {
    assetUrl,
    isLoading,
    error,
    reload,
  };
}

export function preloadCourseAsset(assetPathOrUrl: string, options?: { force?: boolean }) {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  const assetUrl = assetPathOrUrl.startsWith("/courses/")
    ? assetPathOrUrl
    : buildCourseAssetUrl(assetPathOrUrl);

  if (!options?.force) {
    const existingWarmup = courseAssetWarmups.get(assetUrl);
    if (existingWarmup) {
      return existingWarmup;
    }
  }

  const warmup = fetch(assetUrl, {
    method: "GET",
    credentials: "same-origin",
    cache: options?.force ? "reload" : "force-cache",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Course asset warmup failed with status ${response.status}`);
      }

      return response.arrayBuffer();
    })
    .then(() => undefined)
    .catch((error) => {
      courseAssetWarmups.delete(assetUrl);
      throw error;
    });

  courseAssetWarmups.set(assetUrl, warmup);
  return warmup;
}

export function isScormLaunchSection(section: CourseLaunchSection | null | undefined) {
  return Boolean(section && (section.contentKind === "scorm" || section.contentKind === "zip"));
}

export function getCourseSectionProgress(course: any, sectionId?: string | null) {
  if (!sectionId) {
    return null;
  }

  const progressModules = Array.isArray(course?.progressModules) ? course.progressModules : [];
  for (const moduleRecord of progressModules) {
    const sections = Array.isArray(moduleRecord?.sections) ? moduleRecord.sections : [];
    const matchingSection = sections.find((sectionRecord: any) => sectionRecord?.sectionId === sectionId);
    if (matchingSection) {
      return matchingSection;
    }
  }

  return null;
}

export function getFirstPlayableLaunchSection(course: any) {
  const modules = Array.isArray(course?.curriculum?.modules) ? course.curriculum.modules : [];

  for (const moduleRecord of modules) {
    const sections = Array.isArray(moduleRecord?.sections) ? moduleRecord.sections : [];
    for (const sectionRecord of sections) {
      const launchSection = buildLaunchSection(moduleRecord, sectionRecord);
      if (launchSection) {
        return launchSection;
      }
    }
  }

  return null;
}
