import { CalendarIcon } from "@chakra-ui/icons";
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
import { GiPsychicWaves, GiMedicalDrip } from "react-icons/gi";
import CustomDrawer from "../../../../component/common/Drawer/CustomDrawer";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../../component/config/utils/variable";
import { genderOptions } from "../../../../config/constant";
import { copyToClipboard } from "../../../../config/utils/function";
import stores from "../../../../store/stores";
import AppointmentList from "../../../appointments/Appointments";
import ViewDoctor from "./ViewPatient";
import Treatment from "../../../toothTreatment/page";

const PatientTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const {
    userStore: { getAllUsers, user },
    auth: { openNotification },
  } = stores;

  const [openAppointmentDetails, setOpenAppointmentDetails] = useState({
    open: false,
    data: null as any,
  });

  const [openTreatmentDetails, setOpenTreatmentDetails] = useState({
    open: false,
    data: null as any,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const applyGetAllPatients = useCallback(
    ({ page = 1, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit, type: "patient" };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        setCurrentPage(1);
      }

      getAllUsers(query).catch((err) => {
        openNotification({
          type: "error",
          title: "Failed to fetch patients",
          message: err?.message || "Something went wrong",
        });
      });
    },
    [debouncedSearchQuery, getAllUsers, openNotification]
  );

  useEffect(() => {
    applyGetAllPatients({ page: currentPage });
  }, [currentPage, debouncedSearchQuery, applyGetAllPatients]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    applyGetAllPatients({ reset: true });
  };

  const handleRowClick = (user: any) => {
    setSelectedUser(user);
    onOpen();
  };

  const PatientTableColumns = [
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
            <Avatar src={dt.pic?.url} name={dt.name} size="sm" />
          </Box>
        ),
      },
      props: { row: { minW: 100, textAlign: "center" } },
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
            genderOptions.find((opt: any) => opt.value === dt?.gender)?.label ||
            "--";

          const colorScheme =
            genderLabel === "Male"
              ? "blue"
              : genderLabel === "Female"
              ? "pink"
              : "gray";

          return (
            <Badge
              colorScheme={colorScheme}
              variant="solid"
              px={4}
              py={1.5}
              borderRadius="full"
              fontSize="sm"
              fontWeight="semibold"
            >
              {genderLabel}
            </Badge>
          );
        },
      },
      props: { row: { minW: 120, textAlign: "center" } },
    },
    {
      headerName: "Mobile No.",
      key: "mobile",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const primaryPhone = dt.phones?.find((p: any) => p.primary);
          const number = primaryPhone?.number || "--";
          const masked = number !== "--" ? `••••${number.slice(-4)}` : "--";

          return (
            <Tooltip label={number !== "--" ? `Copy: ${number}` : ""} hasArrow>
              <Box
                cursor={number !== "--" ? "pointer" : "default"}
                onClick={() => number !== "--" && copyToClipboard(number)}
                color={number !== "--" ? "blue.600" : "gray.500"}
                fontWeight="medium"
              >
                {masked}
              </Box>
            </Tooltip>
          );
        },
      },
      props: { row: { minW: 140, textAlign: "center" } },
    },
    {
      headerName: "Appointments",
      key: "appointments",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Badge
            as="button"
            px={3}
            py={1}
            borderRadius="md"
            colorScheme="teal"
            variant="solid"
            cursor="pointer"
            fontWeight="600"
            fontSize="xs"
            display="flex"
            alignItems="center"
            gap={1}
            _hover={{ bg: "teal.600", shadow: "sm" }}
            transition="all 0.2s"
            onClick={() => setOpenAppointmentDetails({ open: true, data: dt })}
          >
            <CalendarIcon boxSize={3} />
            Appointments
          </Badge>
        ),
      },
      props: { row: { minW: 130, textAlign: "center" } },
    },
    {
      headerName: "Treatment",
      key: "treatment",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Badge
            as="button"
            px={3}
            py={1}
            borderRadius="md"
            colorScheme="purple"
            variant="solid"
            cursor="pointer"
            fontWeight="600"
            fontSize="xs"
            display="flex"
            alignItems="center"
            gap={1}
            _hover={{ bg: "purple.600", shadow: "sm" }}
            transition="all 0.2s"
            onClick={() => setOpenTreatmentDetails({ open: true, data: dt })}
          >
            <GiMedicalDrip size={14} />
            Treatment
          </Badge>
        ),
      },
      props: { row: { minW: 120, textAlign: "center" } },
    },
    {
      headerName: "Actions",
      key: "table-actions",
      type: "table-actions",
      props: { row: { minW: 180, textAlign: "center" } },
    },
  ];

  return (
    <>
      <Box p={4}>
        <CustomTable
          title="Patients"
          data={
            user.data?.map((patient: any, index: number) => ({
              ...patient,
              ...patient.profileDetails?.personalInfo,
              sno: index + 1 + (currentPage - 1) * tablePageLimit,
            })) || []
          }
          columns={PatientTableColumns}
          actions={{
            actionBtn: {
              addKey: { showAddButton: true, function: onAdd },
              editKey: { showEditButton: true, function: onEdit },
              viewKey: { showViewButton: true, function: handleRowClick },
              deleteKey: { showDeleteButton: true, function: onDelete },
            },
            search: {
              show: true,
              searchValue: searchQuery,
              onSearchChange: (e: any) => setSearchQuery(e.target.value),
            },
            resetData: {
              show: false,
              function: resetTableData,
            },
            pagination: {
              show: true,
              onClick: handleChangePage,
              currentPage,
              totalPages: user.totalPages || 1,
            },
          }}
          loading={user.loading}
        />

        {/* Patient Profile Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader
              bgGradient="linear(to-r, teal.500, blue.500)"
              color="white"
            >
              <Flex align="center" gap={3}>
                <GiPsychicWaves size={28} />
                Patient Profile
              </Flex>
            </DrawerHeader>
            <DrawerBody>
              {selectedUser && (
                <ViewDoctor
                  user={{
                    ...selectedUser,
                    ...selectedUser.profileDetails?.personalInfo,
                  }}
                />
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Appointments Drawer */}
        {openAppointmentDetails.open && (
          <CustomDrawer
            width="92%"
            title="Patient -> Appointments"
            open={openAppointmentDetails.open}
            close={() => setOpenAppointmentDetails({ open: false, data: null })}
          >
            <AppointmentList
              isPatient={true}
              patientDetails={openAppointmentDetails.data}
            />
          </CustomDrawer>
        )}

        {/* Treatment Drawer */}
        {openTreatmentDetails.open && (
          <CustomDrawer
            width="92%"
            title="Treatment History"
            open={openTreatmentDetails.open}
            close={() => setOpenTreatmentDetails({ open: false, data: null })}
          >
            <Treatment
              isPatient={true}
              patientDetails={openTreatmentDetails.data}
            />
          </CustomDrawer>
        )}
      </Box>
    </>
  );
});

export default PatientTable;
