"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  HStack,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useDisclosure,
  useToast,
  VStack,
  Badge,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiTrendingUp,
  FiAward,
  FiGrid,
  FiList,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import stores from "@/app/store/stores";
import { batchStore } from "@/app/store/batchStore/batchStore";
import { isLearnerRole } from "@/app/config/utils/roleAccess";
import { PERMISSION_KEYS, hasPermission } from "@/app/config/utils/permissions";
import BatchCard from "./BatchCard";
import BatchCreationModal from "./BatchCreationModal";
import BatchDetailsDrawer from "./BatchDetailsDrawer";
import GlassSearchInput from "@/app/component/common/GlassSearch/GlassSearchInput";

type BatchesWorkspaceProps = {
  courseBasePath?: string;
};

const BatchesWorkspace = observer(
  ({
    courseBasePath = "/dashboard/course/my-courses",
  }: BatchesWorkspaceProps) => {
    const { auth, companyStore } = stores;
    const role = String(auth.userType || auth.user?.role || "").toLowerCase();
    const currentUserId = String(auth.user?._id || "");
    const router = useRouter();
    const toast = useToast();
    const isLearner = isLearnerRole(role);
    const isSuperadmin = role === "superadmin";
    const canCreate = hasPermission(auth.user, PERMISSION_KEYS.MANAGE_BATCHES);
    const canManage = hasPermission(auth.user, PERMISSION_KEYS.MANAGE_BATCHES);
    const creationDisclosure = useDisclosure();
    const detailsDisclosure = useDisclosure();
    const editDisclosure = useDisclosure();
    const [editStep, setEditStep] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"card" | "table">("card");
    const [sortBy, setSortBy] = useState<"name" | "date" | "users" | "status">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const companyId = isSuperadmin
      ? companyStore.getActiveCompanyId()
      : auth.company;
    const companies = companyStore.companies.data || [];
    const activeCompany =
      companies.find((company: any) => company._id === companyId) ||
      auth.user?.companyDetails ||
      null;

    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.300");

    useEffect(() => {
      if (isSuperadmin) {
        companyStore.getManagedCompanies().catch(() => undefined);
      }
    }, [companyStore, isSuperadmin]);

    useEffect(() => {
      if (isLearner) {
        batchStore.fetchMyBatches().catch(() => undefined);
        return;
      }

      if (!companyId && isSuperadmin) {
        return;
      }

      batchStore
        .fetchBatches({ companyId: companyId || undefined })
        .catch(() => undefined);
    }, [companyId, isSuperadmin, isLearner]);

    const items = isLearner ? batchStore.myBatches : batchStore.batches;
    const isLoading = isLearner
      ? batchStore.isMyBatchesLoading
      : batchStore.isLoading;
    
    const filteredItems = useMemo(() => {
      const query = searchQuery.trim().toLowerCase();

      let filtered = items.filter((batch) => {
        const searchableText = [
          batch.name,
          batch.company?.company_name,
          batch.createdBy?.name,
          batch.createdBy?.email,
          batch.createdBy?.username,
          batch.status,
          batch.durationLabel,
          batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "",
          batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "",
          String(batch.courseCount ?? ""),
          String(batch.userCount ?? ""),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });

      // Apply sorting
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "date":
            const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
            const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
            comparison = dateA - dateB;
            break;
          case "users":
            comparison = (a.userCount || 0) - (b.userCount || 0);
            break;
          case "status":
            comparison = (a.status || "").localeCompare(b.status || "");
            break;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });

      return filtered;
    }, [items, searchQuery, sortBy, sortOrder]);

    // Calculate statistics
    const stats = useMemo(() => {
      const totalBatches = items.length;
      const activeBatches = items.filter(b => b.status === "active").length;
      const completedBatches = items.filter(b => b.status === "completed").length;
      const totalUsers = items.reduce((sum, b) => sum + (b.userCount || 0), 0);
      const totalCourses = items.reduce((sum, b) => sum + (b.courseCount || 0), 0);
      
      return {
        totalBatches,
        activeBatches,
        completedBatches,
        totalUsers,
        totalCourses,
        completionRate: totalBatches > 0 ? Math.round((completedBatches / totalBatches) * 100) : 0,
      };
    }, [items]);

    const refreshBatches = async () => {
      if (isLearner) {
        await batchStore.fetchMyBatches();
        return;
      }

      await batchStore.fetchBatches({ companyId: companyId || undefined });
    };

    const handleBatchClick = async (batchId: string) => {
      detailsDisclosure.onOpen();
      await batchStore.fetchBatchDetails(batchId).catch(() => undefined);
    };

    const handleEditOpen = (initialStep = 0) => {
      setEditStep(initialStep);
      detailsDisclosure.onClose();
      editDisclosure.onOpen();
    };

    const canDeleteActiveBatch = Boolean(
      canManage &&
      batchStore.activeBatch?._id &&
      currentUserId &&
      String(batchStore.activeBatch.createdBy?._id || "") === currentUserId
    );

    const handleDeleteBatch = async () => {
      if (!batchStore.activeBatch?._id) {
        return;
      }

      const confirmed = window.confirm(
        `Delete "${batchStore.activeBatch.name}"? Learners will lose access to this batch and its batch-based course access.`
      );
      if (!confirmed) {
        return;
      }

      try {
        await batchStore.deleteBatch(batchStore.activeBatch._id);
        toast({
          title: "Batch deleted",
          description: "The batch and its batch-based learner access have been removed.",
          status: "success",
          duration: 4000,
          position: "top-right",
        });
        detailsDisclosure.onClose();
        batchStore.clearActiveBatch();
        await refreshBatches();
      } catch (error: any) {
        toast({
          title: "Unable to delete batch",
          description: error?.message || error?.error || "Please try again.",
          status: "error",
          duration: 4500,
          position: "top-right",
        });
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "active":
          return FiCheckCircle;
        case "completed":
          return FiAward;
        default:
          return FiClock;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "active":
          return "green";
        case "completed":
          return "blue";
        default:
          return "gray";
      }
    };

    return (
      <Box
        minH="100vh"
        w="100%"
        bg={isLearner 
          ? "transparent" 
          : useColorModeValue(
              "linear-gradient(135deg, #f5f7fa 0%, #eef2f6 100%)",
              "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
            )}
        p={{ base: 4, md: 6, lg: 8 }}
      >
        <Stack spacing={6} w="100%">
          {/* Hero Header Section - Full Width */}
          <Box
            borderRadius="3xl"
            px={{ base: 5, md: 8, lg: 10 }}
            py={{ base: 6, md: 8, lg: 10 }}
            bg={
              isLearner
                ? "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)"
                : useColorModeValue(
                    "linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)",
                    "linear-gradient(135deg, #2d3748 0%, #1e3a8a 50%, #1a365d 100%)"
                  )
            }
            borderWidth="1px"
            borderColor={isLearner ? "transparent" : useColorModeValue("blue.100", "blue.900")}
            boxShadow={isLearner ? "2xl" : "xl"}
            color={isLearner ? "white" : useColorModeValue("inherit", "white")}
            position="relative"
            overflow="hidden"
            w="100%"
          >
            <Stack spacing={6} position="relative" zIndex={1} w="100%">
              <Flex
                justify="space-between"
                align={{ base: "start", md: "center" }}
                wrap="wrap"
                gap={4}
                w="100%"
              >
                <VStack align="start" spacing={3} flex={1}>
                  <HStack spacing={3} flexWrap="wrap">
                    <Icon 
                      as={FiGrid} 
                      boxSize={{ base: 6, md: 8 }} 
                      color={isLearner ? "blue.300" : "blue.600"}
                    />
                    <Heading size={{ base: "md", md: "lg" }} fontWeight="bold">
                      {isLearner ? "My Learning Batches" : "Batch Management"}
                    </Heading>
                    {stats.totalBatches > 0 && (
                      <Badge
                        colorScheme={isLearner ? "blue" : "purple"}
                        variant="solid"
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="sm"
                      >
                        {stats.totalBatches} Batches
                      </Badge>
                    )}
                  </HStack>
                  <Text
                    fontSize={{ base: "sm", md: "md" }}
                    color={isLearner ? "whiteAlpha.800" : "gray.600"}
                    maxW="3xl"
                  >
                    {isLearner
                      ? "Access your learning cohorts, track progress, and launch courses bundled in each batch"
                      : `Manage learning cohorts for ${activeCompany?.company_name || "your organization"} with intuitive controls and real-time insights`}
                  </Text>
                </VStack>

                {canCreate && !isLearner && (
                  <Button
                    leftIcon={<Icon as={FiPlus} />}
                    colorScheme="blue"
                    size={{ base: "md", md: "lg" }}
                    onClick={creationDisclosure.onOpen}
                    isDisabled={!companyId && isSuperadmin}
                    boxShadow="lg"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "xl",
                    }}
                    transition="all 0.2s"
                  >
                    Create New Batch
                  </Button>
                )}
              </Flex>

              {/* Statistics Cards - Full Width Grid */}
              {!isLearner && stats.totalBatches > 0 && (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4} pt={4} w="100%">
                  <Box
                    bg={useColorModeValue("white", "gray.800")}
                    borderRadius="2xl"
                    p={4}
                    boxShadow="md"
                    _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
                  >
                    <HStack justify="space-between">
                      <Stat>
                        <StatLabel color={useColorModeValue("gray.500", "gray.400")}>Total Batches</StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue("blue.600", "blue.400")}>
                          {stats.totalBatches}
                        </StatNumber>
                        <StatHelpText>
                          <HStack spacing={1}>
                            <Icon as={FiTrendingUp} boxSize={3} />
                            <Text>{stats.activeBatches} active</Text>
                          </HStack>
                        </StatHelpText>
                      </Stat>
                      <Box p={2} bg={useColorModeValue("blue.50", "blue.900")} borderRadius="lg" color={useColorModeValue("blue.500", "blue.300")}>
                        <Icon as={FiGrid} boxSize={6} />
                      </Box>
                    </HStack>
                  </Box>

                  <Box
                    bg={useColorModeValue("white", "gray.800")}
                    borderRadius="2xl"
                    p={4}
                    boxShadow="md"
                    _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
                  >
                    <HStack justify="space-between">
                      <Stat>
                        <StatLabel color={useColorModeValue("gray.500", "gray.400")}>Total Learners</StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue("green.600", "green.400")}>
                          {stats.totalUsers}
                        </StatNumber>
                        <StatHelpText>Across all batches</StatHelpText>
                      </Stat>
                      <Box p={2} bg={useColorModeValue("green.50", "green.900")} borderRadius="lg" color={useColorModeValue("green.500", "green.300")}>
                        <Icon as={FiUsers} boxSize={6} />
                      </Box>
                    </HStack>
                  </Box>

                  <Box
                    bg={useColorModeValue("white", "gray.800")}
                    borderRadius="2xl"
                    p={4}
                    boxShadow="md"
                    _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
                  >
                    <HStack justify="space-between">
                      <Stat>
                        <StatLabel color={useColorModeValue("gray.500", "gray.400")}>Total Courses</StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue("purple.600", "purple.400")}>
                          {stats.totalCourses}
                        </StatNumber>
                        <StatHelpText>Assigned in batches</StatHelpText>
                      </Stat>
                      <Box p={2} bg={useColorModeValue("purple.50", "purple.900")} borderRadius="lg" color={useColorModeValue("purple.500", "purple.300")}>
                        <Icon as={FiBookOpen} boxSize={6} />
                      </Box>
                    </HStack>
                  </Box>

                  <Box
                    bg={useColorModeValue("white", "gray.800")}
                    borderRadius="2xl"
                    p={4}
                    boxShadow="md"
                    _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
                  >
                    <HStack justify="space-between">
                      <Stat>
                        <StatLabel color={useColorModeValue("gray.500", "gray.400")}>Completion Rate</StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue("orange.600", "orange.400")}>
                          {stats.completionRate}%
                        </StatNumber>
                        <StatHelpText>Batches completed</StatHelpText>
                      </Stat>
                      <Box p={2} bg={useColorModeValue("orange.50", "orange.900")} borderRadius="lg" color={useColorModeValue("orange.500", "orange.300")}>
                        <Icon as={FiAward} boxSize={6} />
                      </Box>
                    </HStack>
                  </Box>

                  <Box
                    bg={useColorModeValue("white", "gray.800")}
                    borderRadius="2xl"
                    p={4}
                    boxShadow="md"
                    _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
                  >
                    <HStack justify="space-between">
                      <Stat>
                        <StatLabel color={useColorModeValue("gray.500", "gray.400")}>Active Batches</StatLabel>
                        <StatNumber fontSize="2xl" color={useColorModeValue("teal.600", "teal.400")}>
                          {stats.activeBatches}
                        </StatNumber>
                        <StatHelpText>Currently running</StatHelpText>
                      </Stat>
                      <Box p={2} bg={useColorModeValue("teal.50", "teal.900")} borderRadius="lg" color={useColorModeValue("teal.500", "teal.300")}>
                        <Icon as={FiCalendar} boxSize={6} />
                      </Box>
                    </HStack>
                  </Box>
                </SimpleGrid>
              )}

              {/* Search and Controls Section - Full Width */}
              <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "stretch", md: "center" }}
                gap={4}
                pt={isLearner ? 2 : 4}
                w="100%"
              >
                <Box flex={1} minW={{ md: "300px" }}>
                  <GlassSearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search batches by name, status, dates, or members..."
                    isLearner={isLearner}
                  />
                </Box>
                
                <HStack spacing={4}>
                  {/* View Toggle */}
                  <HStack spacing={2}>
                    <Tooltip label="Card View">
                      <IconButton
                        aria-label="Card view"
                        icon={<Icon as={FiGrid} />}
                        colorScheme={viewMode === "card" ? "blue" : "gray"}
                        variant={viewMode === "card" ? "solid" : "ghost"}
                        onClick={() => setViewMode("card")}
                        size="md"
                      />
                    </Tooltip>
                    <Tooltip label="Table View">
                      <IconButton
                        aria-label="Table view"
                        icon={<Icon as={FiList} />}
                        colorScheme={viewMode === "table" ? "blue" : "gray"}
                        variant={viewMode === "table" ? "solid" : "ghost"}
                        onClick={() => setViewMode("table")}
                        size="md"
                      />
                    </Tooltip>
                  </HStack>

                  {/* Sort Dropdown */}
                  {viewMode === "table" && (
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<Icon as={FiTrendingUp} />}
                        variant="outline"
                        size="md"
                      >
                        Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => setSortBy("name")}>Name</MenuItem>
                        <MenuItem onClick={() => setSortBy("date")}>Start Date</MenuItem>
                        <MenuItem onClick={() => setSortBy("users")}>Users Count</MenuItem>
                        <MenuItem onClick={() => setSortBy("status")}>Status</MenuItem>
                        <Divider />
                        <MenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                          Toggle Order ({sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"})
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  )}
                </HStack>
              </Flex>
            </Stack>
          </Box>

          {/* Main Content Area - Full Width */}
          {isLoading ? (
            <Flex justify="center" align="center" minH="400px" w="100%">
              <VStack spacing={4}>
                <Spinner size="xl" colorScheme="blue" thickness="4px" />
                <Text color={textColor} fontWeight="medium">
                  Loading batches...
                </Text>
              </VStack>
            </Flex>
          ) : filteredItems.length === 0 ? (
            <Box
              bg={cardBg}
              borderRadius="3xl"
              p={12}
              textAlign="center"
              borderWidth="1px"
              borderColor={borderColor}
              boxShadow="sm"
              w="100%"
            >
              <VStack spacing={4}>
                <Box
                  p={4}
                  bg={useColorModeValue("blue.50", "blue.900")}
                  borderRadius="full"
                  color={useColorModeValue("blue.500", "blue.300")}
                >
                  <Icon as={FiSearch} boxSize={8} />
                </Box>
                <Heading size="md" color={useColorModeValue("gray.700", "gray.200")}>
                  {searchQuery ? "No matching batches found" : "No batches available"}
                </Heading>
                <Text color={textColor} maxW="md">
                  {searchQuery
                    ? "Try adjusting your search terms or clear the filter to see all batches"
                    : isLearner
                    ? "You haven't been added to any batches yet"
                    : "Get started by creating your first batch"}
                </Text>
                {!isLearner && canCreate && !searchQuery && (
                  <Button
                    leftIcon={<Icon as={FiPlus} />}
                    colorScheme="blue"
                    onClick={creationDisclosure.onOpen}
                    size="lg"
                    mt={2}
                  >
                    Create Your First Batch
                  </Button>
                )}
              </VStack>
            </Box>
          ) : (
            <>
              {/* Results Summary */}
              <Flex justify="space-between" align="center" wrap="wrap" gap={3} w="100%">
                <HStack spacing={2}>
                  <Icon as={FiSearch} color="gray.400" />
                  <Text color={textColor} fontSize="sm">
                    Showing {filteredItems.length} of {items.length} batches
                  </Text>
                  {searchQuery && (
                    <Badge colorScheme="blue" borderRadius="full" px={2}>
                      Filtered
                    </Badge>
                  )}
                </HStack>
                <Text color={textColor} fontSize="sm">
                  Last updated: {new Date().toLocaleDateString()}
                </Text>
              </Flex>

              <Divider />

              {/* View Renderer - Full Width */}
              {viewMode === "card" ? (
                <SimpleGrid columns={{ base: 1, lg: 2, xl: 2 }} spacing={6} w="100%">
                  {filteredItems.map((batch) => (
                    <BatchCard
                      key={batch._id}
                      batch={batch}
                      onClick={() => handleBatchClick(batch._id)}
                      isLearner={isLearner}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Box
                  bg={cardBg}
                  borderRadius="2xl"
                  borderWidth="1px"
                  borderColor={borderColor}
                  overflowX="auto"
                  boxShadow="sm"
                  w="100%"
                >
                  <Table variant="striped" w="100%">
                    <Thead bg={useColorModeValue("gray.50", "gray.700")}>
                      <Tr>
                        <Th color={useColorModeValue("gray.700", "gray.200")}>Batch Name</Th>
                        <Th color={useColorModeValue("gray.700", "gray.200")}>Status</Th>
                        <Th color={useColorModeValue("gray.700", "gray.200")}>Start Date</Th>
                        <Th color={useColorModeValue("gray.700", "gray.200")}>End Date</Th>
                        <Th color={useColorModeValue("gray.700", "gray.200")}>Courses</Th>
                        <Th color={useColorModeValue("gray.700", "gray.200")}>Users</Th>
                        <Th color={useColorModeValue("gray.700", "gray.200")}>Created By</Th>
                        {!isLearner && <Th color={useColorModeValue("gray.700", "gray.200")}>Actions</Th>}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredItems.map((batch) => {
                        const StatusIcon = getStatusIcon(batch.status);
                        return (
                          <Tr
                            key={batch._id}
                            cursor="pointer"
                            _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                            onClick={() => handleBatchClick(batch._id)}
                          >
                            <Td fontWeight="semibold">
                              <HStack spacing={2}>
                                <Icon as={FiGrid} color={useColorModeValue("blue.500", "blue.300")} />
                                <Text>{batch.name}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={getStatusColor(batch.status)}
                                borderRadius="full"
                                px={3}
                                py={1}
                              >
                                <HStack spacing={1}>
                                  <Icon as={StatusIcon} boxSize={3} />
                                  <Text>{batch.status || "active"}</Text>
                                </HStack>
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <Icon as={FiCalendar} boxSize={3} color={useColorModeValue("gray.400", "gray.500")} />
                                <Text>
                                  {batch.startDate
                                    ? new Date(batch.startDate).toLocaleDateString()
                                    : "Not set"}
                                </Text>
                              </HStack>
                            </Td>
                            <Td>
                              {batch.endDate
                                ? new Date(batch.endDate).toLocaleDateString()
                                : "Not set"}
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <Icon as={FiBookOpen} boxSize={3} color={useColorModeValue("purple.500", "purple.300")} />
                                <Text>{batch.courseCount || 0}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <Icon as={FiUsers} boxSize={3} color={useColorModeValue("green.500", "green.300")} />
                                <Text>{batch.userCount || 0}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <Text fontSize="sm">
                                {batch.createdBy?.name ||
                                  batch.createdBy?.email ||
                                  "System"}
                              </Text>
                            </Td>
                            {!isLearner && (
                              <Td onClick={(e) => e.stopPropagation()}>
                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    icon={<Icon as={FiMoreVertical} />}
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Options"
                                  />
                                  <MenuList>
                                    <MenuItem
                                      icon={<Icon as={FiEdit2} />}
                                      onClick={() => {
                                        // batchStore.setActiveBatch(batch);
                                        handleEditOpen(0);
                                      }}
                                    >
                                      Edit Batch
                                    </MenuItem>
                                    <MenuItem
                                      icon={<Icon as={FiUserPlus} />}
                                      onClick={() => {
                                        // batchStore.setActiveBatch(batch);
                                        handleEditOpen(2);
                                      }}
                                    >
                                      Manage Users
                                    </MenuItem>
                                    <MenuItem
                                      icon={<Icon as={FiTrash2} />}
                                      color="red.500"
                                      onClick={() => {
                                        // batchStore.setActiveBatch(batch);
                                        handleDeleteBatch();
                                      }}
                                    >
                                      Delete Batch
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </Td>
                            )}
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </>
          )}
        </Stack>

        {/* Modals and Drawers */}
        <BatchDetailsDrawer
          isOpen={detailsDisclosure.isOpen}
          onClose={() => {
            detailsDisclosure.onClose();
            batchStore.clearActiveBatch();
          }}
          batch={batchStore.activeBatch}
          isLoading={batchStore.isDetailsLoading}
          canManage={canManage && !isLearner}
          canDelete={canDeleteActiveBatch}
          isLearner={isLearner}
          isDeleteLoading={batchStore.isSubmitting}
          onEditBatch={() => handleEditOpen(0)}
          onDeleteBatch={handleDeleteBatch}
          onManageUsers={() => handleEditOpen(2)}
          onOpenCourse={
            isLearner
              ? (courseId) =>
                  router.push(`${courseBasePath}?courseId=${courseId}`)
              : undefined
          }
        />

        <BatchCreationModal
          isOpen={creationDisclosure.isOpen}
          onClose={creationDisclosure.onClose}
          companyId={companyId || undefined}
          onCreated={refreshBatches}
        />

        <BatchCreationModal
          isOpen={editDisclosure.isOpen}
          onClose={editDisclosure.onClose}
          companyId={companyId || undefined}
          onCreated={async () => {
            await refreshBatches();
            if (batchStore.activeBatch?._id) {
              await batchStore.fetchBatchDetails(batchStore.activeBatch._id);
            }
          }}
          mode="edit"
          initialBatch={batchStore.activeBatch}
          initialStep={editStep}
        />
      </Box>
    );
  },
);

export default BatchesWorkspace;