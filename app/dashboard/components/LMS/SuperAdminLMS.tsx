"use client";

import React from "react";
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
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";

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
  Filler
);

const MotionBox = motion(Box);

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  growth: string;
  color: string;
}

const StatCard = ({ label, value, icon: StatIcon, growth, color }: StatCardProps) => {
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
          <Text fontSize="2xl" fontWeight="bold" mt={1}>
            {value}
          </Text>
        </Box>

        <HStack spacing={1} bg="green.50" px={2} py={1} rounded="lg">
          <Icon as={ArrowUpRight} color="green.500" boxSize={3} />
          <Text fontSize="xs" color="green.600" fontWeight="bold">
            {growth}
          </Text>
          <Text fontSize="xs" color="green.600">vs last month</Text>
        </HStack>
      </VStack>
    </MotionBox>
  );
};

const SuperAdminLMS = () => {
  const sectionBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        fill: true,
        label: "Revenue",
        data: [35000, 42000, 38000, 55000, 68000, 72000, 85000],
        borderColor: "rgb(124, 58, 237)",
        backgroundColor: "rgba(124, 58, 237, 0.1)",
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const distributionData = {
    labels: ["Programming", "Design", "Marketing", "Business"],
    datasets: [
      {
        data: [45, 25, 15, 15],
        backgroundColor: [
          "rgba(124, 58, 237, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
        ],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

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

  const activities = [
    { type: "User", name: "New instructor registered", time: "2 mins ago", status: "Success" },
    { type: "Course", name: "Premium bundle published", time: "1 hour ago", status: "Active" },
    { type: "Payment", name: "Payout processed: $12k", time: "3 hours ago", status: "Completed" },
    { type: "System", name: "Weekly backup completed", time: "5 hours ago", status: "Success" },
  ];

  return (
    <Box p={4}>
      <VStack spacing={8} align="stretch">
        {/* Top Header */}
        <Flex justify="space-between" align="center" bg="purple.600" p={8} rounded="3xl" color="white" shadow="xl">
          <Box>
            <HStack spacing={2} mb={2}>
              <Icon as={Globe} boxSize={5} />
              <Text fontWeight="medium">LMS Global Overview</Text>
            </HStack>
            <Text fontSize="3xl" fontWeight="bold">SuperAdmin Central</Text>
            <Text opacity={0.8}>System health is optimal. 1,204 active users right now.</Text>
          </Box>
          <Box bg="whiteAlpha.200" p={4} rounded="2xl" border="1px" borderColor="whiteAlpha.300">
            <HStack spacing={2}>
              <Icon as={Activity} color="green.300" />
              <Text fontWeight="bold">ALIVE</Text>
            </HStack>
            <Text fontSize="xs">Uptime: 99.98%</Text>
          </Box>
        </Flex>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <StatCard
            label="Total Platform Revenue"
            value="$420,500"
            icon={DollarSign}
            growth="+22.5%"
            color="purple"
          />
          <StatCard
            label="Total Enrollments"
            value="84,200"
            icon={Users}
            growth="+15.2%"
            color="blue"
          />
          <StatCard
            label="Active Instructors"
            value="1,450"
            icon={Award}
            growth="+5.4%"
            color="orange"
          />
          <StatCard
            label="Total Courses"
            value="3,200"
            icon={BookOpen}
            growth="+12.1%"
            color="green"
          />
        </SimpleGrid>

        {/* Middle Section: Charts */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {/* Revenue Growth Chart */}
          <Box
            gridColumn={{ lg: "span 2" }}
            bg={sectionBg}
            p={8}
            rounded="3xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="sm"
          >
            <Flex justify="space-between" align="center" mb={10}>
              <Box>
                <Text fontWeight="bold" fontSize="xl">Revenue Growth</Text>
                <Text fontSize="sm" color="gray.500">Global earnings across all currencies</Text>
              </Box>
              <Badge colorScheme="purple" variant="subtle" px={3} py={1} rounded="lg">
                LAST 7 MONTHS
              </Badge>
            </Flex>
            <Box h="300px">
              <Line data={revenueData} options={chartOptions} />
            </Box>
          </Box>

          {/* Distribution Doughnut */}
          <Box
            bg={sectionBg}
            p={8}
            rounded="3xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="sm"
          >
            <Text fontWeight="bold" fontSize="xl" mb={8}>Course Categories</Text>
            <Box h="240px" position="relative">
              <Doughnut 
                data={distributionData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } 
                }} 
              />
            </Box>
          </Box>
        </SimpleGrid>

        {/* Bottom Section: Activity Feed */}
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
                {activities.map((activity, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Badge colorScheme="purple" variant="outline" rounded="md">{activity.type}</Badge>
                    </Td>
                    <Td fontWeight="medium">{activity.name}</Td>
                    <Td color="gray.500">{activity.time}</Td>
                    <Td>
                      <HStack>
                        <Box w={2} h={2} bg="green.500" rounded="full" />
                        <Text fontSize="sm">{activity.status}</Text>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </VStack>
    </Box>
  );
};

export default SuperAdminLMS;
