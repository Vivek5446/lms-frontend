"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Flex,
  Grid,
  Heading,
  HStack,
  Spinner,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import {
  FiActivity,
  FiBookOpen,
  FiBriefcase,
  FiGrid,
  FiLayers,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import stores from "@/app/store/stores";

const chartAccentMap: Record<string, string> = {
  purple: "purple.500",
  blue: "blue.500",
  teal: "teal.500",
  orange: "orange.500",
  green: "green.500",
};

function StatCard({
  label,
  value,
  helper,
  accent = "blue.500",
}: {
  label: string;
  value: string | number;
  helper: string;
  accent?: string;
}) {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      p={5}
      boxShadow="sm"
    >
      <Stat>
        <StatLabel color="gray.500" fontSize="sm">
          {label}
        </StatLabel>
        <StatNumber fontSize="3xl" color={accent}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </StatNumber>
        <Text mt={2} fontSize="sm" color="gray.500">
          {helper}
        </Text>
      </Stat>
    </Box>
  );
}

function MiniChart({
  title,
  entries,
  color = "blue.500",
}: {
  title: string;
  entries: Array<{ label: string; value: number }>;
  color?: string;
}) {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const trackColor = useColorModeValue("gray.100", "gray.700");
  const maxValue = Math.max(...entries.map((entry) => entry.value), 1);

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      p={5}
      boxShadow="sm"
    >
      <Heading size="sm" mb={4}>
        {title}
      </Heading>
      <Stack spacing={4}>
        {entries.length ? (
          entries.map((entry) => (
            <Box key={`${title}-${entry.label}`}>
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="sm" fontWeight="medium">
                  {entry.label}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {entry.value.toLocaleString()}
                </Text>
              </Flex>
              <Box h="9px" borderRadius="full" bg={trackColor} overflow="hidden">
                <Box
                  h="100%"
                  borderRadius="full"
                  bg={color}
                  width={`${Math.max(8, Math.round((entry.value / maxValue) * 100))}%`}
                />
              </Box>
            </Box>
          ))
        ) : (
          <Text fontSize="sm" color="gray.500">
            No chart data available yet.
          </Text>
        )}
      </Stack>
    </Box>
  );
}

function ActivityList({
  title,
  icon,
  items,
  emptyText,
}: {
  title: string;
  icon: any;
  items: Array<{
    title: string;
    subtitle?: string;
    meta?: string;
  }>;
  emptyText: string;
}) {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      p={5}
      boxShadow="sm"
    >
      <HStack spacing={3} mb={4}>
        <Box p={2} borderRadius="xl" bg="blue.50" color="blue.500">
          {icon}
        </Box>
        <Heading size="sm">{title}</Heading>
      </HStack>
      <Stack spacing={4}>
        {items.length ? (
          items.map((item, index) => (
            <Box key={`${title}-${index}`} borderBottomWidth={index === items.length - 1 ? "0" : "1px"} borderColor={borderColor} pb={index === items.length - 1 ? 0 : 4}>
              <Text fontWeight="semibold">{item.title}</Text>
              {item.subtitle ? (
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {item.subtitle}
                </Text>
              ) : null}
              {item.meta ? (
                <Text fontSize="xs" color="gray.400" mt={2}>
                  {item.meta}
                </Text>
              ) : null}
            </Box>
          ))
        ) : (
          <Text fontSize="sm" color="gray.500">
            {emptyText}
          </Text>
        )}
      </Stack>
    </Box>
  );
}

