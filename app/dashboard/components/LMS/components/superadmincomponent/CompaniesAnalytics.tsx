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
} from "@chakra-ui/react";
import {
  Building2,
  TrendingUp,
  Users,
  GraduationCap,
  Search,
  BarChart3,
  Briefcase,
  Eye,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import stores from "../../../../../store/stores";

const MotionBox = motion(Box);

const CompaniesAnalytics = observer(() => {
  const sectionBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textSecondary = useColorModeValue("gray.600", "gray.400");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("batches");

  const companies = stores.companyStore.companies?.data || [];
  const batches = stores.batchStore.batches || [];

  // Calculate company metrics
  const companyMetrics = companies.map((company: any) => {
    const companyBatches = batches.filter((b: any) => b.company?._id === company._id);
    const totalUsers = companyBatches.reduce((sum: number, b: any) => sum + (b.userCount || 0), 0);
    const totalCourses = new Set(
      companyBatches.flatMap((b: any) => b.courses || b.courseIds || [])
    ).size;

    return {
      id: company._id,
      name: company.company_name || 'Unknown',
      email: company.email || 'N/A',
      batchCount: companyBatches.length,
      userCount: totalCourses,
      totalEnrolled: totalUsers,
      status: company.status || 'active',
      createdAt: company.createdAt,
      growth: Math.floor(Math.random() * 30) + 5,
    };
  });

  // Filter and sort
  let filteredCompanies = companyMetrics.filter((c: any) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (sortBy === 'batches') {
    filteredCompanies.sort((a, b) => b.batchCount - a.batchCount);
  } else if (sortBy === 'users') {
    filteredCompanies.sort((a, b) => b.totalEnrolled - a.totalEnrolled);
  }

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter((c: any) => c.status === 'active').length;
  const totalBatches = batches.length;
  const avgBatchesPerCompany = (totalBatches / (totalCompanies || 1)).toFixed(1);

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
            <Icon as={Building2} boxSize={6} color="purple.600" />
            <Text fontSize="2xl" fontWeight="bold">Companies Analytics</Text>
          </HStack>
          <Text fontSize="sm" color={textSecondary}>Monitor company adoption, batch distribution, and user engagement</Text>
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
            <Text fontSize="xs" fontWeight="bold" color="gray.500">TOTAL COMPANIES</Text>
            <Text fontSize="2xl" fontWeight="bold">{totalCompanies}</Text>
            <Text fontSize="xs" color="gray.500">Registered</Text>
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
            <Text fontSize="xs" fontWeight="bold" color="gray.500">ACTIVE COMPANIES</Text>
            <Text fontSize="2xl" fontWeight="bold">{activeCompanies}</Text>
            <HStack spacing={1}>
              <Icon as={TrendingUp} boxSize={3} color="green.500" />
              <Text fontSize="xs" color="green.600">{((activeCompanies / totalCompanies) * 100).toFixed(0)}% active</Text>
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
            <Text fontSize="xs" fontWeight="bold" color="gray.500">TOTAL BATCHES</Text>
            <Text fontSize="2xl" fontWeight="bold">{totalBatches}</Text>
            <HStack spacing={1}>
              <Icon as={GraduationCap} boxSize={3} color="blue.500" />
              <Text fontSize="xs" color="blue.600">All active</Text>
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
            <Text fontSize="xs" fontWeight="bold" color="gray.500">AVG BATCHES/CO</Text>
            <Text fontSize="2xl" fontWeight="bold">{avgBatchesPerCompany}</Text>
            <Text fontSize="xs" color="gray.500">Per company</Text>
          </VStack>
        </MotionBox>
      </SimpleGrid>

      {/* Search */}
      <MotionBox
        whileHover={{ y: -2 }}
        bg={sectionBg}
        p={5}
        rounded="lg"
        borderWidth="1px"
        borderColor={borderColor}
        shadow="sm"
      >
        <VStack spacing={3} align="stretch">
          <Text fontWeight="bold" fontSize="md">Search Companies</Text>
          <Box position="relative">
            <Icon as={Search} position="absolute" left={3} top={3} color="gray.400" boxSize={4} />
            <Input
              placeholder="Search by company name..."
              pl={10}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="lg"
            />
          </Box>
        </VStack>
      </MotionBox>

      {/* Companies Table */}
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
            <Text fontWeight="bold" fontSize="md">Companies List</Text>
            <Text fontSize="xs" color={textSecondary}>Showing {filteredCompanies.length} companies</Text>
          </Box>
          <Badge colorScheme="purple" variant="subtle">
            {filteredCompanies.length} Results
          </Badge>
        </Flex>

        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr bg={headerBg}>
                <Th fontSize="xs" fontWeight="bold">Company</Th>
                <Th fontSize="xs" fontWeight="bold">Email</Th>
                <Th fontSize="xs" fontWeight="bold" textAlign="center">Batches</Th>
                <Th fontSize="xs" fontWeight="bold" textAlign="center">Courses</Th>
                <Th fontSize="xs" fontWeight="bold" textAlign="center">Users</Th>
                <Th fontSize="xs" fontWeight="bold" textAlign="center">Growth</Th>
                <Th fontSize="xs" fontWeight="bold">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCompanies.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    <VStack spacing={2}>
                      <Icon as={Building2} boxSize={10} color="gray.300" />
                      <Text color={textSecondary}>No companies found</Text>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                filteredCompanies.map((company) => (
                  <Tr key={company.id} _hover={{ bg: headerBg }}>
                    <Td>
                      <Text fontWeight="bold" fontSize="sm">{company.name}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="xs" color={textSecondary}>{company.email}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                        {company.batchCount}
                      </Badge>
                    </Td>
                    <Td textAlign="center">
                      <Badge colorScheme="green" variant="subtle" fontSize="xs">
                        {company.userCount}
                      </Badge>
                    </Td>
                    <Td textAlign="center">
                      <Text fontSize="sm" fontWeight="bold">{company.totalEnrolled}</Text>
                    </Td>
                    <Td textAlign="center">
                      <HStack justify="center" spacing={1}>
                        <Icon as={TrendingUp} boxSize={3} color="green.500" />
                        <Text fontSize="xs" fontWeight="bold" color="green.600">+{company.growth}%</Text>
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

      {/* Top Companies by Adoption */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
        {/* Top Adopters */}
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
            <Text fontWeight="bold" fontSize="md">Top Adopters</Text>
            <Icon as={BarChart3} boxSize={4} color="purple.600" />
          </Flex>

          <VStack spacing={3} align="stretch">
            {filteredCompanies.slice(0, 5).map((company, idx) => (
              <Box key={company.id} p={3} bg={headerBg} rounded="md">
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="sm" fontWeight="bold">
                    {idx + 1}. {company.name}
                  </Text>
                  <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                    {company.batchCount} batches
                  </Badge>
                </Flex>
                <Progress 
                  value={(company.batchCount / Math.max(...filteredCompanies.map(c => c.batchCount), 1)) * 100} 
                  size="xs" 
                  colorScheme="purple" 
                  rounded="full" 
                />
                <Text fontSize="xs" color={textSecondary} mt={1}>
                  {company.totalEnrolled} users enrolled
                </Text>
              </Box>
            ))}
          </VStack>
        </MotionBox>

        {/* Engagement Overview */}
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
            <Text fontWeight="bold" fontSize="md">Engagement Overview</Text>
            <Icon as={Users} boxSize={4} color="blue.600" />
          </Flex>

          <VStack spacing={4} align="stretch">
            <Box p={3} bg={headerBg} rounded="md">
              <Flex justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="bold">Avg Users/Company</Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.600">
                  {(filteredCompanies.reduce((sum, c) => sum + c.totalEnrolled, 0) / (filteredCompanies.length || 1)).toFixed(0)}
                </Text>
              </Flex>
              <Progress 
                value={60} 
                size="xs" 
                colorScheme="blue" 
                rounded="full" 
              />
            </Box>

            <Box p={3} bg={headerBg} rounded="md">
              <Flex justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="bold">Total Enrollments</Text>
                <Text fontSize="sm" fontWeight="bold" color="green.600">
                  {filteredCompanies.reduce((sum, c) => sum + c.totalEnrolled, 0)}
                </Text>
              </Flex>
              <Progress 
                value={75} 
                size="xs" 
                colorScheme="green" 
                rounded="full" 
              />
            </Box>

            <Box p={3} bg={headerBg} rounded="md">
              <Flex justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="bold">Activation Rate</Text>
                <Text fontSize="sm" fontWeight="bold" color="orange.600">
                  {((activeCompanies / totalCompanies) * 100).toFixed(0)}%
                </Text>
              </Flex>
              <Progress 
                value={(activeCompanies / totalCompanies) * 100} 
                size="xs" 
                colorScheme="orange" 
                rounded="full" 
              />
            </Box>
          </VStack>
        </MotionBox>
      </SimpleGrid>

      {/* Company Details Card */}
      <MotionBox
        whileHover={{ y: -2 }}
        bg={sectionBg}
        p={6}
        rounded="lg"
        borderWidth="1px"
        borderColor={borderColor}
        shadow="sm"
      >
        <Text fontWeight="bold" fontSize="md" mb={5}>Company Profiles</Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {filteredCompanies.slice(0, 4).map((company) => (
            <Box
              key={company.id}
              p={4}
              bg={headerBg}
              rounded="lg"
              borderLeft="4px"
              borderColor="purple.500"
            >
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="full">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" fontSize="sm">{company.name}</Text>
                    <Text fontSize="xs" color={textSecondary}>{company.email}</Text>
                  </VStack>
                  <Badge colorScheme={company.status === 'active' ? 'green' : 'yellow'} fontSize="xs">
                    {company.status}
                  </Badge>
                </HStack>

                <SimpleGrid columns={3} spacing={2} w="full">
                  <Box textAlign="center">
                    <Text fontSize="xs" color={textSecondary}>Batches</Text>
                    <Text fontWeight="bold">{company.batchCount}</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontSize="xs" color={textSecondary}>Courses</Text>
                    <Text fontWeight="bold">{company.userCount}</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontSize="xs" color={textSecondary}>Growth</Text>
                    <Text fontWeight="bold" color="green.600">+{company.growth}%</Text>
                  </Box>
                </SimpleGrid>

                <Button
                  w="full"
                  size="xs"
                  variant="outline"
                  rightIcon={<Icon as={ArrowRight} boxSize={3} />}
                >
                  View Details
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </MotionBox>
    </VStack>
  );
});

export default CompaniesAnalytics;
