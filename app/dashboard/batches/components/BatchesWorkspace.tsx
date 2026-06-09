"use client";

import GlassSearchInput from "@/app/component/common/GlassSearch/GlassSearchInput";
import { PERMISSION_KEYS, hasPermission } from "@/app/config/utils/permissions";
import { isLearnerRole } from "@/app/config/utils/roleAccess";
import { batchStore } from "@/app/store/batchStore/batchStore";
import stores from "@/app/store/stores";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Spinner,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiGrid,
  FiList,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiTrendingUp,
  FiUserPlus,
  FiUsers
} from "react-icons/fi";
import BatchCard from "./BatchCard";
import BatchCreationModal from "./BatchCreationModal";
import BatchDetailsDrawer from "./BatchDetailsDrawer";

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

    const MobileStatChip = ({
  label,
  value,
  icon,
  colorScheme,
}: {
  label: string;
  value: string | number;
  icon: any;
  colorScheme: string;
}) => {
  const bg = useColorModeValue("white", "whiteAlpha.100");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const valueColor = useColorModeValue("gray.900", "white");
  const iconColor = useColorModeValue(`${colorScheme}.500`, `${colorScheme}.300`);

  return (
    <HStack
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      rounded="full"
      px={3}
      py={2}
      spacing={2}
      shadow="sm"
      flexShrink={0}
    >
      <Icon as={icon} boxSize={3.5} color={iconColor} />

      <Text fontSize="xs" fontWeight="700" color={labelColor}>
        {label}
      </Text>

      <Text fontSize="sm" fontWeight="900" color={valueColor}>
        {value}
      </Text>
    </HStack>
  );
};

    useEffect(() => {
  if (typeof window === "undefined") return;

  const forceCardViewOnMobile = () => {
    if (window.innerWidth < 768) {
      setViewMode("card");
    }
  };

  forceCardViewOnMobile();
  window.addEventListener("resize", forceCardViewOnMobile);

  return () => window.removeEventListener("resize", forceCardViewOnMobile);
}, []);


