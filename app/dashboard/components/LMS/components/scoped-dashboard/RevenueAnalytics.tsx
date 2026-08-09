"use client";

import StatCard, { StatCardProps } from "@/app/component/common/StatCard/StatCard";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
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
import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiCreditCard,
  FiDollarSign,
  FiShoppingBag,
  FiTrendingUp,
} from "react-icons/fi";
import { DashboardChartEntry, ScopedDashboardSummary, TopRevenueCourse } from "./types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Filler,
  Tooltip,
  Legend
);

export type RevenueAnalyticsProps = {
  summary: ScopedDashboardSummary;
  isLoading?: boolean;
};

type ViewMode = "daily" | "monthly";

function formatRupees(amount: number | null | undefined): string {
  const value = Number(amount || 0);
  return `₹${value.toLocaleString("en-IN")}`;
}

export function RevenueAnalytics({ summary, isLoading = false }: RevenueAnalyticsProps) {
  const [chartView, setChartView] = useState<ViewMode>("daily");

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("#475569", "#CBD5E1");
  const titleColor = useColorModeValue("gray.900", "white");
  const subtitleColor = useColorModeValue("gray.500", "gray.400");
  const gridColor = useColorModeValue("rgba(148,163,184,0.12)", "rgba(148,163,184,0.08)");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.900");

  const stats = summary.stats || {};
  const charts = summary.charts || {};
  const highlights = summary.highlights || {};

  const totalRevenue = Number(stats.totalRevenue || 0);
  const avgRevenue = Number(stats.avgRevenuePerEnrollment || 0);
  const paidEnrollmentCount = Number(stats.paidEnrollmentCount || 0);

  const dailyRevenue: DashboardChartEntry[] = charts.dailyRevenue || [];
  const monthlyRevenue: DashboardChartEntry[] = charts.monthlyRevenue || [];
  const topRevenueCourses: TopRevenueCourse[] = highlights.topRevenueCourses || [];

  const topCourse = topRevenueCourses[0] || null;

  const currentChartEntries = chartView === "daily" ? dailyRevenue : monthlyRevenue;
  const labels = currentChartEntries.map((e) => e.label);

  const hasRevenueData =
    totalRevenue > 0 ||
    dailyRevenue.some((d) => d.value > 0) ||
    monthlyRevenue.some((m) => m.value > 0);

  const revenueStatCards: StatCardProps[] = [
    {
      label: "Total Revenue",
      value: formatRupees(totalRevenue),
      helper: "Earnings from course sales",
      icon: FiDollarSign,
      colorScheme: "green",
    },
    {
      label: "Avg Order Value",
      value: formatRupees(avgRevenue),
      helper: "Average price per enrollment",
      icon: FiTrendingUp,
      colorScheme: "blue",
    },
    {
      label: "Paid Enrollments",
      value: paidEnrollmentCount,
      helper: "Monetized course transactions",
      icon: FiShoppingBag,
      colorScheme: "purple",
    },
    {
      label: "Top Earning Course",
      value: topCourse ? formatRupees(topCourse.totalRevenue) : "₹0",
      helper: topCourse ? topCourse.title : "No course pricing",
      icon: FiAward,
      colorScheme: "orange",
    },
  ];

  const chartData: ChartData<"bar"> = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: chartView === "daily" ? "Daily Revenue (₹)" : "Monthly Revenue (₹)",
          data: currentChartEntries.map((d) => d.value),
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return "#10B981";
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            if (chartView === "daily") {
              gradient.addColorStop(0, "rgba(16, 185, 129, 0.35)");
              gradient.addColorStop(1, "#10B981");
            } else {
              gradient.addColorStop(0, "rgba(99, 102, 241, 0.35)");
              gradient.addColorStop(1, "#6366F1");
            }
            return gradient;
          },
          borderColor: chartView === "daily" ? "#059669" : "#4F46E5",
          borderWidth: 1.5,
          borderRadius: 6,
          maxBarThickness: 42,
        },
      ],
    };
  }, [labels, currentChartEntries, chartView]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          titleColor: "#FFFFFF",
          bodyColor: "#CBD5E1",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context: any) => {
              const val = context.parsed.y || 0;
              return ` Revenue: ₹${val.toLocaleString("en-IN")}`;
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
            font: { size: 11 },
            callback: (val: any) => `₹${val}`,
          },
        },
      },
    }),
    [textColor, gridColor]
  );

  if (isLoading) {
    return (
      <Stack spacing={4}>
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} h="100px" borderRadius="xl" />
          ))}
        </SimpleGrid>
        <Skeleton h="300px" borderRadius="2xl" />
      </Stack>
    );
  }

  return (
    <Stack spacing={5}>
      {/* Common StatCards Grid for Revenue */}
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={{ base: 3, md: 4 }}>
        {revenueStatCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </SimpleGrid>

      {/* Revenue Charts & Top Courses Grid */}
      <Grid templateColumns={{ base: "1fr", xl: "repeat(2, minmax(0, 1fr))" }} gap={4}>
        {/* Revenue Trend Bar Chart Card */}
        <Box
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="2xl"
          p={{ base: 4, md: 5 }}
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <HStack spacing={3}>
              <Flex
                w="38px"
                h="38px"
                align="center"
                justify="center"
                borderRadius="xl"
                    bgGradient="linear(to-br, purple.500, indigo.600)"
                // bgGradient="linear(to-br, green.400, teal.600)"
                color="white"
              >
                <Icon as={FiCreditCard} boxSize={4} />
              </Flex>
              <Box>
                <Heading size="sm" color={titleColor}>
                  Revenue Trend
                </Heading>
                <Text fontSize="xs" color={subtitleColor}>
                  Monitor earnings generated from course purchases
                </Text>
              </Box>
            </HStack>

            <ButtonGroup
              size="xs"
              isAttached
              variant="outline"
              borderColor={borderColor}
              borderRadius="lg"
              p="2px"
              bg={useColorModeValue("gray.50", "gray.900")}
            >
              <Button
                px={2.5}
                py={1}
                borderRadius="md"
                fontWeight="600"
                fontSize="xs"
                bg={chartView === "daily" ? cardBg : "transparent"}
                color={chartView === "daily" ? "emerald.600" : subtitleColor}
                onClick={() => setChartView("daily")}
              >
                Daily
              </Button>
              <Button
                px={2.5}
                py={1}
                borderRadius="md"
                fontWeight="600"
                fontSize="xs"
                bg={chartView === "monthly" ? cardBg : "transparent"}
                color={chartView === "monthly" ? "purple.600" : subtitleColor}
                onClick={() => setChartView("monthly")}
              >
                Monthly
              </Button>
            </ButtonGroup>
          </Flex>

          {hasRevenueData ? (
            <Box h={{ base: "230px", md: "260px" }} w="100%">
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
                No revenue recorded for selected filters
              </Text>
              <Text fontSize="xs" color={subtitleColor} mt={1} maxW="380px">
                Set course pricing in course commerce settings or expand filter date range to track company earnings.
              </Text>
            </Box>
          )}
        </Box>

        {/* Top Revenue Courses Table */}
        <Box
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="2xl"
          p={{ base: 4, md: 5 }}
          boxShadow="sm"
        >
          <HStack spacing={3} mb={4}>
            <Flex
              w="38px"
              h="38px"
              align="center"
              justify="center"
              borderRadius="xl"
              bgGradient="linear(to-br, purple.500, indigo.600)"
              color="white"
            >
              <Icon as={FiBookOpen} boxSize={4} />
            </Flex>
            <Box>
              <Heading size="sm" color={titleColor}>
                Top Revenue Courses
              </Heading>
              <Text fontSize="xs" color={subtitleColor}>
                Breakdown of course pricing and total money generated
              </Text>
            </Box>
          </HStack>

          {topRevenueCourses.length > 0 ? (
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th fontSize="10px">Course</Th>
                    <Th fontSize="10px" isNumeric>Price</Th>
                    <Th fontSize="10px" isNumeric>Sales</Th>
                    <Th fontSize="10px" isNumeric>Total Revenue</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {topRevenueCourses.map((course, idx) => {
                    const maxRevenue = Math.max(1, topRevenueCourses[0]?.totalRevenue || 1);
                    const percentage = Math.round((course.totalRevenue / maxRevenue) * 100);

                    return (
                      <Tr key={idx}>
                        <Td py={2.5}>
                          <Text fontSize="xs" fontWeight="700" color={titleColor} noOfLines={1}>
                            {course.title}
                          </Text>
                          <Progress
                            value={percentage}
                            size="xs"
                            colorScheme="purple"
                            borderRadius="full"
                            mt={1}
                          />
                        </Td>
                        <Td isNumeric py={2.5}>
                          <Badge colorScheme="blue" borderRadius="md" px={2}>
                            {formatRupees(course.price)}
                          </Badge>
                        </Td>
                        <Td isNumeric py={2.5} fontSize="xs" fontWeight="600">
                          {course.enrollments}
                        </Td>
                        <Td isNumeric py={2.5}>
                          <Text fontSize="xs" fontWeight="800" color="emerald.500">
                            {formatRupees(course.totalRevenue)}
                          </Text>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
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
              <Icon as={FiDollarSign} boxSize={8} color="gray.400" mb={2} />
              <Text fontSize="sm" fontWeight="600" color={titleColor}>
                No course pricing data available
              </Text>
              <Text fontSize="xs" color={subtitleColor} mt={1} maxW="360px">
                When courses are configured with pricing in their commerce tab, course sales and total revenue metrics will automatically appear here.
              </Text>
            </Box>
          )}
        </Box>
      </Grid>
    </Stack>
  );
}
