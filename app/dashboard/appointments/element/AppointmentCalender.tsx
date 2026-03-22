import { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Flex,
  Heading,
  Text,
  Icon,
  useColorModeValue,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import moment from "moment";
import CustomDrawer from "../../../component/common/Drawer/CustomDrawer";
import AddForm from "../component/AddForm";
import EditForm from "../component/EditForm";
import stores from "../../../store/stores";
import DentistScheduler from "../../daily-report/component/DentistScheduler/DentistScheduler";
import { SLOT_DURATION } from "../../daily-report/utils/constant";

// ⭐ Convert operating hours → FullCalendar businessHours
const convertOperatingHoursToBusinessHours = (hours: any[]) => {
  return hours
    .filter((d) => d.isOpen)
    .map((d) => {
      const dayIndex = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ].indexOf(d.day);
      return d.slots.map((slot) => ({
        daysOfWeek: [dayIndex],
        startTime: slot.start,
        endTime: slot.end,
      }));
    })
    .flat();
};

// ⭐ Compute min/max times for the weekly view UI
const computeMinMaxTimes = (allowed: any[]) => {
  let all = allowed
    .map((s) => s.startTime)
    .concat(allowed.map((s) => s.endTime));
  all = all.filter(Boolean).sort();
  return {
    min: all[0] || "06:00",
    max: all[all.length - 1] || "23:59",
  };
};

