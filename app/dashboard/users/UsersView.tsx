"use client";

import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tab,
  TabList,
  Table,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import useDebounce from "../../component/config/component/customHooks/useDebounce";
import CustomInput from "../../component/config/component/customInput/CustomInput";
import stores from "../../store/stores";

type ManagerRow = {
  level: number;
  selectedManager: any | null;
};

type UserFormState = {
  id?: string;
  code: string;
  name: string;
  email: string;
  mobileNumber: string;
  branch: string;
  city: string;
  state: string;
  designation: string;
  joiningDate: string;
  role: string;
  companyId: string;
  companyName: string;
  companyManagerLevels: number;
  createCompany: boolean;
  resendSetupEmail: boolean;
  managers: ManagerRow[];
};

type BulkFormState = {
  companyId: string;
  companyName: string;
  companyManagerLevels: number;
  createCompany: boolean;
};

const COLORS = ["blue", "purple", "orange", "green", "pink", "cyan"];

const normalizeRole = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^l\s*(\d+)\s*manager$/i, "l$1-manager")
    .replace(/\s+/g, "-");
const normalizeEmail = (value: unknown) => String(value || "").trim().toLowerCase();
const emptyManager = (level: number): ManagerRow => ({ level, selectedManager: null });

const getCompanyManagerLevels = (company: any) => Math.max(1, Number(company?.managerLevels) || 3);

const formatRoleLabel = (role: string) => {
  if (!role) {
    return "Role";
  }

  if (role === "user") {
    return "User";
  }

  if (role === "admin") {
    return "Admin";
  }

  return role
    .split("-")
    .map((part) =>
      part.startsWith("l") && /\d+/.test(part.slice(1))
        ? part.toUpperCase()
        : `${part.charAt(0).toUpperCase()}${part.slice(1)}`
    )
    .join(" ");
};

const parseManagerLevel = (role: string) => {
  const match = normalizeRole(role).match(/^l(\d+)-manager$/i);
  return match ? Number(match[1]) : null;
};

const optionFromManager = (manager: any) => {
  const email = manager?.email || manager?.username || manager?.managerEmail || "";
  if (!email && !manager?._id && !manager?.managerId) {
    return null;
  }

  const managerId =
    manager?._id ||
    manager?.managerId ||
    (manager?.manager?._id ? manager.manager._id : null);
  const status = manager?.status || (managerId ? "ASSIGNED" : "PENDING");

  return {
    label: `${manager?.name || email} (${email})`,
    value: managerId || `pending:${email}`,
    email,
    username: manager?.username || email,
    name: manager?.name || email,
    role: manager?.role,
    status,
  };
};

const getRequiredManagerLevels = (role: string, maxLevel: number) => {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole || normalizedRole === "admin" || normalizedRole === "superadmin") {
    return [];
  }

  const managerLevel = parseManagerLevel(normalizedRole);
  const startLevel = managerLevel ? managerLevel + 1 : 1;

  if (startLevel > maxLevel) {
    return [];
  }

  return Array.from({ length: maxLevel - startLevel + 1 }, (_, index) => startLevel + index);
};

const reconcileManagersForRole = (role: string, managers: ManagerRow[], maxLevel: number) => {
  const managerMap = new Map<number, ManagerRow>();
  managers.forEach((manager) => {
    managerMap.set(Number(manager.level), manager);
  });

  return getRequiredManagerLevels(role, maxLevel).map(
    (level) => managerMap.get(level) || emptyManager(level)
  );
};

const initialForm = (): UserFormState => ({
  code: "",
  name: "",
  email: "",
  mobileNumber: "",
  branch: "",
  city: "",
  state: "",
  designation: "",
  joiningDate: "",
  role: "user",
  companyId: "",
  companyName: "",
  companyManagerLevels: 3,
  createCompany: false,
  resendSetupEmail: true,
  managers: reconcileManagersForRole("user", [], 3),
});

