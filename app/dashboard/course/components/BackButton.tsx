"use client";

import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  onBack: () => void;
}

export default function BackButton({ onBack }: BackButtonProps) {
  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={onBack}
      className="
        group relative ml-3 flex h-10 w-10 items-center justify-center overflow-hidden
        rounded-full border border-border
        bg-card text-foreground shadow-sm
        transition-colors duration-300 ease-out
        hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-md
        active:scale-95
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-primary focus-visible:ring-offset-2
        sm:ml-0
      "
    >
      {/* Primary icon: Slides out to the left and fades away on hover */}
      <ChevronLeft 
        className="absolute h-5 w-5 transition-all duration-300 ease-out group-hover:-translate-x-6 group-hover:scale-75 group-hover:opacity-0" 
      />
      
      {/* Secondary icon: Starts off-screen right, slides in to the center on hover */}
      <ChevronLeft 
        className="absolute h-5 w-5 translate-x-6 scale-75 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100" 
      />
    </button>
  );
}