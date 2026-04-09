"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  SimpleGrid,
  Icon,
  HStack,
  VStack,
  useColorModeValue,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  Button,
  ButtonGroup,
} from "@chakra-ui/react";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Activity,
  Globe,
  Award,
  ArrowUpRight,
  Star,
  Building2,
  GraduationCap,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
);

const MotionBox = motion(Box);

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  growth?: string;
  color: string;
  isLoading?: boolean;
}

const StatCard = ({ label, value, icon: StatIcon, growth, color, isLoading }: StatCardProps) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  return (
    <MotionBox
      whileHover={{ scale: 1.02 }}
      bg={bg}
      p={6}
      rounded="3xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <VStack align="start" spacing={4}>
        <Flex
          p={3}
          bg={`${color}.50`}
          color={`${color}.500`}
          rounded="2xl"
          align="center"
          justify="center"
        >
          <Icon as={StatIcon} boxSize={5} />
        </Flex>

        <Box>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">
            {label}
          </Text>
          {isLoading ? (
            <Spinner size="sm" mt={2} />
          ) : (
            <Text fontSize="2xl" fontWeight="bold" mt={1}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>
          )}
        </Box>

        {growth && (
          <HStack spacing={1} bg="green.50" px={2} py={1} rounded="lg">
            <Icon as={ArrowUpRight} color="green.500" boxSize={3} />
            <Text fontSize="xs" color="green.600" fontWeight="bold">
              {growth}
            </Text>
            <Text fontSize="xs" color="green.600">vs last month</Text>
          </HStack>
        )}
      </VStack>
    </MotionBox>
  );
};