const AttendanceCalendar = ({
  isPatient,
  patientDetails,
  type,
  close,
  applyGetAllRecords,
  appointments,
}: any) => {
  const {
    auth: { user },
  } = stores;
  const [selectedDateTime, setSelectedDateTime] = useState<any>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [reportDrawer, setReportDrawer] = useState(false);
  // ⭐ Prepare slots
  const allowedSlots = useMemo(
    () =>
      convertOperatingHoursToBusinessHours(
        user?.companyDetails?.operatingHours || []
      ),
    []
  );
  const { min, max } = useMemo(
    () => computeMinMaxTimes(allowedSlots),
    [allowedSlots]
  );

  // ⭐ COLORFUL EVENTS
  const appointmentColors = [
    { bg: "#3B82F6", border: "#2563EB", text: "#FFFFFF" },
    { bg: "#8B5CF6", border: "#7C3AED", text: "#FFFFFF" },
    { bg: "#EC4899", border: "#DB2777", text: "#FFFFFF" },
    { bg: "#F59E0B", border: "#D97706", text: "#FFFFFF" },
    { bg: "#10B981", border: "#059669", text: "#FFFFFF" },
    { bg: "#06B6D4", border: "#0891B2", text: "#FFFFFF" },
    { bg: "#EF4444", border: "#DC2626", text: "#FFFFFF" },
    { bg: "#6366F1", border: "#4F46E5", text: "#FFFFFF" },
    { bg: "#14B8A6", border: "#0D9488", text: "#FFFFFF" },
    { bg: "#F97316", border: "#EA580C", text: "#FFFFFF" },
  ];

  const getAppointmentColor = (index: number) =>
    appointmentColors[index % appointmentColors.length];

  const formatDateOnly = (isoDate: string) =>
    moment(isoDate).format("YYYY-MM-DD");

  const bookedEvents =
    appointments?.data?.map((item: any, index: number) => {
      const date = formatDateOnly(item.appointmentDate);
      const colors = getAppointmentColor(index);
      return {
        id: item?._id,
        title: item?.patientName || "Booked",
        start: `${date}T${item?.startTime}`,
        end: `${date}T${item?.endTime}`,
        backgroundColor: item?.chair?.chairColor || colors.bg,
        borderColor: item?.chair?.chairColor || colors.border,
        textColor: colors.text,
        display: "block",
        extendedProps: item,
      };
    }) || [];

  // ⭐ BLOCK selecting outside allowed slots
  const selectAllow = (selectInfo: any) => {
    const start = moment(selectInfo.start);
    const end = moment(selectInfo.end);

    const isInsideSlot = allowedSlots.some((slot) => {
      return (
        slot.daysOfWeek.includes(start.day()) &&
        start.format("HH:mm") >= slot.startTime &&
        end.format("HH:mm") <= slot.endTime
      );
    });

    return isInsideSlot && start.isSameOrAfter(moment());
  };

  // ⭐ Handle selection
  const handleDateSelect = (info: any) => {
    setSelectedDateTime({ start: info.start, end: info.end });
    setReportDrawer(true);
  };

  // ⭐ FullCalendar options
  const calendarOptions: any = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: "timeGridWeek",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    height: "80vh",
    selectable: true,
    editable: false,
    selectAllow,
    businessHours: allowedSlots,
    slotMinTime: min,
    slotMaxTime: max,

    visibleRange() {
      return {
        start: moment().startOf("day").format("YYYY-MM-DD"),
        end: moment().add(1, "year").format("YYYY-MM-DD"),
      };
    },

    select: handleDateSelect,

    events: bookedEvents,

    eventClick: (info: any) => {
      setSelectedDateTime({
        start: info.event.start,
        end: info.event.end,
        eventData: info.event.extendedProps,
      });
      setReportDrawer(true);
    },

    eventContent: (arg: any) => ({
      html: `
        <div style="
          padding: 4px 8px;
          font-size: 10px;
          font-weight: 600;
        ">${arg.event.title}</div>
      `,
    }),
  };

  const calendarBg = useColorModeValue("white", "darkBrand.50");
  const borderColor = useColorModeValue("brand.200", "darkBrand.200");

  const handleOpenAddDrawer = (data: any) => {
    console.log("the data are", data);

    const selectedDate = moment().format("YYYY-MM-DD"); // today

    const start = moment(`${selectedDate}T${data.time}`);
    const end = start.clone().add(SLOT_DURATION, "minutes");

    setSelectedDateTime({
      start: start.toDate(),
      end: end.toDate(),
      time: data.time,
      chairId: data.chair?.id,
      chair: { label: data?.chair?.name, value: data?.chair?.id },
    });

    setOpenDrawer(true);
  };

  return (
    <>
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        mb={4}
        p={4}
        bg={calendarBg}
        borderRadius="lg"
        shadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Flex align="center" gap={3}>
          <Icon as={FaCalendarAlt} color="brand.500" boxSize={5} />
          <Heading size="md" color={useColorModeValue("brand.600", "white")}>
            Appointment Calendar
          </Heading>
        </Flex>

        <Flex align="center" gap={3}>
          {selectedDateTime && (
            <Text fontSize="sm" color="gray.500">
              Selected:{" "}
              <b>
                {moment(selectedDateTime.start).format("DD MMM YYYY, hh:mm A")}
              </b>
            </Text>
          )}
          <Tooltip label="Open Report" placement="bottom">
            <IconButton
              aria-label="Open Report"
              icon={<FaFileAlt size="22px" />}
              size="lg"
              variant="solid"
              colorScheme="brand"
              borderRadius="full"
              boxShadow="md"
              _hover={{
                transform: "scale(1.1)",
                boxShadow: "lg",
              }}
              onClick={() => setReportDrawer(true)}
            />
          </Tooltip>
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            Report
          </Text>
        </Flex>
      </Flex>

      {/* Calendar */}
      <Box
        p={4}
        bg={calendarBg}
        borderRadius="xl"
        shadow="md"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <FullCalendar {...calendarOptions} />
      </Box>

      {/* Drawer */}
      <CustomDrawer
        width="80vw"
        open={openDrawer}
        close={() => setOpenDrawer(false)}
        title={
          selectedDateTime
            ? `Selected: ${moment(selectedDateTime.start).format(
              "dddd, DD MMM YYYY"
            )}`
            : "Select a date"
        }

      >
        <Box p={2}>
          {type === "add" ? (
            <AddForm
              patientDetails={patientDetails}
              isPatient={isPatient}
              applyGetAllRecords={applyGetAllRecords}
              close={close}
              selectedDateAndTime={selectedDateTime}
            />
          ) : (
            <EditForm />
          )}
        </Box>
      </CustomDrawer>

      <CustomDrawer
        width="88vw"
        open={reportDrawer}
        close={() => setReportDrawer(false)}
        title={`Reports → Selected: ${moment(selectedDateTime?.start).format(
          "DD MMM YYYY"
        )}`}
      >
        <DentistScheduler
          selectedDate={selectedDateTime || new Date()}
          handleTimeSlots={handleOpenAddDrawer}
        />
      </CustomDrawer>
    </>
  );
};

export default AttendanceCalendar;