"use client";
import PermissionGate from "@/app/component/common/PermissionGate";
import { PERMISSION_KEYS, hasPermission } from "@/app/config/utils/permissions";
import stores from "@/app/store/stores";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import {
  FiBarChart2,
  FiDatabase,
  FiGrid,
  FiShield,
  FiUsers,
} from "react-icons/fi";

function buildPermissionDraft(catalog: any[], source: Record<string, boolean> = {}) {
  return catalog.reduce<Record<string, boolean>>((acc, item) => {
    acc[item.key] = Boolean(source?.[item.key]);
    return acc;
  }, {});
}

// Updated category styles based on real API data
const getCategoryStyle = (category: string) => {
  switch (category) {
    case "Navigation":
      return { Icon: FiGrid, gradient: "from-teal-400 to-cyan-500" };
    case "Users":
      return { Icon: FiUsers, gradient: "from-violet-400 to-fuchsia-500" };
    case "Courses":
      return { Icon: FiBarChart2, gradient: "from-blue-400 to-indigo-500" };
    case "Batches":
      return { Icon: FiDatabase, gradient: "from-pink-400 to-rose-500" };
    case "Permissions":
      return { Icon: FiShield, gradient: "from-amber-400 to-orange-500" };
    default:
      return { Icon: FiGrid, gradient: "from-teal-400 to-cyan-500" };
  }
};