const ScopedDashboard = observer(() => {
  const {
    dashboardStore: { fetchScopedSummary, scopedSummary, scopedSummaryError, scopedSummaryLoading },
  } = stores;

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const heroBg = useColorModeValue("white", "gray.800");
  const heroBorder = useColorModeValue("gray.200", "gray.700");
  const role = String(scopedSummary?.role || "").toLowerCase();
  const scope = scopedSummary?.scope || {};
  const stats = scopedSummary?.stats || {};
  const charts = scopedSummary?.charts || {};
  const highlights = scopedSummary?.highlights || {};

  useEffect(() => {
    fetchScopedSummary().catch(() => undefined);
  }, [fetchScopedSummary]);

  const roleCopy =
    role === "superadmin"
      ? {
          title: "Platform Command Center",
          subtitle: "A platform-wide view across companies, users, courses, and batches.",
          badge: "Platform scope",
          accent: "purple.500",
        }
      : role === "admin"
        ? {
            title: scope.companyName ? `${scope.companyName} Dashboard` : "Company Dashboard",
            subtitle: "Company-only analytics for the users, courses, assignments, and batches you manage.",
            badge: "Company scope",
            accent: "blue.500",
          }
        : {
            title: scope.departmentName ? `${scope.departmentName} Department Dashboard` : "Department Dashboard",
            subtitle: "Department-only visibility for your team, learning activity, and course coverage.",
            badge: "Department scope",
            accent: "teal.500",
          };

  if (scopedSummaryLoading && !scopedSummary) {
    return (
      <Flex minH="60vh" align="center" justify="center" gap={4} bg={pageBg}>
        <Spinner size="xl" color="blue.500" />
        <Text color="gray.500">Loading dashboard summary...</Text>
      </Flex>
    );
  }

  if (scopedSummaryError) {
    return (
      <Alert status="error" borderRadius="2xl">
        <AlertIcon />
        <Box>
          <AlertTitle>Unable to load dashboard</AlertTitle>
          <AlertDescription>{scopedSummaryError}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg} p={{ base: 4, md: 6 }}>
      <Stack spacing={6}>
        <Box
          bg={heroBg}
          borderWidth="1px"
          borderColor={heroBorder}
          borderRadius="3xl"
          p={{ base: 6, md: 8 }}
          boxShadow="sm"
        >
          <Flex justify="space-between" gap={6} wrap="wrap" align="flex-start">
            <Box maxW="760px">
              <Badge colorScheme={role === "superadmin" ? "purple" : role === "admin" ? "blue" : "teal"} px={3} py={1} borderRadius="full">
                {roleCopy.badge}
              </Badge>
              <Heading mt={4} size="lg">
                {roleCopy.title}
              </Heading>
              <Text mt={3} color="gray.500" lineHeight="1.7">
                {roleCopy.subtitle}
              </Text>
            </Box>
            <VStack align="stretch" spacing={3} minW={{ base: "full", md: "260px" }}>
              {scope.companyName ? (
                <HStack spacing={3}>
                  <Box p={2} borderRadius="xl" bg="blue.50" color="blue.500">
                    <FiBriefcase />
                  </Box>
                  <Box>
                    <Text fontSize="xs" textTransform="uppercase" color="gray.500">
                      Company
                    </Text>
                    <Text fontWeight="semibold">{scope.companyName}</Text>
                  </Box>
                </HStack>
              ) : null}
              {scope.departmentName ? (
                <HStack spacing={3}>
                  <Box p={2} borderRadius="xl" bg="teal.50" color="teal.500">
                    <FiLayers />
                  </Box>
                  <Box>
                    <Text fontSize="xs" textTransform="uppercase" color="gray.500">
                      Department
                    </Text>
                    <Text fontWeight="semibold">{scope.departmentName}</Text>
                  </Box>
                </HStack>
              ) : null}
            </VStack>
          </Flex>
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap={4}>
          {role === "superadmin" ? (
            <StatCard
              label="Companies"
              value={stats.totalCompanies || 0}
              helper="Organizations currently inside your LMS network."
              accent="purple.500"
            />
          ) : null}
          <StatCard
            label="Users"
            value={stats.totalUsers || 0}
            helper={role === "departmenthead" ? "Team members inside your department scope." : "Users inside your current dashboard scope."}
            accent={roleCopy.accent}
          />
          <StatCard
            label="Courses"
            value={stats.totalCourses || 0}
            helper="Visible courses after permission and scope filtering."
            accent="blue.500"
          />
          <StatCard
            label="Assignments"
            value={stats.totalAssignments || 0}
            helper="Active course grants visible in your allowed scope."
            accent="orange.500"
          />
          <StatCard
            label="Enrollments"
            value={stats.totalEnrollments || 0}
            helper="Course enrollment records tied to your scoped users."
            accent="green.500"
          />
          <StatCard
            label="Batches"
            value={stats.totalBatches || 0}
            helper="Batches accessible within your current scope."
            accent="teal.500"
          />
          <StatCard
            label="Published Courses"
            value={stats.publishedCourses || 0}
            helper="Published courses in the scoped course library."
            accent="blue.500"
          />
          <StatCard
            label="Active Batches"
            value={stats.activeBatches || 0}
            helper="Batches currently running in the visible scope."
            accent="purple.500"
          />
        </Grid>

        <Grid templateColumns={{ base: "1fr", xl: "repeat(2, 1fr)" }} gap={4}>
          <MiniChart title="Users By Role" entries={charts.usersByRole || []} color="blue.500" />
          <MiniChart title="Courses By Status" entries={charts.coursesByStatus || []} color="green.500" />
          <MiniChart title="Batches By Status" entries={charts.batchesByStatus || []} color="orange.500" />
          <MiniChart title="Top Course Categories" entries={charts.coursesByCategory || []} color="purple.500" />
        </Grid>

        <Grid templateColumns={{ base: "1fr", xl: "repeat(3, 1fr)" }} gap={4}>
          <ActivityList
            title="Top Courses"
            icon={<FiTrendingUp />}
            items={(highlights.topCourses || []).map((course: any) => ({
              title: course.title,
              subtitle: `${course.enrollmentCount || 0} enrollments`,
              meta: `Status: ${course.status || "draft"}`,
            }))}
            emptyText="No course activity is available yet."
          />
          <ActivityList
            title="Recent Users"
            icon={<FiUsers />}
            items={(highlights.recentUsers || []).map((user: any) => ({
              title: user.name,
              subtitle: `${user.role}${user.department ? ` · ${user.department}` : ""}`,
              meta: user.email,
            }))}
            emptyText="No recent users were found in this scope."
          />
          <ActivityList
            title="Recent Batches"
            icon={<FiActivity />}
            items={(highlights.recentBatches || []).map((batch: any) => ({
              title: batch.name,
              subtitle: `${batch.userCount || 0} learners`,
              meta: `Status: ${batch.status}`,
            }))}
            emptyText="No recent batches were found in this scope."
          />
        </Grid>
      </Stack>
    </Box>
  );
});

export default ScopedDashboard;
