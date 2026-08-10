import React, { useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  useColorModeValue,
  Flex,
  Button,
  Badge,
  CircularProgress,
  CircularProgressLabel,
  SimpleGrid,
  Skeleton,
  Icon,
  Avatar,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";
import { sidebarDatas, sidebarFooterData } from "../../layouts/dashboardLayout/SidebarLayout/utils/SidebarItems";
import ColorPickerComponent from "../common/ColorPicker/ColorPickerComponent";
import { DeleteIcon } from "@chakra-ui/icons";
import { FiClock, FiAward, FiBookOpen } from "react-icons/fi";

const formatTime = (seconds?: number) => {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const QuizAttemptCard = ({ attempt }: { attempt: any }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textMuted = useColorModeValue("gray.500", "gray.400");
  const statBg = useColorModeValue("gray.50", "gray.700");
  const trackColor = useColorModeValue("gray.100", "gray.700");
  const pct = Math.round(attempt.percentage || 0);
  const passed = attempt.isPassed;
  const accentColor = passed ? "green.400" : "red.400";

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={5}
      boxShadow="sm"
      _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
      transition="all 0.2s"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        width="4px"
        height="100%"
        bg={accentColor}
        borderRadius="full"
      />
      <Flex align="flex-start" justify="space-between" gap={4} pl={2}>
        <Box flex={1}>
          <Flex align="center" gap={2} mb={1} flexWrap="wrap">
            <Text fontWeight="700" fontSize="md" noOfLines={1}>
              {attempt.quiz?.title || "Untitled Quiz"}
            </Text>
            <Badge
              colorScheme={passed ? "green" : "red"}
              borderRadius="full"
              px={2}
              fontSize="xs"
            >
              {passed ? "PASSED" : "FAILED"}
            </Badge>
          </Flex>
          {attempt.quiz?.company?.company_name && (
            <Flex align="center" gap={1.5} mb={3}>
              <Avatar
                size="2xs"
                src={attempt.quiz.company.logo?.url}
                name={attempt.quiz.company.company_name}
              />
              <Text fontSize="xs" color={textMuted} fontWeight="500">
                {attempt.quiz.company.company_name}
              </Text>
            </Flex>
          )}
          <SimpleGrid columns={3} spacing={2} mt={1}>
            <Box bg={statBg} borderRadius="md" p={2} textAlign="center">
              <Text fontSize="xs" color={textMuted} mb={0.5}>Score</Text>
              <Text fontWeight="700" fontSize="sm">
                {attempt.score ?? 0}/{attempt.maxScore ?? 0}
              </Text>
            </Box>
            <Box bg={statBg} borderRadius="md" p={2} textAlign="center">
              <Flex align="center" justify="center" gap={1}>
                <Icon as={FiClock} color={textMuted} boxSize={3} />
                <Text fontSize="xs" color={textMuted}>Time</Text>
              </Flex>
              <Text fontWeight="600" fontSize="sm">{formatTime(attempt.timeTakenSeconds)}</Text>
            </Box>
            <Box bg={statBg} borderRadius="md" p={2} textAlign="center">
              <Text fontSize="xs" color={textMuted} mb={0.5}>Attempt</Text>
              <Text fontWeight="600" fontSize="sm">#{attempt.attemptNumber ?? 1}</Text>
            </Box>
          </SimpleGrid>
          <Text fontSize="xs" color={textMuted} mt={3}>
            {formatDate(attempt.startTime)}
          </Text>
        </Box>
        <CircularProgress
          value={pct}
          size="72px"
          color={passed ? "green.400" : "red.400"}
          trackColor={trackColor}
          thickness="8px"
          flexShrink={0}
        >
          <CircularProgressLabel fontSize="sm" fontWeight="700">
            {pct}%
          </CircularProgressLabel>
        </CircularProgress>
      </Flex>
    </Box>
  );
};

const ProfileSettings = observer(() => {
  const {
    themeStore: { themeConfig, setThemeConfig },
    quizStore,
  } = stores;

  const allSidebarItems = [...sidebarDatas, ...sidebarFooterData];
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const textMuted = useColorModeValue("gray.500", "gray.400");
  const headingColor = useColorModeValue("gray.700", "white");
  const boxBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    quizStore.fetchMyAttempts();
  }, []);

  const handleColorChange = (name: string, newColor: { light: string; dark: string }) => {
    setThemeConfig(`sidebarColors.${name}`, newColor);
  };

  const handleResetColor = (name: string) => {
    const currentColors = themeConfig.sidebarColors || {};
    const newColors = { ...currentColors };
    delete newColors[name];
    setThemeConfig("sidebarColors", newColors);
  };

  const traverseSidebarItems = (items: any[]) =>
    items.map((item) => (
      <Box
        key={item.id}
        py={5}
        px={4}
        borderBottomWidth="1px"
        borderColor={useColorModeValue("gray.100", "gray.700")}
        _hover={{ bg: useColorModeValue("gray.50", "gray.800") }}
        transition="background 0.2s"
      >
        <Flex align="flex-start" justify="space-between" width="100%" gap={6}>
          <Box flex={1}>
            <Text fontWeight="600" fontSize="md" color={useColorModeValue("gray.700", "white")}>
              {item.name}
            </Text>
            {item.children && (
              <Text fontSize="xs" color="gray.500" mt={1}>Sub-items available</Text>
            )}
            {themeConfig.sidebarColors?.[item.name] && (
              <Button
                variant="link"
                size="xs"
                colorScheme="red"
                leftIcon={<DeleteIcon />}
                onClick={() => handleResetColor(item.name)}
                mt={2}
                fontWeight="normal"
              >
                Reset to Default
              </Button>
            )}
          </Box>
          <Box w="320px">
            <ColorPickerComponent
              label={item.name}
              color={
                themeConfig.sidebarColors?.[item.name] || { light: "#ffffff", dark: "#1a202c" }
              }
              onChangeComplete={(color: { light: string; dark: string }) =>
                handleColorChange(item.name, color)
              }
            />
          </Box>
        </Flex>
        {item.children && (
          <Box pl={6} mt={4} borderLeftWidth="2px" borderColor={useColorModeValue("blue.100", "gray.600")}>
            <VStack align="stretch" spacing={0} width="100%">
              {traverseSidebarItems(item.children)}
            </VStack>
          </Box>
        )}
      </Box>
    ));

  return (
    <VStack align="stretch" spacing={6} w="100%">
      <Box w="100%" p={4} bg={boxBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Flex justify="space-between" align="center" mb={4} pb={4} borderBottomWidth="1px" borderColor={borderColor}>
          <Box>
            <Heading size="md" color={headingColor}>Sidebar Customization</Heading>
            <Text fontSize="sm" color={textMuted}>Set custom background colors for sidebar items.</Text>
          </Box>
        </Flex>
        <VStack align="stretch" spacing={0}>
          {traverseSidebarItems(allSidebarItems)}
        </VStack>
      </Box>

      <Box w="100%" p={4} bg={boxBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Flex align="center" gap={2} mb={4} pb={4} borderBottomWidth="1px" borderColor={borderColor}>
          <Icon as={FiAward} color="blue.400" boxSize={5} />
          <Box>
            <Heading size="md" color={headingColor}>Quiz History</Heading>
            <Text fontSize="sm" color={textMuted}>All quizzes you have attempted.</Text>
          </Box>
        </Flex>
        {quizStore.loading ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height="160px" borderRadius="xl" />
            ))}
          </SimpleGrid>
        ) : quizStore.myAttempts.length === 0 ? (
          <Flex direction="column" align="center" py={10} gap={3} color={textMuted}>
            <Icon as={FiBookOpen} boxSize={10} />
            <Text fontSize="md" fontWeight="500">No quiz attempts yet</Text>
            <Text fontSize="sm">Complete a quiz to see your results here.</Text>
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {quizStore.myAttempts.map((attempt) => (
              <QuizAttemptCard key={attempt._id} attempt={attempt} />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </VStack>
  );
});

export default ProfileSettings;
