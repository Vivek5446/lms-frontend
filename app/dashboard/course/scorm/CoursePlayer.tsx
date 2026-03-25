import { Box, Flex, Heading, IconButton, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiMaximize2, FiMinimize2 } from "react-icons/fi";

interface CoursePlayerProps {
  courseUrl: string;
  courseTitle: string;
  onBack: () => void;
}

export default function CoursePlayer({ courseUrl, courseTitle, onBack }: CoursePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Ultra-subtle theme colors
  const headerBg = useColorModeValue("white", "#0F0F0F");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const iconHoverBg = useColorModeValue("gray.50", "whiteAlpha.200");
  const playerBg = useColorModeValue("white", "black");

  // SCORM API attachment
  useEffect(() => {
    const scorm12Api = {
      LMSInitialize: () => { console.log("SCORM API Initialized"); return "true"; },
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

    const attachApis = (targetWindow: Window | null | undefined) => {
      if (!targetWindow) return;
      (targetWindow as any).API = scorm12Api;
      (targetWindow as any).API_1484_11 = scorm2004Api;
    };

    attachApis(window);

    const iframeElement = iframeRef.current;
    const handleLoad = () => {
      try {
        attachApis(iframeElement?.contentWindow);
      } catch (error) {
        console.warn("Unable to attach SCORM API to iframe window.", error);
      }
    };

    iframeElement?.addEventListener("load", handleLoad);

    // Prevent body scroll when this component mounts
    document.body.style.overflow = "hidden";

    return () => {
      delete (window as any).API;
      delete (window as any).API_1484_11;
      iframeElement?.removeEventListener("load", handleLoad);
      // Restore body scroll on unmount
      document.body.style.overflow = "unset";
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <Flex
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition="0.3s ease-in-out"
      ref={containerRef}
      direction="column"
      w="100%"
      h="100vh"
      overflow="hidden" // Absolutely no scrolling
      bg={playerBg}
    >
      {/* Ultra-subtle Header 
        Extremely minimal, blends into the background, thin profile 
      */}
      <Flex
        h="52px"
        bg={headerBg}
        borderBottomWidth="1px"
        borderBottomColor={borderColor}
        px={4}
        align="center"
        justify="space-between"
        zIndex={10}
      >
        <Flex align="center" gap={3}>
          <IconButton
            aria-label="Back to course"
            icon={<FiArrowLeft size={18} />}
            onClick={onBack}
            variant="ghost"
            size="sm"
            color={textColor}
            _hover={{ bg: iconHoverBg, color: useColorModeValue("black", "white") }}
            isRound
          />
          <Heading 
            size="sm" 
            fontWeight="500" 
            color={textColor} 
            noOfLines={1}
            userSelect="none"
          >
            {courseTitle}
          </Heading>
        </Flex>
        
        <IconButton
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          icon={isFullscreen ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
          onClick={toggleFullscreen}
          variant="ghost"
          size="sm"
          color={textColor}
          _hover={{ bg: iconHoverBg, color: useColorModeValue("black", "white") }}
          isRound
        />
      </Flex>

      {/* Player Body Area - Takes exactly the remaining space */}
      <Box 
        flex="1" 
        w="100%"
        position="relative"
        bg={playerBg}
      >
        <iframe
          ref={iframeRef}
          src={courseUrl}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
          }}
          title={courseTitle}
          allow="autoplay; fullscreen"
        />
      </Box>
    </Flex>
  );
}