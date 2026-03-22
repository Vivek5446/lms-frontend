import { RepeatClockIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Center,
  Flex,
  Grid,
  IconButton,
  Spinner,
  Text,
  useColorModeValue,
  Tooltip,
  Divider,
  Input,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import stores from "../../../../store/stores";
import { SLOT_DURATION } from "../../utils/constant";
import { format } from "date-fns";
import AppointmentDetailsView from "../../../appointments/element/AppointmentDetailsView";
import CustomDrawer from "../../../../component/common/Drawer/CustomDrawer";

/* ---------------------- HELPERS ---------------------- */

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const canEditAppointment = (selectedDate: Date, startTime: string) => {
  // const now = new Date();
  // const [h, m] = startTime.split(":").map(Number);

  // const aptDate = new Date(selectedDate);
  // aptDate.setHours(h, m, 0, 0);

  // return aptDate >= now;
  return true
};


const hexToRGBA = (hex: string, alpha = 0.2) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const generateTimeSlots = (allowedSlots: any[]) => {
  const timeSet = new Set<string>();

  // 🔑 find the latest endTime that is still on the same day
  const sameDayEnds = allowedSlots
    .map((s) => toMinutes(s.endTime))
    .filter((end) => end > 0 && end <= 24 * 60);

  const maxSameDayEnd = sameDayEnds.length
    ? Math.max(...sameDayEnds)
    : 24 * 60;

  allowedSlots.forEach((slot) => {
    const start = toMinutes(slot.startTime);
    const end = toMinutes(slot.endTime);

    // ✅ Normal same-day slot
    if (end > start) {
      let current = start;
      while (current < end) {
        timeSet.add(
          `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(
            current % 60
          ).padStart(2, "0")}`
        );
        current += SLOT_DURATION;
      }
    }

    // ✅ Overnight slot → clamp to last valid same-day end
    else {
      let current = start;
      while (current < maxSameDayEnd) {
        timeSet.add(
          `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(
            current % 60
          ).padStart(2, "0")}`
        );
        current += SLOT_DURATION;
      }
    }
  });

  return Array.from(timeSet).sort(
    (a, b) => toMinutes(a) - toMinutes(b)
  );
};


/* ---------------------- APPOINTMENT CARD ---------------------- */

const AppointmentCard = ({
  appointment,
  chairColor,
  overlapIndex = 0,
  totalOverlaps = 1,
  selectedDate,
  chair,
  handleTimeSlots,
  onOpenDetails,
  shouldNotEditIcon
}: any) => {
  const heightMultiplier = appointment.duration / SLOT_DURATION;
  const heightStyle = `calc(${heightMultiplier * 100}% + ${heightMultiplier - 1
    }px)`;

  const widthPercent = totalOverlaps > 1 ? 92 / totalOverlaps : 96;
  const leftOffset = overlapIndex * (96 / totalOverlaps);

  const editable = canEditAppointment(selectedDate, appointment.startTime);

  console.log(selectedDate)
  console.log(appointment.starTime)

  return (
    <Tooltip
      hasArrow
      placement="right"
      openDelay={300}
      bg="gray.800"
      color="white"
      borderRadius="md"
      px={3}
      py={2}
      pointerEvents="auto"
      label={
        <Box>
          <Text fontWeight="bold" fontSize="sm">
            {appointment.patientName}
          </Text>

          <Text fontSize="xs" opacity={0.85}>
            👨‍⚕️ {appointment.doctorName || "—"}
          </Text>

          <Divider my={1} borderColor="gray.600" />

          <Text fontSize="xs">
            🩺 {appointment.treatment || "Consultation"}
          </Text>

          <Text fontSize="xs">
            ⏰ {appointment.startTime} • {appointment.duration} min
          </Text>

          {/* Full Description */}
          {appointment.description && (
            <Text fontSize="xs" mt={1} opacity={0.85} whiteSpace="pre-wrap">
              📝 {appointment.description}
            </Text>
          )}
        </Box>
      }


    >
      <Box
        position="absolute"
        top={0}
        left={`${leftOffset}%`}
        width={`${widthPercent}%`}
        height={heightStyle}
        m="1x"
        p={1.5}
        borderLeftWidth="6px"
        borderRadius="lg"
        boxShadow="md"
        bg={`${chairColor}22`}
        borderColor={chairColor}
        zIndex={10 + overlapIndex}
        cursor="pointer"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails(appointment);
        }}
      >
        {/* Patient name (primary) */}
        <Flex align="center" maxW="100%">
          <Text
            fontWeight="600"
            fontSize="sm"
            color="gray.800"
            noOfLines={1}
            title={appointment.patientName}
          >
            {appointment.patientName}
          </Text>

          <Text
            fontSize="xs"
            color="gray.600"
            // bg="gray.100"
            px={2}
            py="2px"
            borderRadius="full"
            fontWeight="500"
            whiteSpace="nowrap"
          >
            ( {appointment?.patientMobileNumber} )
          </Text>
        </Flex>
        {editable && (
          <Tooltip label="Edit appointment" hasArrow>
            <IconButton
              display={shouldNotEditIcon ? "none" : undefined}
              aria-label="Edit appointment"
              icon={<EditIcon />}
              size="xs"
              position="absolute"
              top="4px"
              right="4px"
              variant="ghost"
              zIndex={50}
              onMouseEnter={(e) => e.stopPropagation()}   // ✅ stop parent tooltip
              onMouseLeave={(e) => e.stopPropagation()}   // ✅ stop parent tooltip
              onClick={(e) => {
                e.stopPropagation();
                handleTimeSlots({
                  open: true,
                  mode: "edit",
                  appointment,
                  chair,
                  selectedDate,
                });
              }}
            />
          </Tooltip>
        )}



        {/* Doctor name (secondary) */}
        <Text fontSize="xs" color="gray.600" noOfLines={1}>
          Dr. {appointment.doctorName || "—"}
        </Text>

        {/* Treatment */}
        <Text fontSize="xs" mt={1}>
          {(appointment.description || "Consultation").length > 15
            ? (appointment.description || "Consultation").slice(0, 15) + "..."
            : appointment.description || "Consultation"}
        </Text>


        {/* Duration */}
        {appointment.duration >= 60 && (
          <Flex align="center" gap={1} mt={1} fontSize="xs" color="gray.600">
            <RepeatClockIcon boxSize={3.5} />
            <Text>{appointment.duration} min</Text>
          </Flex>
        )}
      </Box>
    </Tooltip>
  );
};

