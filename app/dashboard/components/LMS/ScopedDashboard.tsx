"use client";

import StatCard, { StatCardProps } from "@/app/component/common/StatCard/StatCard";
import stores from "@/app/store/stores";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Skeleton,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import {
  FiActivity,
  FiAlertCircle,
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiGrid,
  FiLayers,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { DailyRegistrationChart } from "./components/scoped-dashboard/DailyRegistrationChart";
import { DashboardCharts } from "./components/scoped-dashboard/DashboardCharts";
import { DashboardFilters } from "./components/scoped-dashboard/DashboardFilters";
import { RevenueAnalytics } from "./components/scoped-dashboard/RevenueAnalytics";
import {
  EMPTY_SCOPED_FILTERS,
  ScopedDashboardFilters,
  ScopedDashboardSummary,
} from "./components/scoped-dashboard/types";
import { SuperadminDashboard } from "./components/superadmin-dashboard/SuperadminDashboard";
import { SuperadminDashboardSummary } from "./components/superadmin-dashboard/types";


function DashboardSkeleton() {
  return (
    <Stack spacing={4}>
      <Skeleton h="132px" borderRadius="2xl" />
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} h="112px" borderRadius="xl" />
        ))}
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
        <Skeleton h="300px" borderRadius="xl" />
        <Skeleton h="300px" borderRadius="xl" />
      </SimpleGrid>
    </Stack>
  );
}

