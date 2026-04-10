"use client";

import React, { useState } from "react";
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
  Button,
  Input,
  Progress,
  Divider,
} from "@chakra-ui/react";
import {
  GraduationCap,
  TrendingUp,
  Users,
  Calendar,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Eye,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import stores from "../../../../../store/stores";

const MotionBox = motion(Box);

const BatchesAnalytics = observer(() => {
  const sectionBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textSecondary = useColorModeValue("gray.600", "gray.400");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const batches = stores.batchStore.batches || [];
  const courses = stores.courseStore.courses || [];

  // Calculate batch metrics
  const batchMetrics = batches.map((batch: any) => {
    const batchCourses = batch.courses || batch.courseIds || [];
    const courseCount = batchCourses.length;
    const startDate = batch.startDate ? new Date(batch.startDate) : null;
    const endDate = batch.endDate ? new Date(batch.endDate) : null;
    const now = new Date();
    
    let daysRemaining = 0;
    if (endDate) {
      daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      id: batch._id,
      name: batch.name || 'Unnamed Batch',
      company: batch.company?.company_name || 'Unassigned',
      status: batch.status || 'active',
      userCount: batch.userCount || 0,
      courseCount,
      startDate,
      endDate,
      daysRemaining,
      createdAt: batch.createdAt,
      createdBy: batch.createdBy?.name || 'System',
    };
  });

  // Filter and search
  let filteredBatches = batchMetrics.filter((b: any) => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Count by status
  const activeBatches = batches.filter((b: any) => b.status === 'active').length;
  const completedBatches = batches.filter((b: any) => b.status === 'completed').length;
  const expiredBatches = batches.filter((b: any) => b.status === 'expired' || b.isExpired).length;
  const totalBatches = batches.length;
  const totalUsers = batches.reduce((sum: number, b: any) => sum + (b.userCount || 0), 0);
  const avgBatchSize = totalBatches ? Math.round(totalUsers / totalBatches) : 0;

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack align="start" spacing={2}>
          <HStack spacing={2}>
            <Icon as={GraduationCap} boxSize={6} color="blue.600" />
            <Text fontSize="2xl" fontWeight="bold">Batches Analytics</Text>
          </HStack>
          <Text fontSize="sm" color={textSecondary}>Monitor batch performance, user distribution, and lifecycle status</Text>
        </VStack>
      </MotionBox>

      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <MotionBox
          whileHover={{ y: -2 }}
          bg={sectionBg}
          p={4}
          rounded="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <VStack align="start" spacing={2}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500">TOTAL BATCHES</Text>
            <Text fontSize="2xl" fontWeight="bold">{totalBatches}</Text>
            <Text fontSize="xs" color="gray.500">All time</Text>
          </VStack>
        </MotionBox>

        <MotionBox
          whileHover={{ y: -2 }}
          bg={sectionBg}
          p={4}
          rounded="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <VStack align="start" spacing={2}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500">ACTIVE BATCHES</Text>
            <Text fontSize="2xl" fontWeight="bold">{activeBatches}</Text>
            <HStack spacing={1}>
              <Icon as={CheckCircle} boxSize={3} color="green.500" />
              <Text fontSize="xs" color="green.600">Currently running</Text>
            </HStack>
          </VStack>
        </MotionBox>

        <MotionBox
          whileHover={{ y: -2 }}
          bg={sectionBg}
          p={4}
          rounded="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <VStack align="start" spacing={2}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500">TOTAL USERS</Text>
            <Text fontSize="2xl" fontWeight="bold">{totalUsers}</Text>
            <HStack spacing={1}>
              <Icon as={Users} boxSize={3} color="blue.500" />
              <Text fontSize="xs" color="blue.600">Enrolled</Text>
            </HStack>
          </VStack>
        </MotionBox>

        <MotionBox
          whileHover={{ y: -2 }}
          bg={sectionBg}
          p={4}
          rounded="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <VStack align="start" spacing={2}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500">AVG BATCH SIZE</Text>
            <Text fontSize="2xl" fontWeight="bold">{avgBatchSize}</Text>
            <Text fontSize="xs" color="gray.500">Users per batch</Text>
          </VStack>
        </MotionBox>
      </SimpleGrid>

      {/* Status Distribution */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <MotionBox
          whileHover={{ y: -2 }}
          bg={sectionBg}
          p={4}
          rounded="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <VStack align="start" spacing={3}>
            <Flex align="center" gap={2} w="full">
              <Icon as={CheckCircle} boxSize={4} color="green.500" />
              <Text fontSize="sm" fontWeight="bold">Active</Text>
            </Flex>
            <Box w="full">
              <Text fontSize="2xl" fontWeight="bold">{activeBatches}</Text>
              <Progress value={(activeBatches / totalBatches) * 100} size="sm" colorScheme="green" rounded="full" />
              <Text fontSize="xs" color={textSecondary} mt={1}>
                {((activeBatches / totalBatches) * 100).toFixed(0)}% of total
              </Text>
            </Box>
          </VStack>
        </MotionBox>

        <MotionBox
          whileHover={{ y: -2 }}
          bg={sectionBg}
          p={4}
          rounded="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <VStack align="start" spacing={3}>
            <Flex align="center" gap={2} w="full">
              <Icon as={CheckCircle} boxSize={4} color="blue.500" />
              <Text fontSize="sm" fontWeight="bold">Completed</Text>
            </Flex>
            <Box w="full">
              <Text fontSize="2xl" fontWeight="bold">{completedBatches}</Text>
              <Progress value={(completedBatches / totalBatches) * 100} size="sm" colorScheme="blue" rounded="full" />
              <Text fontSize="xs" color={textSecondary} mt={1}>
                {((completedBatches / totalBatches) * 100).toFixed(0)}% of total
              </Text>
            </Box>
          </VStack>
        </MotionBox>

        <MotionBox
          whileHover={{ y: -2 }}
          bg={sectionBg}
          p={4}
          rounded="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <VStack align="start" spacing={3}>
            <Flex align="center" gap={2} w="full">
              <Icon as={AlertCircle} boxSize={4} color="red.500" />
              <Text fontSize="sm" fontWeight="bold">Expired</Text>
            </Flex>
            <Box w="full">
              <Text fontSize="2xl" fontWeight="bold">{expiredBatches}</Text>
              <Progress value={(expiredBatches / totalBatches) * 100} size="sm" colorScheme="red" rounded="full" />
              <Text fontSize="xs" color={textSecondary} mt={1}>
                {((expiredBatches / totalBatches) * 100).toFixed(0)}% of total
              </Text>
            </Box>
          </VStack>
        </MotionBox>
      </SimpleGrid>

      {/* Search & Filter */}
      <MotionBox
        whileHover={{ y: -2 }}
        bg={sectionBg}
        p={5}
        rounded="lg"
        borderWidth="1px"
        borderColor={borderColor}
        shadow="sm"
      >
        <VStack spacing={4} align="stretch">
          <Text fontWeight="bold" fontSize="md">Search & Filter</Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            <Box position="relative">
              <Icon as={Search} position="absolute" left={3} top={3} color="gray.400" boxSize={4} />
              <Input
                placeholder="Search batches by name or company..."
                pl={10}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                borderRadius="lg"
              />
            </Box>

            <Box>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e0',
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </Box>
          </SimpleGrid>
        </VStack>
      </MotionBox>

      {/* Batches Table */}
      <MotionBox
        whileHover={{ y: -2 }}
        bg={sectionBg}
        p={6}
        rounded="lg"
        borderWidth="1px"
        borderColor={borderColor}
        shadow="sm"
      >
        <Flex justify="space-between" align="center" mb={5}>
          <Box>
            <Text fontWeight="bold" fontSize="md">Batches List</Text>
            <Text fontSize="xs" color={textSecondary}>Showing {filteredBatches.length} of {totalBatches} batches</Text>
          </Box>
          <Badge colorScheme="blue" variant="subtle">
            {filteredBatches.length} Results
          </Badge>
        </Flex>

        <TableContainer overflowY="auto" maxH="500px">
          <Table variant="simple" size="sm">
            <Thead position="sticky" top={0} bg={headerBg}>
              <Tr>
                <Th fontSize="xs" fontWeight="bold">Batch Name</Th>
                <Th fontSize="xs" fontWeight="bold">Company</Th>
                <Th fontSize="xs" fontWeight="bold" textAlign="center">Courses</Th>
                <Th fontSize="xs" fontWeight="bold" textAlign="center">Users</Th>
                <Th fontSize="xs" fontWeight="bold">Status</Th>
                <Th fontSize="xs" fontWeight="bold" textAlign="center">Days Left</Th>
                <Th fontSize="xs" fontWeight="bold">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredBatches.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    <VStack spacing={2}>
                      <Icon as={GraduationCap} boxSize={10} color="gray.300" />
                      <Text color={textSecondary}>No batches found</Text>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                filteredBatches.map((batch) => (
                  <Tr key={batch.id} _hover={{ bg: headerBg }}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{batch.name}</Text>
                        <Text fontSize="xs" color={textSecondary}>
                          {batch.startDate?.toLocaleDateString()} - {batch.endDate?.toLocaleDateString()}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm" fontWeight="medium">{batch.company}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                        {batch.courseCount}
                      </Badge>
                    </Td>
                    <Td textAlign="center">
                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                        {batch.userCount}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          batch.status === 'active' ? 'green' :
                          batch.status === 'completed' ? 'blue' :
                          'red'
                        }
                        variant="solid"
                        size="sm"
                        fontSize="xs"
                      >
                        {batch.status === 'active' ? '● Active' :
                         batch.status === 'completed' ? '✓ Done' :
                         '✗ Expired'}
                      </Badge>
                    </Td>
                    <Td textAlign="center">
                      <HStack justify="center" spacing={1}>
                        <Icon as={Clock} boxSize={3} color={batch.daysRemaining > 30 ? 'green.500' : batch.daysRemaining > 0 ? 'yellow.500' : 'red.500'} />
                        <Text fontSize="xs" fontWeight="bold">
                          {batch.daysRemaining > 0 ? batch.daysRemaining : 'Ended'}
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Button size="xs" variant="ghost" rightIcon={<Icon as={Eye} boxSize={3} />}>
                        View
                      </Button>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </MotionBox>

      {/* Batch Performance Cards */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        {/* Largest Batches */}
        <MotionBox
          whileHover={{ y: -2 }}
          bg={sectionBg}
          p={6}
          rounded="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <Flex justify="space-between" align="center" mb={5}>
            <Text fontWeight="bold" fontSize="md">Largest Batches</Text>
            <Icon as={Users} boxSize={4} color="blue.600" />
          </Flex>

          <VStack spacing={3} align="stretch">
            {[...filteredBatches]
              .sort((a, b) => b.userCount - a.userCount)
              .slice(0, 5)
              .map((batch, idx) => (
                <Box key={batch.id} p={3} bg={headerBg} rounded="md">
                  <Flex justify="space-between" align="start" mb={2}>
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="bold">{idx + 1}. {batch.name}</Text>
                      <Text fontSize="xs" color={textSecondary}>{batch.company}</Text>
                    </Box>
                    <Text fontSize="sm" fontWeight="bold" color="blue.600">{batch.userCount} users</Text>
                  </Flex>
                  <Progress 
                    value={(batch.userCount / Math.max(...filteredBatches.map(b => b.userCount), 1)) * 100} 
                    size="xs" 
                    colorScheme="blue" 
                    rounded="full" 
                  />
                </Box>
              ))}
          </VStack>
        </MotionBox>

        {/* Upcoming Completions */}
        <MotionBox
          whileHover={{ y: -2 }}
          bg={sectionBg}
          p={6}
          rounded="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <Flex justify="space-between" align="center" mb={5}>
            <Text fontWeight="bold" fontSize="md">Expiring Soon</Text>
            <Icon as={Calendar} boxSize={4} color="orange.600" />
          </Flex>

          <VStack spacing={3} align="stretch">
            {[...filteredBatches]
              .filter(b => b.daysRemaining > 0 && b.daysRemaining < 30)
              .sort((a, b) => a.daysRemaining - b.daysRemaining)
              .slice(0, 5)
              .map((batch) => (
                <Box key={batch.id} p={3} bg={headerBg} rounded="md" borderLeft="3px" borderColor="orange.500">
                  <Flex justify="space-between" align="start">
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{batch.name}</Text>
                      <Text fontSize="xs" color={textSecondary}>{batch.company}</Text>
                    </Box>
                    <VStack align="end" spacing={0}>
                      <Text fontSize="sm" fontWeight="bold" color="orange.600">{batch.daysRemaining} days</Text>
                      <Text fontSize="xs" color={textSecondary}>Ends {batch.endDate?.toLocaleDateString()}</Text>
                    </VStack>
                  </Flex>
                </Box>
              ))}
            {[...filteredBatches].filter(b => b.daysRemaining > 0 && b.daysRemaining < 30).length === 0 && (
              <Text fontSize="sm" color={textSecondary} textAlign="center" py={4}>No batches expiring soon</Text>
            )}
          </VStack>
        </MotionBox>
      </SimpleGrid>
    </VStack>
  );
});

export default BatchesAnalytics;
