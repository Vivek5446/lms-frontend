"use client";
import { Box, Text } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import CustomDrawer from "../../component/common/Drawer/CustomDrawer";
import useDebounce from "../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import { formatDate } from "../../component/config/utils/dateUtils";
import { tablePageLimit } from "../../component/config/utils/variable";
import stores from "../../store/stores";
import Index from "../../component/common/TeethModel/DentalChartComponent";
import AppointmentDetailsView from "./element/AppointmentDetailsView";

const TreatmentList = observer(({ isPatient, patientDetails }: any) => {
  const {
    toothTreatmentStore: { getToothTreatments, toothTreatment },
    auth: { openNotification, userType },
  } = stores;
  const [openView, setOpenView] = useState({ open: false, data: null });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [openReportModal, setOpenReportModal] = useState({
    open: false,
    type: "add",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const applyGetAllRecords = useCallback(
    ({ page = currentPage, limit = tablePageLimit, reset = false }) => {
      const query: any = { page, limit };

      if (debouncedSearchQuery?.trim()) {
        query.search = debouncedSearchQuery.trim();
      }

      if (reset) {
        query.page = 1;
        query.limit = tablePageLimit;
      }

      if (isPatient && patientDetails) {
        query.patientId = patientDetails?._id;
      }

      getToothTreatments(query).catch((err) => {
        openNotification({
          type: "error",
          title: "Failed to get treatment",
          message: err?.message,
        });
      });
    },
    [
      debouncedSearchQuery,
      getToothTreatments,
      openNotification,
      currentPage,
      isPatient,
      patientDetails,
    ]
  );

  useEffect(() => {
    applyGetAllRecords({ page: currentPage, limit: tablePageLimit });
  }, [currentPage, debouncedSearchQuery, applyGetAllRecords]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetTableData = () => {
    setCurrentPage(1);
    setSearchQuery("");
    applyGetAllRecords({ page: 1, reset: true });
  };

  /* ---------------- Patient Column ---------------- */
  const patientColumn = {
    headerName: "Patient",
    key: "patientName",
    metaData: {
      component: (dt: any) => (
        <Box>
          <Text fontWeight="medium">{dt?.patientName || "--"}</Text>
        </Box>
      ),
    },
    props: { row: { textAlign: "center" } },
  };

  /* ---------------- Table Columns ---------------- */
  const ContactTableColumn = [
    {
      headerName: "Tooth",
      key: "toothName",
      metaData: {
        component: (dt: any) => (
          <Box>
            <Text fontSize="sm">{dt?.toothName || "--"}</Text>
          </Box>
        ),
      },
      props: { row: { textAlign: "center" } },
    },

    ...(!isPatient ? [patientColumn] : []),

    {
      headerName: "Doctor",
      key: "doctorName",
      metaData: {
        component: (dt: any) => (
          <Box>
            <Text>{dt?.doctorName || "--"}</Text>
          </Box>
        ),
      },
      props: { row: { textAlign: "center" } },
    },

    {
      headerName: "Status",
      key: "status",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const getStatusColor = (status: string) => {
            switch (status) {
              case "scheduled":
                return "blue";
              case "in-progress":
                return "yellow";
              case "completed":
                return "green";
              case "cancelled":
                return "red";
              case "shift":
                return "purple";
              case "no-show":
                return "gray";
              case "arrived":
                return "green";
              default:
                return "gray";
            }
          };

          return (
            <Box
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="semibold"
              textTransform="capitalize"
              bg={`${getStatusColor(dt.status)}.100`}
              color={`${getStatusColor(dt.status)}.700`}
              display="inline-block"
            >
              {dt.status?.replace("-", " ") || "—"}
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
      headerName: "Treatment Date",
      key: "treatmentDate",
      type: "component",
      metaData: {
        component: (dt: any) => <Box>{formatDate(dt?.treatmentDate)}</Box>,
      },
      props: {
        row: { minW: 120, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },

    {
      headerName: "Created By",
      key: "createdBy",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box>
            <Text>{dt?.createdBy?.name || "--"}</Text>
            <Text fontSize="xs" color="gray.500">
              {dt?.createdBy?.code || ""}
            </Text>
          </Box>
        ),
      },
      props: {
        row: { minW: 120, textAlign: "center" },
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

  const subTitle = patientDetails?.name;

  return (
    <>
      <CustomTable
        title="Treatment"
        subTitle={patientDetails ? subTitle : undefined}
        data={toothTreatment?.data || []}
        columns={ContactTableColumn}
        actions={{
          actionBtn: {
            addKey: {
              showAddButton: ["admin", "superAdmin"].includes(userType),
              function: () => {
                setOpenReportModal({ open: true, type: "add" });
              },
            },
            editKey: {
              showEditButton: ["admin", "superAdmin"].includes(userType),
              function: (dt: any) => {},
            },
            viewKey: {
              showViewButton: true,
              function: (dt: any) => {
                setOpenView({ open: true, data: dt });
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
            currentPage,
            totalPages: toothTreatment?.totalPages,
          },
        }}
        loading={toothTreatment?.loading}
      />

      <CustomDrawer
        width={"80vw"}
        open={openView.open}
        close={() => setOpenView({ open: false, data: null })}
        title="Treatment Details"
      >
        <AppointmentDetailsView data={openView.data} />
      </CustomDrawer>
      {/* Drawer */}
      <CustomDrawer
        width="90vw"
        open={openReportModal.open}
        close={() => setOpenReportModal({ open: false, type: "add" })}
        title="Treatment"
      >
        <Index
          appointments={toothTreatment}
          isPatient={isPatient}
          patientDetails={patientDetails}
          applyGetAllRecords={applyGetAllRecords}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </CustomDrawer>
    </>
  );
});

export default TreatmentList;