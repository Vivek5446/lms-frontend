"use client";

import {
  Badge,
  Box,
  Divider,
  Flex,
  HStack,
  Tab,
  TabList,
  Tabs,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { FiBriefcase, FiMapPin, FiUser, FiUsers } from "react-icons/fi";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable";

const COLORS = ["blue", "purple", "orange", "green", "pink", "cyan"];

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
  formatRoleLabel: (role: string) => string;
  canEdit?: boolean;
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
  formatRoleLabel,
  canEdit = true,
}: Props) => {
  const columns = [
    {
      headerName: "Name",
      key: "name",
      type: "component",
      metaData: {
        component: (user: any) => (
          <HStack spacing={3}>
            <Box color="blue.500">
              <FiUser size={18} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontWeight="semibold">{user.name || "--"}</Text>
              <Text fontSize="xs" color={muted}>
                {user.code || "No code"}
              </Text>
            </VStack>
          </HStack>
        ),
      },
    },
    {
      headerName: "Email",
      key: "email",
      type: "component",
      metaData: {
        component: (user: any) => (
          <Text fontSize="sm" color="gray.600">
            {user.email || "--"}
          </Text>
        ),
      },
    },
    {
      headerName: "Department",
      key: "department",
      type: "component",
      metaData: {
        component: (user: any) => (
          <VStack align="start" spacing={0.5}>
            <HStack fontSize="sm">
              <FiMapPin color="#718096" />
              <Text>{user.department || "--"}</Text>
            </HStack>
            <Text fontSize="xs" color={muted}>
              {[user.city, user.state].filter(Boolean).join(", ") || "No location"}
            </Text>
          </VStack>
        ),
      },
    },
    {
      headerName: "Company",
      key: "company",
      type: "component",
      metaData: {
        component: (user: any) => (
          <HStack spacing={2}>
            <Box color="purple.500">
              <FiBriefcase size={16} />
            </Box>
            <Text fontSize="sm">
              {user.company?.name || user.company?.company_name || "Unassigned"}
            </Text>
          </HStack>
        ),
      },
    },
    {
      headerName: "Role",
      key: "role",
      type: "component",
      metaData: {
        component: (user: any) => (
          <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full" fontWeight="medium">
            {formatRoleLabel(user.role)}
          </Badge>
        ),
      },
    },
    {
      headerName: "Managers",
      key: "managers",
      type: "component",
      metaData: {
        component: (user: any) => {
          const managers = user.managers || [];
          const visibleManagers = managers.slice(0, 3);
          const extraCount = managers.length - 3;

          if (managers.length === 0) {
            return (
              <Text fontSize="sm" color={muted} fontStyle="italic">
                No managers assigned
              </Text>
            );
          }

          return (
            <Tooltip
              hasArrow
              placement="top-start"
              label={
                <VStack align="stretch" spacing={3} p={1}>
                  <HStack>
                    <FiUsers size={18} />
                    <Text fontWeight="bold">Manager Hierarchy</Text>
                  </HStack>
                  <Divider />
                  {managers.map((manager: any, index: number) => (
                    <Flex key={`${user._id}-${manager.level}`} justify="space-between" align="center" gap={3}>
                      <HStack>
                        <Badge colorScheme={COLORS[index % COLORS.length]} borderRadius="full">
                          L{manager.level}
                        </Badge>
                        <Text>{manager.managerEmail}</Text>
                      </HStack>
                      <Badge colorScheme={manager.status === "ASSIGNED" ? "green" : "orange"}>
                        {manager.status}
                      </Badge>
                    </Flex>
                  ))}
                </VStack>
              }
            >
              <HStack spacing={1} cursor="pointer">
                {visibleManagers.map((manager: any, index: number) => (
                  <Badge
                    key={`${user._id}-${manager.level}`}
                    colorScheme={COLORS[index % COLORS.length]}
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                    fontSize="xs"
                  >
                    L{manager.level}
                  </Badge>
                ))}
                {extraCount > 0 ? (
                  <Badge variant="outline" borderRadius="full" px={2} fontSize="xs">
                    +{extraCount}
                  </Badge>
                ) : null}
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
      metaData: {
        component: (user: any) => (
          <Badge colorScheme={user.isActive ? "green" : "orange"} px={3} py={1} borderRadius="full">
            {user.isActive ? "Active" : "Pending"}
          </Badge>
        ),
      },
    },
    {
      headerName: "Password",
      key: "passwordStatus",
      type: "component",
      metaData: {
        component: (user: any) => (
          <Badge colorScheme={user.passwordStatus === "SET" ? "green" : "red"} px={3} py={1} borderRadius="full">
            {user.passwordStatus === "SET" ? "Set" : "Not Set"}
          </Badge>
        ),
      },
    },
    {
      headerName: "Actions",
      key: "table-actions",
      type: "table-actions",
      props: {
        row: { minW: 140, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ];

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Tabs
          variant="soft-rounded"
          colorScheme="blue"
          size={'sm'}
          index={activeTabIndex}
          onChange={(index) => {
            setListTab(listTabs[index]?.value || "user");
            setPage(1);
          }}
        >
          <TabList gap={2} flexWrap="wrap">
            {listTabs.map((tab) => (
              <Tab key={tab.value}>{tab.label}</Tab>
            ))}
          </TabList>
        </Tabs>

        <Text fontSize="sm" color={muted} fontWeight="medium">
          {pagination.total} total {activeTabLabel.toLowerCase()}
        </Text>
      </Flex>

      <CustomTable
        title="User Directory"
        // subTitle={`Viewing ${activeTabLabel.toLowerCase()} records`}
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
              function: (user: any) => onEdit(user),
            },
            viewKey: {
              showViewButton: true,
              title: "View User",
              function: (user: any) => onView(user),
            },
            deleteKey: {
              showDeleteButton: false,
            },
          },
          search: {
            show: true,
            placeholder: "Search by name, email, role, or creator",
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
    </Box>
  );
};

export default UsersTable;
