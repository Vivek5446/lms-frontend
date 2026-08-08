"use client";

import { useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export function useDevToolsBlocker(onDetect?: () => void) {
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    let devToolsOpen = false;

    // Method 1: Debugger loop. If DevTools is open, this will freeze the browser tab
    // on the debugger statement constantly, making the page unusable.
    const debuggerInterval = setInterval(() => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = performance.now();
      
      // If it took more than 100ms to execute the debugger statement, 
      // it means the browser actually paused execution (DevTools is open)
      if (end - start > 100) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          toast({
            title: "Security Violation",
            description: "Developer tools detected. Please close them immediately.",
            status: "error",
            duration: null, // Don't auto-close
            isClosable: false,
            position: "top"
          });
          
          if (onDetect) {
            onDetect();
          } else {
            // Default action: kick them out
            router.replace("/dashboard");
          }
        }
      }
    }, 1000);

    // Method 2: Prevent all the keyboard shortcuts
    const blockKeys = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'P' || e.key === 'p' || e.key === 'S' || e.key === 's'))
      ) {
        e.preventDefault();
        return false;
      }
    };
    
    const blockContext = (e: Event) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener("keydown", blockKeys, { capture: true });
    window.addEventListener("contextmenu", blockContext, { capture: true });

    return () => {
      clearInterval(debuggerInterval);
      window.removeEventListener("keydown", blockKeys, { capture: true });
      window.removeEventListener("contextmenu", blockContext, { capture: true });
    };
  }, [onDetect, router, toast]);
}