const SuperAdminLMS = observer(() => {
  const sectionBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  // State for dynamic data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisView, setAnalysisView] = useState<"overview" | "courses" | "companies" | "batches">("overview");
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalBatches: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeInstructors: 0,
  });

  // State for course assignment stats
  const [courseAssignmentStats, setCourseAssignmentStats] = useState<any[]>([]);
  const [courseDistributionData, setCourseDistributionData] = useState<any>(null);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [isLoadingCourseStats, setIsLoadingCourseStats] = useState(true);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [batchStatusStats, setBatchStatusStats] = useState({
    active: 0,
    completed: 0,
    expired: 0,
  });
  const [assignmentTypeStats, setAssignmentTypeStats] = useState({
    company: 0,
    department: 0,
    user: 0,
    other: 0,
  });
  const [topCompaniesByAssignments, setTopCompaniesByAssignments] = useState<any[]>([]);
  const [topCompaniesByBatches, setTopCompaniesByBatches] = useState<any[]>([]);
  const [unassignedCourseCount, setUnassignedCourseCount] = useState(0);
  const [averageBatchSize, setAverageBatchSize] = useState(0);
  const [activeInstructorCount, setActiveInstructorCount] = useState(0);

  // Helper function to get consistent colors for categories
  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'Programming': 'rgba(124, 58, 237, 0.8)',
      'Design': 'rgba(59, 130, 246, 0.8)',
      'Marketing': 'rgba(16, 185, 129, 0.8)',
      'Business': 'rgba(245, 158, 11, 0.8)',
      'Data Science': 'rgba(236, 72, 153, 0.8)',
      'Development': 'rgba(139, 92, 246, 0.8)',
      'Uncategorized': 'rgba(156, 163, 175, 0.8)',
    };
    return colorMap[category] || `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`;
  };

  // Fetch course stats - FIXED VERSION with proper batch count calculation
  const fetchCourseStats = async () => {
    setIsLoadingCourseStats(true);

    try {
      // Fetch all courses first
      const allCourses = stores.courseStore.courses || [];
      
      if (allCourses.length === 0) {
        setCourseAssignmentStats([]);
        setCategoryStats([]);
        setIsLoadingCourseStats(false);
        return;
      }

      // Fetch assigned courses data
      let assignedCourses: any[] = [];
      try {
        await stores.courseStore.fetchAssignedCourseAccesses();
        assignedCourses = stores.courseStore.assignedCourseAccesses || [];
      } catch (err) {
        console.log("No assignment data available");
      }

      // Get batches to calculate batch counts
      const batches = stores.batchStore.batches || [];

      // Create a map for course assignments and batch counts
      const courseAssignmentsMap = new Map();

      // Initialize with all courses
      allCourses.forEach((course: any) => {
        courseAssignmentsMap.set(course._id, {
          courseId: course._id,
          title: course.title || 'Untitled Course',
          assignmentCount: 0,
          companyCount: 0,
          batchCount: 0,
          createdAt: course.createdAt,
          status: course.status || 'draft',
          rating: course.rating || 4.5,
        });
      });

      // Calculate assignment counts from assignedCourses
      if (assignedCourses.length > 0) {
        assignedCourses.forEach((assignment: any) => {
          const courseId = assignment.courseId;
          if (courseAssignmentsMap.has(courseId)) {
            const courseData = courseAssignmentsMap.get(courseId);
            courseData.assignmentCount += 1;
            
            if (assignment.company?._id) {
              courseData.companyCount += 1;
            }
          }
        });
      }

      // Calculate batch counts from batches - FIXED
      if (batches.length > 0) {
        batches.forEach((batch: any) => {
          // Check different possible field names for courses in batch
          const batchCourses = batch.courses || batch.courseIds || [];
          
          batchCourses.forEach((courseId: string) => {
            if (courseAssignmentsMap.has(courseId)) {
              const courseData = courseAssignmentsMap.get(courseId);
              courseData.batchCount += 1;
            }
          });
        });
      }

      // Convert to array and sort by assignment count
      const sortedCourses = Array.from(courseAssignmentsMap.values())
        .sort((a, b) => b.assignmentCount - a.assignmentCount);

      setCourseAssignmentStats(sortedCourses);

      // Calculate unassigned course count and top companies by assignments
      const assignedCourseIds = new Set(assignedCourses.map((assignment: any) => assignment.courseId));
      setUnassignedCourseCount(allCourses.filter((course: any) => !assignedCourseIds.has(course._id)).length);

      const companyAssignmentMap = new Map();
      const instructors = new Set<string>();
      const assignmentTypeCounts = {
        company: 0,
        department: 0,
        user: 0,
        other: 0,
      };

      assignedCourses.forEach((assignment: any) => {
        const accessType = String(assignment.assignmentType || '').toLowerCase();
        if (accessType === 'company' || accessType === 'department' || accessType === 'user') {
          assignmentTypeCounts[accessType as keyof typeof assignmentTypeCounts] += 1;
        } else {
          assignmentTypeCounts.other += 1;
        }

        const companyName = assignment.company?.company_name || 'Unassigned Company';
        if (!companyAssignmentMap.has(companyName)) {
          companyAssignmentMap.set(companyName, {
            name: companyName,
            assignments: 0,
          });
        }
        companyAssignmentMap.get(companyName).assignments += 1;

        if (assignment.assignedBy?._id) {
          instructors.add(assignment.assignedBy._id);
        }
      });

      const topCompaniesByAssignments = Array.from(companyAssignmentMap.values())
        .sort((a, b) => b.assignments - a.assignments)
        .slice(0, 3);

      setTopCompaniesByAssignments(topCompaniesByAssignments);
      setAssignmentTypeStats(assignmentTypeCounts);

      const batchCompanyMap = new Map();
      let totalUsers = 0;

      batches.forEach((batch: any) => {
        const companyName = batch.company?.company_name || 'Unknown Company';
        if (!batchCompanyMap.has(companyName)) {
          batchCompanyMap.set(companyName, {
            name: companyName,
            batches: 0,
            users: 0,
          });
        }
        const item = batchCompanyMap.get(companyName);
        item.batches += 1;
        item.users += batch.userCount || 0;

        totalUsers += batch.userCount || 0;

        if (batch.createdBy?._id) {
          instructors.add(batch.createdBy._id);
        }
      });

      const topCompaniesByBatches = Array.from(batchCompanyMap.values())
        .sort((a, b) => b.batches - a.batches)
        .slice(0, 3);

      setTopCompaniesByBatches(topCompaniesByBatches);
      setAverageBatchSize(batches.length ? Math.round(totalUsers / batches.length) : 0);
      setActiveInstructorCount(instructors.size);

      // Calculate course distribution by category
      const categoryMap = new Map();

      allCourses.forEach((course: any) => {
        const categories = course.taxonomy?.categories || ['Uncategorized'];
        const primaryCategory = categories[0] || 'Uncategorized';

        if (!categoryMap.has(primaryCategory)) {
          categoryMap.set(primaryCategory, {
            name: primaryCategory,
            count: 0,
            color: getCategoryColor(primaryCategory),
          });
        }

        categoryMap.get(primaryCategory).count += 1;
      });

      const categoryStatsArray = Array.from(categoryMap.values())
        .sort((a, b) => b.count - a.count);

      const totalCourses = allCourses.length;
      const categoriesWithPercentage = categoryStatsArray.map(cat => ({
        ...cat,
        percentage: totalCourses > 0 ? Math.round((cat.count / totalCourses) * 100) : 0,
      }));

      setCategoryStats(categoriesWithPercentage);

      // Prepare chart data
      setCourseDistributionData({
        labels: categoriesWithPercentage.map(cat => cat.name),
        datasets: [
          {
            data: categoriesWithPercentage.map(cat => cat.count),
            backgroundColor: categoriesWithPercentage.map(cat => cat.color),
            borderWidth: 0,
            hoverOffset: 10,
          },
        ],
      });

    } catch (error) {
      console.error("Error fetching course stats:", error);
      setCourseAssignmentStats([]);
      setCategoryStats([]);
    } finally {
      setIsLoadingCourseStats(false);
    }
  };

  // Fetch batch status stats
  const fetchBatchStats = async () => {
    try {
      const batches = stores.batchStore.batches || [];
      const active = batches.filter((b: any) => b.status === 'active').length;
      const completed = batches.filter((b: any) => b.status === 'completed').length;
      const expired = batches.filter((b: any) => b.status === 'expired' || b.isExpired).length;

      setBatchStatusStats({ active, completed, expired });
    } catch (error) {
      console.error("Error fetching batch stats:", error);
    }
  };

  // Generate revenue data from course prices
  const generateRevenueData = () => {
    const courses = stores.courseStore.courses || [];
    const monthlyRevenue = [0, 0, 0, 0, 0, 0, 0];

    courses.forEach((course: any) => {
      const price = course.commerce?.amountInRupees || 0;
      const createdAt = course.createdAt ? new Date(course.createdAt) : new Date();
      const month = createdAt.getMonth();
      if (month < 7) {
        monthlyRevenue[month] += price;
      }
    });

    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      datasets: [
        {
          fill: true,
          label: "Revenue",
          data: monthlyRevenue,
          borderColor: "rgb(124, 58, 237)",
          backgroundColor: "rgba(124, 58, 237, 0.1)",
          tension: 0.4,
          pointRadius: 4,
        },
      ],
    };
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [companiesRes, batchesRes, coursesRes] = await Promise.allSettled([
          stores.companyStore.getManagedCompanies(),
          stores.batchStore.fetchBatches(),
          stores.courseStore.fetchCourses(),
        ]);

        // Process companies data
        let totalCompanies = 0;
        if (companiesRes.status === 'fulfilled') {
          totalCompanies = stores.companyStore.companies.data?.length || 0;
        } else {
          console.error("Failed to fetch companies:", companiesRes.reason);
        }

        // Process batches data
        let totalBatches = 0;
        if (batchesRes.status === 'fulfilled') {
          totalBatches = stores.batchStore.batches?.length || 0;
          await fetchBatchStats();
        } else {
          console.error("Failed to fetch batches:", batchesRes.reason);
        }

        // Process courses data
        let totalCourses = 0;
        if (coursesRes.status === 'fulfilled') {
          totalCourses = stores.courseStore.courses?.length || 0;
          setRevenueData(generateRevenueData());
          // Pass batches to fetchCourseStats
          await fetchCourseStats();
        } else {
          console.error("Failed to fetch courses:", coursesRes.reason);
        }

        // Calculate additional stats from the data
        let totalEnrollments = 0;
        let totalRevenue = 0;

        if (batchesRes.status === 'fulfilled' && stores.batchStore.batches) {
          totalEnrollments = stores.batchStore.batches.reduce(
            (sum, batch: any) => sum + (batch.userCount || 0),
            0
          );
        }

        if (coursesRes.status === 'fulfilled' && stores.courseStore.courses) {
          totalRevenue = stores.courseStore.courses.reduce((sum, course: any) => {
            return sum + (course.commerce?.amountInRupees || 0);
          }, 0);
        }

        setStats({
          totalCompanies,
          totalBatches,
          totalCourses,
          totalEnrollments,
          totalRevenue,
          activeInstructors: 1450,
        });

      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { display: false },
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8" }
      },
    },
  };

  const getAnalysisSummary = () => {
    switch (analysisView) {
      case "courses":
        return `Focus on course performance, assignment reach and category distribution to discover which content is driving demand.`;
      case "companies":
        return `Compare company adoption across batches and assignments to identify the strongest clients and engagement gaps.`;
      case "batches":
        return `Analyze batch health, average batch size, and active batches to plan new cohort launches more effectively.`;
      default:
        return `View the full SuperAdmin dashboard overview with revenue, enrollment, course and batch analytics.`;
    }
  };

  // Dynamic activities from real data
  const getActivities = () => {
    const activities = [];

    if (stores.batchStore.batches?.length > 0) {
      const recentBatch = stores.batchStore.batches[0];
      activities.push({
        type: "Batch",
        name: `New batch created: ${recentBatch.name}`,
        time: recentBatch.createdAt ? new Date(recentBatch.createdAt).toLocaleString() : "Recently",
        status: "Success",
        statusColor: "green"
      });
    }

    if (stores.courseStore.courses?.length > 0) {
      const recentCourse = stores.courseStore.courses[0];
      activities.push({
        type: "Course",
        name: `New course added: ${recentCourse.title}`,
        time: recentCourse.createdAt ? new Date(recentCourse.createdAt).toLocaleString() : "Recently",
        status: "Active",
        statusColor: "blue"
      });
    }

    if (courseAssignmentStats.length > 0) {
      activities.push({
        type: "Assignment",
        name: `${courseAssignmentStats[0].title} assigned to ${courseAssignmentStats[0].companyCount} companies`,
        time: "Recently",
        status: "Success",
        statusColor: "green"
      });
    }

    if (activities.length === 0) {
      activities.push(
        { type: "System", name: "System health check completed", time: "Just now", status: "Success", statusColor: "green" },
        { type: "Info", name: "Waiting for data synchronization", time: "Recently", status: "Pending", statusColor: "yellow" }
      );
    }

    return activities;
  };

  // Dynamic top courses from real data - UPDATED to include batchCount
  const getTopCourses = () => {
    if (courseAssignmentStats.length > 0) {
      // Sort by assignment count to get truly top courses
      const sortedByAssignments = [...courseAssignmentStats].sort((a, b) => b.assignmentCount - a.assignmentCount);
      
      return sortedByAssignments.slice(0, 5).map((course, index) => ({
        title: course.title,
        enrollments: course.assignmentCount,
        rating: course.rating || (4.5 + (index * 0.1)),
        revenue: `₹${(course.assignmentCount * 1500).toLocaleString()}`,
        batchCount: course.batchCount || 0,
      }));
    }

    if (stores.courseStore.courses?.length > 0) {
      return stores.courseStore.courses.slice(0, 5).map((course: any, index: number) => ({
        title: course.title,
        enrollments: 0,
        rating: 4.5 + (index * 0.1),
        revenue: course.commerce?.amountInRupees 
          ? `₹${course.commerce.amountInRupees.toLocaleString()}`
          : `₹${(Math.random() * 50000 + 10000).toFixed(0)}`,
        batchCount: 0,
      }));
    }

    return [
      { title: "No courses available", enrollments: 0, rating: 0, revenue: "₹0", batchCount: 0 },
    ];
  };

  if (error) {
    return (
      <Box p={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  const maxAssignments = courseAssignmentStats[0]?.assignmentCount || 1;

  return (
    <Box p={4}>
      <VStack spacing={8} align="stretch">
        {/* Modern Redesigned Header */}
        <Box
          position="relative"
          bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
          p={8}
          rounded="3xl"
          color="white"
          shadow="2xl"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={-20}
            right={-20}
            w={64}
            h={64}
            bg="whiteAlpha.200"
            rounded="full"
            filter="blur(60px)"
          />
          <Box
            position="absolute"
            bottom={-10}
            left={-10}
            w={48}
            h={48}
            bg="whiteAlpha.100"
            rounded="full"
            filter="blur(40px)"
          />

          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box position="relative" zIndex={1}>
              <HStack spacing={3} mb={3}>
                <Box p={2} bg="whiteAlpha.200" rounded="xl" backdropFilter="blur(10px)">
                  <Icon as={Globe} boxSize={5} />
                </Box>
                <Text
                  fontWeight="semibold"
                  letterSpacing="wide"
                  fontSize="sm"
                  textTransform="uppercase"
                  bg="whiteAlpha.300"
                  px={3}
                  py={1}
                  rounded="full"
                  backdropFilter="blur(10px)"
                >
                  LMS Global Overview
                </Text>
              </HStack>

              <Text fontSize="4xl" fontWeight="extrabold" letterSpacing="tight" mb={2}>
                SuperAdmin Central
              </Text>

              <HStack spacing={2} flexWrap="wrap">
                <Badge bg="green.400" color="white" px={3} py={1} rounded="full" fontSize="sm">
                  ● SYSTEM ONLINE
                </Badge>
                <Text opacity={0.9} fontSize="sm">
                  {stats.totalEnrollments.toLocaleString()} enrollments • {stats.totalCompanies} companies
                </Text>
              </HStack>
            </Box>

            <HStack spacing={4} position="relative" zIndex={1}>
              <Box bg="whiteAlpha.200" backdropFilter="blur(10px)" p={4} rounded="2xl" minW="120px">
                <Text fontSize="xs" opacity={0.8}>Active Batches</Text>
                <Text fontSize="2xl" fontWeight="bold">{batchStatusStats.active}</Text>
                <HStack spacing={1}>
                  <Icon as={ArrowUpRight} boxSize={3} />
                  <Text fontSize="xs">+{Math.round((batchStatusStats.active / (stats.totalBatches || 1)) * 100)}%</Text>
                </HStack>
              </Box>
              <Box bg="whiteAlpha.200" backdropFilter="blur(10px)" p={4} rounded="2xl" minW="120px">
                <Text fontSize="xs" opacity={0.8}>Uptime</Text>
                <Text fontSize="2xl" fontWeight="bold">99.98%</Text>
                <Text fontSize="xs" color="green.300">● Operational</Text>
              </Box>
            </HStack>
          </Flex>
        </Box>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <StatCard
            label="Total Companies"
            value={stats.totalCompanies}
            icon={Building2}
            growth="+12%"
            color="purple"
            isLoading={isLoading}
          />
          <StatCard
            label="Total Batches"
            value={stats.totalBatches}
            icon={GraduationCap}
            growth="+8%"
            color="blue"
            isLoading={isLoading}
          />
          <StatCard
            label="Total Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            growth="+15%"
            color="green"
            isLoading={isLoading}
          />
          <StatCard
            label="Total Enrollments"
            value={stats.totalEnrollments}
            icon={Users}
            growth="+22%"
            color="orange"
            isLoading={isLoading}
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mt={4}>
          <StatCard
            label="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="teal"
            isLoading={isLoading}
          />
          <StatCard
            label="Active Facilitators"
            value={activeInstructorCount}
            icon={Activity}
            color="cyan"
            isLoading={isLoading}
          />
          <StatCard
            label="Unassigned Courses"
            value={unassignedCourseCount}
            icon={BookOpen}
            color="yellow"
            isLoading={isLoadingCourseStats}
          />
          <StatCard
            label="Avg Batch Size"
            value={averageBatchSize}
            icon={TrendingUp}
            color="pink"
            isLoading={isLoading}
          />
        </SimpleGrid>

        <Box
          bg={sectionBg}
          p={6}
          rounded="3xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={4}>
            <Box>
              <Text fontWeight="bold" fontSize="lg">Analysis Options</Text>
              <Text fontSize="sm" color="gray.500">Choose a view to surface the most useful SuperAdmin insights.</Text>
            </Box>
            <ButtonGroup size="sm" variant="outline">
              {[
                { key: "overview", label: "Overview" },
                { key: "courses", label: "Courses" },
                { key: "companies", label: "Companies" },
                { key: "batches", label: "Batches" },
              ].map((option) => (
                <Button
                  key={option.key}
                  variant={analysisView === option.key ? "solid" : "outline"}
                  colorScheme={analysisView === option.key ? "purple" : "gray"}
                  onClick={() => setAnalysisView(option.key as any)}
                >
                  {option.label}
                </Button>
              ))}
            </ButtonGroup>
          </Flex>
          <Text fontSize="sm" color="gray.600">{getAnalysisSummary()}</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          <Box
            bg={sectionBg}
            p={6}
            rounded="3xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="sm"
          >
            <Text fontWeight="bold" fontSize="lg" mb={4}>Assignment Channel Mix</Text>
            <VStack align="stretch" spacing={3}>
              {Object.entries(assignmentTypeStats).map(([key, count]) => (
                <Flex key={key} justify="space-between" align="center">
                  <Text fontSize="sm" textTransform="capitalize">{key.replace(/_/g, ' ')}</Text>
                  <Badge colorScheme={count > 0 ? 'purple' : 'gray'}>{count}</Badge>
                </Flex>
              ))}
            </VStack>
          </Box>

          <Box
            bg={sectionBg}
            p={6}
            rounded="3xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="sm"
          >
            <Text fontWeight="bold" fontSize="lg" mb={4}>Top Companies by Batch Adoption</Text>
            <VStack align="stretch" spacing={3}>
              {topCompaniesByBatches.length === 0 ? (
                <Text fontSize="sm" color="gray.500">No batch adoption data available</Text>
              ) : (
                topCompaniesByBatches.map((company, idx) => (
                  <Box key={company.name} p={3} bg={useColorModeValue('gray.50', 'gray.700')} rounded="2xl">
                    <Text fontSize="sm" fontWeight="bold">{idx + 1}. {company.name}</Text>
                    <Text fontSize="xs" color="gray.500">{company.batches} batches • {company.users} users</Text>
                  </Box>
                ))
              )}
            </VStack>
          </Box>

          <Box
            bg={sectionBg}
            p={6}
            rounded="3xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="sm"
          >
            <Text fontWeight="bold" fontSize="lg" mb={4}>Top Companies by Course Assignments</Text>
            <VStack align="stretch" spacing={3}>
              {topCompaniesByAssignments.length === 0 ? (
                <Text fontSize="sm" color="gray.500">No assignment company data available</Text>
              ) : (
                topCompaniesByAssignments.map((company, idx) => (
                  <Box key={company.name} p={3} bg={useColorModeValue('gray.50', 'gray.700')} rounded="2xl">
                    <Text fontSize="sm" fontWeight="bold">{idx + 1}. {company.name}</Text>
                    <Text fontSize="xs" color="gray.500">{company.assignments} assignments</Text>
                  </Box>
                ))
              )}
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Middle Section: Dynamic Charts */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {/* Most Assigned Courses */}
          <Box
            gridColumn={{ lg: "span 2" }}
            bg={sectionBg}
            p={8}
            rounded="3xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="sm"
          >
            <Flex justify="space-between" align="center" mb={6}>
              <Box>
                <Text fontWeight="bold" fontSize="xl">Course Assignment Analytics</Text>
                <Text fontSize="sm" color="gray.500">
                  All courses with their assignment statistics
                </Text>
              </Box>
              <Badge colorScheme="purple" variant="subtle" px={3} py={1} rounded="lg">
                TOTAL: {courseAssignmentStats.length} COURSES
              </Badge>
            </Flex>

            <VStack spacing={4} align="stretch" maxH="400px" overflowY="auto" pr={2}>
              {isLoadingCourseStats ? (
                <Flex justify="center" py={8}>
                  <Spinner />
                </Flex>
              ) : courseAssignmentStats.length === 0 ? (
                <Flex justify="center" py={8}>
                  <VStack spacing={3}>
                    <Icon as={BookOpen} boxSize={12} color="gray.300" />
                    <Text color="gray.500">No courses found</Text>
                    <Text fontSize="sm" color="gray.400">Create courses to see analytics here</Text>
                  </VStack>
                </Flex>
              ) : (
                courseAssignmentStats.map((course, idx) => (
                  <Box
                    key={course.courseId || idx}
                    p={4}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    rounded="xl"
                    transition="all 0.2s"
                    _hover={{ transform: "translateX(4px)", shadow: "md" }}
                  >
                    <Flex justify="space-between" mb={3}>
                      <HStack spacing={3} flex={1}>
                        <Text fontSize="md" fontWeight="bold" color="purple.500" minW="40px">
                          #{idx + 1}
                        </Text>
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="semibold" fontSize="sm">
                            {course.title}
                          </Text>
                          <HStack spacing={3}>
                            <Badge colorScheme={course.assignmentCount > 0 ? "green" : "gray"} variant="subtle" size="sm">
                              {course.assignmentCount} Assignments
                            </Badge>
                            <Badge colorScheme={course.batchCount > 0 ? "blue" : "gray"} variant="subtle" size="sm">
                              {course.batchCount} Batches
                            </Badge>
                            <Badge colorScheme={course.companyCount > 0 ? "purple" : "gray"} variant="subtle" size="sm">
                              {course.companyCount} Companies
                            </Badge>
                          </HStack>
                        </VStack>
                      </HStack>
                    </Flex>

                    <Box bg="gray.200" rounded="full" h={2} overflow="hidden">
                      <MotionBox
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (course.assignmentCount / (maxAssignments || 1)) * 100)}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                        bg={course.assignmentCount > 0 ? "purple.500" : "gray.400"}
                        h="full"
                        rounded="full"
                      />
                    </Box>

                    <Flex justify="space-between" mt={2}>
                      <Text fontSize="xs" color="gray.500">
                        Created: {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                      </Text>
                      <Text fontSize="xs" color={course.assignmentCount > 0 ? "purple.500" : "gray.500"} fontWeight="medium">
                        {course.assignmentCount > 0
                          ? `${Math.round((course.assignmentCount / maxAssignments) * 100)}% utilization`
                          : 'No assignments yet'}
                      </Text>
                    </Flex>
                  </Box>
                ))
              )}
            </VStack>
          </Box>

          {/* Course Distribution by Category */}
          <Box
            bg={sectionBg}
            p={8}
            rounded="3xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="sm"
          >
            <Text fontWeight="bold" fontSize="xl" mb={4}>Course Categories</Text>
            <Text fontSize="sm" color="gray.500" mb={6}>
              Distribution by category
            </Text>

            {isLoadingCourseStats ? (
              <Flex justify="center" py={8}>
                <Spinner />
              </Flex>
            ) : courseDistributionData ? (
              <>
                <Box h="200px" position="relative" mb={4}>
                  <Doughnut
                    data={courseDistributionData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 10,
                            font: { size: 10 }
                          }
                        }
                      }
                    }}
                  />
                </Box>

                <VStack spacing={2} mt={4} align="stretch">
                  {categoryStats.slice(0, 5).map((cat) => (
                    <Flex key={cat.name} justify="space-between" align="center">
                      <HStack spacing={2}>
                        <Box w={2} h={2} bg={cat.color} rounded="full" />
                        <Text fontSize="xs">{cat.name}</Text>
                      </HStack>
                      <Text fontSize="xs" fontWeight="bold">
                        {cat.count} ({cat.percentage}%)
                      </Text>
                    </Flex>
                  ))}
                </VStack>

                <Divider my={3} />

                <Box textAlign="center" mt={2}>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                    {categoryStats.reduce((sum, cat) => sum + cat.count, 0)}
                  </Text>
                  <Text fontSize="xs" color="gray.500">Total Courses</Text>
                </Box>
              </>
            ) : (
              <Flex justify="center" py={8}>
                <VStack spacing={3}>
                  <Icon as={BookOpen} boxSize={12} color="gray.300" />
                  <Text color="gray.500">No category data available</Text>
                </VStack>
              </Flex>
            )}
          </Box>
        </SimpleGrid>

        {/* Activity Feed */}
        <Box
          bg={sectionBg}
          p={8}
          rounded="3xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Text fontWeight="bold" fontSize="xl">System-wide Activity</Text>
            <HStack spacing={2} cursor="pointer">
              <Text fontSize="sm" color="purple.500" fontWeight="bold">View logs</Text>
              <Icon as={TrendingUp} color="purple.500" boxSize={4} />
            </HStack>
          </Flex>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Type</Th>
                  <Th>Activity</Th>
                  <Th>Time</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {getActivities().map((activity, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Badge colorScheme={activity.statusColor === 'green' ? 'green' : activity.statusColor === 'blue' ? 'blue' : 'yellow'} variant="outline" rounded="md">
                        {activity.type}
                      </Badge>
                    </Td>
                    <Td fontWeight="medium">{activity.name}</Td>
                    <Td color="gray.500">{activity.time}</Td>
                    <Td>
                      <HStack>
                        <Icon
                          as={activity.status === 'Success' ? CheckCircle : activity.status === 'Active' ? Activity : Clock}
                          color={`${activity.statusColor}.500`}
                          boxSize={3}
                        />
                        <Text fontSize="sm">{activity.status}</Text>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* Top Performing Course - FIXED VERSION with proper batch count */}
        <Box
          bg={sectionBg}
          p={8}
          rounded="3xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Text fontWeight="bold" fontSize="xl">
                🏆 Top Performing Course
              </Text>
              <Text fontSize="sm" color="gray.500">
                Most assigned course platform-wide
              </Text>
            </Box>
            <Icon as={Award} color="yellow.500" boxSize={6} />
          </Flex>

          {isLoading || isLoadingCourseStats ? (
            <Flex justify="center" py={8}>
              <Spinner size="xl" />
            </Flex>
          ) : getTopCourses().length === 0 || getTopCourses()[0].title === "No courses available" ? (
            <Flex justify="center" py={8} direction="column" align="center">
              <Icon as={BookOpen} boxSize={12} color="gray.300" mb={3} />
              <Text color="gray.500">No course data available</Text>
            </Flex>
          ) : (
            (() => {
              const topCourse = getTopCourses()[0];
              // Use batchCount directly from topCourse
              const courseBatchCount = topCourse.batchCount || 0;
              
              return (
                <MotionBox
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  borderWidth="2px"
                  borderColor="yellow.200"
                  borderRadius="2xl"
                  overflow="hidden"
                >
                  {/* Top accent bar */}
                  <Box h={2} bgGradient="linear(90deg, #f6e05e 0%, #ed8936 100%)" />
                  
                  <Box p={6}>
                    <Flex justify="space-between" align="start" mb={4}>
                      <VStack align="start" spacing={1}>
                        <Badge colorScheme="yellow" variant="solid" rounded="full" px={3} py={1}>
                          ⭐ MOST POPULAR
                        </Badge>
                        <Text fontSize="xl" fontWeight="bold" mt={2}>
                          {topCourse.title}
                        </Text>
                      </VStack>
                      <Box
                        bg="yellow.100"
                        p={3}
                        rounded="full"
                      >
                        <Icon as={Award} color="yellow.600" boxSize={6} />
                      </Box>
                    </Flex>
                    
                    <SimpleGrid columns={4} spacing={4} mt={4} py={4} borderY="1px" borderColor={useColorModeValue("gray.100", "gray.700")}>
                      <Box textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                          {topCourse.enrollments}
                        </Text>
                        <Text fontSize="xs" color="gray.500">Total Assignments</Text>
                      </Box>
                      <Box textAlign="center">
                        <HStack justify="center" spacing={1}>
                          <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                            {topCourse.rating}
                          </Text>
                          <Icon as={Star} color="yellow.400" boxSize={5} />
                        </HStack>
                        <Text fontSize="xs" color="gray.500">Rating</Text>
                      </Box>
                      <Box textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                          {courseBatchCount}
                        </Text>
                        <Text fontSize="xs" color="gray.500">Batches</Text>
                      </Box>
                      <Box textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="green.600">
                          {topCourse.revenue}
                        </Text>
                        <Text fontSize="xs" color="gray.500">Revenue</Text>
                      </Box>
                    </SimpleGrid>
                    
                    {/* Show message if no batches */}
                    {courseBatchCount === 0 && (
                      <Box mt={3} p={2} bg="blue.50" rounded="lg">
                        <Text fontSize="xs" color="blue.600" textAlign="center">
                          ℹ️ This course is not yet added to any batch
                        </Text>
                      </Box>
                    )}
                    
                    <Flex justify="space-between" align="center" mt={4}>
                      <HStack spacing={2}>
                        <Box w={2} h={2} bg={courseBatchCount > 0 ? "green.500" : "yellow.500"} rounded="full" />
                        <Text fontSize="xs" color="gray.500">
                          {courseBatchCount > 0 ? "Active & Performing" : "Ready for batch assignment"}
                        </Text>
                      </HStack>
                      <HStack spacing={1} color="purple.500">
                        <Text fontSize="sm" fontWeight="bold">View Details</Text>
                        <Icon as={ArrowUpRight} boxSize={4} />
                      </HStack>
                    </Flex>
                  </Box>
                </MotionBox>
              );
            })()
          )}
        </Box>

        {/* Last Batch Data Table */}
        <Box
          bg={sectionBg}
          p={8}
          rounded="3xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Text fontWeight="bold" fontSize="xl">Recent Batches</Text>
              <Text fontSize="sm" color="gray.500">
                Latest batches created across all companies
              </Text>
            </Box>
            <Badge colorScheme="purple" variant="subtle" px={3} py={1} rounded="lg">
              TOTAL: {stores.batchStore.batches?.length || 0} BATCHES
            </Badge>
          </Flex>

          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Batch Name</Th>
                  <Th>Company</Th>
                  <Th>Courses</Th>
                  <Th>Users</Th>
                  <Th>Start Date</Th>
                  <Th>End Date</Th>
                  <Th>Status</Th>
                  <Th>Created By</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={8}>
                      <Spinner size="md" />
                    </Td>
                  </Tr>
                ) : stores.batchStore.batches?.length === 0 ? (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={8}>
                      <VStack spacing={2}>
                        <Icon as={GraduationCap} boxSize={8} color="gray.300" />
                        <Text color="gray.500">No batches found</Text>
                        <Text fontSize="sm" color="gray.400">Create a batch to see it here</Text>
                      </VStack>
                    </Td>
                  </Tr>
                ) : (
                  stores.batchStore.batches.slice(0, 10).map((batch: any) => (
                    <Tr key={batch._id} _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
                      <Td>
                        <Text fontWeight="medium" fontSize="sm">
                          {batch.name}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="purple" variant="subtle" size="sm">
                          {batch.company?.company_name || 'N/A'}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue" variant="subtle">
                          {batch.courseCount || 0} Courses
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme="green" variant="subtle">
                          {batch.userCount || 0} Users
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A'}
                        </Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            batch.status === 'active' ? 'green' :
                              batch.status === 'completed' ? 'blue' :
                                batch.status === 'expired' ? 'red' : 'yellow'
                          }
                          variant="solid"
                          size="sm"
                          px={2}
                          py={1}
                          rounded="full"
                        >
                          {batch.status === 'active' ? '● Active' :
                            batch.status === 'completed' ? '✓ Completed' :
                              batch.status === 'expired' ? '✗ Expired' : '⚠ Expiring Soon'}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {batch.createdBy?.name || batch.createdBy?.username || 'System'}
                        </Text>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>

          {stores.batchStore.batches?.length > 10 && (
            <Flex justify="center" mt={4}>
              <Button
                variant="link"
                colorScheme="purple"
                rightIcon={<Icon as={ArrowUpRight} boxSize={4} />}
              >
                View All {stores.batchStore.batches.length} Batches
              </Button>
            </Flex>
          )}
        </Box>
      </VStack>
    </Box>
  );
});

export default SuperAdminLMS;