const PermissionsPage = observer(() => {
  const toast = useToast();
  const { auth, companyStore, userStore } = stores;
  const canManagePermissions = hasPermission(auth.user, PERMISSION_KEYS.MANAGE_PERMISSIONS);
  const companyId = companyStore.getActiveCompanyId();
  const [selectedRole, setSelectedRole] = useState("admin");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [roleDraft, setRoleDraft] = useState<Record<string, boolean>>({});
  const [userDraft, setUserDraft] = useState<Record<string, boolean>>({});

  useEffect(() => {
    companyStore.getManagedCompanies().catch(() => undefined);
  }, [companyStore]);

  useEffect(() => {
    if (!companyId || !canManagePermissions) {
      return;
    }
    userStore.fetchPermissionConfig(companyId).catch(() => undefined);
    userStore.fetchUsers({
      page: 1,
      limit: 100,
      companyId,
    }).catch(() => undefined);
  }, [canManagePermissions, companyId, userStore]);

  const config = userStore.permissionConfig;
  const catalog = config?.catalog || [];
  const roles = config?.roles || [];

  const selectedUser = useMemo(
    () => userStore.users.find((user) => user._id === selectedUserId) || null,
    [selectedUserId, userStore.users]
  );

  const groupedCatalog = useMemo(() => {
    return catalog.reduce((acc: Record<string, any[]>, item: any) => {
      const category = item.category || "Miscellaneous";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
  }, [catalog]);

  useEffect(() => {
    if (!selectedRole && roles[0]?.value) {
      setSelectedRole(roles[0].value);
    }
  }, [roles, selectedRole]);

  useEffect(() => {
    setRoleDraft(
      buildPermissionDraft(catalog, config?.rolePermissions?.[selectedRole] || {})
    );
  }, [catalog, config?.rolePermissions, selectedRole]);

  useEffect(() => {
    setUserDraft(
      buildPermissionDraft(catalog, selectedUser?.permissionOverrides || {})
    );
  }, [catalog, selectedUser]);

  const handleRoleToggle = (key: string, value: boolean) => {
    setRoleDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleUserToggle = (key: string, value: boolean) => {
    setUserDraft((prev) => ({ ...prev, [key]: value }));
  };

  const saveRolePermissions = async () => {
    try {
      await userStore.updateRolePermissions(selectedRole, roleDraft, companyId);
      await auth.fetchUser();
      toast({
        title: "Role permissions updated",
        status: "success",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Unable to update role permissions",
        description: error?.error || error?.message || "Please try again.",
        status: "error",
        duration: 4000,
      });
    }
  };

  const saveUserPermissions = async () => {
    if (!selectedUserId) {
      return;
    }
    try {
      await userStore.updateUserPermissions(selectedUserId, userDraft);
      if (selectedUserId === auth.user?._id) {
        await auth.fetchUser();
      }
      toast({
        title: "User overrides updated",
        status: "success",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Unable to update user overrides",
        description: error?.error || error?.message || "Please try again.",
        status: "error",
        duration: 4000,
      });
    }
  };

  const CustomSwitch = ({
    checked,
    onChange,
    gradient,
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
    gradient: string;
  }) => (
    <label className="relative inline-flex cursor-pointer items-center flex-shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className={`h-7 w-12 rounded-3xl transition-all duration-200
          ${checked 
            ? `bg-gradient-to-r ${gradient} shadow-inner` 
            : "bg-gray-200"}`}
      />
      <div
        className={`absolute left-1 top-1 h-5 w-5 rounded-3xl bg-white shadow transition-all duration-200
          ${checked ? "translate-x-5" : ""}`}
      />
    </label>
  );

  const permissionCards = (
    draft: Record<string, boolean>,
    onToggle: (key: string, value: boolean) => void
  ) => (
    <div className="space-y-10">
      {Object.entries(groupedCatalog).map(([category, permissions]:any) => {
        const { Icon: CategoryIcon, gradient } = getCategoryStyle(category);
        return (
          <div key={category}>
            {/* Category header with React Icon + per-category gradient */}
            <div className="mb-5 flex items-center gap-3">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white text-xl shadow-sm`}
              >
                <CategoryIcon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold tracking-tight text-gray-900">
                  {category}
                </h3>
                <div className="text-xs font-medium uppercase tracking-widest text-violet-600">
                  {permissions.length} permission{permissions.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* 3 columns on desktop */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {permissions.map((permission: any) => (
                <div
                  key={permission.key}
                  className="group flex items-start justify-between gap-5 rounded-3xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-violet-200 hover:bg-gradient-to-br hover:from-white hover:to-violet-50"
                >
                  <div className="flex-1">
                    <div className="text-base font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                      {permission.label}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">
                      {permission.description}
                    </p>
                  </div>

                  <div className="pt-1">
                    <CustomSwitch
                      checked={Boolean(draft?.[permission.key])}
                      onChange={(value) => onToggle(permission.key, value)}
                      gradient={gradient}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <PermissionGate
      allowed={canManagePermissions}
      title="Permissions access is disabled"
      description="Only Super Admins with permission management access can edit these settings."
      fallbackHref="/dashboard/profile"
    >
      <Box minH="100vh" bg="gray.50">
        <div className="px-6 lg:px-2">
          <Stack spacing={6}>
            {/* Header */}
            <Box
              className="rounded-3xl bg-gradient-to-r from-violet-50 to-teal-50 border border-violet-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Heading size="xl" className="tracking-tighter text-gray-900">
                    Permissions
                  </Heading>
                  <Text className="mt-1 text-base text-gray-600">
                    Role defaults + user overrides
                  </Text>
                </div>
                <div className="hidden items-center gap-2 rounded-3xl bg-white px-4 py-1.5 text-xs font-semibold text-teal-700 shadow-sm md:flex">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                  LIVE SYNC
                </div>
              </div>
            </Box>

            {/* Role Defaults */}
            <Box
              borderRadius="3xl"
              bg="white"
              borderWidth="1px"
              borderColor="gray.100"
              p={6}
              shadow="sm"
            >
              <Stack spacing={7}>
                <div className="flex items-center justify-between">
                  <Heading size="md" className="flex items-center gap-3 text-gray-900">
                    {/* <span className="text-3xl drop-shadow-sm">👑</span> */}
                    Role Defaults
                  </Heading>
                  <span className="rounded-3xl bg-teal-100 px-4 py-1 text-xs font-semibold text-teal-700">
                    COMPANY-WIDE
                  </span>
                </div>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
             

                  <FormControl>
                    <FormLabel className="text-sm font-semibold text-gray-500">Role</FormLabel>
                    <Select
                      value={selectedRole}
                      onChange={(event) => setSelectedRole(event.target.value)}
                      className="h-11 rounded-3xl border-gray-200 text-base focus:border-teal-300 focus:ring-teal-300"
                    >
                      {roles.map((role: any) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {userStore.permissionLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Spinner size="xl" color="teal.400" />
                  </div>
                ) : (
                  permissionCards(roleDraft, handleRoleToggle)
                )}

                <Button
                  alignSelf="flex-start"
                  colorScheme="teal"
                  size="lg"
                  height="12"
                  px={8}
                  fontSize="md"
                  rounded="full"
                  onClick={saveRolePermissions}
                  isLoading={userStore.permissionSaving}
                >
                  Save Role Defaults
                </Button>
              </Stack>
            </Box>

            {/* User Overrides */}
            <Box
              borderRadius="3xl"
              bg="white"
              borderWidth="1px"
              borderColor="gray.100"
              p={7}
              shadow="sm"
            >
              <Stack spacing={7}>
                <div className="flex items-center justify-between">
                  <Heading size="lg" className="flex items-center gap-3 text-gray-900">
                    <span className="text-3xl drop-shadow-sm">👤</span>
                    User Overrides
                  </Heading>
                  <span className="rounded-3xl bg-amber-100 px-4 py-1 text-xs font-semibold text-amber-700">
                    INDIVIDUAL
                  </span>
                </div>

                <FormControl>
                  <FormLabel className="text-sm font-semibold text-gray-500">User</FormLabel>
                  <Select
                    placeholder="Select a user to override"
                    value={selectedUserId}
                    onChange={(event) => setSelectedUserId(event.target.value)}
                    className="h-11 rounded-3xl border-gray-200 text-base focus:border-teal-300 focus:ring-teal-300"
                  >
                    {userStore.users.map((user: any) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email}) — {user.role}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {selectedUser ? (
                  <>
                    <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 p-4 text-sm flex items-center gap-3 border border-amber-100">
                      <span className="text-2xl">⚡</span>
                      <span className="text-amber-700">
                        Overrides applied <span className="font-semibold">on top</span> of role defaults
                      </span>
                    </div>

                    {permissionCards(userDraft, handleUserToggle)}

                    <Button
                      alignSelf="flex-start"
                      colorScheme="teal"
                      size="lg"
                      height="12"
                      px={8}
                      fontSize="md"
                      rounded="full"
                      onClick={saveUserPermissions}
                      isLoading={userStore.permissionSaving}
                    >
                      Save User Overrides
                    </Button>
                  </>
                ) : (
                  <div className="flex h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 text-center">
                    <Text color="gray.400" fontSize="lg">
                      Select a user above to edit overrides
                    </Text>
                  </div>
                )}
              </Stack>
            </Box>
          </Stack>
        </div>
      </Box>
    </PermissionGate>
  );
});

export default PermissionsPage;