"use client";

import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { FiBookOpen, FiCalendar } from "react-icons/fi";
import { ScopedDashboardSummary } from "./types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Filler,
  Tooltip,
  Legend
);

export type DailyRegistrationChartProps = {
  charts?: ScopedDashboardSummary["charts"];
  isLoading?: boolean;
  role?: "admin" | "departmenthead";
};

export function DailyRegistrationChart({
  charts,
  isLoading = false,
  role = "admin",
}: DailyRegistrationChartProps) {
  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("#475569", "#CBD5E1");
  const titleColor = useColorModeValue("gray.900", "white");
  const subtitleColor = useColorModeValue("gray.500", "gray.400");
  const gridColor = useColorModeValue("rgba(148,163,184,0.12)", "rgba(148,163,184,0.08)");

  const dailyEnrollments = useMemo(
    () => charts?.dailyEnrollments || [],
    [charts]
  );

  const labels = useMemo(
    () => dailyEnrollments.map((entry) => entry.label),
    [dailyEnrollments]
  );

  const hasData = dailyEnrollments.some((d) => d.value > 0);

  // Construct Chart.js Data
  const chartData: ChartData<"bar"> = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: "Course Enrollments",
          data: dailyEnrollments.map((d) => d.value),
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return "#7C3AED";
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, "rgba(99, 102, 241, 0.4)");
            gradient.addColorStop(1, "#8B5CF6");
            return gradient;
          },
          borderColor: "#7C3AED",
          borderWidth: 1.5,
          borderRadius: 6,
          hoverBackgroundColor: "#6D28D9",
          maxBarThickness: 42,
        },
      ],
    };
  }, [labels, dailyEnrollments]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          titleColor: "#FFFFFF",
          bodyColor: "#CBD5E1",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: (context: any) => {
              const val = context.parsed.y || 0;
              return ` Course Enrollments: ${val} ${val === 1 ? "enrollment" : "enrollments"}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: textColor,
            font: { size: 11, weight: "500" as const },
            maxRotation: 45,
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            precision: 0,
            font: { size: 11 },
          },
        },
      },
    }),
    [textColor, gridColor]
  );

  if (isLoading) {
    return (
      <Box
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="2xl"
        p={{ base: 4, md: 6 }}
      >
        <Skeleton h="30px" mb={4} borderRadius="md" w="200px" />
        <Skeleton h="250px" borderRadius="xl" />
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      overflow="hidden"
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius={{ base: "xl", md: "2xl" }}
      p={{ base: 4, md: 6 }}
      boxShadow={useColorModeValue(
        "0 4px 20px rgba(99, 102, 241, 0.05)",
        "0 4px 20px rgba(0, 0, 0, 0.2)"
      )}
      transition="all 0.25s ease"
      _hover={{
        borderColor: useColorModeValue("purple.200", "purple.700"),
        boxShadow: useColorModeValue(
          "0 8px 30px rgba(99, 102, 241, 0.1)",
          "0 8px 30px rgba(0, 0, 0, 0.35)"
        ),
      }}
    >
      <Stack spacing={5}>
        {/* Header Row */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={4}
        >
          <HStack spacing={3.5} align="center">
            <Flex
              w="42px"
              h="42px"
              align="center"
              justify="center"
              borderRadius="xl"
              bgGradient="linear(to-br, #6269FF, #8A2BE2)"
              color="white"
              boxShadow="0 4px 12px rgba(98, 105, 255, 0.28)"
              flexShrink={0}
            >
              <Icon as={FiBookOpen} boxSize={5} />
            </Flex>

            <Box minW={0}>
              <HStack spacing={2} align="center">
                <Heading fontSize={{ base: "md", md: "lg" }} color={titleColor}>
                  Daily Course Enrollments
                </Heading>
                <Badge
                  colorScheme="purple"
                  variant="subtle"
                  borderRadius="full"
                  px={2.5}
                  fontSize="10px"
                  fontWeight="700"
                  letterSpacing="0.03em"
                >
                  DAILY TREND
                </Badge>
              </HStack>
              <Text fontSize="xs" color={subtitleColor} mt={0.5}>
                {role === "admin"
                  ? "Track daily learner course purchases and enrollments across company courses."
                  : "Track daily course enrollments within your department."}
              </Text>
            </Box>
          </HStack>
        </Flex>

        {/* Chart Canvas area */}
        {hasData ? (
          <Box h={{ base: "230px", md: "270px" }} w="100%">
            <Bar data={chartData} options={chartOptions as any} />
          </Box>
        ) : (
          <Box
            h={{ base: "180px", md: "240px" }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            borderRadius="xl"
            bg={useColorModeValue("gray.50", "gray.900")}
            borderWidth="1px"
            borderStyle="dashed"
            borderColor={borderColor}
            p={6}
            textAlign="center"
          >
            <Icon as={FiCalendar} boxSize={8} color="gray.400" mb={2} />
            <Text fontSize="sm" fontWeight="600" color={titleColor}>
              No daily course enrollments recorded
            </Text>
            <Text fontSize="xs" color={subtitleColor} mt={1} maxW="380px">
              No learner course enrollments found for the selected filter parameters. Try expanding your date range or clearing filters.
            </Text>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
