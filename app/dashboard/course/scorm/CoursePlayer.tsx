"use client";

import axios from "axios";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiMaximize2, FiMinimize2, FiX } from "react-icons/fi";
import ScormQuizReviewContent from "./ScormQuizReviewContent";
import { ScormAnswerSectionRecord } from "./quizReviewTypes";
import { buildScorm12InitialState, createScorm12Api, ScormTrackingPayload } from "./scorm12";

interface CoursePlayerProps {
  courseUrl: string;
  courseTitle: string;
  onBack: () => void;
  courseId?: string;
  moduleId?: string;
  sectionId?: string;
  userId?: string;
  learnerName?: string;
  answerSections?: ScormAnswerSectionRecord[];
  isAnswerSectionsLoading?: boolean;
  onRefreshAnswerSections?: () => void | Promise<void>;
}

const HEADER_H = 48;

export default function CoursePlayer({
  courseUrl,
  courseTitle,
  onBack,
  courseId,
  moduleId,
  sectionId,
  userId,
  learnerName,
  answerSections = [],
  isAnswerSectionsLoading = false,
  onRefreshAnswerSections,
}: CoursePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReturnType<typeof createScorm12Api> | null>(null);
  const syncQueueRef = useRef<Promise<void>>(Promise.resolve());
  const trackingEnabledRef = useRef(false);
  const refreshTimerRef = useRef<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const [hasSlowLoad, setHasSlowLoad] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [resolvedCourseUrl, setResolvedCourseUrl] = useState<string | null>(null);
  const [isQuizReviewOpen, setIsQuizReviewOpen] = useState(false);

  const visibleAnswerSections = useMemo(() => {
    if (!sectionId) {
      return answerSections;
    }

    const matchingSections = answerSections.filter((entry) => entry.sectionId === sectionId);
    return matchingSections.length ? matchingSections : answerSections;
  }, [answerSections, sectionId]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const attachApiToWindow = (targetWindow: Window | null | undefined) => {
    if (!targetWindow || !apiRef.current) {
      return;
    }

    (targetWindow as any).API = apiRef.current.api;
    (targetWindow as any).__SCORM_CONTEXT__ = apiRef.current.context;
  };

  const detachApiFromWindow = (targetWindow: Window | null | undefined) => {
    if (!targetWindow) {
      return;
    }

    delete (targetWindow as any).API;
    delete (targetWindow as any).__SCORM_CONTEXT__;
  };

  const scheduleAnswersRefresh = (payload: ScormTrackingPayload, mode: "commit" | "finish") => {
    if (!onRefreshAnswerSections) {
      return;
    }

    if (!payload.interactions.length && !payload.suspend_data && mode !== "finish") {
      return;
    }

    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }

    refreshTimerRef.current = window.setTimeout(() => {
      Promise.resolve(onRefreshAnswerSections()).catch(() => undefined);
    }, mode === "finish" ? 150 : 450);
  };

  const queueTrackingSync = (mode: "commit" | "finish", payload: ScormTrackingPayload) => {
    if (!trackingEnabledRef.current) {
      return Promise.resolve();
    }

    const endpoint = mode === "finish" ? "/scorm/finish" : "/scorm/commit";

    syncQueueRef.current = syncQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        const response = await axios.post(endpoint, payload);
        const persistedProgress = response?.data?.data;

        if (persistedProgress && apiRef.current) {
          apiRef.current.mergeState({
            "cmi.core.lesson_status": persistedProgress.lessonStatus || payload.lesson_status,
            "cmi.core.score.raw":
              persistedProgress.score === null || persistedProgress.score === undefined
                ? ""
                : String(persistedProgress.score),
            "cmi.core.lesson_location": persistedProgress.lessonLocation || payload.lesson_location,
            "cmi.suspend_data": persistedProgress.suspendData || payload.suspend_data,
            "cmi.core.total_time": persistedProgress.totalTime || payload.total_time,
          });
        }

        setSyncError(null);
        scheduleAnswersRefresh(payload, mode);
      })
      .catch((error) => {
        console.error(`SCORM ${mode} sync failed`, error);
        setSyncError("Progress sync is temporarily unavailable. Your latest activity may not be saved.");
      });

    return syncQueueRef.current;
  };

  useEffect(() => {
    let isActive = true;

    const bootstrapPlayer = async () => {
      setIsBootstrapping(true);
      setIsFrameLoading(true);
      setHasSlowLoad(false);
      setPlayerError(null);
      setSyncError(null);
      setResolvedCourseUrl(null);

      const trackingEnabled = Boolean(userId && courseId);
      trackingEnabledRef.current = trackingEnabled;

      try {
        let progress = null;
        let initializeError: any = null;

        if (trackingEnabled) {
          try {
            const response = await axios.post("/scorm/initialize", {
              userId,
              courseId,
              moduleId,
              sectionId,
            });
            progress = response?.data?.data || null;
          } catch (error: any) {
            initializeError = error;
            console.error("SCORM initialize failed", error);
          }
        }

        const runtime = createScorm12Api({
          context: {
            userId,
            courseId,
            moduleId,
            sectionId,
            learnerName,
          },
          initialState: buildScorm12InitialState({
            context: {
              userId,
              courseId,
              moduleId,
              sectionId,
              learnerName,
            },
            progress,
          }),
          onCommit: (payload) => queueTrackingSync("commit", payload),
          onFinish: (payload) => queueTrackingSync("finish", payload),
        });

        apiRef.current = runtime;
        attachApiToWindow(window);

        if (!isActive) {
          return;
        }

        if (initializeError) {
          setSyncError(
            initializeError?.response?.data?.message ||
            initializeError?.response?.data?.error ||
            "SCORM tracking could not be initialized. The lesson is loading without saved progress sync."
          );
        }

        setResolvedCourseUrl(courseUrl);
      } catch (error: any) {
        console.error("SCORM player bootstrap failed", error);
        if (isActive) {
          setPlayerError(
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            "We couldn't initialize SCORM tracking for this course."
          );
        }
      } finally {
        if (isActive) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrapPlayer();

    return () => {
      isActive = false;

      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }

      const currentRuntime = apiRef.current;
      apiRef.current = null;

      if (currentRuntime?.isInitialized()) {
        const payload = currentRuntime.buildTrackingPayload();
        if (payload) {
          void queueTrackingSync("commit", payload);
        }
      }

      detachApiFromWindow(iframeRef.current?.contentWindow);
      detachApiFromWindow(window);
    };
  }, [courseId, courseUrl, learnerName, moduleId, sectionId, userId]);

  useEffect(() => {
    const iframeElement = iframeRef.current;
    if (!iframeElement) {
      return;
    }

    const handleLoad = () => {
      try {
        attachApiToWindow(window);
        attachApiToWindow(iframeElement.contentWindow);

        if (iframeElement.contentDocument?.contentType?.includes("text/plain")) {
          setPlayerError("The SCORM launch file was returned as plain text.");
        } else {
          setPlayerError(null);
        }
      } catch (error) {
        console.warn("Unable to attach the SCORM API to the iframe window.", error);
      } finally {
        setIsFrameLoading(false);
        setHasSlowLoad(false);
      }
    };

    iframeElement.addEventListener("load", handleLoad);

    return () => {
      iframeElement.removeEventListener("load", handleLoad);
    };
  }, [resolvedCourseUrl]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const slowLoadTimer = window.setTimeout(() => {
      setHasSlowLoad(true);
    }, 6000);

    return () => {
      window.clearTimeout(slowLoadTimer);
    };
  }, [courseUrl, resolvedCourseUrl]);

  const toggleFullscreen = async () => {
    if (!modalRef.current) {
      return;
    }

    if (!document.fullscreenElement) {
      await modalRef.current.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  };

  const showOverlay = isBootstrapping || isFrameLoading || Boolean(playerError);

  return (
    <>
      <style>{`
        body, html { overflow: hidden !important; }
        @keyframes scorm-spin { to { transform: rotate(360deg); } }
        .scorm-spinner { animation: scorm-spin 0.9s linear infinite; }
      `}</style>

      <div
        className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onBack();
          }
        }}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.2 }}
          onClick={(event) => event.stopPropagation()}
          className={`
            flex flex-col overflow-hidden bg-white dark:bg-[#0F0F0F]
            shadow-[0_24px_80px_rgba(0,0,0,0.5)]
            ${isFullscreen ? "w-screen h-screen rounded-none" : "w-[60vw] h-[80vh] max-w-[1600px] rounded-2xl"}
          `}
        >
          <div
            className="flex items-center justify-between gap-3 flex-shrink-0 px-3 bg-black dark:bg-[#0F0F0F] border-b border-gray-100 dark:border-white/10"
            style={{ height: HEADER_H }}
          >
            <h2 className="text-sm font-medium text-gray-100 dark:text-gray-400 truncate ml-1 select-none">
              {courseTitle}
            </h2>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                colorScheme="teal"
                variant="outline"
                onClick={() => setIsQuizReviewOpen(true)}
                isDisabled={isBootstrapping}
              >
                View Quiz Answers
              </Button>
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-200 transition hover:bg-white/10"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsQuizReviewOpen(false);
                  onBack();
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-200 transition hover:bg-white/10"
                aria-label="Close player"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-[#0B0B0B]">
            {showOverlay ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0B0B0B] text-white">
                <div className="scorm-spinner w-8 h-8 rounded-full border-[3px] border-white/20 border-t-white" />
                <p className="text-sm font-medium">
                  {playerError || "Loading course assets and reconnecting your SCORM session..."}
                </p>
                {hasSlowLoad && !playerError ? (
                  <p className="text-xs text-white/70">
                    This package is taking a bit longer than usual to load.
                  </p>
                ) : null}
              </div>
            ) : null}

            <iframe
              ref={iframeRef}
              src={resolvedCourseUrl || undefined}
              title={courseTitle}
              className="w-full h-full bg-white"
              allowFullScreen
              onError={() => {
                setPlayerError("We couldn't load this SCORM package.");
                setIsFrameLoading(false);
              }}
            />
          </div>

          {syncError ? (
            <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
              {syncError}
            </div>
          ) : null}
        </motion.div>
      </div>

      <Drawer isOpen={isQuizReviewOpen} placement="right" onClose={() => setIsQuizReviewOpen(false)} size="lg">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Quiz Review</DrawerHeader>
          <DrawerBody py={6}>
            <ScormQuizReviewContent
              sections={visibleAnswerSections}
              isLoading={isAnswerSectionsLoading}
              emptyState="Answers will appear here after the SCORM package commits quiz data or when the lesson is completed."
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
