import { motion } from "framer-motion";
import React from "react";
import "./auth.css";

const emojis = [
  { e: "📚", l: "10%", d: "10s", a: "0s" },
  { e: "🎓", l: "45%", d: "12s", a: "2s" },
  { e: "✨", l: "80%", d: "9s", a: "1s" },
  { e: "💡", l: "25%", d: "14s", a: "4s" },
  { e: "🎯", l: "65%", d: "11s", a: "1.5s" },
  { e: "💻", l: "85%", d: "15s", a: "3s" },
  { e: "🧠", l: "35%", d: "12s", a: "5s" },
  { e: "📝", l: "15%", d: "13s", a: "3.5s" },
  { e: "🚀", l: "55%", d: "9s", a: "0.5s" },
  { e: "🔬", l: "75%", d: "16s", a: "6s" },
  { e: "⚡️", l: "5%", d: "11s", a: "2.5s" },
  { e: "🏆", l: "90%", d: "14s", a: "7s" },
  { e: "✏️", l: "30%", d: "10s", a: "1.2s" },
  { e: "🎒", l: "50%", d: "15s", a: "4.5s" },
];

export function AuthLayout({
  children,
  hideBrand,
  hideMobileBrand,
  mobileFooter,
  mobileAction,
}: {
  children: React.ReactNode;
  hideBrand?: boolean;
  hideMobileBrand?: boolean;
  /** Content pinned to the bottom on mobile (e.g. sign-in link) */
  mobileFooter?: React.ReactNode;
  /** The primary action button, pinned above the link on mobile */
  mobileAction?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden select-none z-[100] bg-[#FFF5F6] dark:bg-[#090314] transition-colors duration-700">

      {/* ── Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute w-[800px] h-[800px] bg-gradient-to-br from-primary/10 to-transparent dark:from-[#8b5cf6]/20 dark:to-transparent top-[-20%] left-[-20%] rounded-full blur-[120px] dark:blur-[160px] animate-pulse transition-all duration-1000" />
        <div className="absolute w-[600px] h-[600px] bg-[#F7B733]/15 dark:bg-primary/20 bottom-[-10%] right-[-10%] rounded-full blur-[120px] dark:blur-[160px] transition-all duration-1000" />
      </div>

      {/* ── Floating Emojis (Foreground) ── */}
      <div className="fixed inset-0 z-[30] pointer-events-none overflow-hidden">
        {emojis.map((emoji, i) => (
          <div
            key={i}
            className="absolute bottom-[-50px] text-3xl opacity-60 dark:opacity-20 drop-shadow-sm transition-opacity duration-700"
            style={{ left: emoji.l, animation: `floatUp ${emoji.d} linear infinite ${emoji.a}` }}
          >
            {emoji.e}
          </div>
        ))}
      </div>

      {/* ── Fixed top bar ── */}
      <div className="fixed left-0 w-full flex justify-between items-center px-6 z-[120] pointer-events-none top-[calc(40px+1.5rem)] sm:top-6">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-black/40 dark:text-white/30 transition-colors">ACADEMY</span>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-black/30 dark:text-white/20 transition-colors">Learner Access</span>
          <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px] bg-primary shadow-primary/50 animate-pulse" />
        </div>
      </div>

      {/* ── MOBILE layout (< sm) ── */}
      {/* Logo top | Content flex-1 | Button pinned bottom */}
      <div className="sm:hidden relative min-h-[100dvh] w-full flex flex-col z-10">

        {/* Logo — top */}
        {!hideBrand && !hideMobileBrand && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pb-8 px-7 flex flex-col items-center"
            style={{ paddingTop: 'calc(var(--safe-area-top, env(safe-area-inset-top, 0px)) + 2.5rem)' }}
          >
            <h1 className="text-[2rem] font-[900] leading-tight text-transparent bg-clip-text bg-gradient-to-br from-primary via-[#8b5cf6] to-[#F7B733] drop-shadow-[0_10px_20px_rgba(var(--primary),0.2)] tracking-tighter uppercase whitespace-nowrap">
              LUMA LMS
            </h1>
            <p className="text-[9px] font-bold tracking-[0.35em] uppercase text-black/30 dark:text-white/25 mt-1">
              Your learning journey
            </p>
          </motion.div>
        )}

        {/* Content — grows to fill space */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 px-7 pt-2 pb-28"
        >
          {children}
        </motion.div>

        {/* Sticky footer — button + link */}
        {(mobileAction || mobileFooter) && (
          <div className="sticky bottom-0 z-20 px-6 pt-6 flex flex-col gap-4" style={{ paddingBottom: '80px' }}>
            {mobileAction}
            {mobileFooter}
          </div>
        )}
      </div>

      {/* ── DESKTOP layout (sm+) ── */}
      {/* Centered card, same as before */}
      <div className="hidden sm:flex relative min-h-[100dvh] w-full flex-col items-center justify-center pt-16 pb-8 px-4 z-10">
        <div className="relative z-10 w-full max-w-[400px] flex flex-col items-center -mt-12">
          {!hideBrand && (
            <div className="flex flex-col items-center mb-4 w-full animate-in slide-in-from-bottom-4 fade-in duration-1000">
              <h1 className="text-[2.2rem] sm:text-[2.8rem] font-[900] leading-tight text-transparent bg-clip-text bg-gradient-to-br from-primary via-[#8b5cf6] to-[#F7B733] drop-shadow-[0_10px_20px_rgba(var(--primary),0.2)] tracking-tighter uppercase flex items-center justify-center transition-all duration-1000 pb-1 whitespace-nowrap">
                LUMA LMS
              </h1>
            </div>
          )}

          {/* Glass card */}
          <div className="w-full perspective-[1200px] flex flex-col">
            <div
              className="w-full rounded-[40px] px-8 py-8 flex flex-col justify-center space-y-5 bg-white/60 border border-white/80 shadow-[0_30px_80px_rgba(0,0,0,0.08)] backdrop-blur-3xl ring-1 ring-black/5 dark:ring-white/10 dark:bg-[#13072E]/40 dark:border-white/5 dark:backdrop-blur-[40px] dark:shadow-[0_40px_100px_rgba(139,92,246,0.15)]"
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
      `}} />
    </div>
  );
}
