"use client";

import {
  Box,
  Flex,
  Grid,
  Heading,
  Select,
  Text,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import {
  BarChart3,
  PieChart,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { ChartEntry, SuperadminDashboardSummary } from "./types";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
);

type AnalyticsChartsProps = {
  charts: NonNullable<SuperadminDashboardSummary["charts"]>;
  availability: NonNullable<SuperadminDashboardSummary["availability"]>;
};

const palette = [
  "#7C3AED",
  "#2563EB",
  "#0D9488",
  "#F59E0B",
  "#E11D48",
  "#64748B",
  "#06B6D4",
  "#84CC16",
];

function ChartCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const [firstWord, ...restWords] = title.split(" ");
  const restTitle = restWords.join(" ");

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      p={{ base: 4, md: 6 }}
      boxShadow="sm"
      minW={0}
      transition="all 0.2s"
      _hover={{ boxShadow: "md" }}
    >
      <Flex justify="space-between" align="center" gap={3} mb={6}>
        <Box>
          <Heading size="sm" fontWeight="900" letterSpacing="tight" textTransform="uppercase">
            <Box as="span" color={useColorModeValue("gray.900", "white")}>{firstWord} </Box>
            {restTitle && (
              <Box as="span" bgGradient={useColorModeValue("linear(to-r, purple.500, purple.700)", "linear(to-r, purple.300, purple.500)")} bgClip="text">
                {restTitle}
              </Box>
            )}
          </Heading>
          <Text fontSize="10px" fontWeight="700" color="gray.500" mt={0.5} letterSpacing="wider" textTransform="uppercase">
            {subtitle}
          </Text>
        </Box>
        <Flex
          align="center"
          justify="center"
          boxSize="38px"
          borderRadius="xl"
          bg={useColorModeValue("purple.50", "purple.900")}
          color={useColorModeValue("purple.600", "purple.300")}
          flexShrink={0}
        >
          <Icon as={icon} boxSize={5} />
        </Flex>
      </Flex>
      <Box h={{ base: "230px", md: "270px" }} position="relative">
        {children}
      </Box>
    </Box>
  );
}

function hasData(entries: ChartEntry[] = []) {
  return entries.some((entry) => entry.value > 0);
}

function EmptyChart({ message }: { message: string }) {
  return (
    <Flex h="100%" align="center" justify="center" textAlign="center" px={6}>
      <Text fontSize="sm" color="gray.500">
        {message}
      </Text>
    </Flex>
  );
}

export function AnalyticsCharts({ charts, availability }: AnalyticsChartsProps) {
  const textColor = useColorModeValue("#334155", "#CBD5E1");
  const gridColor = useColorModeValue("rgba(148,163,184,0.16)", "rgba(148,163,184,0.12)");
  const [distribution, setDistribution] = useState<"roles" | "courses" | "batches">("roles");

  const trendData = useMemo(
    () => ({
      labels: (charts.userGrowth || []).map((entry) => entry.label),
      datasets: [
        {
          label: "New users",
          data: (charts.userGrowth || []).map((entry) => entry.value),
          borderColor: "#7C3AED",
          backgroundColor: "rgba(124,58,237,0.12)",
          fill: true,
          tension: 0.38,
          pointRadius: 3,
        },
        {
          label: "Completions",
          data: (charts.completionTrend || []).map((entry) => entry.value),
          borderColor: "#0D9488",
          backgroundColor: "rgba(13,148,136,0.08)",
          fill: true,
          tension: 0.38,
          pointRadius: 3,
        },
      ],
    }),
    [charts.completionTrend, charts.userGrowth]
  );

  const companyData = {
    labels: (charts.companyUserDistribution || []).map((entry) => entry.label),
    datasets: [
      {
        label: "Users",
        data: (charts.companyUserDistribution || []).map((entry) => entry.value),
        backgroundColor: "#2563EB",
        borderRadius: 7,
      },
    ],
  };

  const distributionEntries =
    distribution === "roles"
      ? charts.usersByRole || []
      : distribution === "courses"
        ? charts.coursesByStatus || []
        : charts.batchesByStatus || [];
  const distributionData = {
    labels: distributionEntries.map((entry) => entry.label),
    datasets: [
      {
        data: distributionEntries.map((entry) => entry.value),
        backgroundColor: distributionEntries.map((_, index) => palette[index % palette.length]),
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  };

  const quizEntries = charts.quizPerformance || [];
  const quizData = {
    labels: quizEntries.map((entry) => entry.label),
    datasets: [
      {
        label: "Attempts",
        data: quizEntries.map((entry) => entry.value),
        backgroundColor: ["#0D9488", "#F59E0B", "#E11D48"],
        borderRadius: 8,
      },
    ],
  };

  const axisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: textColor, usePointStyle: true, boxWidth: 8 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, maxRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: textColor, precision: 0 },
      },
    },
  } as const;

  return (
    <Grid templateColumns={{ base: "1fr", xl: "repeat(2, minmax(0, 1fr))" }} gap={4}>
      <ChartCard title="Growth and completion" subtitle="New users and completed enrollments over the last six months" icon={TrendingUp}>
        <Line data={trendData} options={axisOptions} />
      </ChartCard>

      <ChartCard title="Company user distribution" subtitle="Largest organizations by filtered user count" icon={BarChart3}>
        {hasData(charts.companyUserDistribution) ? (
          <Bar
            data={companyData}
            options={{
              ...axisOptions,
              indexAxis: "y",
              plugins: { legend: { display: false } },
            }}
          />
        ) : (
          <EmptyChart message="No company distribution is available for these filters." />
        )}
      </ChartCard>

      <ChartCard title="Platform distribution" subtitle="Switch between role, course, and batch status" icon={PieChart}>
        <Select
          size="xs"
          width="140px"
          position="absolute"
          top={-10}
          right={0}
          zIndex={2}
          value={distribution}
          onChange={(event) =>
            setDistribution(event.target.value as "roles" | "courses" | "batches")
          }
        >
          <option value="roles">User roles</option>
          <option value="courses">Course status</option>
          <option value="batches">Batch status</option>
        </Select>
        {hasData(distributionEntries) ? (
          <Doughnut
            data={distributionData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: "68%",
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    color: textColor,
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 14,
                  },
                },
              },
            }}
          />
        ) : (
          <EmptyChart message="No distribution data is available for this view." />
        )}
      </ChartCard>

      <ChartCard title="Assessment performance" subtitle="Quiz attempts grouped by achieved percentage" icon={Target}>
        {availability.quizPerformance && hasData(quizEntries) ? (
          <Bar
            data={quizData}
            options={{
              ...axisOptions,
              plugins: { legend: { display: false } },
            }}
          />
        ) : (
          <EmptyChart message="Quiz analytics will appear after learners submit assessments." />
        )}
      </ChartCard>
    </Grid>
  );
}