const ScopedDashboard = observer(() => {
  const {
    dashboardStore: { fetchScopedSummary, scopedSummary, scopedSummaryError, scopedSummaryLoading },
  } = stores;
  const [draftFilters, setDraftFilters] =
    useState<ScopedDashboardFilters>(EMPTY_SCOPED_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<ScopedDashboardFilters>(EMPTY_SCOPED_FILTERS);

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const heroBg = useColorModeValue("white", "gray.800");
  const heroBorder = useColorModeValue("gray.200", "gray.700");
  const summary = scopedSummary as ScopedDashboardSummary | SuperadminDashboardSummary | null;
  const role = String(summary?.role || "").toLowerCase();

  useEffect(() => {
    const params = Object.fromEntries(
      Object.entries(appliedFilters).filter(([, value]) => Boolean(value))
    );
    fetchScopedSummary(params).catch(() => undefined);
  }, [appliedFilters, fetchScopedSummary]);

  if (scopedSummaryLoading && !summary) {
    return <DashboardSkeleton />;
  }

  if (scopedSummaryError && !summary) {
    return (
      <Box p={{ base: 3, md: 6 }}>
        <Alert status="error" borderRadius="xl">
          <AlertIcon />
          <Box flex={1}>
            <AlertTitle>Unable to load dashboard</AlertTitle>
            <AlertDescription>{scopedSummaryError}</AlertDescription>
          </Box>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiRefreshCw />}
            onClick={() => fetchScopedSummary().catch(() => undefined)}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  if (role === "superadmin" && summary) {
    return (
      <SuperadminDashboard
        summary={summary as SuperadminDashboardSummary}
        isLoading={scopedSummaryLoading}
        error={scopedSummaryError}
        onRefresh={fetchScopedSummary}
      />
    );
  }

  if (!summary || !["admin", "departmenthead"].includes(role)) {
    return <DashboardSkeleton />;
  }

  const scoped = summary as ScopedDashboardSummary;
  const scope = scoped.scope || {};
  const stats = scoped.stats || {};
  const isAdmin = role === "admin";
  const completionRate =
    typeof stats.completionRate === "number" ? `${stats.completionRate}%` : "No data";
  const averageProgress =
    typeof stats.averageProgress === "number" ? `${stats.averageProgress}%` : "No data";
  const averageQuizScore =
    typeof stats.averageQuizScore === "number" ? `${stats.averageQuizScore}%` : "No data";

  const statCards: StatCardProps[] = isAdmin
    ? [
        {
          label: "Company users",
          value: stats.totalUsers || 0,
          helper: `${stats.activeUsers || 0} active`,
          icon: FiUsers,
          colorScheme: "purple",
        },
        {
          label: "Departments",
          value: stats.totalDepartments || 0,
          helper: "Company structure",
          icon: FiLayers,
          colorScheme: "blue",
        },
        {
          label: "Courses",
          value: stats.totalCourses || 0,
          helper: `${stats.publishedCourses || 0} published`,
          icon: FiBookOpen,
          colorScheme: "teal",
        },
        {
          label: "Completion rate",
          value: completionRate,
          helper: `${stats.completedEnrollments || 0} completions`,
          icon: FiCheckCircle,
          colorScheme: "green",
        },
        {
          label: "Average progress",
          value: averageProgress,
          helper: `${stats.totalEnrollments || 0} enrollments`,
          icon: FiTrendingUp,
          colorScheme: "purple",
        },
        {
          label: "Active batches",
          value: stats.activeBatches || 0,
          helper: `${stats.totalBatches || 0} total batches`,
          icon: FiGrid,
          colorScheme: "orange",
        },
        {
          label: "Quiz average",
          value: averageQuizScore,
          helper: `${stats.quizAttempts || 0} attempts`,
          icon: FiTarget,
          colorScheme: "pink",
        },
        {
          label: "Needs attention",
          value: stats.lowEngagementUsers || 0,
          helper: `${stats.pendingCompletions || 0} pending`,
          icon: FiAlertCircle,
          colorScheme: "red",
        },
      ]
    : [
        {
          label: "Department users",
          value: stats.totalUsers || 0,
          helper: `${stats.activeUsers || 0} active`,
          icon: FiUsers,
          colorScheme: "teal",
        },
        {
          label: "Assigned courses",
          value: stats.totalCourses || 0,
          helper: `${stats.publishedCourses || 0} published`,
          icon: FiBookOpen,
          colorScheme: "blue",
        },
        {
          label: "Completion rate",
          value: completionRate,
          helper: `${stats.completedEnrollments || 0} complete`,
          icon: FiCheckCircle,
          colorScheme: "green",
        },
        {
          label: "Pending courses",
          value: stats.pendingCompletions || 0,
          helper: "Still to complete",
          icon: FiClock,
          colorScheme: "orange",
        },
        {
          label: "Average progress",
          value: averageProgress,
          helper: `${stats.totalEnrollments || 0} enrollments`,
          icon: FiTrendingUp,
          colorScheme: "purple",
        },
        {
          label: "Quiz average",
          value: averageQuizScore,
          helper: `${stats.quizAttempts || 0} attempts`,
          icon: FiTarget,
          colorScheme: "pink",
        },
        {
          label: "Learners at risk",
          value: stats.lowEngagementUsers || 0,
          helper: "Inactive for 30+ days",
          icon: FiAlertCircle,
          colorScheme: "red",
        },
        {
          label: "Upcoming deadlines",
          value: stats.expiringItems || 0,
          helper: "Within 30 days",
          icon: FiActivity,
          colorScheme: "orange",
        },
      ];

  const companyThemeColor =
    scope.primaryThemeColor ||
    stores.auth?.user?.companyDetails?.primaryThemeColor ||
    "#6269FF";

  const dashboardTitle = isAdmin ? scope.companyName || "COMPANY DASHBOARD" : scope.departmentName || "DEPARTMENT DASHBOARD";
  const titleWords = dashboardTitle.split(" ");
  const titleFirstWord = titleWords[0] || "";
  const titleRest = titleWords.slice(1).join(" ");

  return (
<Box
  bg="transparent"
  px={{ base: 3, md: 0 }}
  py={{ base: 2, md: 0 }}
>
  <Stack spacing={{ base: 4, md: 5 }}>
    <Box
      position="relative"
      overflow="hidden"
      bg={useColorModeValue("white", "gray.800")}
      borderWidth="1px"
      borderColor={heroBorder}
      borderRadius={{ base: "2xl", md: "24px" }}
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 5 }}
      boxShadow={useColorModeValue(
        "0 6px 24px rgba(15, 23, 42, 0.06)",
        "0 6px 24px rgba(0, 0, 0, 0.22)"
      )}
      _before={{
        content: '""',
        position: "absolute",
        top: "-70px",
        right: "-50px",
        w: "180px",
        h: "180px",
        borderRadius: "full",
        bgGradient: `linear(to-br, ${companyThemeColor}20, blue.100)`,
        opacity: useColorModeValue(0.5, 0.06),
        pointerEvents: "none",
      }}
    >
      <Flex
        position="relative"
        zIndex={1}
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        gap={{ base: 4, md: 5 }}
      >
        <HStack
          spacing={{ base: 3, md: 4 }}
          align="center"
          minW={0}
        >
          <Flex
            w={{ base: "42px", md: "48px" }}
            h={{ base: "42px", md: "48px" }}
            flexShrink={0}
            align="center"
            justify="center"
            bg={companyThemeColor}
            // bgGradient={`linear(to-br, ${companyThemeColor})`}
            borderRadius={{ base: "xl", md: "2xl" }}
            boxShadow={`0 8px 20px ${companyThemeColor}44`}
          >
            <Icon
              as={isAdmin ? FiBriefcase : FiLayers}
              boxSize={{ base: 4, md: 5 }}
              color="white"
            />
          </Flex>

          <Box minW={0}>
            <Heading
              fontSize={{ base: "lg", md: "2xl" }}
              fontWeight="800"
              letterSpacing="-0.03em"
              lineHeight="1.15"
            >
              <Box
                as="span"
                color={useColorModeValue("gray.900", "white")}
              >
                {titleFirstWord}
                {titleRest ? " " : ""}
              </Box>

              {titleRest && (
                <Box
                  as="span"
                  bg={companyThemeColor}
                  // bgGradient={useColorModeValue(
                  //   `linear(to-r, ${companyThemeColor}, #8A2BE2)`,
                  //   "linear(to-r, purple.300, blue.300)"
                  // )}
                  bgClip="text"
                >
                  {titleRest}
                </Box>
              )}
            </Heading>

            <Text
              mt={1}
              maxW="650px"
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="500"
              lineHeight="1.5"
              color={useColorModeValue(
                "gray.500",
                "gray.400"
              )}
            >
              {isAdmin
                ? "Monitor learning activity, people engagement and course performance."
                : `Track learning progress and engagement inside ${
                    scope.companyName || "your company"
                  }.`}
            </Text>
          </Box>
        </HStack>

        <Flex
          align="center"
          justify={{
            base: "space-between",
            md: "flex-end",
          }}
          gap={2.5}
          w={{ base: "100%", md: "auto" }}
          flexShrink={0}
        >
          <Badge
            display="inline-flex"
            alignItems="center"
            px={3}
            h="36px"
            borderRadius="full"
            bg={useColorModeValue(
              "purple.50",
              "rgba(98, 105, 255, 0.12)"
            )}
            color={useColorModeValue(
              "purple.600",
              "purple.300"
            )}
            borderWidth="1px"
            borderColor={useColorModeValue(
              "purple.100",
              "whiteAlpha.100"
            )}
            fontSize="10px"
            fontWeight="800"
            letterSpacing="0.04em"
          >
            <HStack spacing={1.5}>
              <Icon as={FiTarget} boxSize={3.5} />

              <Text>
                {isAdmin ? "Company" : "Department"}
              </Text>
            </HStack>
          </Badge>
        </Flex>
      </Flex>
    </Box>

    <DashboardFilters
      role={role as "admin" | "departmenthead"}
      value={draftFilters}
      options={scoped.filterOptions}
      isLoading={scopedSummaryLoading}
      onChange={setDraftFilters}
      onApply={() => setAppliedFilters(draftFilters)}
      onClear={() => {
        setDraftFilters(EMPTY_SCOPED_FILTERS);
        setAppliedFilters(EMPTY_SCOPED_FILTERS);
      }}
    />

    {scopedSummaryError ? (
      <Alert
        status="warning"
        variant="subtle"
        borderRadius="xl"
        py={2.5}
        px={4}
      >
        <AlertIcon boxSize={4} />

        <Text fontSize="sm" fontWeight="500">
          {scopedSummaryError}. Showing the last available
          result.
        </Text>
      </Alert>
    ) : null}

    {isAdmin ? (
      <Tabs variant="soft-rounded" colorScheme="purple" lazyBehavior="unmount">
        <TabList
          bg={heroBg}
          p={1.5}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={heroBorder}
          gap={2}
        >
          <Tab
            fontSize="xs"
            fontWeight="700"
            px={4}
            py={2}
            _selected={{ bg: companyThemeColor, color: "white", boxShadow: "md" }}
          >
            <HStack spacing={2}>
              <Icon as={FiActivity} boxSize={4} />
              <Text>Overview Analytics</Text>
            </HStack>
          </Tab>
          <Tab
            fontSize="xs"
            fontWeight="700"
            px={4}
            py={2}
            _selected={{ bg: companyThemeColor, color: "white", boxShadow: "md" }}
          >
            <HStack spacing={2}>
              <Icon as={FiDollarSign} boxSize={4} />
              <Text>Revenue & Sales</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels mt={4}>
          <TabPanel p={0}>
            <Stack spacing={{ base: 4, md: 5 }}>
              <SimpleGrid
                columns={{
                  base: 1,
                  sm: 2,
                  xl: 4,
                }}
                spacing={{ base: 3, md: 4 }}
              >
                {statCards.map((card) => (
                  <StatCard key={card.label} {...card} />
                ))}
              </SimpleGrid>


              <DashboardCharts
                role={role as "admin" | "departmenthead"}
                charts={scoped.charts}
                />
              <DailyRegistrationChart
                role={role as "admin" | "departmenthead"}
                charts={scoped.charts}
                isLoading={scopedSummaryLoading}
                primaryThemeColor={companyThemeColor}
              />
            </Stack>
          </TabPanel>

          <TabPanel p={0}>
            <RevenueAnalytics
              summary={scoped}
              isLoading={scopedSummaryLoading}
              primaryThemeColor={companyThemeColor}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    ) : (
      <Stack spacing={{ base: 4, md: 5 }}>
        <SimpleGrid
          columns={{
            base: 1,
            sm: 2,
            xl: 4,
          }}
          spacing={{ base: 3, md: 4 }}
        >
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </SimpleGrid>

        <DailyRegistrationChart
          role={role as "admin" | "departmenthead"}
          charts={scoped.charts}
          isLoading={scopedSummaryLoading}
          primaryThemeColor={companyThemeColor}
        />

        <DashboardCharts
          role={role as "admin" | "departmenthead"}
          charts={scoped.charts}
        />
      </Stack>
    )}
  </Stack>
</Box>
  );
});

export default ScopedDashboard;
