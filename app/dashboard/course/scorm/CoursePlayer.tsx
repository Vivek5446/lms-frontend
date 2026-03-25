import { Box, Flex, Heading, IconButton, Text, useColorModeValue } from "@chakra-ui/react";
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
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const [hasSlowLoad, setHasSlowLoad] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  
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
        const iframeDocument = iframeElement?.contentDocument;
        if (iframeDocument?.contentType?.includes("text/plain")) {
          setPlayerError("The SCORM launch file was returned as plain text instead of a webpage.");
        } else {
          setPlayerError(null);
        }
      } catch (error) {
        console.warn("Unable to attach SCORM API to iframe window.", error);
      } finally {
        setIsFrameLoading(false);
        setHasSlowLoad(false);
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

  useEffect(() => {
    setIsFrameLoading(true);
    setHasSlowLoad(false);
    setPlayerError(null);

    const slowLoadTimer = window.setTimeout(() => {
      setHasSlowLoad(true);
    }, 6000);

    return () => window.clearTimeout(slowLoadTimer);
  }, [courseUrl]);

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
        {isFrameLoading && (
          <Flex
            position="absolute"
            inset={0}
            zIndex={2}
            align="center"
            justify="center"
            bg={useColorModeValue("rgba(255,255,255,0.94)", "rgba(10,10,10,0.94)")}
            direction="column"
            gap={4}
            textAlign="center"
            px={6}
          >
            <Box
              w="64px"
              h="64px"
              borderRadius="20px"
              bg="linear-gradient(135deg, #4F46E5 0%, #0EA5E9 100%)"
              display="grid"
              placeItems="center"
              boxShadow="0 18px 45px rgba(79, 70, 229, 0.25)"
            >
              <Box
                w="26px"
                h="26px"
                borderRadius="full"
                border="3px solid rgba(255,255,255,0.35)"
                borderTopColor="white"
                animation="course-player-spin 0.9s linear infinite"
              />
            </Box>
            <Box maxW="520px">
              <Heading size="md" mb={2} color={useColorModeValue("gray.800", "white")}>
                Preparing SCORM player
              </Heading>
              <Text color={textColor} fontSize="sm">
                Loading course assets and connecting the SCORM runtime.
              </Text>
              {hasSlowLoad && (
                <Text mt={3} color={textColor} fontSize="sm">
                  This package is taking a bit longer than usual. Large SCORM uploads can need extra time on first load.
                </Text>
              )}
              {playerError && (
                <Text mt={3} color="red.400" fontSize="sm">
                  {playerError}
                </Text>
              )}
            </Box>
          </Flex>
        )}
        <iframe
          key={courseUrl}
          ref={iframeRef}
          src={courseUrl}
          onError={() => {
            setPlayerError("We couldn't load this SCORM package.");
            setIsFrameLoading(false);
          }}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
          }}
          title={courseTitle}
          allow="autoplay; fullscreen"
        />
        <style>{`@keyframes course-player-spin { to { transform: rotate(360deg); } }`}</style>
      </Box>
    </Flex>
  );
}
