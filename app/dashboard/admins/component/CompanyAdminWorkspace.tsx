"use client";

import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  AlertTitle,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  StatArrow,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  useColorModeValue,
  useToast,
  VStack
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  FiArrowLeft,
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiEdit2,
  FiExternalLink,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiPlus,
  FiShield,
  FiUsers
} from "react-icons/fi";
import ConfirmationModal from "../../../component/common/ConfirmationModal/ConfirmationModal";
import { getApiErrorMessage } from "../../../config/utils/apiError";
import { readFileAsBase64 } from "../../../config/utils/utils";
import stores from "../../../store/stores";
import UserDrawer from "../../users/components/UserDrawer";
import CompanyForm from "./CompanyForm";
import UserTable from "./users/UserTable";

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
  profileId: "",
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
  dateOfBirth: "",
  gender: "",
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
    userStore: { createManagedUser, updateManagedUser, deleteManagedUser },
    auth: { user: currentUser },
    companyStore: { deleteManagedCompany, setSelectedCompanyId, updateManagedCompany },
  } = stores;

  const [adminRefreshKey, setAdminRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawerState, setDrawerState] = useState<any>({
    type: "admin-add",
    isOpen: false,
    data: null,
  });
  const [activeTab, setActiveTab] = useState(0);
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [isDeleteCompanyOpen, setIsDeleteCompanyOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const cancelStatusRef = useRef<HTMLButtonElement | null>(null);
  const showToast = (options: any) =>
    toast({
      position: "top-right",
      isClosable: true,
      ...options,
    });
  const isCompanyInactive = company?.is_active === false;
  const companyRestrictionMessage = `${company?.company_name || "This company"} is inactive. Existing learners can still log in and continue their assigned courses, but new management actions are disabled until the company is reactivated.`;

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

      showToast({
        title: "Member added",
        description: `${formData.name} now belongs to ${company.company_name}.`,
        status: "success",
        duration: 4000,
      });
    } catch (err: any) {
      showToast({
        title: "Failed to create member",
        description: getApiErrorMessage(err, "Please review the member details and try again."),
        status: "error",
        duration: 5000,
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

      showToast({
        title: "Member updated",
        description: `${values.name} has been updated successfully.`,
        status: "success",
        duration: 4000,
      });
    } catch (err: any) {
      showToast({
        title: "Failed to update member",
        description: getApiErrorMessage(err),
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
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
    if (isCompanyInactive) {
      showToast({
        title: "Company is inactive",
        description: companyRestrictionMessage,
        status: "warning",
        duration: 4000,
      });
      return;
    }
    setSelectedCompanyId(company._id);
    router.push("/dashboard/users");
  };

  const openAssignedCourses = () => {
    if (isCompanyInactive) {
      showToast({
        title: "Company is inactive",
        description: companyRestrictionMessage,
        status: "warning",
        duration: 4000,
      });
      return;
    }
    setSelectedCompanyId(company._id);
    router.push("/dashboard/course/assigned");
  };

  const handleCompanyStatusToggle = async () => {
    try {
      setLoading(true);
      const response = await stores.companyStore.updateManagedCompanyStatus(
        company._id,
        Boolean(isCompanyInactive)
      );

      await refreshAll();
      setIsStatusDialogOpen(false);
      showToast({
        title: isCompanyInactive ? "Company activated" : "Company deactivated",
        description:
          response?.data?.message ||
          (isCompanyInactive
            ? `${company.company_name} can now resume management activities.`
            : `${company.company_name} is now restricted to existing learner access only.`),
        status: "success",
        duration: 4000,
      });
    } catch (err: any) {
      showToast({
        title: "Unable to update company status",
        description: getApiErrorMessage(err),
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyEditSubmit = async (values: any) => {
    try {
      setLoading(true);

      const existingLogoUrl = company?.logo?.url || "";
      const nextLogo = values?.logo || {};
      const nextFile = nextLogo?.file;
      const removedExistingLogo = !nextFile && !nextLogo?.url && Boolean(existingLogoUrl);
      const shouldReplaceLogo = isRealFile(nextFile);

      const companyDetails: any = {
        company_name: values.company_name,
        companyCode: values.companyCode,
        companyType: values.companyType,
        tenantSlug: values.tenantSlug || values.company_name,
        customDomain: values.customDomain,
        companyEmail: values.companyEmail,
        managerLevels: Number(values.managerLevels) || 3,
        mobileNo: values.mobileNo,
        workNo: values.workNo,
        webLink: values.webLink,
        bio: values.bio,
        primaryThemeColor: values.primaryThemeColor,
        verified_email_allowed: Boolean(values.verified_email_allowed),
        addressInfo: values.addressInfo || [],
        deletedFiles: removedExistingLogo && existingLogoUrl ? [existingLogoUrl] : [],
        isLogoEdit: shouldReplaceLogo,
      };

      if (shouldReplaceLogo) {
        const buffer = await readFileAsBase64(nextFile);
        companyDetails.logo = {
          buffer,
          filename: nextFile.name,
          type: nextFile.type,
        };
      } else if (removedExistingLogo) {
        companyDetails.logo = null;
      }

      const response = await updateManagedCompany(company._id, { companyDetails });

      await refreshAll();
      setIsEditCompanyOpen(false);

      showToast({
        title: "Company updated",
        description: response?.data?.message || `${values.company_name} has been updated successfully.`,
        status: "success",
        duration: 4000,
      });
    } catch (err: any) {
      showToast({
        title: "Failed to update company",
        description: getApiErrorMessage(err, "Please review the company details and try again."),
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberDelete = async () => {
    const targetUserId = drawerState?.data?._id;
    if (!targetUserId) {
      return;
    }

    try {
      setLoading(true);
      const response = await deleteManagedUser(targetUserId);
      await refreshAll();
      setDrawerState({ type: "admin-add", isOpen: false, data: null });
      showToast({
        title: "Member deleted",
        description: response?.message || "Member deleted successfully.",
        status: "success",
        duration: 4000,
      });
    } catch (err: any) {
      showToast({
        title: "Unable to delete member",
        description: getApiErrorMessage(err),
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyDelete = async () => {
    try {
      setLoading(true);
      const response = await deleteManagedCompany(company._id);
      setSelectedCompanyId("");
      await onCompanyRefresh();
      setIsDeleteCompanyOpen(false);
      onBack();
      showToast({
        title: "Company deleted",
        description: response?.data?.message || `${company.company_name} has been deleted successfully.`,
        status: "success",
        duration: 4000,
      });
    } catch (err: any) {
      showToast({
        title: "Unable to delete company",
        description: getApiErrorMessage(err),
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
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
          {isCompanyInactive ? (
            <Alert status="warning" borderRadius="2xl" alignItems="start">
              <AlertIcon mt={1} />
              <Box>
                <AlertTitle>Management is paused for this company</AlertTitle>
                <AlertDescription>{companyRestrictionMessage}</AlertDescription>
              </Box>
            </Alert>
          ) : null}

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
              <Button
                variant="outline"
                size="sm"
                borderRadius="full"
                leftIcon={<FiEdit2 />}
                onClick={() => setIsEditCompanyOpen(true)}
              >
                Edit Company
              </Button>
              <Button
                size="sm"
                borderRadius="full"
                colorScheme={company?.is_active ? "red" : "green"}
                variant={company?.is_active ? "outline" : "solid"}
                onClick={() => setIsStatusDialogOpen(true)}
                isLoading={loading}
              >
                {company?.is_active ? "Deactivate" : "Activate"}
              </Button>
              <Button
                size="sm"
                borderRadius="full"
                colorScheme="red"
                variant="ghost"
                onClick={() => setIsDeleteCompanyOpen(true)}
                isLoading={loading && isDeleteCompanyOpen}
              >
                Delete Company
              </Button>
              <Tooltip label="Assigned Courses" placement="top">
                <Button
                  variant="outline"
                  size="sm"
                  borderRadius="full"
                  leftIcon={<FiBookOpen />}
                  onClick={openAssignedCourses}
                  isDisabled={isCompanyInactive}
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
                isDisabled={isCompanyInactive}
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
                                profileId: entry.profileId || "",
                                name: entry.name || "",
                                email: entry.email || entry.username || "",
                                pic: entry.pic ? { ...entry.pic, file: null, isAdd: 0, isDeleted: 0, url: entry.pic.url || "" } : { file: null, isAdd: 0, isDeleted: 0, url: "" },
                                mobileNumber: entry.mobileNumber || "",
                                department: entry.department || "",
                                city: entry.city || "",
                                state: entry.state || "",
                                designation: entry.designation || "",
                                joiningDate: entry.joiningDate ? String(entry.joiningDate).slice(0, 10) : "",
                                dateOfBirth: entry.dateOfBirth ? String(entry.dateOfBirth).slice(0, 10) : "",
                                gender: typeof entry.gender === "number" ? entry.gender : "",
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
                                profileId: entry.profileId || "",
                                name: entry.name || "",
                                email: entry.email || entry.username || "",
                                pic: entry.pic ? { ...entry.pic, file: null, isAdd: 0, isDeleted: 0, url: entry.pic.url || "" } : { file: null, isAdd: 0, isDeleted: 0, url: "" },
                                mobileNumber: entry.mobileNumber || "",
                                department: entry.department || "",
                                city: entry.city || "",
                                state: entry.state || "",
                                designation: entry.designation || "",
                                joiningDate: entry.joiningDate ? String(entry.joiningDate).slice(0, 10) : "",
                                dateOfBirth: entry.dateOfBirth ? String(entry.dateOfBirth).slice(0, 10) : "",
                                gender: typeof entry.gender === "number" ? entry.gender : "",
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

      <ConfirmationModal
        isOpen={drawerState.type === "delete" && drawerState.isOpen}
        onClose={() => setDrawerState({ type: "admin-add", isOpen: false, data: null })}
        onConfirm={handleMemberDelete}
        title="Delete member?"
        description={`${drawerState?.data?.name || "This member"} will be removed from active management.`}
        // note="This is a soft delete for audit purposes. The member record remains in the database, but it will no longer appear in the UI."
        confirmText="Delete Member"
        isLoading={loading && drawerState.type === "delete"}
        tone="danger"
      />

      <ConfirmationModal
        isOpen={isDeleteCompanyOpen}
        onClose={() => setIsDeleteCompanyOpen(false)}
        onConfirm={handleCompanyDelete}
        title="Delete company?"
        description={`${company?.company_name || "This company"} will be removed from active management and hidden from the application.`}
        // note="This is a soft delete for audit purposes. The company record remains in the database, but it will no longer be shown or fetched in the UI."
        confirmText="Delete Company"
        isLoading={loading && isDeleteCompanyOpen}
        tone="danger"
      />

      <Drawer
        size="xl"
        isOpen={isEditCompanyOpen}
        placement="right"
        onClose={() => setIsEditCompanyOpen(false)}
      >
        <DrawerOverlay backdropFilter="blur(8px)" bg="blackAlpha.300" />
        <DrawerContent borderLeftRadius={{ base: "none", md: "3xl" }} shadow="2xl">
          <DrawerCloseButton top={4} right={4} size="lg" />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} py={6} px={8}>
            <Text fontSize="2xl" fontWeight="800">
              Edit Company
            </Text>
            <Text fontSize="sm" color={mutedText} mt={1}>
              Update the company profile, tenant, and contact details.
            </Text>
          </DrawerHeader>
          <DrawerBody pb={8} pt={6} px={8}>
            <CompanyForm
              initialValues={company}
              onSubmit={handleCompanyEditSubmit}
              onClose={() => setIsEditCompanyOpen(false)}
              isLoading={loading}
              submitLabel="Save Changes"
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        isOpen={isStatusDialogOpen}
        leastDestructiveRef={cancelStatusRef}
        onClose={() => setIsStatusDialogOpen(false)}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent borderRadius="2xl">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {company?.is_active ? "Deactivate company?" : "Activate company?"}
          </AlertDialogHeader>
          <AlertDialogBody>
            {company?.is_active
              ? `${company?.company_name} will stop all new management operations, including adding users, assigning courses, and creating batches. Existing learners will still be able to log in and continue assigned learning.`
              : `${company?.company_name} will regain access to user, course, batch, and assignment management immediately.`}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelStatusRef} onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              colorScheme={company?.is_active ? "red" : "green"}
              ml={3}
              onClick={handleCompanyStatusToggle}
              isLoading={loading}
            >
              {company?.is_active ? "Deactivate" : "Activate"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
};

export default CompanyAdminWorkspace;
