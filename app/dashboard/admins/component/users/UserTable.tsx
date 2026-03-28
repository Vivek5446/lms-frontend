"use client";

import { Badge, Box, Tooltip } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { formatDate } from "../../../../component/config/utils/dateUtils";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import stores from "../../../../store/stores";

const UserTable = observer(({
  companyId,
  companyName,
  onAdd,
  onEdit,
  onDelete,
  showAddButton = true,
}: any) => {
  const {
    userStore: { getAllUsers, user },
    auth: { openNotification },
  } = stores;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 600);

  const applyGetAllAdmins = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false }) => {
      if (!companyId) {
        return;
      }

      const query: any = {
        page,
        limit,
        company: companyId,
        includeInactive: true,
        role: "admin",
        type: "admin",
      };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      getAllUsers(query).catch((err) => {
        openNotification({
          type: "error",
          title: "Failed to fetch admins",
          message: err?.message,
        });
      });
    },
    [companyId, debouncedSearchQuery, getAllUsers, openNotification]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [companyId]);

  useEffect(() => {
    applyGetAllAdmins({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, applyGetAllAdmins]);

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    applyGetAllAdmins({ reset: true });
  };

  const columns = [
    {
      headerName: "S.No.",
      key: "sno",
      props: { row: { textAlign: "center" } },
    },
    // {
    //   headerName: "Name",
    //   key: "name",
    //   type: "component",
    //   metaData: {
    //     component: (dt: any) => (
    //       <Box py={2}>
    //         <Text fontWeight="semibold">{dt.name || "-"}</Text>
    //         <Text fontSize="xs" color="gray.500">
    //           {dt.code || "-"}
    //         </Text>
    //       </Box>
    //     ),
    //   },
    // },
    {
      headerName: "Name",
      key: "name",
    },
    {
      headerName: "Code",
      key: "code",
    },
    {
      headerName: "Email",
      key: "username",
    },
    {
      headerName: "Status",
      key: "is_active",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Badge colorScheme={dt.is_active ? "green" : "orange"}>
            {dt.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    },
    {
      headerName: "Bio",
      key: "bio",
      type: "tooltip",
      function: (dt: any) =>
        dt.profileDetails?.personalInfo?.bio ? (
          <Tooltip label={dt.profileDetails.personalInfo.bio} hasArrow zIndex={9999}>
            <span>{dt.profileDetails.personalInfo.bio.slice(0, 50)}</span>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      headerName: "Created At",
      key: "createdAt",
      type: "component",
      metaData: {
        component: (dt: any) => <Box py={2}>{formatDate(dt?.createdAt)}</Box>,
      },
    },
    {
      headerName: "Actions",
      key: "table-actions",
      type: "table-actions",
      props: {
        row: { minW: 180, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ];

  return (
    <Box p={4}>
      <CustomTable
        title={companyName ? `${companyName} Admins` : "Admins"}
        data={
          user.data?.map((admin: any, index: number) => ({
            ...admin,
            sno: index + 1 + (currentPage - 1) * tablePageLimit,
          })) || []
        }
        columns={columns}
        actions={{
          actionBtn: {
            addKey: {
              showAddButton,
              function: () => onAdd(),
            },
            editKey: {
              showEditButton: true,
              function: (entry: any) => onEdit(entry),
            },
            viewKey: {
              showViewButton: false,
              function: () => null,
            },
            deleteKey: {
              showDeleteButton: true,
              function: (entry: any) => onDelete(entry),
            },
          },
          search: {
            show: true,
            searchValue: searchQuery,
            onSearchChange: (e: any) => setSearchQuery(e.target.value),
          },
          resetData: {
            show: true,
            text: "Reset Data",
            function: resetTableData,
          },
          pagination: {
            show: true,
            onClick: (page: number) => setCurrentPage(page),
            currentPage,
            totalPages: user.totalPages || 1,
          },
        }}
        loading={user.loading}
      />
    </Box>
  );
});

export default UserTable;
