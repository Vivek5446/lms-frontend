"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  useToast,
  Icon,
  Avatar,
  Divider,
  Tooltip,
  VStack,
  Heading,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiArrowLeft,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiPlus,
  FiShield,
  FiUsers,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
  FiExternalLink,
  FiMoreVertical,
  FiUserPlus,
  FiBookOpen,
  FiHome,
} from "react-icons/fi";
import { readFileAsBase64 } from "../../../config/utils/utils";
import stores from "../../../store/stores";
import UserTable from "./users/UserTable";
import DeleteData from "./users/component/DeleteUser";
import UserDrawer from "../../users/components/UserDrawer";

const emptyManager = (level: number) => ({ level, selectedManager: null });
const parseManagerLevel = (role: string) => {
  const match = String(role || "").trim().toLowerCase().match(/^l(\d+)-manager$/i);
  return match ? Number(match[1]) : null;
};
const getRequiredManagerLevels = (role: string, maxLevel: number) => {
  const normalizedRole = String(role || "").trim().toLowerCase();
  if (!normalizedRole || normalizedRole === "admin" || normalizedRole === "superadmin" || normalizedRole === "departmenthead") {
    return [];
  }

  const managerLevel = parseManagerLevel(normalizedRole);
  const startLevel = managerLevel ? managerLevel + 1 : 1;
  if (startLevel > maxLevel) {
    return [];
  }

  return Array.from({ length: maxLevel - startLevel + 1 }, (_, index) => index + startLevel);
};
const reconcileManagersForRole = (role: string, managers: any[], maxLevel: number) => {
  const managerMap = new Map<number, any>();
  managers.forEach((manager) => managerMap.set(Number(manager.level), manager));
  return getRequiredManagerLevels(role, maxLevel).map((level) => managerMap.get(level) || emptyManager(level));
};
const createMemberForm = (companyId: string, role = "admin") => ({
  code: "",
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  pic: { file: null, isAdd: 0, isDeleted: 0, url: "" },
  mobileNumber: "",
  department: "",
  city: "",
  state: "",
  designation: "",
  joiningDate: "",
  role,
  companyId,
  companyName: "",
  companyManagerLevels: 3,
  createCompany: false,
  resendSetupEmail: false,
  managers: reconcileManagersForRole(role, [], 3),
});
const isRealFile = (value: unknown): value is File => typeof File !== "undefined" && value instanceof File;

// Modern Stat Card with gradient accent
const StatCard = ({
  label,
  value,
  subtext,
  icon: IconEl,
  trend,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: any;
  trend?: { value: number; isUp: boolean };
}) => {
  const bgHover = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  return (
    <Box
      p={5}
      bg={useColorModeValue("white", "gray.800")}
      borderRadius="2xl"
      border="1px solid"
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)", shadow: "md", borderColor: "blue.200" }}
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" top={0} left={0} right={0} h="3px" bgGradient="linear(to-r, blue.400, teal.400)" />
      <HStack justify="space-between" align="flex-start">
        <Box>
          <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider">
            {label}
          </Text>
          <Text fontSize="3xl" fontWeight="800" mt={2} letterSpacing="tight">
            {value}
          </Text>
          {trend && (
            <HStack spacing={1} mt={1}>
              <StatArrow type={trend.isUp ? "increase" : "decrease"} />
              <Text fontSize="xs" color={trend.isUp ? "green.500" : "red.500"} fontWeight="500">
                {Math.abs(trend.value)}%
              </Text>
              {subtext && <Text fontSize="xs" color="gray.500">vs last month</Text>}
            </HStack>
          )}
          {subtext && !trend && <Text fontSize="xs" color="gray.500" mt={1}>{subtext}</Text>}
        </Box>
        <Flex
          bg={useColorModeValue("blue.50", "blue.900")}
          p={3}
          borderRadius="xl"
          color="blue.500"
        >
          <IconEl size={20} />
        </Flex>
      </HStack>
    </Box>
  );
};

