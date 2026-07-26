"use client";

import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Tab,
  TabList,
  Tabs,
  Text,
  Tooltip,
  VStack,
  Avatar,
  Icon,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Stack,
  useBreakpointValue,
  useColorModeValue,
  StackDivider,
} from "@chakra-ui/react";
import {
  FiBriefcase,
  FiMapPin,
  FiUser,
  FiUsers,
  FiMail,
  FiShield,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiSearch,
  FiUpload,
  FiUserPlus,
  FiEye,
  FiTrash2,
  FiEdit2,
  FiLayers
} from "react-icons/fi";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable";
import StatCard from "@/app/component/common/StatCard/StatCard";

const COLORS = ["blue", "purple", "orange", "green", "pink", "cyan", "teal", "red"];

type Props = {
  users: any[];
  loading: boolean;
  pagination: any;
  search: string;
  setSearch: (v: string) => void;
  page: number;
  setPage: (v: number) => void;
  listTabs: any[];
  listTab: string;
  setListTab: (v: string) => void;
  activeTabIndex: number;
  activeTabLabel: string;
  tableHeadBg: string;
  borderColor: string;
  muted: string;
  onEdit: (user: any) => void;
  onView: (user: any) => void;
  onDelete?: (user: any) => void;
  onToggleStatus?: (user: any) => void;
  statusUpdatingId?: string | null;
  formatRoleLabel: (role: string) => string;
  canEdit?: boolean;
  canDelete?: boolean;
  canToggleStatus?: boolean;
  // User source separation (admin self-signup)
  showUserSourceTabs?: boolean;
  userSourceTab?: "all" | "manual" | "public_enrolled";
  setUserSourceTab?: (v: "all" | "manual" | "public_enrolled") => void;
  isPublicEnrolledUser?: (user: any) => boolean;
  onOpenBulk?: () => void;
  onOpenCreate?: () => void;
  canOpenBulk?: boolean;
  canOpenCreate?: boolean;
};

const getUserStatusMeta = (user: any) => {
  if (user?.status === "INACTIVE" || user?.isEnabled === false || user?.is_enabled === false) {
    return {
      label: "Inactive",
      colorScheme: "red",
      dotColor: "red.500",
      helperText: "Login blocked",
    };
  }

  if (user?.status === "ACTIVE" || user?.isActive) {
    return {
      label: "Active",
      colorScheme: "green",
      dotColor: "green.500",
      helperText: "Can access portal",
    };
  }

  return {
    label: "Pending",
    colorScheme: "orange",
    dotColor: "orange.500",
    helperText: "Setup incomplete",
  };
};

