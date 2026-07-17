"use client";

import PermissionGate from "@/app/component/common/PermissionGate";
import { PERMISSION_KEYS, hasPermission } from "@/app/config/utils/permissions";
import LearnerResultsWorkspace from "@/app/dashboard/components/LMS/components/learner-results/LearnerResultsWorkspace";
import stores from "@/app/store/stores";
import {
  Badge,
  Box,
  Center,
  Flex,
  Heading,
  Icon,
  Spinner,
  Stack,
  HStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ClipboardCheck, ShieldCheck } from "lucide-react";
import { FiArrowLeft } from "react-icons/fi";

const LearnerProgressPage = observer(() => {
  const router = useRouter();
  const { auth } = stores;
  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isAllowedRole = ["superadmin", "admin", "departmenthead"].includes(role);
  const canView = hasPermission(
    auth.user,
    PERMISSION_KEYS.VIEW_LEARNER_PROGRESS_RESULTS
  );
  const isLoading = auth.isLoading || !auth.sessionReady;
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const heroBg = useColorModeValue(
    "linear-gradient(135deg, #312E81 0%, #6D28D9 55%, #0F766E 125%)",
    "linear-gradient(135deg, #111827 0%, #312E81 60%, #134E4A 125%)"
  );

  useEffect(() => {
    if (!isLoading && !isAllowedRole) {
      router.replace("/");
    }
  }, [isAllowedRole, isLoading, router]);

  if (isLoading) {
    return (
      <Center minH="70vh">
        <Stack align="center">
          <Spinner color="purple.500" />
          <Text fontSize="sm" color="gray.500">
            Loading learner progress...
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <PermissionGate
      allowed={isAllowedRole && canView}
      title="Learner progress access is disabled"
      description="This account does not currently have permission to view learner progress and results."
      fallbackHref="/dashboard"
    >
      <Box bg="transparent" p={{ base: 3, md: 0 }}>
        <Stack spacing={4} maxW="1600px" mx="auto">
          <Box bg={useColorModeValue("white", "gray.800")} borderWidth="1px" borderColor={useColorModeValue("gray.200", "gray.700")} rounded={{ base: "xl", md: "2xl" }} px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }} shadow="sm">
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} gap={4}>
              <HStack spacing={{ base: 3, md: 4 }} align="center">
                <Box 
                  as="button"
                  onClick={() => window.history.back()}
                  color={useColorModeValue("gray.500", "gray.400")}
                  bg={useColorModeValue("gray.100", "whiteAlpha.100")}
                  w={{ base: "36px", md: "40px" }} h={{ base: "36px", md: "40px" }}
                  rounded="full"
                  flexShrink={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  _hover={{ bg: useColorModeValue("gray.200", "whiteAlpha.200"), color: "#6269FF", transform: "translateX(-3px)" }}
                  transition="all 0.2s"
                >
                  <FiArrowLeft size={18} />
                </Box>
                <Box display={{ base: "none", md: "flex" }} p={{ base: 2.5, md: 3 }} bgGradient="linear(to-br, #6269FF, #8A2BE2)" rounded="full" alignItems="center" justifyContent="center" boxShadow="0 4px 15px rgba(98,105,255,0.4)" border="1px solid" borderColor="rgba(255,255,255,0.2)">
                  <Icon as={ClipboardCheck} boxSize={{ base: 4, md: 5 }} color="white" />
                </Box>
                <Box>
                  <Heading size={{ base: "sm", md: "lg" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                    <Box as="span" color={useColorModeValue("gray.900", "white")}>LEARNER </Box>
                    <Box as="span" bgGradient={useColorModeValue("linear(to-r, purple.500, purple.700)", "linear(to-r, purple.300, purple.500)")} bgClip="text">
                      PROGRESS
                    </Box>
                  </Heading>
                  <Text mt={1} fontSize={{ base: "2xs", md: "xs" }} fontWeight="700" color={useColorModeValue("gray.500", "gray.400")} letterSpacing="0.1em" textTransform="uppercase" noOfLines={1}>
                    Review course completion and assessment results
                  </Text>
                </Box>
              </HStack>
              <Badge bg={useColorModeValue("blue.50", "rgba(98,105,255,0.15)")} color="#6269FF" borderRadius="full" px={4} py={2} fontSize="xs" fontWeight="800">
                <Flex align="center" gap={1.5}>
                  <Icon as={ShieldCheck} boxSize={3.5} />
                  {role === "superadmin" ? "PLATFORM SCOPE" : role === "admin" ? "COMPANY SCOPE" : "DEPARTMENT SCOPE"}
                </Flex>
              </Badge>
            </Flex>
          </Box>

          <LearnerResultsWorkspace
            role={role as "superadmin" | "admin" | "departmenthead"}
            showHeader={false}
          />
        </Stack>
      </Box>
    </PermissionGate>
  );
});

export default LearnerProgressPage;
