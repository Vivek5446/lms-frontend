"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMaximize2, FiMinimize2, FiX } from "react-icons/fi";

interface CoursePlayerProps {
  courseUrl: string;
  courseTitle: string;
  onBack: () => void;
}

const HEADER_H = 48;

export default function CoursePlayer({ courseUrl, courseTitle, onBack }: CoursePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const [hasSlowLoad, setHasSlowLoad] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  // ── Lock scroll ──────────────────────────────────────────────
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  // ── SCORM API ────────────────────────────────────────────────
  useEffect(() => {
    const scorm12Api = {
      LMSInitialize: () => "true",
      LMSFinish: () => "true",
      LMSGetValue: (key: string) => {
        if (key === "cmi.core.lesson_status") return "incomplete";
        if (key === "cmi.core.student_id") return "student-001";
        if (key === "cmi.core.student_name") return "Learner, Awesome";
        return "";
      },
      LMSSetValue: () => "true",
      LMSCommit: () => "true",
      LMSGetLastError: () => "0",
      LMSGetErrorString: () => "No error",
      LMSGetDiagnostic: () => "Diagnostic info",
    };

    const scorm2004State: Record<string, string> = {
      "cmi.completion_status": "incomplete",
      "cmi.success_status": "unknown",
      "cmi.learner_id": "student-001",
      "cmi.learner_name": "Learner, Awesome",
    };

    const scorm2004Api = {
      Initialize: () => "true",
      Terminate: () => "true",
      GetValue: (key: string) => scorm2004State[key] ?? "",
      SetValue: (key: string, value: string) => { scorm2004State[key] = value; return "true"; },
      Commit: () => "true",
      GetLastError: () => "0",
      GetErrorString: () => "No error",
      GetDiagnostic: () => "Diagnostic info",
    };

    const attach = (w: Window | null | undefined) => {
      if (!w) return;
      (w as any).API = scorm12Api;
      (w as any).API_1484_11 = scorm2004Api;
    };

    attach(window);

    const el = iframeRef.current;
    const handleLoad = () => {
      try {
        attach(el?.contentWindow);
        if (el?.contentDocument?.contentType?.includes("text/plain")) {
          setPlayerError("The SCORM launch file was returned as plain text.");
        } else {
          setPlayerError(null);
        }
      } catch (e) {
        console.warn("SCORM API attach failed", e);
      } finally {
        setIsFrameLoading(false);
        setHasSlowLoad(false);
      }
    };

    el?.addEventListener("load", handleLoad);
    return () => {
      delete (window as any).API;
      delete (window as any).API_1484_11;
      el?.removeEventListener("load", handleLoad);
    };
  }, []);

  // ── Fullscreen ───────────────────────────────────────────────
  const toggleFullscreen = async () => {
    if (!modalRef.current) return;
    if (!document.fullscreenElement) {
      await modalRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // ── Reset on URL change ──────────────────────────────────────
  useEffect(() => {
    setIsFrameLoading(true);
    setHasSlowLoad(false);
    setPlayerError(null);
    const t = window.setTimeout(() => setHasSlowLoad(true), 6000);
    return () => window.clearTimeout(t);
  }, [courseUrl]);

  return (
    <>
      <style>{`
        body, html { overflow: hidden !important; }
        @keyframes scorm-spin { to { transform: rotate(360deg); } }
        .scorm-spinner { animation: scorm-spin 0.9s linear infinite; }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onBack(); }}
      >
        {/* ── Modal ── */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className={`
            flex flex-col overflow-hidden bg-white dark:bg-[#0F0F0F]
            shadow-[0_24px_80px_rgba(0,0,0,0.5)]
            ${isFullscreen
              ? "w-screen h-screen rounded-none"
              : "w-[60vw] h-[80vh] max-w-[1600px] rounded-2xl"
            }
          `}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between flex-shrink-0 px-3 bg-white dark:bg-[#0F0F0F] border-b border-gray-100 dark:border-white/10"
            style={{ height: HEADER_H }}
          >
            {/* Title */}
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate ml-1 select-none">
              {courseTitle}
            </h2>

            {/* Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
              </button>
              <button
                onClick={onBack}
                aria-label="Close"
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/* ── iframe area ── */}
          <div
            className="relative w-full overflow-hidden bg-white dark:bg-black"
            style={{ height: `calc(100% - ${HEADER_H}px)` }}
          >
            {/* Loading overlay */}
            <AnimatePresence>
              {isFrameLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-white/95 dark:bg-black/95 text-center px-6"
                >
                  {/* Spinner icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <div className="scorm-spinner w-6 h-6 rounded-full border-[3px] border-white/30 border-t-white" />
                  </div>

                  <div className="max-w-md">
                    <p className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                      Preparing SCORM player
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Loading course assets and connecting the SCORM runtime.
                    </p>
                    {hasSlowLoad && (
                      <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                        Taking longer than usual — large packages need extra time on first load.
                      </p>
                    )}
                    {playerError && (
                      <p className="mt-2 text-sm text-red-500">{playerError}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <iframe
              key={courseUrl}
              ref={iframeRef}
              src={courseUrl}
              onError={() => {
                setPlayerError("We couldn't load this SCORM package.");
                setIsFrameLoading(false);
              }}
              className="w-full h-full border-0 block"
              title={courseTitle}
              allow="autoplay; fullscreen"
            />
          </div>
        </motion.div>
      </div>
    </>
  );
}