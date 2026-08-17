import { motion } from "framer-motion";
import { Download, ExternalLink, FileText, RotateCcw, Video, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LaunchContentKind, useProtectedCourseAssetUrl } from "./sectionTracking";

const VIDEO_PROGRESS_SYNC_INTERVAL_MS = 30000;

interface CourseAssetModalProps {
  assetUrl: string;
  assetKind: LaunchContentKind;
  title: string;
  courseId?: string;
  moduleId?: string;
  sectionId?: string;
  displayMode?: "modal" | "inline";
  showHeader?: boolean;
  showCloseButton?: boolean;
  initialTime?: number;
  initialProgress?: number;
  onBack: () => void;
  onOpened?: () => void | Promise<void>;
  onCompleted?: () => void | Promise<void>;
  onProgressUpdate?: (data: { currentTime: number; duration: number; progress: number; reason?: "interval" | "pause" | "exit" }) => void;
  onStartOver?: () => void;
}

export default function CourseAssetModal({
  assetUrl,
  assetKind,
  title,
  courseId,
  moduleId,
  sectionId,
  displayMode = "modal",
  showHeader = true,
  showCloseButton = true,
  initialTime = 0,
  initialProgress = 0,
  onBack,
  onOpened,
  onCompleted,
  onProgressUpdate,
  onStartOver,
}: CourseAssetModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastUpdateRef = useRef(0);
  const hasTrackedOpenRef = useRef(false);
  const hasTrackedCompletionRef = useRef(false);
  const hasAppliedInitialTimeRef = useRef(false);
  const onOpenedRef = useRef(onOpened);
  const onCompletedRef = useRef(onCompleted);
  const onProgressUpdateRef = useRef(onProgressUpdate);
  const {
    assetUrl: protectedAssetUrl,
    isLoading: isProtectedAssetLoading,
    error: protectedAssetError,
    reload: reloadProtectedAssetUrl,
  } = useProtectedCourseAssetUrl(assetUrl, {
    courseId,
    moduleId,
    sectionId,
  });
  const [showStartOver, setShowStartOver] = useState(initialProgress >= 100);
  const isInline = displayMode === "inline";

  useEffect(() => {
    onOpenedRef.current = onOpened;
    onCompletedRef.current = onCompleted;
    onProgressUpdateRef.current = onProgressUpdate;
  }, [onOpened, onCompleted, onProgressUpdate]);

  useEffect(() => {
    hasTrackedOpenRef.current = false;
    hasTrackedCompletionRef.current = false;
    hasAppliedInitialTimeRef.current = false;
    lastUpdateRef.current = 0;
    setShowStartOver(initialProgress >= 100);
  }, [assetUrl, initialProgress]);

  useEffect(() => {
    if (assetKind !== "video" || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    const enforceNormalPlaybackRate = () => {
      if (video.defaultPlaybackRate !== 1) {
        video.defaultPlaybackRate = 1;
      }

      if (video.playbackRate !== 1) {
        video.playbackRate = 1;
      }
    };
    const preventRateShortcut = (event: KeyboardEvent) => {
      if (["<", ">", ",", ".", "[", "]"].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        enforceNormalPlaybackRate();
      }
    };

    enforceNormalPlaybackRate();
    video.addEventListener("ratechange", enforceNormalPlaybackRate);
    video.addEventListener("loadedmetadata", enforceNormalPlaybackRate);
    window.addEventListener("keydown", preventRateShortcut, true);

    return () => {
      video.removeEventListener("ratechange", enforceNormalPlaybackRate);
      video.removeEventListener("loadedmetadata", enforceNormalPlaybackRate);
      window.removeEventListener("keydown", preventRateShortcut, true);
    };
  }, [assetKind, protectedAssetUrl]);

  useEffect(() => {
    if (displayMode !== "modal") {
      if (!hasTrackedOpenRef.current) {
        hasTrackedOpenRef.current = true;
        void Promise.resolve(onOpenedRef.current?.()).catch(() => undefined);
      }

      return () => {
        if (assetKind === "video" && videoRef.current) {
          const video = videoRef.current;
          if (video.currentTime > 0 && !hasTrackedCompletionRef.current) {
            const progress = video.duration > 0 ? (video.currentTime / video.duration) * 100 : 0;
            onProgressUpdateRef.current?.({
              currentTime: video.currentTime,
              duration: video.duration,
              progress: Math.min(progress, 99),
              reason: "exit",
            });
          }
        }
      };
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (!hasTrackedOpenRef.current) {
      hasTrackedOpenRef.current = true;
      void Promise.resolve(onOpenedRef.current?.()).catch(() => undefined);
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;

      // Save current position on unmount if it's a video
      if (assetKind === "video" && videoRef.current) {
        const video = videoRef.current;
        if (video.currentTime > 0 && !hasTrackedCompletionRef.current) {
          const progress = video.duration > 0 ? (video.currentTime / video.duration) * 100 : 0;
          onProgressUpdateRef.current?.({
            currentTime: video.currentTime,
            duration: video.duration,
            progress: Math.min(progress, 99),
            reason: "exit",
          });
        }
      }
    };
  }, [assetKind, displayMode]);

  const seekToInitialTime = useCallback(() => {
    if (assetKind !== "video" || !videoRef.current || initialTime <= 0) {
      return false;
    }

    const video = videoRef.current;
    if (Number.isFinite(video.duration) && initialTime < video.duration) {
      if (Math.abs(video.currentTime - initialTime) > 0.5) {
        video.currentTime = initialTime;
      }
      hasAppliedInitialTimeRef.current = true;
      return true;
    }

    return false;
  }, [assetKind, initialTime]);

  const applyInitialTime = () => {
    if (hasAppliedInitialTimeRef.current) {
      return;
    }

    seekToInitialTime();
  };

  useEffect(() => {
    if (assetKind !== "video") {
      return;
    }

    hasAppliedInitialTimeRef.current = false;
    seekToInitialTime();
  }, [assetKind, assetUrl, initialTime, seekToInitialTime]);

  const handleLoadedMetadata = () => {
    applyInitialTime();
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !onProgressUpdateRef.current) return;

    const now = Date.now();
    if (now - lastUpdateRef.current > VIDEO_PROGRESS_SYNC_INTERVAL_MS) {
      const video = videoRef.current;
      const progress = video.duration > 0 ? (video.currentTime / video.duration) * 100 : 0;

      onProgressUpdateRef.current({
        currentTime: video.currentTime,
        duration: video.duration,
        progress: Math.min(progress, 99),
        reason: "interval",
      });

      lastUpdateRef.current = now;
    }
  };

  const handlePause = () => {
    if (!videoRef.current || !onProgressUpdateRef.current) return;
    const video = videoRef.current;
    const progress = video.duration > 0 ? (video.currentTime / video.duration) * 100 : 0;

    onProgressUpdateRef.current({
      currentTime: video.currentTime,
      duration: video.duration,
      progress: Math.min(progress, 99),
      reason: "pause",
    });
  };

  const handleCompleted = () => {
    if (hasTrackedCompletionRef.current) {
      return;
    }

    hasTrackedCompletionRef.current = true;
    void Promise.resolve(onCompletedRef.current?.()).catch(() => undefined);
  };

  const handleStartOver = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    setShowStartOver(false);
    onStartOver?.();
  };

  const renderContent = () => {
    if (isProtectedAssetLoading) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-background p-6 text-center">
          <div className="max-w-sm space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Preparing secure lesson access...
            </p>
            <p className="text-xs text-muted-foreground">
              Your lesson asset is being authorized before playback starts.
            </p>
          </div>
        </div>
      );
    }

    if (!protectedAssetUrl) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-background p-6 text-center">
          <div className="max-w-sm space-y-4">
            <p className="text-sm font-semibold text-foreground">
              Lesson asset unavailable
            </p>
            <p className="text-xs text-muted-foreground">
              {protectedAssetError || "We could not authorize this lesson asset."}
            </p>
            <button
              type="button"
              onClick={reloadProtectedAssetUrl}
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (assetKind === "video") {
      return (
        <div
          className="relative flex-1 overflow-hidden bg-black"
          onContextMenu={(event) => event.preventDefault()}
        >
          <video
            ref={videoRef}
            src={protectedAssetUrl}
            controls
            autoPlay
            playsInline
            controlsList="nodownload noplaybackrate noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            className="h-full w-full object-contain"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPause={handlePause}
            onEnded={handleCompleted}
            onContextMenu={(event) => event.preventDefault()}
          />
          {showStartOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm">
              <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-slate-900/90 p-4 text-center shadow-2xl sm:p-6">
                <p className="text-white font-medium">You've already completed this lesson.</p>
                <div className="flex flex-col justify-center gap-2 sm:flex-row sm:gap-3">
                  <button
                    onClick={() => setShowStartOver(false)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Resume Playing
                  </button>
                  <button
                    onClick={handleStartOver}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Start Over
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (assetKind === "document") {
      return (
        <iframe
          src={protectedAssetUrl}
          title={title}
          className="h-full w-full bg-white"
          referrerPolicy="no-referrer"
        />
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-white p-8 text-center">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <FileText className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{title}</p>
            <p className="mt-2 text-sm text-slate-600">
              This lesson opens in a separate tab so the browser can handle the file directly.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={protectedAssetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Open File
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={
        isInline
          ? "h-full"
          : "fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      }
      onClick={(event) => {
        if (!isInline && event.target === event.currentTarget) {
          onBack();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
        className={`flex flex-col overflow-hidden ${
          isInline
            ? "h-full w-full rounded-[1.5rem] border border-border bg-background shadow-none"
            : "h-[100dvh] w-screen rounded-none border border-white/5 bg-slate-950 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)] sm:h-auto sm:max-w-5xl sm:w-full sm:rounded-xl"
        }`}
      >
        {showHeader ? (
          <div
            className={`flex flex-shrink-0 items-center justify-between gap-3 border-b backdrop-blur-md ${
              isInline
                ? "border-border bg-background"
                : "border-white/10 bg-slate-900/80"
            }`}
            style={{ height: "64px", paddingLeft: "24px", paddingRight: "24px", flexShrink: 0 }}
          >
            <div
              className={`flex min-w-0 items-center gap-3 ${
                isInline ? "text-foreground" : "text-slate-200"
              }`}
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${
                  isInline
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                }`}
              >
                {assetKind === "video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <span
                  className={`block truncate text-xs font-bold tracking-wide uppercase leading-tight ${
                    isInline ? "text-foreground" : "text-white"
                  }`}
                >
                  {title}
                </span>
                <span
                  className={`mt-0.5 block text-[8px] font-medium tracking-wider uppercase leading-none ${
                    isInline ? "text-muted-foreground" : "text-slate-400"
                  }`}
                >
                  Lesson Viewer
                </span>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              {assetKind !== "video" && protectedAssetUrl ? (
                <a
                  href={protectedAssetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                    isInline
                      ? "border-border bg-background text-foreground hover:bg-muted"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Open</span>
                </a>
              ) : null}
              {showCloseButton ? (
                <button
                  type="button"
                  onClick={onBack}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition active:scale-95 ${
                    isInline
                      ? "border-border bg-background text-muted-foreground hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900 dark:hover:bg-red-950/30"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-red-500 hover:bg-red-500 hover:text-white"
                  }`}
                  aria-label="Close asset viewer"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          className={`relative flex flex-1 flex-col overflow-hidden ${
            isInline ? "bg-background" : "bg-slate-950"
          }`}
        >
          {renderContent()}
        </div>
      </motion.div>
    </div>
  );
}
