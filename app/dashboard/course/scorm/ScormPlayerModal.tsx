import {
    Flex,
    Heading,
    IconButton,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";

interface ScormPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseUrl: string;
  courseTitle: string;
  sectionTitle?: string;
}

export default function ScormPlayerModal({
  isOpen,
  onClose,
  courseUrl,
  courseTitle,
  sectionTitle,
}: ScormPlayerModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const bgHeader = useColorModeValue("gray.50", "gray.800");

  // SCORM API attachment
  useEffect(() => {
    const scorm12Api = {
      LMSInitialize: () => {
        console.log("SCORM API Initialized");
        return "true";
      },
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
      SetValue: (key: string, value: string) => {
        scorm2004State[key] = value;
        return "true";
      },
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

    return () => {
      delete (window as any).API;
      delete (window as any).API_1484_11;
      iframeElement?.removeEventListener("load", handleLoad);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!contentRef.current) return;
    if (!document.fullscreenElement) {
      await contentRef.current.requestFullscreen();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      motionPreset="slideInBottom"
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        maxW="90vw"
        maxH="90vh"
        w="90vw"
        h="90vh"
        borderRadius="2xl"
        overflow="hidden"
        m="auto"
      >
        {/* Header */}
        <ModalHeader
          bg={bgHeader}
          borderBottomWidth="1px"
          py={3}
          px={4}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Flex align="center" gap={2}>
            <ModalCloseButton position="static" top="auto" right="auto" />
            <Heading size="sm" fontWeight="medium" color="gray.600">
              {courseTitle}
            </Heading>
            {sectionTitle && (
              <Text fontSize="xs" color="gray.500" ml={2}>
                • {sectionTitle}
              </Text>
            )}
          </Flex>
          <IconButton
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            icon={isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
            onClick={toggleFullscreen}
            variant="ghost"
            size="sm"
          />
        </ModalHeader>

        <ModalBody p={0} flex="1" ref={contentRef}>
          <iframe
            ref={iframeRef}
            src={courseUrl}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
            }}
            title={`${courseTitle} - ${sectionTitle || "player"}`}
            allowFullScreen
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}