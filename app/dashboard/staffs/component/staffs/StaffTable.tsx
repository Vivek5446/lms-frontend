import {
  Avatar,
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { GiPsychicWaves } from "react-icons/gi";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import { genderOptions } from "../../../../config/constant";
import { copyToClipboard } from "../../../../config/utils/function";
import stores from "../../../../store/stores";
import ViewUser from "./ViewUser";

const StaffTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const {
    userStore: { getAllUsers, user },
    auth: { openNotification },
  } = stores;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedTherapist] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const applyGetAllTherapists = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit, type: "staff" };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      getAllUsers(query)
        .then(() => {})
        .catch((err) => {
          openNotification({
            type: "error",
            title: "Failed to get users",
            message: err?.message,
          });
        });
    },
    [debouncedSearchQuery, getAllUsers, openNotification]
  );

  useEffect(() => {
    applyGetAllTherapists({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, applyGetAllTherapists]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    applyGetAllTherapists({ reset: true });
  };

  const handleRowClick = (user: any) => {
    setSelectedTherapist(user);
    onOpen();
  };

  const UserTableColumns = [
    {
      headerName: "S.No.",
      key: "sno",
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Pic",
      key: "user",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box m={1}>
            <Avatar src={dt.pic?.url} name={dt.pic?.name} size="sm" />
          </Box>
        ),
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: "Name",
      key: "name",
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Code",
      key: "code",
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Gender",
      key: "gender",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const genderLabel =
            genderOptions.find((option: any) => option.value === dt?.gender)
              ?.label || "--";
          const colorScheme =
            genderLabel === "Male"
              ? "blue"
              : genderLabel === "Female"
              ? "pink"
              : "gray";

          return (
            <Box m={1} textAlign="center" minW="120px">
              <Badge
                colorScheme={colorScheme}
                variant="solid"
                px={4}
                py={1.5}
                borderRadius="full"
                fontSize="xs"
                fontWeight="semibold"
                boxShadow="sm"
              >
                {genderLabel}
              </Badge>
            </Box>
          );
        },
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
    {
      headerName: "Mobile No.",
      key: "mobile",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const number =
            dt.phones?.find((it: any) => it.primary)?.number || "--";
          const displayNumber =
            number !== "--" ? `•••${number.slice(-4)}` : "--";

          return (
            <Tooltip label={`Click to copy: ${number}`} hasArrow>
              <Box
                m={1}
                textAlign="center"
                cursor={number !== "--" ? "pointer" : "default"}
                onClick={() => copyToClipboard(number)}
              >
                {displayNumber}
              </Box>
            </Tooltip>
          );
        },
      },
      props: {
        row: { minW: 10, textAlign: "center" },
        column: { textAlign: "center" },
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
        title="Staffs"
        data={
          user.data?.map((t: any, index: number) => {
            return {
              ...t,
              ...t.profileDetails?.personalInfo,
              sno: index + 1,
            };
          }) || []
        }
        columns={UserTableColumns}
        actions={{
          actionBtn: {
            addKey: {
              showAddButton: true,
              function: () => {
                onAdd();
              },
            },
            editKey: {
              showEditButton: true,
              function: (e: any) => {
                onEdit(e);
              },
            },
            viewKey: {
              showViewButton: true,
              function: (e: any) => {
                handleRowClick(e);
              },
            },
            deleteKey: {
              showDeleteButton: true,
              function: (e: any) => {
                onDelete(e);
              },
            },
          },
          search: {
            show: true,
            searchValue: searchQuery,
            onSearchChange: (e: any) => setSearchQuery(e.target.value),
          },
          resetData: {
            show: false,
            text: "Reset Data",
            function: resetTableData,
          },
          pagination: {
            show: true,
            onClick: handleChangePage,
            currentPage: currentPage,
            totalPages: user.totalPages || 1,
          },
        }}
        loading={user.loading}
      />

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent minW={{ md: "80vw", sm: "100vw" }}>
          <DrawerCloseButton />
          <DrawerHeader
            bgGradient="linear(to-r, blue.400, purple.400)"
            color="white"
          >
            <Flex align="center" gap={3}>
              <GiPsychicWaves size="24px" />
              User Profile
            </Flex>
          </DrawerHeader>

          {selectedUser && (
            <DrawerBody>
              <ViewUser
                user={{
                  ...selectedUser.profileDetails?.personalInfo,
                  ...selectedUser,
                }}
              />
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>
    </Box>
  );
});

export default StaffTable;