const UsersView = observer(() => {
  const toast = useToast();
  const { userStore, companyStore, auth } = stores;
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [listTab, setListTab] = useState("user");
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserFormState>(initialForm());
  const [bulkForm, setBulkForm] = useState<BulkFormState>({
    companyId: "",
    companyName: "",
    companyManagerLevels: 3,
    createCompany: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const muted = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableHeadBg = useColorModeValue("gray.50", "gray.900");
  const role = normalizeRole(auth.userType || auth.user?.role);
  const isSuperadmin = role === "superadmin";
  const managedCompanies = companyStore.companies.data || [];
  const currentCompanyName =
    auth.user?.companyDetails?.company_name ||
    managedCompanies.find((company: any) => company?._id === auth.company)?.company_name ||
    "Current company";
  const currentCompanyManagerLevels = getCompanyManagerLevels(
    auth.user?.companyDetails ||
      managedCompanies.find((company: any) => company?._id === auth.company)
  );
  const managerCompanyId = isSuperadmin ? userForm.companyId : auth.company;
  const selectedUserCompany = isSuperadmin
    ? managedCompanies.find((company: any) => company?._id === userForm.companyId)
    : auth.user?.companyDetails;
  const selectedBulkCompany = isSuperadmin
    ? managedCompanies.find((company: any) => company?._id === bulkForm.companyId)
    : auth.user?.companyDetails;
  const selectedUserManagerLevels = userForm.createCompany
    ? Math.max(1, Number(userForm.companyManagerLevels) || 3)
    : getCompanyManagerLevels(selectedUserCompany || { managerLevels: currentCompanyManagerLevels });
  const selectedBulkManagerLevels = bulkForm.createCompany
    ? Math.max(1, Number(bulkForm.companyManagerLevels) || 3)
    : getCompanyManagerLevels(selectedBulkCompany || { managerLevels: currentCompanyManagerLevels });

  const visibleManagerLevels = useMemo(() => {
    const companyLevels = isSuperadmin
      ? managedCompanies.map((company: any) => getCompanyManagerLevels(company))
      : [currentCompanyManagerLevels];
    const maxConfiguredLevel = Math.max(1, ...companyLevels, selectedUserManagerLevels, selectedBulkManagerLevels);
    return Array.from({ length: maxConfiguredLevel }, (_, index) => index + 1);
  }, [
    currentCompanyManagerLevels,
    isSuperadmin,
    managedCompanies,
    selectedBulkManagerLevels,
    selectedUserManagerLevels,
  ]);

  const roleOptions = useMemo(() => {
    const baseRoles = ["user", ...Array.from({ length: selectedUserManagerLevels }, (_, index) => `l${index + 1}-manager`)];
    if (isSuperadmin) {
      baseRoles.push("admin");
    }

    return baseRoles.map((item) => ({
      value: item,
      label: formatRoleLabel(item),
    }));
  }, [isSuperadmin, selectedUserManagerLevels]);

  const listTabs = useMemo(() => {
    const tabs = [
      { label: "Users", value: "user" },
      ...visibleManagerLevels.map((level) => ({
        label: `L${level} Managers`,
        value: `l${level}-manager`,
      })),
    ];

    if (isSuperadmin) {
      tabs.push({ label: "Admins", value: "admin" });
    }

    return tabs;
  }, [isSuperadmin, visibleManagerLevels]);

  const activeTabIndex = Math.max(0, listTabs.findIndex((item) => item.value === listTab));

  const fetchUsers = useCallback(async () => {
    try {
      await userStore.fetchUsers({
        page,
        limit: 10,
        search: debouncedSearch,
        role: listTab,
      });
    } catch (err: any) {
      toast({
        title: "Unable to load users",
        description: err?.error || err?.message || "Please try again.",
        status: "error",
        duration: 3500,
      });
    }
  }, [debouncedSearch, listTab, page, toast, userStore]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (isSuperadmin) {
      companyStore.getManagedCompanies().catch(() => undefined);
    }
  }, [companyStore, isSuperadmin]);

  useEffect(() => {
    if (!isUserDrawerOpen) {
      return;
    }

    setUserForm((prev) => {
      const nextManagers = reconcileManagersForRole(prev.role, prev.managers, selectedUserManagerLevels);
      const isSame =
        nextManagers.length === prev.managers.length &&
        nextManagers.every(
          (manager, index) =>
            manager.level === prev.managers[index]?.level &&
            manager.selectedManager?.value === prev.managers[index]?.selectedManager?.value &&
            manager.selectedManager?.email === prev.managers[index]?.selectedManager?.email
        );

      return isSame ? prev : { ...prev, managers: nextManagers };
    });
  }, [isUserDrawerOpen, selectedUserManagerLevels]);

  useEffect(() => {
    if (!listTabs.some((item) => item.value === listTab)) {
      setListTab("user");
      setPage(1);
    }
  }, [listTab, listTabs]);

  useEffect(() => {
    const currentRoleLevel = parseManagerLevel(userForm.role);
    if (currentRoleLevel && currentRoleLevel > selectedUserManagerLevels) {
      setUserForm((prev) => ({
        ...prev,
        role: "user",
        managers: reconcileManagersForRole("user", prev.managers, selectedUserManagerLevels),
      }));
    }
  }, [selectedUserManagerLevels, userForm.role]);

  const resetForm = () =>
    setUserForm({
      ...initialForm(),
      companyId: isSuperadmin ? "" : auth.company || "",
      companyManagerLevels: isSuperadmin ? 3 : currentCompanyManagerLevels,
      managers: reconcileManagersForRole("user", [], isSuperadmin ? 3 : currentCompanyManagerLevels),
    });

  const openCreate = () => {
    resetForm();
    setIsUserDrawerOpen(true);
  };

  const openEdit = (user: any) => {
    const roleValue = normalizeRole(user.role || "user");
    const mappedManagers =
      Array.isArray(user.managers) && user.managers.length > 0
        ? user.managers.map((manager: any, index: number) => ({
            level: Number(manager.level) || index + 1,
            selectedManager: optionFromManager(manager.manager || manager),
          }))
        : [];
    const roleMaxLevel = getCompanyManagerLevels(user.company || { managerLevels: selectedUserManagerLevels });

    setUserForm({
      id: user._id,
      code: user.code || "",
      name: user.name || "",
      email: user.email || user.username || "",
      mobileNumber: user.mobileNumber || "",
      branch: user.branch || "",
      city: user.city || "",
      state: user.state || "",
      designation: user.designation || "",
      joiningDate: user.joiningDate ? String(user.joiningDate).slice(0, 10) : "",
      role: roleValue,
      companyId: user.companyId || user.company?._id || "",
      companyName: user.company?.name || user.company?.company_name || "",
      companyManagerLevels: user.company?.managerLevels || selectedUserManagerLevels,
      createCompany: false,
      resendSetupEmail: false,
      managers: reconcileManagersForRole(roleValue, mappedManagers, roleMaxLevel),
    });
    setIsUserDrawerOpen(true);
  };

  const updateRole = (nextRole: string) => {
    setUserForm((prev) => ({
      ...prev,
      role: nextRole,
      managers: reconcileManagersForRole(nextRole, prev.managers, selectedUserManagerLevels),
    }));
  };

  const setManagerSelection = (index: number, selectedManager: any) =>
    setUserForm((prev) => ({
      ...prev,
      managers: prev.managers.map((manager, managerIndex) =>
        managerIndex === index ? { ...manager, selectedManager: selectedManager || null } : manager
      ),
    }));

  const submitUser = async () => {
    const code = userForm.code.trim();
    const name = userForm.name.trim();
    const email = normalizeEmail(userForm.email);
    const roleValue = normalizeRole(userForm.role);
    const mobileNumber = userForm.mobileNumber.trim();
    const branch = userForm.branch.trim();
    const city = userForm.city.trim();
    const state = userForm.state.trim();
    const designation = userForm.designation.trim();
    const joiningDate = userForm.joiningDate;
    const managers = userForm.managers
      .map((manager) => ({
        level: manager.level,
        managerEmail: normalizeEmail(
          manager.selectedManager?.email || manager.selectedManager?.username
        ),
      }))
      .filter((manager) => manager.managerEmail);

    if (!code || !name || !email || !roleValue || !designation) {
      toast({
        title: "Missing details",
        description: "Employee code, name, email, designation, and role are required.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (managers.some((manager) => manager.managerEmail === email)) {
      toast({
        title: "Invalid hierarchy",
        description: "A user cannot be their own manager.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const payload: any = {
      code,
      name,
      email,
      mobileNumber,
      branch,
      city,
      state,
      designation,
      joiningDate,
      role: roleValue,
      managers,
      resendSetupEmail: userForm.resendSetupEmail,
    };

    if (isSuperadmin) {
      if (userForm.createCompany) {
        if (!userForm.companyName.trim()) {
          toast({
            title: "Company is required",
            description: "Enter a company name or choose an existing company.",
            status: "warning",
            duration: 3000,
          });
          return;
        }
        payload.companyName = userForm.companyName.trim();
        payload.companyManagerLevels = userForm.companyManagerLevels;
      } else if (userForm.companyId) {
        payload.companyId = userForm.companyId;
      } else {
        toast({
          title: "Company is required",
          description: "Select a company or create a new one.",
          status: "warning",
          duration: 3000,
        });
        return;
      }
    } else {
      payload.companyId = auth.company;
    }

    try {
      const response = userForm.id
        ? await userStore.updateManagedUser(userForm.id, payload)
        : await userStore.createManagedUser(payload);
      toast({
        title: userForm.id ? "User updated" : "User created",
        description: response?.message || "Saved successfully.",
        status: response?.data?.emailDelivery?.success ? "success" : "info",
        duration: 3500,
      });
      setIsUserDrawerOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast({
        title: "Unable to save user",
        description: err?.error || err?.message || "Please try again.",
        status: "error",
        duration: 4000,
      });
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) {
        return;
      }

      if (isSuperadmin && bulkForm.createCompany && !bulkForm.companyName.trim()) {
        toast({
          title: "Company is required",
          description: "Enter a company name before previewing the upload.",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      if (isSuperadmin && !bulkForm.createCompany && !bulkForm.companyId) {
        toast({
          title: "Company is required",
          description: "Select a company before previewing the upload.",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      setSelectedFile(file);
      try {
        const bulkUploadOptions = isSuperadmin
          ? bulkForm.createCompany
            ? {
                companyName: bulkForm.companyName.trim(),
                companyManagerLevels: bulkForm.companyManagerLevels,
              }
            : {
                companyId: bulkForm.companyId,
                companyManagerLevels: selectedBulkManagerLevels,
              }
        : {};

        await userStore.previewUploadUsers(file, bulkUploadOptions);
      } catch (err: any) {
        toast({
          title: "Preview failed",
          description: err?.error || err?.message || "We could not read that Excel file.",
          status: "error",
          duration: 4000,
        });
      }
    },
    [bulkForm.companyId, bulkForm.companyManagerLevels, bulkForm.companyName, bulkForm.createCompany, isSuperadmin, toast, userStore]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Choose an Excel file before uploading.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (isSuperadmin && bulkForm.createCompany && !bulkForm.companyName.trim()) {
      toast({
        title: "Company is required",
        description: "Enter a company name for this bulk upload.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (isSuperadmin && !bulkForm.createCompany && !bulkForm.companyId) {
      toast({
        title: "Company is required",
        description: "Select a company before uploading this file.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const bulkUploadOptions = isSuperadmin
          ? bulkForm.createCompany
            ? {
                companyName: bulkForm.companyName.trim(),
                companyManagerLevels: bulkForm.companyManagerLevels,
              }
            : {
                companyId: bulkForm.companyId,
                companyManagerLevels: selectedBulkManagerLevels,
              }
          : {};

      const response = await userStore.uploadUsers(selectedFile, bulkUploadOptions);
      toast({
        title: response?.data?.failedCount > 0 ? "Partial success" : "Bulk upload complete",
        description:
          response?.message ||
          `${response?.data?.createdCount || 0} users created and ${response?.data?.failedCount || 0} failed.`,
        status: response?.data?.failedCount > 0 ? "info" : "success",
        duration: 4500,
      });
      setIsBulkModalOpen(false);
      setSelectedFile(null);
      userStore.bulkPreview = [];
      setBulkForm({
        companyId: "",
        companyName: "",
        companyManagerLevels: 3,
        createCompany: false,
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: "Bulk upload failed",
        description: err?.error || err?.message || "Please try again.",
        status: "error",
        duration: 4000,
      });
    }
  };

  const filteredCompanies = useMemo(
    () => (isSuperadmin ? managedCompanies : []),
    [isSuperadmin, managedCompanies]
  );

  const activeTabLabel =
    listTabs.find((item) => item.value === listTab)?.label || "Users";

  return (
    <Box minH="100vh" p={{ base: 4, md: 6 }}>
      <VStack align="stretch" spacing={6}>
        <Box
          bg="white"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          p={{ base: 5, md: 6 }}
          boxShadow="sm"
        >
          <Flex
            justify="space-between"
            align={{ base: "start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <Box>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
                Users Management
              </Text>
              <Text color={muted} mt={1}>
                Separate user and manager-level views, live hierarchy search, and password setup onboarding.
              </Text>
            </Box>
            <HStack spacing={3} alignSelf={{ base: "stretch", md: "auto" }}>
              <Button colorScheme="purple" variant="outline" onClick={() => setIsBulkModalOpen(true)}>
                Excel Upload
              </Button>
              <Button colorScheme="blue" onClick={openCreate}>
                Add User
              </Button>
            </HStack>
          </Flex>
        </Box>

        <Box
          bg="white"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          p={{ base: 5, md: 6 }}
          boxShadow="sm"
        >
          <Tabs
            variant="soft-rounded"
            colorScheme="blue"
            index={activeTabIndex}
            onChange={(index) => {
              setListTab(listTabs[index]?.value || "user");
              setPage(1);
            }}
          >
            <TabList mb={5} flexWrap="wrap" gap={2}>
              {listTabs.map((tab) => (
                <Tab key={tab.value}>{tab.label}</Tab>
              ))}
            </TabList>
          </Tabs>

          <Flex
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
            mb={5}
          >
            <Input
              maxW={{ base: "100%", md: "320px" }}
              placeholder="Search by name, email, role, or creator"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <Text color={muted} fontSize="sm">
              {userStore.pagination.total} total {activeTabLabel.toLowerCase()}
            </Text>
          </Flex>

          <TableContainer borderWidth="1px" borderColor={borderColor} borderRadius="xl">
            <Table variant="simple" size="sm">
              <Thead bg={tableHeadBg}>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Company</Th>
                  <Th>Created By</Th>
                  <Th>Role</Th>
                  <Th>Managers</Th>
                  <Th>Status</Th>
                  <Th>Password</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {userStore.loading ? (
                  <Tr>
                    <Td colSpan={9} py={8}>
                      <Text textAlign="center" color={muted}>
                        Loading users...
                      </Text>
                    </Td>
                  </Tr>
                ) : userStore.users.length === 0 ? (
                  <Tr>
                    <Td colSpan={9} py={8}>
                      <Text textAlign="center" color={muted}>
                        No users found.
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  userStore.users.map((user: any) => (
                    <Tr key={user._id}>
                      <Td>
                        <Text fontWeight="semibold">{user.name}</Text>
                      </Td>
                      <Td>{user.email}</Td>
                      <Td>{user.company?.name || user.company?.company_name || "Unassigned"}</Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {user.createdBy?.name || "System"}
                          </Text>
                          <Text fontSize="xs" color={muted}>
                            {user.createdBy?.email || "--"}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue" textTransform="none" borderRadius="full" px={3} py={1}>
                          {formatRoleLabel(user.role)}
                        </Badge>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={2}>
                          {(user.managers || []).length === 0 ? (
                            <Text color={muted} fontSize="sm">
                              No managers
                            </Text>
                          ) : (
                            user.managers.map((manager: any, index: number) => (
                              <HStack key={`${user._id}-${manager.level}`} spacing={2} wrap="wrap">
                                <Badge
                                  colorScheme={COLORS[index % COLORS.length]}
                                  borderRadius="full"
                                  px={2.5}
                                  py={0.5}
                                >
                                  L{manager.level}
                                </Badge>
                                <Text fontSize="sm">{manager.managerEmail}</Text>
                                <Badge
                                  colorScheme={manager.status === "ASSIGNED" ? "green" : "orange"}
                                  borderRadius="full"
                                >
                                  {manager.status}
                                </Badge>
                              </HStack>
                            ))
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={user.isActive ? "green" : "orange"} borderRadius="full" px={3} py={1}>
                          {user.isActive ? "Active" : "Pending"}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={user.passwordStatus === "SET" ? "green" : "red"}
                          borderRadius="full"
                          px={3}
                          py={1}
                        >
                          {user.passwordStatus === "SET" ? "Password Set" : "Not Set"}
                        </Badge>
                      </Td>
                      <Td textAlign="right">
                        <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                          Edit
                        </Button>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>

          <Flex justify="space-between" align="center" mt={5}>
            <Text color={muted} fontSize="sm">
              Page {userStore.pagination.page} of {userStore.pagination.totalPages}
            </Text>
            <HStack>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                isDisabled={page <= 1 || userStore.loading}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setPage((currentPage) => Math.min(userStore.pagination.totalPages, currentPage + 1))
                }
                isDisabled={page >= userStore.pagination.totalPages || userStore.loading}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </Box>
      </VStack>

      <Drawer isOpen={isUserDrawerOpen} placement="right" size="xl" onClose={() => setIsUserDrawerOpen(false)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid" borderColor={borderColor}>
            {userForm.id ? "Edit User" : "Add User"}
          </DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={6}>
              <Box>
                <Text fontWeight="bold" mb={3}>
                  Employee Details
                </Text>
                <Flex gap={4} direction={{ base: "column", md: "row" }}>
                  <FormControl isRequired>
                    <FormLabel>Employee Code</FormLabel>
                    <Input
                      value={userForm.code}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, code: event.target.value }))
                      }
                      placeholder="EMP001"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Employee Name</FormLabel>
                    <Input
                      value={userForm.name}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      placeholder="Enter employee name"
                    />
                  </FormControl>
                </Flex>
                <Flex gap={4} mt={4} direction={{ base: "column", md: "row" }}>
                  <FormControl isRequired>
                    <FormLabel>Email ID</FormLabel>
                    <Input
                      type="email"
                      value={userForm.email}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      placeholder="john@company.com"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Contact Number</FormLabel>
                    <Input
                      value={userForm.mobileNumber}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, mobileNumber: event.target.value }))
                      }
                      placeholder="9876543210"
                    />
                  </FormControl>
                </Flex>
                <Flex gap={4} mt={4} direction={{ base: "column", md: "row" }}>
                  <FormControl>
                    <FormLabel>Branch</FormLabel>
                    <Input
                      value={userForm.branch}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, branch: event.target.value }))
                      }
                      placeholder="Branch"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Designation</FormLabel>
                    <Input
                      value={userForm.designation}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, designation: event.target.value }))
                      }
                      placeholder="Designation"
                    />
                  </FormControl>
                </Flex>
                <Flex gap={4} mt={4} direction={{ base: "column", md: "row" }}>
                  <FormControl>
                    <FormLabel>City</FormLabel>
                    <Input
                      value={userForm.city}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, city: event.target.value }))
                      }
                      placeholder="City"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>State</FormLabel>
                    <Input
                      value={userForm.state}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, state: event.target.value }))
                      }
                      placeholder="State"
                    />
                  </FormControl>
                </Flex>
                <Flex gap={4} mt={4} direction={{ base: "column", md: "row" }}>
                  <FormControl>
                    <FormLabel>Joining Date</FormLabel>
                    <Input
                      type="date"
                      value={userForm.joiningDate}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, joiningDate: event.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Role</FormLabel>
                    <Select value={userForm.role} onChange={(event) => updateRole(event.target.value)}>
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </Flex>
                <FormControl mt={4}>
                  <FormLabel>Setup Email</FormLabel>
                  <Checkbox
                    isChecked={userForm.resendSetupEmail}
                    onChange={(event) =>
                      setUserForm((prev) => ({
                        ...prev,
                        resendSetupEmail: event.target.checked,
                      }))
                    }
                  >
                    {userForm.id ? "Resend setup email after update" : "Send password setup email"}
                  </Checkbox>
                </FormControl>
              </Box>

              <Divider />

              <Box>
                <Text fontWeight="bold" mb={3}>
                  Company
                </Text>
                {isSuperadmin ? (
                  <VStack align="stretch" spacing={4}>
                    <Checkbox
                      isChecked={userForm.createCompany}
                      onChange={(event) =>
                        setUserForm((prev) => ({
                          ...prev,
                          createCompany: event.target.checked,
                          companyId: event.target.checked ? "" : prev.companyId,
                          companyManagerLevels: event.target.checked
                            ? prev.companyManagerLevels || 3
                            : getCompanyManagerLevels(
                                managedCompanies.find((company: any) => company?._id === prev.companyId)
                              ),
                        }))
                      }
                    >
                      Create company automatically if it does not exist
                    </Checkbox>
                    {userForm.createCompany ? (
                      <Flex gap={4} direction={{ base: "column", md: "row" }}>
                        <FormControl isRequired>
                          <FormLabel>New Company Name</FormLabel>
                          <Input
                            value={userForm.companyName}
                            onChange={(event) =>
                              setUserForm((prev) => ({ ...prev, companyName: event.target.value }))
                            }
                            placeholder="Enter company name"
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Manager Levels</FormLabel>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={userForm.companyManagerLevels}
                            onChange={(event) =>
                              setUserForm((prev) => ({
                                ...prev,
                                companyManagerLevels: Number(event.target.value) || 1,
                              }))
                            }
                          />
                        </FormControl>
                      </Flex>
                    ) : (
                      <FormControl isRequired>
                        <FormLabel>Select Company</FormLabel>
                        <Select
                          placeholder="Choose a company"
                          value={userForm.companyId}
                          onChange={(event) =>
                            setUserForm((prev) => {
                              const nextCompany = managedCompanies.find(
                                (company: any) => company?._id === event.target.value
                              );
                              return {
                                ...prev,
                                companyId: event.target.value,
                                companyManagerLevels: getCompanyManagerLevels(nextCompany),
                              };
                            })
                          }
                        >
                          {filteredCompanies.map((company: any) => (
                            <option key={company._id} value={company._id}>
                              {company.company_name} ({getCompanyManagerLevels(company)} levels)
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </VStack>
                ) : (
                  <Box borderWidth="1px" borderColor={borderColor} borderRadius="xl" p={4}>
                    <Text fontSize="sm" color={muted}>
                      Users created here will be linked to your company.
                    </Text>
                    <Text fontWeight="semibold" mt={2}>
                      {currentCompanyName}
                    </Text>
                  </Box>
                )}
              </Box>

              <Divider />

              <Box>
                <Flex justify="space-between" align="start" mb={3}>
                  <Box>
                    <Text fontWeight="bold">Manager Hierarchy</Text>
                    <Text fontSize="sm" color={muted}>
                      {userForm.managers.length > 0
                        ? "Manager searches appear automatically based on the selected role level."
                        : "No higher-level manager selection is needed for this role."}
                    </Text>
                  </Box>
                  <Badge colorScheme="blue" borderRadius="full" px={3} py={1} textTransform="none">
                    {formatRoleLabel(userForm.role)}
                  </Badge>
                </Flex>

                {userForm.managers.length === 0 ? (
                  <Box borderWidth="1px" borderColor={borderColor} borderRadius="xl" p={4}>
                    <Text fontSize="sm" color={muted}>
                      This role sits at the top of the configured hierarchy, so no additional manager selection is required.
                    </Text>
                  </Box>
                ) : (
                  <VStack align="stretch" spacing={4}>
                    {userForm.managers.map((manager, index) => {
                      const resolvedEmail = normalizeEmail(
                        manager.selectedManager?.email || manager.selectedManager?.username
                      );
                      const isAssigned =
                        Boolean(manager.selectedManager?.value) &&
                        !String(manager.selectedManager?.value || "").startsWith("pending:");

                      return (
                        <Box
                          key={`manager-level-${manager.level}`}
                          borderWidth="1px"
                          borderColor={borderColor}
                          borderRadius="xl"
                          p={4}
                        >
                          <Flex
                            justify="space-between"
                            align={{ base: "start", md: "center" }}
                            direction={{ base: "column", md: "row" }}
                            gap={3}
                            mb={3}
                          >
                            <HStack spacing={3}>
                              <Badge
                                colorScheme={COLORS[index % COLORS.length]}
                                borderRadius="full"
                                px={3}
                                py={1}
                              >
                                L{manager.level}
                              </Badge>
                              <Text fontWeight="semibold">L{manager.level} Manager</Text>
                            </HStack>
                            <Badge
                              colorScheme={isAssigned ? "green" : resolvedEmail ? "orange" : "gray"}
                              borderRadius="full"
                              px={3}
                              py={1}
                            >
                              {isAssigned ? "Assigned" : resolvedEmail ? "Pending" : "Optional"}
                            </Badge>
                          </Flex>

                          <CustomInput
                            label={`Search L${manager.level} Manager`}
                            name={`manager-search-${manager.level}`}
                            type="real-time-user-search"
                            placeholder="Type name or email to search"
                            query={managerCompanyId ? { companyId: managerCompanyId } : {}}
                            value={manager.selectedManager}
                            isSearchable
                            isClear
                            onChange={(selected: any) => setManagerSelection(index, selected)}
                            disabled={!managerCompanyId && userForm.createCompany}
                          />

                          {!managerCompanyId && userForm.createCompany && (
                            <Text fontSize="sm" color={muted} mt={3}>
                              Manager search becomes available after selecting an existing company.
                            </Text>
                          )}

                          {resolvedEmail && (
                            <Text fontSize="sm" color={muted} mt={3}>
                              Selected: {resolvedEmail}
                            </Text>
                          )}
                        </Box>
                      );
                    })}
                  </VStack>
                )}
              </Box>
            </VStack>
          </DrawerBody>
          <DrawerFooter gap={3}>
            <Button variant="ghost" onClick={() => setIsUserDrawerOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={submitUser} isLoading={userStore.submitting}>
              {userForm.id ? "Save Changes" : "Create User"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} size="6xl">
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent mx={4} borderRadius="2xl">
          <ModalHeader>Bulk Upload Users</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={5}>
              {isSuperadmin ? (
                <Box borderWidth="1px" borderColor={borderColor} borderRadius="xl" p={4}>
                  <VStack align="stretch" spacing={4}>
                    <Checkbox
                      isChecked={bulkForm.createCompany}
                      onChange={(event) =>
                        setBulkForm((prev) => ({
                          ...prev,
                          createCompany: event.target.checked,
                          companyId: event.target.checked ? "" : prev.companyId,
                        }))
                      }
                    >
                      Create company automatically for this upload
                    </Checkbox>
                    {bulkForm.createCompany ? (
                      <Flex gap={4} direction={{ base: "column", md: "row" }}>
                        <FormControl isRequired>
                          <FormLabel>New Company Name</FormLabel>
                          <Input
                            value={bulkForm.companyName}
                            onChange={(event) =>
                              setBulkForm((prev) => ({ ...prev, companyName: event.target.value }))
                            }
                            placeholder="Enter company name"
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Manager Levels</FormLabel>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={bulkForm.companyManagerLevels}
                            onChange={(event) =>
                              setBulkForm((prev) => ({
                                ...prev,
                                companyManagerLevels: Number(event.target.value) || 1,
                              }))
                            }
                          />
                        </FormControl>
                      </Flex>
                    ) : (
                      <FormControl isRequired>
                        <FormLabel>Select Company</FormLabel>
                        <Select
                          placeholder="Choose a company"
                          value={bulkForm.companyId}
                          onChange={(event) =>
                            setBulkForm((prev) => {
                              const nextCompany = managedCompanies.find(
                                (company: any) => company?._id === event.target.value
                              );
                              return {
                                ...prev,
                                companyId: event.target.value,
                                companyManagerLevels: getCompanyManagerLevels(nextCompany),
                              };
                            })
                          }
                        >
                          {filteredCompanies.map((company: any) => (
                            <option key={company._id} value={company._id}>
                              {company.company_name} ({getCompanyManagerLevels(company)} levels)
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </VStack>
                </Box>
              ) : null}
              <Box
                {...getRootProps()}
                borderWidth="2px"
                borderStyle="dashed"
                borderColor={isDragActive ? "blue.400" : borderColor}
                borderRadius="2xl"
                p={8}
                textAlign="center"
                cursor="pointer"
                bg={isDragActive ? "blue.50" : "transparent"}
              >
                <input {...getInputProps()} />
                <Text fontWeight="bold">Drag & drop your Excel file here</Text>
                <Text color={muted} mt={2}>
                  Supported columns: Employee Code, Employee Name, Email ID, Contact Number, Branch, City, State, Designation, Joining Date, L1 Manager Email ID...
                </Text>
                {selectedFile && (
                  <Text mt={3} fontSize="sm" color="blue.600">
                    Selected file: {selectedFile.name}
                  </Text>
                )}
              </Box>
              <Box>
                <Text fontWeight="bold" mb={3}>
                  Preview
                </Text>
                <TableContainer borderWidth="1px" borderColor={borderColor} borderRadius="xl" maxH="420px" overflowY="auto">
                  <Table size="sm">
                    <Thead bg={tableHeadBg}>
                      <Tr>
                        <Th>Row</Th>
                        <Th>Name</Th>
                        <Th>Email</Th>
                        <Th>Role</Th>
                        <Th>Company</Th>
                        <Th>Managers</Th>
                        <Th>Action</Th>
                        <Th>Errors</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {userStore.uploadLoading ? (
                        <Tr>
                          <Td colSpan={8} py={8}>
                            <Text textAlign="center" color={muted}>
                              Reading Excel file...
                            </Text>
                          </Td>
                        </Tr>
                      ) : userStore.bulkPreview.length === 0 ? (
                        <Tr>
                          <Td colSpan={8} py={8}>
                            <Text textAlign="center" color={muted}>
                              Drop a file to preview rows before upload.
                            </Text>
                          </Td>
                        </Tr>
                      ) : (
                        userStore.bulkPreview.map((row: any) => (
                          <Tr key={`preview-${row.rowNumber}`}>
                            <Td>{row.rowNumber}</Td>
                            <Td>{row.name}</Td>
                            <Td>{row.email}</Td>
                            <Td>{row.role}</Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text>{row.company}</Text>
                                <Badge
                                  colorScheme={row.companyStatus === "EXISTS" ? "green" : "purple"}
                                  borderRadius="full"
                                >
                                  {row.companyStatus}
                                </Badge>
                              </VStack>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                {(row.managers || []).length === 0 ? (
                                  <Text fontSize="sm" color={muted}>
                                    None
                                  </Text>
                                ) : (
                                  row.managers.map((manager: any) => (
                                    <HStack key={`${row.rowNumber}-${manager.level}`}>
                                      <Badge colorScheme={COLORS[(manager.level - 1) % COLORS.length]}>
                                        L{manager.level}
                                      </Badge>
                                      <Text fontSize="sm">{manager.managerEmail}</Text>
                                      <Badge colorScheme={manager.status === "ASSIGNED" ? "green" : "orange"}>
                                        {manager.status}
                                      </Badge>
                                    </HStack>
                                  ))
                                )}
                              </VStack>
                            </Td>
                            <Td>
                              <Badge colorScheme={row.action === "CREATE" ? "blue" : "red"} borderRadius="full">
                                {row.action}
                              </Badge>
                            </Td>
                            <Td>
                              {(row.errors || []).length > 0 ? (
                                <Text fontSize="sm" color="red.500">
                                  {row.errors.join(", ")}
                                </Text>
                              ) : (
                                <Text fontSize="sm" color={muted}>
                                  No errors
                                </Text>
                              )}
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="ghost"
              onClick={() => {
                setIsBulkModalOpen(false);
                setSelectedFile(null);
                userStore.bulkPreview = [];
                setBulkForm({
                  companyId: "",
                  companyName: "",
                  companyManagerLevels: 3,
                  createCompany: false,
                });
              }}
            >
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={handleBulkUpload} isLoading={userStore.uploadLoading}>
              Upload Users
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default UsersView;