/* ---------------------- SCHEDULE GRID ---------------------- */

const ScheduleGrid = ({
  timeSlots,
  chairs,
  appointments,
  handleTimeSlots,
  selectedDate,
  setSelectedDate,
  allowedSlots,
  onOpenDetails,
  shouldNotEditIcon
}: any) => {
  const bg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.900");
  const timeHeaderBg = useColorModeValue("gray.100", "gray.700");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = selectedDate < today;

  const getAppointmentsStartingAt = (time: string, chairId: string) =>
    appointments.filter(
      (apt: any) => apt.startTime === time && apt.chairId === chairId
    );

  const isSlotOccupied = (time: string, chairId: string) => {
    const slotMinutes = toMinutes(time);
    return appointments.some((apt: any) => {
      if (apt.chairId !== chairId) return false;
      const start = toMinutes(apt.startTime);
      const end = start + apt.duration;
      return slotMinutes >= start && slotMinutes < end;
    });
  };

  const isSlotAllowed = (time: string) => {
    if (isPastDate) return false;

    const slotMinutes = toMinutes(time);

    return allowedSlots.some((slot: any) => {
      const start = toMinutes(slot.startTime);
      const end = toMinutes(slot.endTime);

      // normal
      if (end > start) {
        return slotMinutes >= start && slotMinutes < end;
      }

      // overnight → only if within declared same-day range
      return slotMinutes >= start && slotMinutes < 24 * 60;
    });
  };


  const canEditAppointment = (selectedDate: Date, startTime: string) => {
    const now = new Date();
    const [h, m] = startTime.split(":").map(Number);

    const aptDate = new Date(selectedDate);
    aptDate.setHours(h, m, 0, 0);

    return aptDate >= now;
  };


  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return (
    <Box flex="1" px={1} pb={1} overflowX="auto">
      <Box bg={bg} borderRadius="2xl" boxShadow="2xl" borderWidth="1px">
        <Grid
          templateColumns={`100px repeat(${chairs.length}, 1fr)`}
          bg={headerBg}
          borderBottomWidth="2px"
        >
          <Flex
            p={5}
            w={"100%"}
            bg={timeHeaderBg}
            align="center"
            justify="center"
            borderRightWidth="2px"
          >
            <Flex>
              <Input
                type="date"
                name="date"
                value={formatDateForInput(selectedDate)}
                onChange={(e: any) => {
                  const [y, m, d] = e.target.value.split("-").map(Number);
                  setSelectedDate(new Date(y, m - 1, d));
                }}
                sx={{
                  width: "80px",
                  height: "100px",
                  padding: "0",
                  textIndent: "-9999px",
                  cursor: "pointer",

                  "&::-webkit-datetime-edit": {
                    display: "none",
                  },

                  "&::-webkit-calendar-picker-indicator": {
                    position: "absolute",
                    right: "8px",
                    width: "60px",
                    height: "60px",
                    cursor: "pointer",
                  },
                }}
              />
            </Flex>
          </Flex>

          {chairs.map((chair: any) => (
            <Box key={chair.id} p={4} textAlign="center">
              <Flex direction="column" align="center" gap={2}>
                <Box w={12} h={12} borderRadius="full" bg={chair.color} />
                <Text fontWeight="bold">{chair.name}</Text>
                <Text fontSize="sm">Chair {chair.chairNo}</Text>
              </Flex>
            </Box>
          ))}
        </Grid>

        {timeSlots.map((time: string) => (
          <Grid
            key={time}
            templateColumns={`100px repeat(${chairs.length}, 1fr)`}
          >
            <Box
              py={4}
              px={3}
              bg={timeHeaderBg}
              borderRightWidth="2px"
              textAlign="center"
              fontWeight="bold"
            >
              {time}
            </Box>

            {chairs.map((chair: any) => {
              const startingAppointments = getAppointmentsStartingAt(
                time,
                chair.id
              );
              const occupied = isSlotOccupied(time, chair.id);
              const allowed = isSlotAllowed(time);

              return (
                <Box
                  key={`${chair.id}-${time}`}
                  position="relative"
                  minH="70px"
                  borderRightWidth="2px"
                  borderBottomWidth="2px"
                  borderColor="gray.400"
                  bg={allowed ? hexToRGBA(chair.color, 0.07) : "gray.100"}
                  opacity={allowed ? 1 : 0.45}
                >
                  {/* 🔹 Existing Appointments (ALWAYS clickable) */}
                  {startingAppointments.map((apt: any, index: number) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      selectedDate={selectedDate}
                      handleTimeSlots={handleTimeSlots}
                      chairColor={chair.color}
                      overlapIndex={index}
                      totalOverlaps={startingAppointments.length}
                      onOpenDetails={onOpenDetails}
                      shouldNotEditIcon={shouldNotEditIcon}
                    />
                  ))}

                  {/* 🔒 Closed Slot Label (does NOT block appointments) */}
                  {!allowed && startingAppointments.length === 0 && (
                    <Text
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      fontSize="xs"
                      color="gray.600"
                      fontWeight="semibold"
                      zIndex={1} // behind appointment cards
                      pointerEvents="none"
                    >
                      Closed
                    </Text>
                  )}

                  {/* ➕ Add Appointment (ONLY if slot is allowed & empty) */}
                  {!occupied && allowed && (
                    <Flex
                      position="absolute"
                      inset={0}
                      align="center"
                      justify="center"
                      opacity={0}
                      _hover={{ opacity: 1 }}
                    >
                      <IconButton
                        aria-label="Add appointment"
                        size="lg"
                        borderRadius="full"
                        bg="blue.500"
                        color="white"
                        icon={<Text fontSize="2xl">+</Text>}
                        onClick={() =>
                          handleTimeSlots({
                            open: true,
                            time,
                            chair,
                            selectedDate,
                          })
                        }
                      />
                    </Flex>
                  )}
                </Box>
              );
            })}
          </Grid>
        ))}
      </Box>
    </Box>
  );
};