// Compact Info Row Component
const InfoRow = ({
  label,
  value,
  icon: IconEl,
}: {
  label: string;
  value: string;
  icon: any;
}) => {
  return (
    <HStack spacing={3} align="flex-start">
      <Flex
        w="28px"
        h="28px"
        bg={useColorModeValue("gray.100", "gray.700")}
        borderRadius="lg"
        align="center"
        justify="center"
        color={useColorModeValue("blue.500", "blue.300")}
      >
        <IconEl size={14} />
      </Flex>
      <Box>
        <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wide">
          {label}
        </Text>
        <Text fontSize="sm" fontWeight="500" color={useColorModeValue("gray.700", "gray.200")}>
          {value || "—"}
        </Text>
      </Box>
    </HStack>
  );
};

const CompanyAdminWorkspace = ({
  company,
  onBack,
  onCompanyRefresh,
}: {
  company: any;
  onBack: () => void;
  onCompanyRefresh: () => Promise<any>;
}) => {
  const router = useRouter();
  const toast = useToast();
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const surfaceBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");

  const {
    userStore: { createManagedUser, updateManagedUser },
    auth: { user: currentUser },
    companyStore,
  } = stores;

  const [adminRefreshKey, setAdminRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawerState, setDrawerState] = useState<any>({
    type: "admin-add",
    isOpen: false,
    data: null,
  });
  const [activeTab, setActiveTab] = useState(0);

  const refreshAll = async () => {
    await onCompanyRefresh();
    setAdminRefreshKey((prev) => prev + 1);
  };

  const handleAddSubmit = async (formData: any) => {
    try {
      setLoading(true);
      const payload = { ...formData, companyId: company._id };

      if (payload.pic?.isDeleted) {
        payload.pic = {
          isDeleted: 1,
          isAdd: 0,
        };
      }

      if (isRealFile(payload.pic?.file)) {
        const buffer = await readFileAsBase64(payload.pic.file);
        payload.pic = {
          buffer,
          filename: payload.pic.file.name,
          type: payload.pic.file.type,
          isAdd: 1,
          isDeleted: payload.pic?.isDeleted || 0,
        };
      }

      await createManagedUser({
        ...payload,
      });
      await refreshAll();
      setDrawerState({ type: "admin-add", isOpen: false, data: null });

      toast({
        title: "Member added",
        description: `${formData.name} now belongs to ${company.company_name}.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "Failed to create member",
        description: err?.message || "Please review the member details and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload = { ...values, companyId: company._id };

      if (payload.pic?.isDeleted) {
        payload.pic = {
          isDeleted: 1,
          isAdd: 0,
        };
      }

      if (isRealFile(payload.pic?.file)) {
        const buffer = await readFileAsBase64(payload.pic.file);
        payload.pic = {
          buffer,
          filename: payload.pic.file.name,
          type: payload.pic.file.type,
          isAdd: 1,
          isDeleted: payload.pic?.isDeleted || 0,
        };
      }

      await updateManagedUser(values.id || values._id, payload);

      await refreshAll();
      setDrawerState({ type: "admin-add", isOpen: false, data: null });

      toast({
        title: "Member updated",
        description: `${values.name} has been updated successfully.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "Failed to update member",
        description: err?.message || "Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRefresh = () => {
    refreshAll().catch(() => null);
  };

  const memberRoleOptions = [
    { label: "Admin", value: "admin" },
    { label: "Department Head", value: "departmenthead" },
  ];

  const updateRole = (nextRole: string) => {
    setDrawerState((prev: any) => ({
      ...prev,
      data: {
        ...(prev.data || createMemberForm(company._id, nextRole)),
        role: nextRole,
        resendSetupEmail: nextRole !== "admin" && nextRole !== "departmenthead",
        managers: reconcileManagersForRole(nextRole, prev.data?.managers || [], 3),
      },
    }));
  };

  const setManagerSelection = (index: number, selectedManager: any) =>
    setDrawerState((prev: any) => ({
      ...prev,
      data: {
        ...prev.data,
        managers: (prev.data?.managers || []).map((manager: any, managerIndex: number) =>
          managerIndex === index ? { ...manager, selectedManager: selectedManager || null } : manager
        ),
      },
    }));

  const openUsersManagement = () => {
    companyStore.setSelectedCompanyId(company._id);
    router.push("/dashboard/users");
  };

  const openAssignedCourses = () => {
    companyStore.setSelectedCompanyId(company._id);
    router.push("/dashboard/course/assigned");
  };

  const addressText = company?.addressInfo?.[0]
    ? [
        company.addressInfo[0].address,
        company.addressInfo[0].city,
        company.addressInfo[0].state,
        company.addressInfo[0].country,
        company.addressInfo[0].pinCode,
      ]
        .filter(Boolean)
        .join(", ")
    : "—";

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CO";
  };

  return (
    <Box minH="100vh" bg={pageBg}>
      <Container maxW="1400px" px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
        <VStack spacing={6} align="stretch">
          {/* Header Section - Enhanced */}
          <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
            <HStack spacing={4}>
              <IconButton
                aria-label="Go back"
                icon={<FiArrowLeft />}
                variant="ghost"
                size="sm"
                onClick={onBack}
                borderRadius="full"
              />
              <Avatar
                size="md"
                name={company?.company_name}
                src={company?.logo?.url}
                bgGradient="linear(to-br, blue.500, teal.500)"
                color="white"
                fontWeight="bold"
              />
              <Box>
                <Heading as="h1" size="lg" fontWeight="800">
                  {company?.company_name}
                </Heading>
                <HStack spacing={2} mt={1}>
                  <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2} py={0.5}>
                    {company?.companyType || "Company"}
                  </Badge>
                  <Badge
                    colorScheme={company?.is_active ? "green" : "red"}
                    variant="subtle"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                  >
                    {company?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </HStack>
              </Box>
            </HStack>

            <HStack spacing={3}>
              <Tooltip label="Assigned Courses" placement="top">
                <Button
                  variant="outline"
                  size="sm"
                  borderRadius="full"
                  leftIcon={<FiBookOpen />}
                  onClick={openAssignedCourses}
                >
                  Courses
                </Button>
              </Tooltip>
              <Button
                colorScheme="blue"
                size="sm"
                borderRadius="full"
                leftIcon={<FiPlus size={14} />}
                onClick={() =>
                  activeTab === (currentUser?.role === "departmenthead" ? 0 : 2)
                    ? openUsersManagement()
                    : setDrawerState({ type: "admin-add", isOpen: true, data: null })
                }
              >
                {activeTab === (currentUser?.role === "departmenthead" ? 0 : 2)
                  ? "Manage Users"
                  : "Add Member"}
              </Button>
            </HStack>
          </Flex>

          {/* Stats Row - Modern Cards */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5}>
            <StatCard
              label="Total Admins"
              value={company?.adminCount || 0}
              icon={FiUsers}
              subtext={`${company?.activeAdminCount || 0} active`}
            />
            <StatCard
              label="Departments"
              value={company?.departments?.length || 0}
              icon={FiBriefcase}
            />
            <StatCard
              label="Manager Levels"
              value={company?.managerLevels || 3}
              icon={FiShield}
            />
            <StatCard
              label="Company Code"
              value={company?.companyCode || "—"}
              icon={FiCheckCircle}
            />
          </SimpleGrid>

          {/* Tabs and Tables - Clean Design */}
          <Box>
            <Tabs
              variant="enclosed-colored"
              colorScheme="blue"
              index={activeTab}
              onChange={(index) => setActiveTab(index)}
              size="md"
            >
              <TabList borderBottom="1px solid" borderColor={borderColor} mb={4} gap={1}>
                {currentUser?.role !== "departmenthead" && (
                  <Tab
                    _selected={{ color: "blue.500", borderBottom: "2px solid", borderBottomColor: "blue.500", fontWeight: "600" }}
                    fontSize="sm"
                    fontWeight="500"
                  >
                    Admins
                  </Tab>
                )}
                {currentUser?.role !== "departmenthead" && (
                  <Tab
                    _selected={{ color: "blue.500", borderBottom: "2px solid", borderBottomColor: "blue.500", fontWeight: "600" }}
                    fontSize="sm"
                    fontWeight="500"
                  >
                    Dept Heads
                  </Tab>
                )}
                <Tab
                  _selected={{ color: "blue.500", borderBottom: "2px solid", borderBottomColor: "blue.500", fontWeight: "600" }}
                  fontSize="sm"
                  fontWeight="500"
                >
                  Users
                </Tab>
              </TabList>

              <TabPanels>
                {currentUser?.role !== "departmenthead" && (
                  <TabPanel px={0}>
                    {activeTab === 0 && (
                      <Box>
                        <UserTable
                          key={`admin-${company._id}-${adminRefreshKey}`}
                          companyId={company._id}
                          companyName={company.company_name}
                          title={`${company.company_name} - Admins`}
                          filterRole="admin"
                          filterType="admin"
                          onAdd={() =>
                            setDrawerState({
                              type: "admin-add",
                              isOpen: true,
                              data: createMemberForm(company._id, "admin"),
                            })
                          }
                          onEdit={(entry: any) =>
                            setDrawerState({
                              type: "admin-edit",
                              isOpen: true,
                              data: {
                                ...createMemberForm(company._id, "admin"),
                                id: entry._id,
                                code: entry.code || "",
                                name: entry.name || "",
                                email: entry.email || entry.username || "",
                                pic: entry.pic ? { ...entry.pic, file: null, isAdd: 0, isDeleted: 0, url: entry.pic.url || "" } : { file: null, isAdd: 0, isDeleted: 0, url: "" },
                                mobileNumber: entry.mobileNumber || "",
                                department: entry.department || "",
                                city: entry.city || "",
                                state: entry.state || "",
                                designation: entry.designation || "",
                                joiningDate: entry.joiningDate ? String(entry.joiningDate).slice(0, 10) : "",
                                role: entry.role || "admin",
                                companyId: company._id,
                              },
                            })
                          }
                          onDelete={(entry: any) =>
                            setDrawerState({ type: "delete", isOpen: true, data: entry })
                          }
                          showAddButton={false}
                        />
                      </Box>
                    )}
                  </TabPanel>
                )}
                {currentUser?.role !== "departmenthead" && (
                  <TabPanel px={0}>
                    {activeTab === 1 && (
                      <Box>
                        <UserTable
                          key={`depthead-${company._id}-${adminRefreshKey}`}
                          companyId={company._id}
                          companyName={company.company_name}
                          title={`${company.company_name} - Dept Heads`}
                          filterRole="departmenthead"
                          filterType="admin"
                          onAdd={() =>
                            setDrawerState({
                              type: "admin-add",
                              isOpen: true,
                              data: createMemberForm(company._id, "departmenthead"),
                            })
                          }
                          onEdit={(entry: any) =>
                            setDrawerState({
                              type: "admin-edit",
                              isOpen: true,
                              data: {
                                ...createMemberForm(company._id, "departmenthead"),
                                id: entry._id,
                                code: entry.code || "",
                                name: entry.name || "",
                                email: entry.email || entry.username || "",
                                pic: entry.pic ? { ...entry.pic, file: null, isAdd: 0, isDeleted: 0, url: entry.pic.url || "" } : { file: null, isAdd: 0, isDeleted: 0, url: "" },
                                mobileNumber: entry.mobileNumber || "",
                                department: entry.department || "",
                                city: entry.city || "",
                                state: entry.state || "",
                                designation: entry.designation || "",
                                joiningDate: entry.joiningDate ? String(entry.joiningDate).slice(0, 10) : "",
                                role: entry.role || "departmenthead",
                                companyId: company._id,
                              },
                            })
                          }
                          onDelete={(entry: any) =>
                            setDrawerState({ type: "delete", isOpen: true, data: entry })
                          }
                          showAddButton={false}
                        />
                      </Box>
                    )}
                  </TabPanel>
                )}
                <TabPanel px={0}>
                  {(activeTab === (currentUser?.role === "departmenthead" ? 0 : 2)) && (
                    <Card
                      bg={cardBg}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="2xl"
                      shadow="sm"
                    >
                      <CardBody>
                        <VStack spacing={4} align="flex-start">
                          <Icon as={FiExternalLink} boxSize={8} color="blue.400" />
                          <Heading size="md">Unified User Management</Heading>
                          <Text color={mutedText}>
                            Users and managers now use the shared user-management flow with enhanced
                            capabilities including setup-email handling, manager hierarchy, and scoped company filtering.
                          </Text>
                          <Button
                            leftIcon={<FiUsers />}
                            colorScheme="blue"
                            variant="solid"
                            onClick={openUsersManagement}
                            borderRadius="full"
                            size="sm"
                          >
                            Open Users Management
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>

          {/* Company Details Section - Enhanced Grid */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" shadow="sm">
            <CardHeader pb={0}>
              <Heading size="sm" fontWeight="700">
                Company Information
              </Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <InfoRow label="Primary Contact" value={company?.companyEmail || company?.mobileNo || "—"} icon={FiMail} />
                <InfoRow label="Website" value={company?.webLink || "—"} icon={FiGlobe} />
                <InfoRow label="Tenant Slug" value={company?.tenantSlug || "—"} icon={FiShield} />
                <InfoRow label="Address" value={addressText} icon={FiMapPin} />
                <InfoRow
                  label="Admin Activity"
                  value={`${company?.activeAdminCount || 0} / ${company?.adminCount || 0} active`}
                  icon={FiUsers}
                />
                <InfoRow
                  label="Tenant Access"
                  value={company?.tenantUrl || company?.tenantSlug || "—"}
                  icon={FiGlobe}
                />
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Drawers and Modals - Unchanged to preserve logic */}
      <UserDrawer
        isOpen={
          drawerState.isOpen &&
          (drawerState.type === "admin-add" || drawerState.type === "admin-edit")
        }
        onClose={() => setDrawerState({ type: "admin-add", isOpen: false, data: null })}
        userForm={
          drawerState.data ||
          createMemberForm(company._id, activeTab === 1 ? "departmenthead" : "admin")
        }
        setUserForm={(updater: any) =>
          setDrawerState((prev: any) => ({
            ...prev,
            data:
              typeof updater === "function"
                ? updater(prev.data || createMemberForm(company._id, activeTab === 1 ? "departmenthead" : "admin"))
                : updater,
          }))
        }
        roleOptions={memberRoleOptions}
        isSuperadmin={false}
        managedCompanies={[]}
        filteredCompanies={[company]}
        borderColor={borderColor}
        muted={mutedText}
        currentCompanyName={company.company_name}
        currentCompanyDepartments={company.departments || []}
        managerCompanyId={company._id}
        updateRole={updateRole}
        setManagerSelection={setManagerSelection}
        onSubmit={() =>
          drawerState.type === "admin-edit"
            ? handleEditSubmit(drawerState.data)
            : handleAddSubmit(drawerState.data)
        }
        loading={loading}
      />

      {drawerState.type === "delete" && drawerState.isOpen ? (
        <DeleteData
          getData={handleDeleteRefresh}
          data={drawerState.data}
          isOpen={drawerState.isOpen}
          onClose={() => setDrawerState({ type: "admin-add", isOpen: false, data: null })}
        />
      ) : null}
    </Box>
  );
};

export default CompanyAdminWorkspace;