"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Input,
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
  useToast
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import useDebounce from "../../component/config/component/customHooks/useDebounce";
import stores from "../../store/stores";
import BulkUploadModal from "./components/BulkUploadModal";
import UserDetailsModal from "./components/UserDetailsModal";
import UserDrawer from "./components/UserDrawer";
import UsersTable from "./components/UsersTable";
import UsersHeader from "./components/UsersHeader";

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
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
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

  const openView = (user: any) => {
    setSelectedUser(user);
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
      const createdCount = response?.data?.createdCount || 0;
      const updatedCount = response?.data?.updatedCount || 0;
      const failedCount = response?.data?.failedCount || 0;
      toast({
        title: failedCount > 0 ? "Partial success" : "Bulk upload complete",
        description:
          response?.message ||
          `${createdCount} created, ${updatedCount} updated, and ${failedCount} failed.`,
        status: failedCount > 0 ? "info" : "success",
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

        <UsersHeader
  onOpenBulk={() => setIsBulkModalOpen(true)}
  onOpenCreate={openCreate}
  borderColor={borderColor}
  muted={muted}
/>

<UsersTable
  users={userStore.users}
  loading={userStore.loading}
  pagination={userStore.pagination}
  search={search}
  setSearch={setSearch}
  page={page}
  setPage={setPage}
  listTabs={listTabs}
  listTab={listTab}
  setListTab={setListTab}
  activeTabIndex={activeTabIndex}
  activeTabLabel={activeTabLabel}
  tableHeadBg={tableHeadBg}
  borderColor={borderColor}
  muted={muted}
  onEdit={openEdit}
  onView={openView}
  formatRoleLabel={formatRoleLabel}
/>
      
      </VStack>

      <UserDrawer
  isOpen={isUserDrawerOpen}
  onClose={() => setIsUserDrawerOpen(false)}
  userForm={userForm}
  setUserForm={setUserForm}
  roleOptions={roleOptions}
  isSuperadmin={isSuperadmin}
  managedCompanies={managedCompanies}
  filteredCompanies={filteredCompanies}
  borderColor={borderColor}
  muted={muted}
  currentCompanyName={currentCompanyName}
  managerCompanyId={managerCompanyId}
  updateRole={updateRole}
  setManagerSelection={setManagerSelection}
  onSubmit={submitUser}
  loading={userStore.submitting}
/>

<BulkUploadModal
  isOpen={isBulkModalOpen}
  onClose={() => setIsBulkModalOpen(false)}
  bulkForm={bulkForm}
  setBulkForm={setBulkForm}
  isSuperadmin={isSuperadmin}
  managedCompanies={managedCompanies}
  filteredCompanies={filteredCompanies}
  borderColor={borderColor}
  tableHeadBg={tableHeadBg}
  muted={muted}
  getRootProps={getRootProps}
  getInputProps={getInputProps}
  isDragActive={isDragActive}
  selectedFile={selectedFile}
  setSelectedFile={setSelectedFile}
  preview={userStore.bulkPreview}
  loading={userStore.uploadLoading}
  onUpload={handleBulkUpload}
/>

<UserDetailsModal
  isOpen={!!selectedUser}
  onClose={() => setSelectedUser(null)}
  user={selectedUser}
  formatRoleLabel={formatRoleLabel}
/>
    </Box>
  );
});

export default UsersView;