/* ---------------------- MAIN ---------------------- */

export default function DentistScheduler({
  handleTimeSlots,
  selectedDate,
  setSelectedDate,
  createdAppointmentByCalender,
  shouldNotEditIcon
}: any) {
  const {
    chairsStore: { getChairSummary },
    auth: { user },
  } = stores;

  const [appointments, setAppointments] = useState<any[]>([]);
  const [chairs, setChairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ ONLY NEW STATE
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [openDrawer, setOpenDrawer] = useState<any>(false);


  const allowedSlots = useMemo(() => {
    if (!user?.companyDetails?.operatingHours) return [];

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const selectedDayName = dayNames[selectedDate.getDay()];

    const dayConfig = user.companyDetails.operatingHours.find(
      (d: any) => d.day === selectedDayName && d.isOpen
    );

    if (!dayConfig) return [];

    return dayConfig.slots.map((slot: any) => ({
      startTime: slot.start,
      endTime: slot.end,
    }));
  }, [user, selectedDate]);


  const timeSlots = useMemo(
    () => generateTimeSlots(allowedSlots),
    [allowedSlots]
  );

  const fetchAppointments = async () => {
    setLoading(true);
    const res = await getChairSummary({
      date: format(selectedDate, "yyyy-MM-dd"),
    });

    if (res?.status === "success") {
      const allAppointments: any[] = [];
      const chairList: any[] = [];

      res.data.forEach((chair: any) => {
        chairList.push({
          id: chair._id,
          name: chair.chairName,
          chairNo: chair.chairNo,
          color: chair.chairColor,
        });

        chair.appointments.forEach((apt: any) => {
          allAppointments.push({
            _id: apt._id,
            id: apt._id,
            patientName: apt.patient?.name || "Unknown",
            patientMobileNumber: apt.patient?.mobileNumber || "Unknown",
            treatment: apt.title,
            description: apt.description,
            doctorName: apt.primaryDoctor?.name || "--",
            doctorMobileNumber: apt.primaryDoctor?.mobileNumber || "--",
            startTime: apt.startTime,
            duration: toMinutes(apt.endTime) - toMinutes(apt.startTime),
            chairId: chair._id,
          });
        });
      });

      setChairs(chairList);
      setAppointments(allAppointments);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, getChairSummary, createdAppointmentByCalender]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <>
      <ScheduleGrid
        timeSlots={timeSlots}
        chairs={chairs}
        appointments={appointments}
        handleTimeSlots={handleTimeSlots}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        allowedSlots={allowedSlots}
        onOpenDetails={(apt: any) => {
          setSelectedAppointment(apt);
          setOpenDrawer(true);
        }}
        shouldNotEditIcon={shouldNotEditIcon}
      />

      {/* ✅ ONLY NEW UI */}
      <CustomDrawer
        width={"80vw"}
        open={openDrawer}
        close={() => setOpenDrawer(false)}
        title="Appointment Details"
      >
        <AppointmentDetailsView
          data={{ ...selectedAppointment, _id: selectedAppointment?.id }}
        />
      </CustomDrawer>
    </>
  );
}