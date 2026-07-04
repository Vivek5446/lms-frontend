import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

export function AuthLayout({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[440px] space-y-6">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl font-bold">Luma LMS</span>
          </Link>
        </div>
        <div className="bg-white border border-border/60 rounded-[28px] p-5 sm:p-6 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