return (
  <Box
    minH="100dvh"
    w="100%"
    bg={
      isLearner
        ? "transparent"
        : useColorModeValue(
            "linear-gradient(135deg, #f8fafc 0%, #eef2ff 48%, #f5f3ff 100%)",
            "linear-gradient(135deg, #020617 0%, #111827 48%, #172554 100%)"
          )
    }
    p={isLearner ? { base: 3, md: 6 } : { base: 0, md: 2 }}
    overflowX="hidden"
  >
    <Stack
      spacing={{ base: 3, md: 6 }}
      w="100%"
      maxW={isLearner ? "8xl" : "none"}
      mx={isLearner ? "auto" : 0}
    >
      <Box
        borderRadius={{ base: "xl", md: "2xl" }}
        px={{ base: 3, md: 8 }}
        py={{ base: 3, md: 6 }}
        bg={
          isLearner
            ? "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)"
            : useColorModeValue(
                "linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)",
                "linear-gradient(135deg, #1f2937 0%, #1e3a8a 50%, #1e293b 100%)"
              )
        }
        borderWidth="1px"
        borderColor={
          isLearner ? "transparent" : useColorModeValue("blue.100", "blue.900")
        }
        boxShadow={{ base: "sm", md: "md" }}
        color={isLearner ? "white" : useColorModeValue("inherit", "white")}
        position="relative"
        overflow="hidden"
        w="100%"
      >
        <Stack spacing={{ base: 3, md: 6 }} position="relative" zIndex={1} w="100%">
          <Flex
            justify="space-between"
            align={{ base: "center", md: "center" }}
            gap={{ base: 2, md: 4 }}
            w="100%"
          >
            <VStack align="start" spacing={{ base: 1, md: 3 }} flex={1} minW={0}>
              <HStack spacing={{ base: 2, md: 3 }} flexWrap="nowrap" w="100%">
                <Icon
                  as={FiGrid}
                  boxSize={{ base: 4, md: 6 }}
                  color={isLearner ? "blue.300" : "blue.600"}
                  flexShrink={0}
                />

                <Heading
                  size={{ base: "sm", md: "md" }}
                  fontWeight="900"
                  noOfLines={1}
                  letterSpacing="-0.03em"
                >
                  {isLearner ? "My Batches" : "Batch Management"}
                </Heading>

                {stats.totalBatches > 0 && (
                  <Badge
                    display={{ base: "none", sm: "inline-flex" }}
                    colorScheme={isLearner ? "blue" : "purple"}
                    variant="solid"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                    flexShrink={0}
                  >
                    {stats.totalBatches} Batches
                  </Badge>
                )}
              </HStack>

              <Text
                fontSize={{ base: "xs", md: "md" }}
                color={isLearner ? "whiteAlpha.800" : "gray.600"}
                maxW="3xl"
                display={{ base: "none", md: "block" }}
              >
                {isLearner
                  ? "Access your learning cohorts, track progress, and launch courses bundled in each batch."
                  : `Manage learning cohorts for ${
                      activeCompany?.company_name || "your organization"
                    } with intuitive controls and real-time insights.`}
              </Text>
            </VStack>

            {canCreate && !isLearner && (
              <Button
                leftIcon={<Icon as={FiPlus} />}
                colorScheme="blue"
                rounded="full"
                size={{ base: "sm", md: "md" }}
                onClick={creationDisclosure.onOpen}
                isDisabled={!companyId && isSuperadmin}
                px={{ base: 3, md: 5 }}
                flexShrink={0}
                _hover={{
                  transform: { base: "none", md: "translateY(-2px)" },
                  boxShadow: { base: "sm", md: "xl" },
                }}
                transition="all 0.2s"
              >
                <Text display={{ base: "none", sm: "inline" }}>Create New Batch</Text>
                <Text display={{ base: "inline", sm: "none" }}>Create</Text>
              </Button>
            )}
          </Flex>

          {!isLearner && stats.totalBatches > 0 && (
            <SimpleGrid
              display={{ base: "none", md: "grid" }}
              columns={{ md: 3, lg: 5 }}
              spacing={4}
              pt={4}
              w="100%"
            >
              <Box
                bg={useColorModeValue("white", "gray.800")}
                borderRadius="2xl"
                p={4}
                boxShadow="md"
                _hover={{
                  transform: "translateY(-2px)",
                  transition: "all 0.2s",
                }}
              >
                <HStack justify="space-between">
                  <Stat>
                    <StatLabel color={useColorModeValue("gray.500", "gray.400")}>
                      Total Batches
                    </StatLabel>
                    <StatNumber
                      fontSize="2xl"
                      color={useColorModeValue("blue.600", "blue.400")}
                    >
                      {stats.totalBatches}
                    </StatNumber>
                    <StatHelpText>
                      <HStack spacing={1}>
                        <Icon as={FiTrendingUp} boxSize={3} />
                        <Text>{stats.activeBatches} active</Text>
                      </HStack>
                    </StatHelpText>
                  </Stat>

                  <Box
                    p={2}
                    bg={useColorModeValue("blue.50", "blue.900")}
                    borderRadius="lg"
                    color={useColorModeValue("blue.500", "blue.300")}
                  >
                    <Icon as={FiGrid} boxSize={6} />
                  </Box>
                </HStack>
              </Box>

              <Box
                bg={useColorModeValue("white", "gray.800")}
                borderRadius="2xl"
                p={4}
                boxShadow="md"
                _hover={{
                  transform: "translateY(-2px)",
                  transition: "all 0.2s",
                }}
              >
                <HStack justify="space-between">
                  <Stat>
                    <StatLabel color={useColorModeValue("gray.500", "gray.400")}>
                      Total Learners
                    </StatLabel>
                    <StatNumber
                      fontSize="2xl"
                      color={useColorModeValue("green.600", "green.400")}
                    >
                      {stats.totalUsers}
                    </StatNumber>
                    <StatHelpText>Across all batches</StatHelpText>
                  </Stat>

                  <Box
                    p={2}
                    bg={useColorModeValue("green.50", "green.900")}
                    borderRadius="lg"
                    color={useColorModeValue("green.500", "green.300")}
                  >
                    <Icon as={FiUsers} boxSize={6} />
                  </Box>
                </HStack>
              </Box>

              <Box
                bg={useColorModeValue("white", "gray.800")}
                borderRadius="2xl"
                p={4}
                boxShadow="md"
                _hover={{
                  transform: "translateY(-2px)",
                  transition: "all 0.2s",
                }}
              >
                <HStack justify="space-between">
                  <Stat>
                    <StatLabel color={useColorModeValue("gray.500", "gray.400")}>
                      Total Courses
                    </StatLabel>
                    <StatNumber
                      fontSize="2xl"
                      color={useColorModeValue("purple.600", "purple.400")}
                    >
                      {stats.totalCourses}
                    </StatNumber>
                    <StatHelpText>Assigned in batches</StatHelpText>
                  </Stat>

                  <Box
                    p={2}
                    bg={useColorModeValue("purple.50", "purple.900")}
                    borderRadius="lg"
                    color={useColorModeValue("purple.500", "purple.300")}
                  >
                    <Icon as={FiBookOpen} boxSize={6} />
                  </Box>
                </HStack>
              </Box>

              <Box
                bg={useColorModeValue("white", "gray.800")}
                borderRadius="2xl"
                p={4}
                boxShadow="md"
                _hover={{
                  transform: "translateY(-2px)",
                  transition: "all 0.2s",
                }}
              >
                <HStack justify="space-between">
                  <Stat>
                    <StatLabel color={useColorModeValue("gray.500", "gray.400")}>
                      Completion Rate
                    </StatLabel>
                    <StatNumber
                      fontSize="2xl"
                      color={useColorModeValue("orange.600", "orange.400")}
                    >
                      {stats.completionRate}%
                    </StatNumber>
                    <StatHelpText>Batches completed</StatHelpText>
                  </Stat>

                  <Box
                    p={2}
                    bg={useColorModeValue("orange.50", "orange.900")}
                    borderRadius="lg"
                    color={useColorModeValue("orange.500", "orange.300")}
                  >
                    <Icon as={FiAward} boxSize={6} />
                  </Box>
                </HStack>
              </Box>

              <Box
                bg={useColorModeValue("white", "gray.800")}
                borderRadius="2xl"
                p={4}
                boxShadow="md"
                _hover={{
                  transform: "translateY(-2px)",
                  transition: "all 0.2s",
                }}
              >
                <HStack justify="space-between">
                  <Stat>
                    <StatLabel color={useColorModeValue("gray.500", "gray.400")}>
                      Active Batches
                    </StatLabel>
                    <StatNumber
                      fontSize="2xl"
                      color={useColorModeValue("teal.600", "teal.400")}
                    >
                      {stats.activeBatches}
                    </StatNumber>
                    <StatHelpText>Currently running</StatHelpText>
                  </Stat>

                  <Box
                    p={2}
                    bg={useColorModeValue("teal.50", "teal.900")}
                    borderRadius="lg"
                    color={useColorModeValue("teal.500", "teal.300")}
                  >
                    <Icon as={FiCalendar} boxSize={6} />
                  </Box>
                </HStack>
              </Box>
            </SimpleGrid>
          )}

          {!isLearner && stats.totalBatches > 0 && (
            <Box
              display={{ base: "block", md: "none" }}
              overflowX="auto"
              pb={1}
              sx={{
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                scrollbarWidth: "none",
              }}
            >
              <HStack spacing={2} minW="max-content">
                <MobileStatChip
                  label="Batches"
                  value={stats.totalBatches}
                  icon={FiGrid}
                  colorScheme="blue"
                />
                <MobileStatChip
                  label="Learners"
                  value={stats.totalUsers}
                  icon={FiUsers}
                  colorScheme="green"
                />
                <MobileStatChip
                  label="Courses"
                  value={stats.totalCourses}
                  icon={FiBookOpen}
                  colorScheme="purple"
                />
                <MobileStatChip
                  label="Active"
                  value={stats.activeBatches}
                  icon={FiCalendar}
                  colorScheme="teal"
                />
                <MobileStatChip
                  label="Done"
                  value={`${stats.completionRate}%`}
                  icon={FiAward}
                  colorScheme="orange"
                />
              </HStack>
            </Box>
          )}

          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            gap={{ base: 2, md: 4 }}
            pt={{ base: 0, md: isLearner ? 2 : 4 }}
            w="100%"
          >
            <Box flex={1} minW={{ md: "300px" }}>
              <GlassSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search batches..."
                isLearner={isLearner}
              />
            </Box>

            <HStack
              spacing={{ base: 2, md: 4 }}
              justify={{ base: "space-between", md: "flex-start" }}
              display={{ base: "none", md: "flex" }}
            >
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
                    <MenuItem
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      Toggle Order (
                      {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"})
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
            </HStack>
          </Flex>
        </Stack>
      </Box>

      {isLoading ? (
        <Flex justify="center" align="center" minH={{ base: "220px", md: "400px" }} w="100%">
          <VStack spacing={3}>
            <Spinner size={{ base: "md", md: "xl" }} colorScheme="blue" thickness="4px" />
            <Text color={textColor} fontWeight="700" fontSize={{ base: "sm", md: "md" }}>
              Loading batches...
            </Text>
          </VStack>
        </Flex>
      ) : filteredItems.length === 0 ? (
        <Box
          bg={cardBg}
          borderRadius={{ base: "2xl", md: "3xl" }}
          p={{ base: 6, md: 12 }}
          textAlign="center"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
          w="100%"
        >
          <VStack spacing={{ base: 3, md: 4 }}>
            <Box
              p={{ base: 3, md: 4 }}
              bg={useColorModeValue("blue.50", "blue.900")}
              borderRadius="full"
              color={useColorModeValue("blue.500", "blue.300")}
            >
              <Icon as={FiSearch} boxSize={{ base: 6, md: 8 }} />
            </Box>

            <Heading size={{ base: "sm", md: "md" }} color={useColorModeValue("gray.700", "gray.200")}>
              {searchQuery ? "No matching batches found" : "No batches available"}
            </Heading>

            <Text color={textColor} maxW="md" fontSize={{ base: "sm", md: "md" }}>
              {searchQuery
                ? "Try adjusting your search terms or clear the filter to see all batches."
                : isLearner
                  ? "You haven't been added to any batches yet."
                  : "Get started by creating your first batch."}
            </Text>

            {!isLearner && canCreate && !searchQuery && (
              <Button
                leftIcon={<Icon as={FiPlus} />}
                colorScheme="blue"
                onClick={creationDisclosure.onOpen}
                size={{ base: "sm", md: "lg" }}
                rounded="full"
                mt={2}
              >
                Create Your First Batch
              </Button>
            )}
          </VStack>
        </Box>
      ) : (
        <>
          <Flex
            display={{ base: "none", md: "flex" }}
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={3}
            w="100%"
          >
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

          <Divider display={{ base: "none", md: "block" }} />

          {viewMode === "card" ? (
            <SimpleGrid
              columns={{ base: 1, lg: 2, xl: 2 }}
              spacing={{ base: 3, md: 6 }}
              w="100%"
            >
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
              display={{ base: "none", md: "block" }}
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
                    {!isLearner && (
                      <Th color={useColorModeValue("gray.700", "gray.200")}>Actions</Th>
                    )}
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
                            <Icon
                              as={FiGrid}
                              color={useColorModeValue("blue.500", "blue.300")}
                            />
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
                            <Icon
                              as={FiCalendar}
                              boxSize={3}
                              color={useColorModeValue("gray.400", "gray.500")}
                            />
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
                            <Icon
                              as={FiBookOpen}
                              boxSize={3}
                              color={useColorModeValue("purple.500", "purple.300")}
                            />
                            <Text>{batch.courseCount || 0}</Text>
                          </HStack>
                        </Td>

                        <Td>
                          <HStack spacing={1}>
                            <Icon
                              as={FiUsers}
                              boxSize={3}
                              color={useColorModeValue("green.500", "green.300")}
                            />
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
                          <Td onClick={(event) => event.stopPropagation()}>
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
                                    handleEditOpen(0);
                                  }}
                                >
                                  Edit Batch
                                </MenuItem>

                                <MenuItem
                                  icon={<Icon as={FiUserPlus} />}
                                  onClick={() => {
                                    handleEditOpen(2);
                                  }}
                                >
                                  Manage Users
                                </MenuItem>

                                <MenuItem
                                  icon={<Icon as={FiTrash2} />}
                                  color="red.500"
                                  onClick={() => {
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
          ? (courseId) => router.push(`${courseBasePath}?courseId=${courseId}`)
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
