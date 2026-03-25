import React, { useEffect, useRef } from 'react';
import { Box, IconButton, Flex, Heading } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface CoursePlayerProps {
  courseUrl: string;
  courseTitle: string;
  onBack: () => void;
}

export default function CoursePlayer({ courseUrl, courseTitle, onBack }: CoursePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Inject a dummy SCORM 1.2 API onto the window object
    (window as any).API = {
      LMSInitialize: () => {
        console.log("SCORM API Initialized");
        return "true";
      },
      LMSFinish: () => "true",
      LMSGetValue: (key: string) => {
        console.log("SCORM GET:", key);
        if (key === "cmi.core.lesson_status") return "incomplete";
        if (key === "cmi.core.student_id") return "student-001";
        if (key === "cmi.core.student_name") return "Learner, Awesome";
        return "";
      },
      LMSSetValue: (key: string, value: string) => {
        console.log("SCORM SET:", key, value);
        return "true";
      },
      LMSCommit: () => "true",
      LMSGetLastError: () => "0",
      LMSGetErrorString: () => "No error",
      LMSGetDiagnostic: () => "Diagnostic info",
    };

    return () => {
      delete (window as any).API;
    };
  }, []);

  return (
    <Box 
      as={motion.div} 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition='0.3s ease-out'
      bg="white" 
      borderRadius="2xl" 
      overflow="hidden" 
      boxShadow="0 10px 40px rgba(0,0,0,0.1)"
      h="calc(100vh - 100px)"
      display="flex"
      flexDirection="column"
    >
      <Flex 
        bgGradient="linear(to-r, blue.400, purple.500)" 
        color="white" 
        p={4} 
        align="center" 
        justify="space-between"
      >
        <Flex align="center" gap={4}>
          <IconButton 
            aria-label="Back to gallery" 
            icon={<FiArrowLeft />} 
            onClick={onBack}
            variant="ghost" 
            color="white" 
            _hover={{ bg: 'whiteAlpha.200' }}
            isRound
          />
          <Heading size="md" noOfLines={1}>{courseTitle}</Heading>
        </Flex>
      </Flex>

      <Box flex="1" bg="gray.100" position="relative">
        <iframe
          ref={iframeRef}
          src={courseUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={courseTitle}
          allowFullScreen
        />
      </Box>
    </Box>
  );
}
