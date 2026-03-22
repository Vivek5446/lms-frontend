"use client";
import {
  Badge,
  Box,
  Flex,
  Switch,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import useDebounce from "../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../component/config/utils/variable";
import { userStore } from "../../store/userStore/userStore";
import EditUserModal from "./components/EditUserModal";

const UsersView = observer(() => {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(search, 700);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const bg = useColorModeValue("white", "gray.800");
  const mutedText = useColorModeValue("gray.500", "gray.400");

  const fetchUsers = () => {
    userStore.getAllUsers({
      page: currentPage,
      limit: tablePageLimit,
      search: debouncedSearch,
      includeInactive: true, // Fetch all for admin
    });
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearch]);

  const handleToggleStatus = async (user: any) => {
    try {
      await userStore.toggleUserStatus(user._id);
      toast({
        title: "Status updated",
        description: `${user.name} is now ${user.is_active ? "inactive" : "active"}`,
        status: "success",
        duration: 3000,
      });
      fetchUsers(); // Refresh after toggle
    } catch (err: any) {
      toast({
        title: "Failed to update status",
        description: err.message || "An error occurred",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const tableColumns = useMemo(() => {
    return [
      {
        headerName: "Name",
        key: "name",
        type: "text",
        props: { row: { minW: 150 } },
      },
      {
        headerName: "Username / Email",
        key: "username",
        type: "text",
        props: { row: { minW: 200 } },
      },
      {
        headerName: "Code",
        key: "code",
        type: "text",
      },
      {
        headerName: "Role",
        key: "role",
        type: "component",
        metaData: {
          component: (dt: any) => (
            <Badge colorScheme="blue" rounded="full" px={2} py={0.5} fontSize="xs" textTransform="capitalize">
              {dt.role || dt.userType || "User"}
            </Badge>
          ),
        },
      },
      {
        headerName: "Active",
        key: "is_active",
        type: "component",
        metaData: {
          component: (dt: any) => (
            <Switch
              colorScheme="brand"
              isChecked={dt.is_active}
              onChange={() => handleToggleStatus(dt)}
            />
          ),
        },
        props: { row: { textAlign: "center" }, column: { textAlign: "center" } },
      },
      {
        headerName: "Actions",
        key: "table-actions",
        type: "table-actions",
        props: { row: { textAlign: "center" }, column: { textAlign: "center" } },
      },
    ];
  }, [fetchUsers]);

  return (
    <Box p={{ base: 4, md: 6 }} minH="100vh">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
        <VStack align="start" spacing={0}>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
            Users
          </Text>
          <Text fontSize="sm" color={mutedText}>
            Manage users in your organization
          </Text>
        </VStack>
      </Flex>

      {/* Table */}
      <Box>
        <CustomTable
          data={userStore.user.data}
          columns={tableColumns}
          loading={userStore.user.loading}
          serial={{ show: true, text: "S.No." }}
          actions={{
            actionBtn: {
              editKey: {
                showEditButton: true,
                function: handleEditClick,
              },
            },
            search: {
              show: true,
              searchValue: search,
              placeholder: "Search users...",
              onSearchChange: (e: any) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              },
            },
            resetData: {
              show: true,
              text: "Reset",
              function: () => {
                setSearch("");
                setCurrentPage(1);
              },
            },
            pagination: {
              show: true,
              currentPage,
              totalPages: userStore.user.totalPages,
              onClick: (p: number) => setCurrentPage(p),
            },
          }}
        />
      </Box>

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={fetchUsers}
        />
      )}
    </Box>
  );
});

export default UsersView;
