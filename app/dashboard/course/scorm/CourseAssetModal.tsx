"use client";

import { motion } from "framer-motion";
import { Download, ExternalLink, FileText, Video, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { LaunchContentKind } from "./sectionTracking";

interface CourseAssetModalProps {
  assetUrl: string;
  assetKind: LaunchContentKind;
  title: string;
  onBack: () => void;
  onOpened?: () => void | Promise<void>;
  onCompleted?: () => void | Promise<void>;
}

export default function CourseAssetModal({
  assetUrl,
  assetKind,
  title,
  onBack,
  onOpened,
  onCompleted,
}: CourseAssetModalProps) {
  const hasTrackedOpenRef = useRef(false);
  const hasTrackedCompletionRef = useRef(false);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (!hasTrackedOpenRef.current) {
      hasTrackedOpenRef.current = true;
      void Promise.resolve(onOpened?.()).catch(() => undefined);
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [onOpened]);

  const handleCompleted = () => {
    if (hasTrackedCompletionRef.current) {
      return;
    }

    hasTrackedCompletionRef.current = true;
    void Promise.resolve(onCompleted?.()).catch(() => undefined);
  };

  // console.log('assetUrl',assetUrl)

  const renderContent = () => {
    if (assetKind === "video") {
      return (
        <video
          src={assetUrl}
          controls
          autoPlay
          className="h-full w-full bg-black"
          onEnded={handleCompleted}
        />
      );
    }

    if (assetKind === "document") {
      return <iframe src={assetUrl} title={title} className="h-full w-full bg-white" />;
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
              href={assetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Open File
            </a>
            <a
              href={assetUrl}
              download
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onBack();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2 }}
        onClick={(event) => event.stopPropagation()}
        className="flex h-[80vh] w-[60vw] max-w-[1600px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
      >
        <div className="flex h-12 items-center justify-between gap-3 border-b border-slate-200 bg-slate-950 px-3">
          <div className="flex min-w-0 items-center gap-2 text-slate-200">
            {assetKind === "video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            <h2 className="truncate text-sm font-medium">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={assetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </a>
            <a
              href={assetUrl}
              download
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-200 transition hover:bg-white/10"
              aria-label="Close asset viewer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-slate-950">{renderContent()}</div>
      </motion.div>
    </div>
  );
}
