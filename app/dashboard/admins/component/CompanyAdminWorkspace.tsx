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
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiArrowLeft, FiGlobe, FiMail, FiMapPin, FiPlus, FiShield, FiUsers } from "react-icons/fi";
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

// Compact summary card with smaller font sizes and reduced padding
const SummaryCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => {
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  return (
    <Box
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      px={4}
      py={3}
      transition="all 0.2s"
      _hover={{ borderColor: "blue.200" }}
    >
      <Text fontSize="xs" fontWeight="500" color={mutedText} textTransform="uppercase" letterSpacing="0.05em">
        {label}
      </Text>
      <Text mt={1} fontSize="xl" fontWeight="600" lineHeight="1.2">
        {value}
      </Text>
    </Box>
  );
};

// Compact detail item with smaller icon and text
const DetailItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: any;
}) => {
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const iconColor = useColorModeValue("blue.400", "blue.300");

  return (
    <HStack align="start" spacing={3}>
      <Box color={iconColor} mt={0.5}>
        <Icon size={14} />
      </Box>
      <Box>
        <Text fontSize="xs" fontWeight="500" color={mutedText} textTransform="uppercase" letterSpacing="0.05em">
          {label}
        </Text>
        <Text mt={0.5} fontSize="sm" fontWeight="500">
          {value || "--"}
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
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");

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
    : "--";

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 4, md: 6 }}>
      <Stack spacing={6} maxW="1400px" mx="auto" px={{ base: 4, md: 6 }}>
        {/* Header Section - compact and clean */}
        <Box>
          <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} wrap="wrap">
            <Box>
              <Button
                variant="ghost"
                colorScheme="blue"
                leftIcon={<FiArrowLeft />}
                size="sm"
                px={0}
                mb={2}
                onClick={onBack}
                _hover={{ bg: "transparent", textDecoration: "underline" }}
              >
                Back to Companies
              </Button>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="700" lineHeight="1.2">
                {company?.company_name}
              </Text>
              <Text mt={1} fontSize="sm" color={mutedText}>
                Manage your organization’s admins, department heads, and users.
              </Text>
            </Box>

            <HStack spacing={3}>
              <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={1} fontSize="xs">
                {company?.companyType || "Company"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                borderRadius="full"
                onClick={openAssignedCourses}
              >
                Assigned Courses
              </Button>
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
        </Box>

        {/* Tabs and Tables - no background/shadow on tables */}
        <Box>
          <Tabs
            variant="soft-rounded"
            colorScheme="blue"
            index={activeTab}
            onChange={(index) => setActiveTab(index)}
            size="sm"
          >
            <TabList mb={4} gap={2}>
              {currentUser?.role !== "departmenthead" && (
                <Tab fontSize="sm" fontWeight="500">
                  Admins
                </Tab>
              )}
              {currentUser?.role !== "departmenthead" && (
                <Tab fontSize="sm" fontWeight="500">
                  Dept Heads
                </Tab>
              )}
              <Tab fontSize="sm" fontWeight="500">
                Users
              </Tab>
            </TabList>

            <TabPanels>
              {currentUser?.role !== "departmenthead" && (
                <TabPanel p={0}>
                  {activeTab === 0 && (
                    <Box bg="transparent" boxShadow="none">
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
                        // Assuming UserTable supports `variant="simple"` or similar; if not, remove the line
                        variant="simple"
                      />
                    </Box>
                  )}
                </TabPanel>
              )}
              {currentUser?.role !== "departmenthead" && (
                <TabPanel p={0}>
                  {activeTab === 1 && (
                    <Box bg="transparent" boxShadow="none">
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
                        variant="simple"
                      />
                    </Box>
                  )}
                </TabPanel>
              )}
              <TabPanel p={0}>
                {(activeTab === (currentUser?.role === "departmenthead" ? 0 : 2)) && (
                  <Box
                    bg={surfaceBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                    p={6}
                  >
                    <Stack spacing={3}>
                      <Text fontSize="md" fontWeight="600">
                        Users and managers now use the shared user-management flow.
                      </Text>
                      <Text fontSize="sm" color={mutedText}>
                        This opens the newer form with setup-email handling, manager hierarchy, and scoped company filtering.
                      </Text>
                      <Flex>
                        <Button colorScheme="blue" onClick={openUsersManagement}>
                          Open Users Management
                        </Button>
                      </Flex>
                    </Stack>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* Compact company stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <SummaryCard label="Company Code" value={company?.companyCode || "--"} />
          <SummaryCard label="Tenant Slug" value={company?.tenantSlug || "--"} />
          <SummaryCard label="Manager Levels" value={company?.managerLevels || 3} />
        </SimpleGrid>

        {/* Company details - minimal card style */}
        <Box border="1px solid" borderColor={borderColor} borderRadius="lg" p={4}>
          <Text fontSize="sm" fontWeight="600" mb={4}>
            Company Details
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            <DetailItem
              label="Primary Contact"
              value={company?.companyEmail || company?.mobileNo || "--"}
              icon={FiMail}
            />
            <DetailItem
              label="Address"
              value={addressText}
              icon={FiMapPin}
            />
            <DetailItem
              label="Website"
              value={company?.webLink || "--"}
              icon={FiGlobe}
            />
            <DetailItem
              label="Status"
              value={`${company?.activeAdminCount || 0} / ${company?.adminCount || 0} admins active`}
              icon={FiUsers}
            />
            <DetailItem
              label="Tenant Access"
              value={company?.tenantUrl || company?.tenantSlug || "--"}
              icon={FiShield}
            />
          </SimpleGrid>
        </Box>
      </Stack>

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

      {/* Delete confirmation modal */}
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
