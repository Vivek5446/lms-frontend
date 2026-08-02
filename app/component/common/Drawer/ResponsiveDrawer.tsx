"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ResponsiveDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  desktopWidth?: string;
  showDesktopClose?: boolean;
  showMobileBack?: boolean;
};

const MOBILE_QUERY = "(max-width: 767px)";

function useIsMobileDrawer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const updateValue = () => setIsMobile(mediaQuery.matches);

    updateValue();
    mediaQuery.addEventListener("change", updateValue);

    return () => {
      mediaQuery.removeEventListener("change", updateValue);
    };
  }, []);

  return isMobile;
}

export default function ResponsiveDrawer({
  open,
  onClose,
  title,
  children,
  className,
  bodyClassName,
  desktopWidth = "min(920px, 100vw)",
  showDesktopClose = true,
  showMobileBack = true,
}: ResponsiveDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobileDrawer();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[1500]">
          <motion.button
            type="button"
            aria-label="Close drawer"
            className="absolute inset-0 h-full w-full bg-slate-950/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            className={cn(
              "absolute flex min-h-0 flex-col overflow-hidden border-border bg-background text-foreground shadow-2xl",
              "md:inset-y-0 md:left-auto md:right-0 md:border-l",
              "inset-x-0 bottom-0 h-[100dvh] rounded-t-[1.35rem] border-t md:rounded-none",
              className
            )}
            style={{
              width: isMobile ? "100%" : desktopWidth,
            }}
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 34,
              mass: 0.9,
            }}
            drag={isMobile ? "y" : false}
            dragDirectionLock
            dragElastic={{ top: 0, bottom: 0.18 }}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 650) {
                onClose();
              }
            }}
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-border bg-background/95 px-3 py-3 backdrop-blur md:px-5 md:py-4">
              <button
                type="button"
                aria-label="Back"
                onClick={onClose}
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted",
                  !showMobileBack && "hidden md:grid"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-border md:hidden" />
                {title ? (
                  typeof title === "string" ? (
                    <h2 className="truncate text-sm font-semibold text-foreground md:text-base">
                      {title}
                    </h2>
                  ) : (
                    title
                  )
                ) : null}
              </div>

              {showDesktopClose ? (
                <button
                  type="button"
                  aria-label="Close drawer"
                  onClick={onClose}
                  className="hidden h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted md:grid"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain",
                bodyClassName
              )}
            >
              {children}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
