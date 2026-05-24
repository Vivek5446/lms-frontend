"use client";
import PermissionGate from "@/app/component/common/PermissionGate";
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
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
      return { Icon: FiGrid, gradient: "from-teal-400 to-cyan-500", bgGradient: "linear(to-r, teal.400, cyan.500)" };
    case "Users":
      return { Icon: FiUsers, gradient: "from-violet-400 to-fuchsia-500", bgGradient: "linear(to-r, violet.400, fuchsia.500)" };
    case "Courses":
      return { Icon: FiBarChart2, gradient: "from-blue-400 to-indigo-500", bgGradient: "linear(to-r, blue.400, indigo.500)" };
    case "Batches":
      return { Icon: FiDatabase, gradient: "from-pink-400 to-rose-500", bgGradient: "linear(to-r, pink.400, rose.500)" };
    case "Permissions":
      return { Icon: FiShield, gradient: "from-amber-400 to-orange-500", bgGradient: "linear(to-r, amber.400, orange.500)" };
    default:
      return { Icon: FiGrid, gradient: "from-teal-400 to-cyan-500", bgGradient: "linear(to-r, teal.400, cyan.500)" };
  }
};

const PermissionsPage = observer(() => {
  const toast = useToast();
  const { auth, companyStore, userStore } = stores;
  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const canManagePermissions = role === "superadmin";
  const companyId = companyStore.getActiveCompanyId();
  const [selectedRole, setSelectedRole] = useState("admin");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [roleDraft, setRoleDraft] = useState<Record<string, boolean>>({});
  const [userDraft, setUserDraft] = useState<Record<string, boolean>>({});

  // Dark mode color values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const headerBgColor = useColorModeValue("from-violet-50 to-teal-50", "from-gray-800 to-gray-700");
  const headerBorderColor = useColorModeValue("violet.100", "gray.600");
  const textColor = useColorModeValue("gray.900", "white");
  const textSecondaryColor = useColorModeValue("gray.600", "gray.400");
  const textMutedColor = useColorModeValue("gray.500", "gray.500");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const tableRowHoverBg = useColorModeValue("gray.50", "gray.700");
  const categoryHeaderBg = useColorModeValue("gray.50", "gray.700");
  const infoBoxBg = useColorModeValue("from-amber-50 to-yellow-50", "from-gray-700 to-gray-600");
  const infoBoxBorderColor = useColorModeValue("amber.100", "gray.600");
  const infoBoxTextColor = useColorModeValue("amber.700", "amber.300");
  const badgeBgColor = useColorModeValue("teal.100", "teal.900");
  const badgeTextColor = useColorModeValue("teal.700", "teal.300");
  const userBadgeBgColor = useColorModeValue("amber.100", "amber.900");
  const userBadgeTextColor = useColorModeValue("amber.700", "amber.300");
  const selectBgColor = useColorModeValue("white", "gray.700");
  const selectBorderColor = useColorModeValue("gray.200", "gray.600");
  const dashedBorderColor = useColorModeValue("gray.200", "gray.700");
  const emptyStateBgColor = useColorModeValue("gray.50", "gray.800");
  const emptyStateTextColor = useColorModeValue("gray.400", "gray.500");

  useEffect(() => {
    if (!canManagePermissions) {
      return;
    }

    companyStore.getManagedCompanies().catch(() => undefined);
  }, [canManagePermissions, companyStore]);

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
  const configurableUsers = useMemo(
    () =>
      userStore.users.filter((user: any) =>
        ["admin", "departmenthead"].includes(String(user?.role || "").toLowerCase())
      ),
    [userStore.users]
  );

  const selectedUser = useMemo(
    () => configurableUsers.find((user: any) => user._id === selectedUserId) || null,
    [configurableUsers, selectedUserId]
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

  useEffect(() => {
    if (selectedUserId && !selectedUser) {
      setSelectedUserId("");
    }
  }, [selectedUser, selectedUserId]);

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
            : "bg-gray-200 dark:bg-gray-600"}`}
      />
      <div
        className={`absolute left-1 top-1 h-5 w-5 rounded-3xl bg-white shadow transition-all duration-200
          ${checked ? "translate-x-5" : ""}`}
      />
    </label>
  );

  const permissionTable = (
    draft: Record<string, boolean>,
    onToggle: (key: string, value: boolean) => void
  ) => (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr bg={tableHeaderBg}>
            <Th width="30%" color={textColor} borderColor={borderColor}>Permission</Th>
            <Th width="50%" color={textColor} borderColor={borderColor}>Description</Th>
            <Th width="20%" textAlign="center" color={textColor} borderColor={borderColor}>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(groupedCatalog).map(([category, permissions]: any) => {
            const { Icon: CategoryIcon, bgGradient } = getCategoryStyle(category);
            
            // Category header row
            return [
              <Tr key={`${category}-header`} bg={categoryHeaderBg}>
                <Td colSpan={3} p={3} borderColor={borderColor}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r ${getCategoryStyle(category).gradient} text-white`}
                    >
                      <CategoryIcon size={18} />
                    </div>
                    <div>
                      <Text fontWeight="bold" fontSize="md" color={textColor}>
                        {category}
                      </Text>
                      <Text fontSize="xs" color={textMutedColor}>
                        {permissions.length} permission{permissions.length !== 1 ? "s" : ""}
                      </Text>
                    </div>
                  </div>
                </Td>
              </Tr>,
              // Permission rows for this category
              ...permissions.map((permission: any) => (
                <Tr key={permission.key} _hover={{ bg: tableRowHoverBg }}>
                  <Td borderColor={borderColor}>
                    <Text fontWeight="semibold" color={textColor}>
                      {permission.label}
                    </Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize="sm" color={textSecondaryColor}>
                      {permission.description}
                    </Text>
                  </Td>
                  <Td textAlign="center" borderColor={borderColor}>
                    <div className="flex justify-center">
                      <CustomSwitch
                        checked={Boolean(draft?.[permission.key])}
                        onChange={(value) => onToggle(permission.key, value)}
                        gradient={getCategoryStyle(category).gradient}
                      />
                    </div>
                  </Td>
                </Tr>
              ))
            ];
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );

  return (
    <PermissionGate
      allowed={canManagePermissions}
      title="Permissions access is disabled"
      description="Only Super Admins can edit role defaults and user permission overrides."
      fallbackHref="/dashboard/profile"
    >
      <Box minH="100vh" bg={bgColor}>
        <div className="px-6 lg:px-2">
          <Stack spacing={6}>
            {/* Header */}
            <Box
              className={`rounded-3xl bg-gradient-to-r ${headerBgColor} border p-6`}
              borderColor={headerBorderColor}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Heading size="xl" className="tracking-tighter" color={textColor}>
                    Permissions
                  </Heading>
                  <Text className="mt-1 text-base" color={textSecondaryColor}>
                    Role defaults + user overrides
                  </Text>
                </div>
                <div className="hidden items-center gap-2 rounded-3xl bg-white dark:bg-gray-800 px-4 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 shadow-sm md:flex">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                  LIVE SYNC
                </div>
              </div>
            </Box>

            {/* Role Defaults */}
            <Box
              borderRadius="3xl"
              bg={cardBgColor}
              borderWidth="1px"
              borderColor={borderColor}
              p={6}
              shadow="sm"
            >
              <Stack spacing={7}>
                <div className="flex items-center justify-between">
                  <Heading size="md" className="flex items-center gap-3" color={textColor}>
                    Role Defaults
                  </Heading>
                  <span className={`rounded-3xl ${badgeBgColor} px-4 py-1 text-xs font-semibold ${badgeTextColor}`}>
                    COMPANY-WIDE
                  </span>
                </div>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  <FormControl>
                    <FormLabel className="text-sm font-semibold" color={textMutedColor}>
                      Role
                    </FormLabel>
                    <Select
                      value={selectedRole}
                      onChange={(event) => setSelectedRole(event.target.value)}
                      bg={selectBgColor}
                      borderColor={selectBorderColor}
                      color={textColor}
                      _hover={{ borderColor: "teal.300" }}
                      className="h-11 rounded-3xl text-base focus:border-teal-300 focus:ring-teal-300"
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
                  permissionTable(roleDraft, handleRoleToggle)
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
              bg={cardBgColor}
              borderWidth="1px"
              borderColor={borderColor}
              p={7}
              shadow="sm"
            >
              <Stack spacing={7}>
                <div className="flex items-center justify-between">
                  <Heading size="lg" className="flex items-center gap-3" color={textColor}>
                    <span className="text-3xl drop-shadow-sm">👤</span>
                    User Overrides
                  </Heading>
                  <span className={`rounded-3xl ${userBadgeBgColor} px-4 py-1 text-xs font-semibold ${userBadgeTextColor}`}>
                    INDIVIDUAL
                  </span>
                </div>

                <FormControl>
                  <FormLabel className="text-sm font-semibold" color={textMutedColor}>
                    User
                  </FormLabel>
                  <Select
                    placeholder="Select a user to override"
                    value={selectedUserId}
                    onChange={(event) => setSelectedUserId(event.target.value)}
                    bg={selectBgColor}
                    borderColor={selectBorderColor}
                    color={textColor}
                    _hover={{ borderColor: "teal.300" }}
                    className="h-11 rounded-3xl text-base focus:border-teal-300 focus:ring-teal-300"
                  >
                    {configurableUsers.map((user: any) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email}) — {user.role}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {selectedUser ? (
                  <>
                    <div className={`rounded-2xl bg-gradient-to-r ${infoBoxBg} p-4 text-sm flex items-center gap-3 border ${infoBoxBorderColor}`}>
                      <span className="text-2xl">⚡</span>
                      <span className={infoBoxTextColor}>
                        Overrides applied <span className="font-semibold">on top</span> of role defaults
                      </span>
                    </div>

                    {permissionTable(userDraft, handleUserToggle)}

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
                  <div className={`flex h-56 flex-col items-center justify-center rounded-3xl border border-dashed ${dashedBorderColor} ${emptyStateBgColor} text-center`}>
                    <Text color={emptyStateTextColor} fontSize="lg">
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