const UsersTable = ({
  users,
  loading,
  pagination,
  search,
  setSearch,
  page,
  setPage,
  listTabs,
  setListTab,
  activeTabIndex,
  activeTabLabel,
  muted,
  onEdit,
  onView,
  onDelete,
  onToggleStatus,
  statusUpdatingId,
  formatRoleLabel,
  canEdit = true,
  canDelete = false,
  canToggleStatus = false,
  showUserSourceTabs = false,
  userSourceTab = "all",
  setUserSourceTab,
  isPublicEnrolledUser,
  onOpenBulk,
  onOpenCreate,
  canOpenBulk = false,
  canOpenCreate = false,
}: Props) => {
  // Statistics calculations
  const stats = {
    total: pagination.total || 0,
    active: users.filter((u: any) => getUserStatusMeta(u).label === "Active").length,
    inactive: users.filter((u: any) => getUserStatusMeta(u).label === "Inactive").length,
    pending: users.filter((u: any) => getUserStatusMeta(u).label === "Pending").length,
    otpEnabled: users.filter((u: any) => u.authMethod === "PHONE_OTP").length,
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColorLight = useColorModeValue("gray.100", "gray.700");
  const statNumberColor = useColorModeValue("gray.800", "white");
  const activeNumberColor = useColorModeValue("green.600", "green.400");
  const pendingNumberColor = useColorModeValue("orange.600", "orange.400");
  const secureNumberColor = useColorModeValue("purple.600", "purple.400");
  const iconBoxBg = useColorModeValue("purple.50", "gray.700");
  const iconBoxDarkBg = useColorModeValue("purple.50", "purple.900");
  const tabListBg = useColorModeValue("gray.50", "gray.700");
  const statsBg = useColorModeValue("blue.50", "blue.900");
  const statsTextColor = useColorModeValue("blue.700", "blue.200");
  const tooltipBg = useColorModeValue("gray.900", "gray.700");
  const tooltipColor = useColorModeValue("white", "white");
  const isCompact = useBreakpointValue({ base: true, lg: false }) ?? false;

  const outlineButtonBorder = useColorModeValue("purple.400", "purple.500");
  const outlineButtonColor = useColorModeValue("purple.600", "purple.300");
  const outlineButtonHoverBg = useColorModeValue("purple.50", "gray.700");
  const gradientFrom = useColorModeValue("blue.600", "blue.400");
  const gradientTo = useColorModeValue("purple.600", "purple.400");

  const columns = [
    {
      headerName: "User",
      key: "name",
      type: "component",
      width: "280px",
      metaData: {
        component: (user: any) => (
          <HStack spacing={3}>
            <Avatar
              size="sm"
              name={user.name || "User"}
              src={user.pic?.url}
              bgGradient="linear(to-br, blue.400, purple.500)"
              color="white"
              fontWeight="bold"
              fontSize="sm"
            />
            <VStack align="start" spacing={0}>
              <Text fontWeight="semibold" fontSize="sm" color={useColorModeValue("gray.800", "white")}>
                {user.name || "--"}
              </Text>
              <HStack spacing={1}>
                <Icon as={FiMail} boxSize={3} color={muted} />
                <Text fontSize="xs" color={muted}>
                  {user.email || "No email"}
                </Text>
              </HStack>
            </VStack>
          </HStack>
        ),
      },
    },
    {
      headerName: "Location",
      key: "department",
      type: "component",
      width: "200px",
      metaData: {
        component: (user: any) => (
          <VStack align="start" spacing={0.5}>
            <HStack spacing={1} fontSize="sm">
              <Icon as={FiBriefcase} boxSize={3} color="purple.500" />
              <Text fontWeight="medium" color={useColorModeValue("gray.700", "gray.200")}>
                {user.department || "--"}
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiMapPin} boxSize={3} color={muted} />
              <Text fontSize="xs" color={muted}>
                {[user.city, user.state].filter(Boolean).join(", ") || "No location"}
              </Text>
            </HStack>
          </VStack>
        ),
      },
    },

    {
      headerName: "Role",
      key: "role",
      type: "component",
      width: "140px",
      metaData: {
        component: (user: any) => (
          <Badge
            variant="solid"
            bgGradient="linear(to-r, blue.500, purple.600)"
            color="white"
            px={3}
            py={1.5}
            borderRadius="full"
            fontWeight="medium"
            fontSize="xs"
            textTransform="capitalize"
          >
            {formatRoleLabel(user.role)}
          </Badge>
        ),
      },
    },
    {
      headerName: "Manager Hierarchy",
      key: "managers",
      type: "component",
      width: "200px",
      metaData: {
        component: (user: any) => {
          const managers = user.managers || [];
          const visibleManagers = managers.slice(0, 3);
          const extraCount = managers.length - 3;

          if (managers.length === 0) {
            return (
              <HStack spacing={1}>
                <Icon as={FiUsers} boxSize={3} color={muted} />
                <Text fontSize="xs" color={muted} fontStyle="italic">
                  No managers assigned
                </Text>
              </HStack>
            );
          }

          return (
            <Tooltip
              hasArrow
              placement="top-start"
              bg={tooltipBg}
              color={tooltipColor}
              p={3}
              borderRadius="xl"
              boxShadow="xl"
              label={
                <VStack align="stretch" spacing={3}>
                  <HStack>
                    <Icon as={FiAward} size={16} />
                    <Text fontWeight="bold" fontSize="sm">
                      Reporting Hierarchy
                    </Text>
                  </HStack>
                  <Divider borderColor="gray.700" />
                  {managers.map((manager: any, index: number) => (
                    <Flex
                      key={`${user._id}-${manager.level}`}
                      justify="space-between"
                      align="center"
                      gap={3}
                    >
                      <HStack spacing={2}>
                        <Badge
                          colorScheme={COLORS[index % COLORS.length]}
                          borderRadius="full"
                          variant="solid"
                          fontSize="xs"
                          px={2}
                        >
                          L{manager.level}
                        </Badge>
                        <Text fontSize="sm">{manager.managerEmail}</Text>
                      </HStack>
                      <Badge
                        size="sm"
                        variant="subtle"
                        colorScheme={manager.status === "ASSIGNED" ? "green" : "orange"}
                      >
                        {manager.status}
                      </Badge>
                    </Flex>
                  ))}
                </VStack>
              }
            >
              <HStack spacing={1.5} cursor="pointer">
                {visibleManagers.map((manager: any, index: number) => (
                  <Badge
                    key={`${user._id}-${manager.level}`}
                    colorScheme={COLORS[index % COLORS.length]}
                    borderRadius="full"
                    px={2.5}
                    py={1}
                    fontSize="xs"
                    variant="subtle"
                  >
                    L{manager.level}
                  </Badge>
                ))}
                {extraCount > 0 && (
                  <Badge
                    variant="solid"
                    colorScheme="gray"
                    borderRadius="full"
                    px={2}
                    fontSize="xs"
                  >
                    +{extraCount}
                  </Badge>
                )}
              </HStack>
            </Tooltip>
          );
        },
      },
    },
    {
      headerName: "Status",
      key: "status",
      type: "component",
      width: "120px",
      metaData: {
        component: (user: any) => {
          const statusMeta = getUserStatusMeta(user);
          const shadowColor =
            statusMeta.colorScheme === "green"
              ? "rgba(72, 187, 120, 0.2)"
              : statusMeta.colorScheme === "red"
                ? "rgba(245, 101, 101, 0.2)"
                : "rgba(237, 137, 54, 0.2)";

          return (
            <VStack align="start" spacing={1}>
              <HStack spacing={1}>
                <Box
                  w="2"
                  h="2"
                  borderRadius="full"
                  bg={statusMeta.dotColor}
                  boxShadow={`0 0 0 2px ${shadowColor}`}
                />
                <Badge
                  variant="subtle"
                  colorScheme={statusMeta.colorScheme}
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                >
                  {statusMeta.label}
                </Badge>
              </HStack>
              <Text fontSize="10px" color={muted}>
                {statusMeta.helperText}
              </Text>
            </VStack>
          );
        },
      },
    },

    {
      headerName: "Security",
      key: "passwordStatus",
      type: "component",
      width: "120px",
      metaData: {
        component: (user: any) => (
          <Tooltip
            label="Phone number + OTP authentication"
            hasArrow
          >
            <Badge
              variant="solid"
              colorScheme="green"
              px={2.5}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              <HStack spacing={1}>
                <Icon as={FiShield} boxSize={3} />
                <Text>Phone OTP</Text>
              </HStack>
            </Badge>
          </Tooltip>
        ),
      },
    },
    {
      headerName: "Actions",
      key: "table-actions",
      type: "table-actions",
      width: "100px",
      props: {
        row: { minW: 100, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ];

  return (
    <VStack spacing={{ base: 4, md: 6 }} align="stretch">
      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 3, md: 4 }}>
        <StatCard
          label="Total Users"
          value={stats.total}
          helper="Across all roles"
          icon={FiTrendingUp}
          colorScheme="blue"
        />
        <StatCard
          label="Active Users"
          value={stats.active}
          helper={`${stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : "0"}% active rate`}
          icon={FiCheckCircle}
          colorScheme="green"
        />
        <StatCard
          label="Pending / Inactive"
          value={stats.pending + stats.inactive}
          helper={stats.inactive > 0 ? `${stats.inactive} deactivated, ${stats.pending} pending` : "Awaiting activation"}
          icon={FiClock}
          colorScheme="orange"
        />
        <StatCard
          label="Phone OTP Ready"
          value={stats.otpEnabled}
          helper={`${stats.total > 0 ? ((stats.otpEnabled / stats.total) * 100).toFixed(1) : "0"}% using OTP`}
          icon={FiShield}
          colorScheme="purple"
        />
      </SimpleGrid>

      {/* Tabs Section */}
      <Box
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColorLight}
        borderRadius="2xl"
        p={{ base: 5, md: 6 }}
        mb={6}
        boxShadow="sm"
      >
        <Flex
          justify="space-between"
          align={{ base: "stretch", sm: "center" }}
          w="100%"
          direction={{ base: "column", sm: "row" }}
          gap={{ base: 5, sm: 4 }}
        >
          {listTabs.length > 1 ? (
            <Tabs
              variant="soft-rounded"
              colorScheme="blue"
              size="sm"
              index={activeTabIndex}
              onChange={(index) => {
                setListTab(listTabs[index]?.value || "user");
                setPage(1);
              }}
            >
              <TabList gap={2} flexWrap="nowrap" overflowX="auto" bg={tabListBg} p={1} borderRadius="full">
                {listTabs.map((tab, idx) => (
                  <Tab
                    key={tab.value}
                    _selected={{
                      bgGradient: "linear(to-r, blue.500, purple.600)",
                      color: "white",
                      boxShadow: "md",
                    }}
                    borderRadius="full"
                    px={{ base: 4, md: 6 }}
                    fontSize="sm"
                    fontWeight="medium"
                    transition="all 0.2s"
                    color={useColorModeValue("gray.600", "gray.300")}
                    whiteSpace="nowrap"
                  >
                    {tab.label}
                  </Tab>
                ))}
              </TabList>
            </Tabs>
          ) : (
            <HStack spacing={3} align="center" alignSelf={{ base: "flex-start", sm: "center" }} mb={{ base: 5, sm: 0 }}>
              <Flex 
                w="40px" 
                h="40px" 
                borderRadius="full" 
                bgGradient="linear(to-br, #6269FF, #8A2BE2)" 
                align="center" 
                justify="center" 
                boxShadow="0 4px 10px rgba(98,105,255,0.3)"
                flexShrink={0}
              >
                <Icon as={FiUsers} boxSize="20px" color="white" />
              </Flex>
              <Box>
                <Text fontSize="sm" fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                  <Box as="span" color={useColorModeValue("gray.900", "white")}>USER </Box>
                  <Box as="span" bgGradient="linear(to-r, #6269FF, #8A2BE2)" bgClip="text">DIRECTORY</Box>
                </Text>
                <Text fontSize="9px" color={useColorModeValue("gray.500", "gray.400")} fontWeight="700" letterSpacing="0.05em" mt={0.5} textTransform="uppercase">
                  ACTIVE DIRECTORY ROLL
                </Text>
              </Box>
            </HStack>
          )}

          <HStack spacing={3} w={{ base: "100%", sm: "auto" }} justify={{ base: "stretch", sm: "flex-end" }}>
            <Box
              bg={statsBg}
              px={4}
              py={2}
              borderRadius="full"
              display={{ base: "none", md: "block" }}
            >
              <Text fontSize="sm" fontWeight="semibold" color={statsTextColor}>
                {pagination.total} total {activeTabLabel.toLowerCase().replace(/s$/, pagination.total === 1 ? '' : 's')}
              </Text>
            </Box>

            {canOpenBulk && (
              <Button
                leftIcon={<Icon as={FiUpload} />}
                variant="outline"
                onClick={onOpenBulk}
                size="md"
                px={5}
                flex={{ base: 1, sm: "initial" }}
                borderRadius="full"
                borderWidth="1px"
                borderColor={outlineButtonBorder}
                color={outlineButtonColor}
                fontWeight="600"
                _hover={{
                  bg: outlineButtonHoverBg,
                  borderColor: useColorModeValue("purple.500", "purple.400"),
                  transform: "translateY(-1px)",
                  boxShadow: "sm",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
              >
                Excel Upload
              </Button>
            )}

            {canOpenCreate && (
              <Button
                leftIcon={<Icon as={FiUserPlus} />}
                onClick={onOpenCreate}
                size="md"
                px={6}
                flex={{ base: 1, sm: "initial" }}
                borderRadius="full"
                bgGradient={`linear(to-r, ${gradientFrom}, ${gradientTo})`}
                color="white"
                fontWeight="600"
                _hover={{
                  bgGradient: `linear(to-r, ${useColorModeValue("blue.600", "blue.500")}, ${useColorModeValue("purple.700", "purple.600")})`,
                  transform: "translateY(-1px)",
                  boxShadow: "md",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                boxShadow="sm"
              >
                Add User
              </Button>
            )}
          </HStack>
          </Flex>
        </Box>

        {/* User Source Sub-filter for Admin (Manually Created vs Public Enrolled) */}
        {showUserSourceTabs && (
          <Box mb={4}>
            <HStack spacing={2} flexWrap="wrap">
              <Text fontSize="xs" color={muted} fontWeight="medium" mr={1}>
                Show:
              </Text>
              {([
                { value: "all", label: "All Users" },
                { value: "manual", label: "Manually Created" },
                { value: "public_enrolled", label: "Public Course Enrolled" },
              ] as const).map((opt) => (
                <Button
                  key={opt.value}
                  size="xs"
                  borderRadius="full"
                  variant={userSourceTab === opt.value ? "solid" : "outline"}
                  colorScheme={opt.value === "public_enrolled" ? "purple" : "blue"}
                  onClick={() => {
                    setUserSourceTab?.(opt.value);
                    setPage(1);
                  }}
                >
                  {opt.label}
                </Button>
              ))}
            </HStack>
            {userSourceTab === "public_enrolled" && (
              <Box
                mt={2}
                px={3}
                py={2}
                bg={useColorModeValue("purple.50", "purple.900")}
                borderRadius="xl"
                borderLeft="3px solid"
                borderColor="purple.400"
              >
                <Text fontSize="xs" color={useColorModeValue("purple.700", "purple.200")}>
                  ⚠️ These users self-enrolled via public course access. You can view their profiles but cannot edit or delete them.
                </Text>
              </Box>
            )}
          </Box>
        )}

        {!isCompact ? (
          <CustomTable
            title=""
            data={users}
            columns={columns}
            loading={loading}
            actions={{
              actionBtn: {
                addKey: {
                  showAddButton: false,
                },
                editKey: {
                  showEditButton: canEdit,
                  title: "Edit User",
                  function: (user: any) => {
                    // Block edit for public-enrolled users
                    if (isPublicEnrolledUser?.(user)) return;
                    onEdit(user);
                  },
                },
                viewKey: {
                  showViewButton: true,
                  title: "View User",
                  function: (user: any) => onView(user),
                },
                deleteKey: {
                  showDeleteButton: canDelete,
                  title: "Delete User",
                  function: (user: any) => {
                    // Block delete for public-enrolled users
                    if (isPublicEnrolledUser?.(user)) return;
                    onDelete?.(user);
                  },
                },
              },
              search: {
                show: true,
                placeholder: "Search by name, email, role, or creator...",
                searchValue: search,
                onSearchChange: (event: any) => {
                  setSearch(event.target.value);
                  setPage(1);
                },
              },
              resetData: {
                show: true,
                text: "Clear Filters",
                function: () => {
                  setSearch("");
                  setPage(1);
                },
              },
              pagination: {
                show: true,
                currentPage: page,
                totalPages: pagination.totalPages || 1,
                onClick: (nextPage: number) => setPage(nextPage),
              },
            }}
          />
        ) : (
          <Stack spacing={3}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color={muted} />
              </InputLeftElement>
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search users"
                bg={cardBg}
                borderColor={borderColorLight}
                borderRadius="xl"
              />
            </InputGroup>

            {loading ? (
              <Box bg={cardBg} borderWidth="1px" borderColor={borderColorLight} borderRadius="xl" p={5}>
                <Text fontSize="sm" color={muted}>Loading users...</Text>
              </Box>
            ) : users.length === 0 ? (
              <Box bg={cardBg} borderWidth="1px" borderColor={borderColorLight} borderRadius="xl" p={5}>
                <Text fontSize="sm" color={muted}>No users found for this filter.</Text>
              </Box>
            ) : <VStack spacing={3} align="stretch" w="100%">
                {users.map((user: any) => {
                  const statusMeta = getUserStatusMeta(user);
                  const statusColor = statusMeta.colorScheme === "green" ? "green.400" : statusMeta.colorScheme === "red" ? "red.400" : "orange.400";
                  return (
                    <Box 
                      key={user._id} 
                      bg={cardBg} 
                      borderWidth="1px" 
                      borderColor={borderColorLight} 
                      borderBottom="4px solid"
                      borderBottomColor={statusColor}
                      borderRadius="2xl" 
                      p={3.5} 
                      boxShadow="sm"
                      transition="transform 0.15s ease"
                      _active={{ transform: "scale(0.98)" }}
                    >
                      {/* Card Header */}
                      <HStack align="center" spacing={3} mb={2.5}>
                        <Avatar
                          size="sm"
                          name={user.name || "User"}
                          src={user.pic?.url}
                          bgGradient="linear(to-br, blue.400, purple.500)"
                          color="white"
                          fontWeight="bold"
                        />
                        <Box flex="1" minW={0}>
                          <Text fontWeight="800" fontSize="sm" color={useColorModeValue("gray.800", "white")} noOfLines={1}>
                            {user.name || "--"}
                          </Text>
                          <Text fontSize="xs" color={muted} noOfLines={1}>
                            {user.email || "No email address"}
                          </Text>
                        </Box>
                        <Badge colorScheme={statusMeta.colorScheme} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="9px" fontWeight="800">
                          {statusMeta.label.toUpperCase()}
                        </Badge>
                      </HStack>

                      {/* Card Body - Horizontal rounded metadata tags */}
                      <Flex flexWrap="wrap" gap={1.5} mb={3}>
                        <Badge colorScheme="blue" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="10px" fontWeight="700">
                          {formatRoleLabel(user.role).toUpperCase()}
                        </Badge>
                        {user.department && (
                          <Badge colorScheme="purple" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="10px" fontWeight="700">
                            {user.department.toUpperCase()}
                          </Badge>
                        )}
                        <Badge colorScheme="teal" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="10px" fontWeight="700">
                          {(user.company?.name || user.company?.company_name || "Unassigned").toUpperCase()}
                        </Badge>
                        <Badge colorScheme="green" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="10px" fontWeight="700">
                          PHONE OTP
                        </Badge>
                      </Flex>

                      <Divider borderColor={borderColorLight} mb={3} />

                      {/* Card Footer Actions */}
                      <HStack spacing={2} w="100%">
                        <Button 
                          size="xs" 
                          colorScheme="blue" 
                          variant="solid" 
                          leftIcon={<Icon as={FiEye} boxSize={3} />} 
                          onClick={() => onView(user)}
                          borderRadius="lg"
                          flex={1}
                          py={3}
                          fontSize="xs"
                          fontWeight="700"
                        >
                          View Details
                        </Button>
                        
                        {canEdit && (
                          <IconButton
                            aria-label="Edit User"
                            icon={<Icon as={FiEdit2} boxSize={3.5} />}
                            size="sm"
                            variant="outline"
                            borderColor={borderColorLight}
                            colorScheme="purple"
                            borderRadius="lg"
                            w="32px"
                            h="32px"
                            onClick={() => onEdit(user)}
                          />
                        )}

                        {canToggleStatus && (
                          <IconButton
                            aria-label={statusMeta.label !== "Inactive" ? "Deactivate" : "Activate"}
                            icon={<Icon as={FiShield} boxSize={3.5} />}
                            size="sm"
                            variant="outline"
                            borderColor={borderColorLight}
                            colorScheme={statusMeta.label !== "Inactive" ? "red" : "green"}
                            borderRadius="lg"
                            w="32px"
                            h="32px"
                            onClick={() => onToggleStatus?.(user)}
                            isLoading={statusUpdatingId === user._id}
                          />
                        )}

                        {canDelete && (
                          <IconButton
                            aria-label="Delete User"
                            icon={<Icon as={FiTrash2} boxSize={3.5} />}
                            size="sm"
                            variant="outline"
                            borderColor={borderColorLight}
                            colorScheme="red"
                            borderRadius="lg"
                            w="32px"
                            h="32px"
                            onClick={() => onDelete?.(user)}
                          />
                        )}
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            }

            <HStack justify="space-between">
              <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, page - 1))} isDisabled={page <= 1}>
                Prev
              </Button>
              <Text fontSize="xs" color={muted}>
                Page {page} of {pagination.totalPages || 1}
              </Text>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(Math.min(pagination.totalPages || 1, page + 1))}
                isDisabled={page >= (pagination.totalPages || 1)}
              >
                Next
              </Button>
            </HStack>
          </Stack>
        )}
    </VStack>
  );
};

export default UsersTable;
